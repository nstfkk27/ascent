/**
 * n8n API: Blog Post Management
 * Create blog posts from automation
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateN8nApiKey } from '@/lib/n8n/auth';
import { PostCategory } from '@prisma/client';

export async function POST(request: NextRequest) {
  // Authenticate
  const authError = validateN8nApiKey(request);
  if (authError) return authError;

  try {
    const data = await request.json();

    const {
      title,
      content,
      excerpt,
      category = 'NEWS',
      tags = [],
      status = 'DRAFT',
      authorId,
      featuredImage,
    } = data;

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content required' },
        { status: 400 }
      );
    }

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Create post
    const post = await prisma.post.create({
      data: {
        title,
        slug: `${slug}-${Date.now()}`,
        content,
        excerpt: excerpt || content.substring(0, 200),
        category: category as PostCategory,
        published: status === 'PUBLISHED',
        authorId: authorId || null,
        featuredImage: featuredImage || null,
      }
    });

    return NextResponse.json({
      success: true,
      post: {
        id: post.id,
        title: post.title,
        slug: post.slug,
        category: post.category,
        published: post.published,
        url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://estateascent.com'}/insights/${post.slug}`,
        createdAt: post.createdAt.toISOString(),
      }
    }, { status: 201 });

  } catch (error) {
    console.error('n8n post creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    );
  }
}
