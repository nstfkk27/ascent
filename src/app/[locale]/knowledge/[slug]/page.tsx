import { prisma } from '@/lib/prisma';
import { Newspaper, Scale, Plane, ArrowLeft, Calendar, User, Share2 } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

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
  params: Promise<{ slug: string; locale: string }>;
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;

  const post = await prisma.post.findUnique({
    where: { slug, published: true },
  });

  if (!post) {
    notFound();
  }

  const Icon = CATEGORY_ICONS[post.category as PostCategory];

  // Get related posts
  const relatedPosts = await prisma.post.findMany({
    where: {
      category: post.category,
      published: true,
      id: { not: post.id },
    },
    take: 3,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      category: true,
      coverImage: true,
      createdAt: true,
    },
  });

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Header */}
      <section className="bg-gradient-to-br from-[#49516f] via-[#496f5d] to-[#49516f] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-12 py-16 relative z-10">
          {/* Back Button */}
          <Link
            href="/knowledge"
            className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Knowledge
          </Link>

          {/* Category Badge */}
          <div className="mb-4">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${CATEGORY_COLORS[post.category as PostCategory]}`}>
              <Icon className="w-4 h-4" />
              {CATEGORY_LABELS[post.category as PostCategory]}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
            {post.title}
          </h1>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 text-white/70">
            <span className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {post.createdAt.toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
            {post.authorName && (
              <span className="flex items-center gap-2">
                <User className="w-4 h-4" />
                {post.authorName}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Cover Image */}
      {post.coverImage && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-12 -mt-8 relative z-20">
          <div className="rounded-2xl overflow-hidden shadow-2xl">
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-64 md:h-96 object-cover"
            />
          </div>
        </div>
      )}

      {/* Content */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-12 py-12">
        <article className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12">
          {/* Excerpt */}
          {post.excerpt && (
            <p className="text-xl text-gray-600 mb-8 leading-relaxed border-l-4 border-[#496f5d] pl-6">
              {post.excerpt}
            </p>
          )}

          {/* Main Content */}
          <div 
            className="prose prose-lg max-w-none prose-headings:text-[#49516f] prose-a:text-[#496f5d] prose-strong:text-[#49516f]"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Share */}
          <div className="mt-12 pt-8 border-t border-gray-100">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-2 text-gray-500">
                <Share2 className="w-5 h-5" />
                <span className="font-medium">Share this article</span>
              </div>
              <div className="flex gap-2">
                <button className="p-2 bg-gray-100 hover:bg-[#496f5d] hover:text-white rounded-full transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </button>
                <button className="p-2 bg-gray-100 hover:bg-[#496f5d] hover:text-white rounded-full transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
                  </svg>
                </button>
                <button className="p-2 bg-gray-100 hover:bg-[#496f5d] hover:text-white rounded-full transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </article>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-[#49516f] mb-8">Related Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((related) => {
                const RelatedIcon = CATEGORY_ICONS[related.category as PostCategory];
                return (
                  <Link
                    key={related.id}
                    href={`/knowledge/${related.slug}`}
                    className="group"
                  >
                    <article className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100">
                      <div className="h-32 relative overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                        {related.coverImage ? (
                          <img
                            src={related.coverImage}
                            alt={related.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <RelatedIcon className="w-8 h-8 text-gray-300" />
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-[#49516f] group-hover:text-[#496f5d] transition-colors line-clamp-2">
                          {related.title}
                        </h3>
                      </div>
                    </article>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
