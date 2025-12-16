import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user?.email) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Only SUPER_ADMIN can create posts
    const agent = await prisma.agentProfile.findFirst({
      where: { email: user.email }
    });

    if (!agent || agent.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ success: false, error: 'Only admins can create posts' }, { status: 403 });
    }

    const body = await req.json();
    const { title, excerpt, content, category, coverImage, published, authorName } = body;

    const post = await prisma.post.create({
      data: {
        title,
        excerpt,
        content,
        category,
        coverImage,
        published: published || false,
        authorName,
      },
    });

    return NextResponse.json({ success: true, data: post });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json({ success: false, error: 'Failed to create post' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const publishedOnly = searchParams.get('published') !== 'false'; // Default to true for public API
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;
    
    const where: any = {};
    if (category) where.category = category;
    if (publishedOnly) where.published = true;

    const [total, posts] = await prisma.$transaction([
      prisma.post.count({ where }),
      prisma.post.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      })
    ]);

    return NextResponse.json({ 
      success: true, 
      data: posts,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch posts' }, { status: 500 });
  }
}
