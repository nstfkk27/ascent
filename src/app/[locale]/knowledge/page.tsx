import { prisma } from '@/lib/prisma';
import { Newspaper, Scale, Plane, ArrowLeft, Calendar, User } from 'lucide-react';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

const CATEGORY_COLORS = {
  LOCAL_NEWS: 'bg-blue-100 text-blue-700',
  LEGAL: 'bg-orange-100 text-orange-700',
  VISA: 'bg-purple-100 text-purple-700',
} as const;

const CATEGORY_LABELS = {
  LOCAL_NEWS: 'Local News',
  LEGAL: 'Legal',
  VISA: 'Visa',
} as const;

const CATEGORY_ICONS = {
  LOCAL_NEWS: Newspaper,
  LEGAL: Scale,
  VISA: Plane,
} as const;

type PostCategory = 'LOCAL_NEWS' | 'LEGAL' | 'VISA';

interface PageProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function KnowledgePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const categoryFilter = params.category as PostCategory | undefined;

  let posts: Array<{
    id: string;
    slug: string;
    title: string;
    excerpt: string | null;
    category: PostCategory;
    coverImage: string | null;
    createdAt: Date;
    authorName: string | null;
  }> = [];

  try {
    const whereClause: { published: boolean; category?: PostCategory } = { published: true };
    if (categoryFilter && ['LOCAL_NEWS', 'LEGAL', 'VISA'].includes(categoryFilter)) {
      whereClause.category = categoryFilter;
    }

    posts = await prisma.post.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        category: true,
        coverImage: true,
        createdAt: true,
        authorName: true,
      },
    }) as typeof posts;
  } catch (error) {
    console.error('Error fetching posts:', error);
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Header */}
      <section className="bg-gradient-to-br from-[#49516f] via-[#496f5d] to-[#49516f] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-16 relative z-10">
          {/* Back Button */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <Newspaper className="w-4 h-4 text-white" />
              <span className="text-white/90 text-sm font-medium">Knowledge Base</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              News & Knowledge
            </h1>
            <p className="text-gray-200 max-w-2xl mx-auto text-lg">
              Stay informed with the latest news, legal updates, and visa information for property buyers in Thailand
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-12">
        {/* Category Filter Tabs */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex flex-wrap justify-center gap-2 bg-white rounded-2xl p-2 shadow-lg border border-gray-100">
            <Link
              href="/knowledge"
              className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                !categoryFilter
                  ? 'bg-[#496f5d] text-white shadow-md'
                  : 'text-gray-600 hover:text-[#496f5d] hover:bg-gray-50'
              }`}
            >
              <Newspaper className="w-4 h-4" />
              All Articles
            </Link>
            {(['LOCAL_NEWS', 'LEGAL', 'VISA'] as const).map((cat) => {
              const Icon = CATEGORY_ICONS[cat];
              return (
                <Link
                  key={cat}
                  href={`/knowledge?category=${cat}`}
                  className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                    categoryFilter === cat
                      ? 'bg-[#496f5d] text-white shadow-md'
                      : 'text-gray-600 hover:text-[#496f5d] hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {CATEGORY_LABELS[cat]}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Posts Grid */}
        {posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => {
              const Icon = CATEGORY_ICONS[post.category];
              return (
                <Link
                  key={post.id}
                  href={`/knowledge/${post.slug}`}
                  className="group"
                >
                  <article className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 h-full">
                    {/* Cover Image */}
                    <div className="h-48 relative overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                      {post.coverImage ? (
                        <img
                          src={post.coverImage}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Icon className="w-12 h-12 text-gray-300" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      {/* Category & Date */}
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${CATEGORY_COLORS[post.category]}`}>
                          {CATEGORY_LABELS[post.category]}
                        </span>
                        <span className="text-gray-400 text-xs flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {post.createdAt.toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-lg font-bold text-[#49516f] mb-2 group-hover:text-[#496f5d] transition-colors line-clamp-2">
                        {post.title}
                      </h3>

                      {/* Excerpt */}
                      <p className="text-gray-500 text-sm line-clamp-3 mb-4">
                        {post.excerpt || 'Read more about this topic...'}
                      </p>

                      {/* Author */}
                      {post.authorName && (
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <User className="w-3 h-3" />
                          {post.authorName}
                        </div>
                      )}
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Newspaper className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No articles yet</h3>
            <p className="text-gray-500 mb-6">Check back soon for new content!</p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-[#496f5d] font-medium hover:underline"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
