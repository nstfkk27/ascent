'use client';

import { useState } from 'react';
import { Newspaper, Scale, Plane, ArrowRight, Calendar } from 'lucide-react';
import Link from 'next/link';

interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  category: 'LOCAL_NEWS' | 'LEGAL' | 'VISA';
  coverImage: string | null;
  createdAt: string;
  authorName: string | null;
}

interface NewsKnowledgeSectionProps {
  posts: Post[];
}

const TABS = [
  { id: 'ALL', label: 'All', icon: Newspaper },
  { id: 'LOCAL_NEWS', label: 'Local News', icon: Newspaper },
  { id: 'LEGAL', label: 'Legal', icon: Scale },
  { id: 'VISA', label: 'Visa', icon: Plane },
] as const;

type TabId = 'ALL' | 'LOCAL_NEWS' | 'LEGAL' | 'VISA';

const CATEGORY_COLORS: Record<TabId, string> = {
  ALL: 'bg-gray-100 text-gray-700',
  LOCAL_NEWS: 'bg-blue-100 text-blue-700',
  LEGAL: 'bg-orange-100 text-orange-700',
  VISA: 'bg-purple-100 text-purple-700',
};

const CATEGORY_LABELS: Record<TabId, string> = {
  ALL: 'All',
  LOCAL_NEWS: 'Local News',
  LEGAL: 'Legal',
  VISA: 'Visa',
};

export default function NewsKnowledgeSection({ posts }: NewsKnowledgeSectionProps) {
  const [activeTab, setActiveTab] = useState<TabId>('ALL');

  const filteredPosts = activeTab === 'ALL' ? posts : posts.filter(p => p.category === activeTab);

  // Get placeholder posts if no real posts exist
  const displayPosts = filteredPosts.length > 0 ? filteredPosts : getPlaceholderPosts(activeTab);

  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-[#496f5d]/10 rounded-full px-4 py-2 mb-6">
            <Newspaper className="w-4 h-4 text-[#496f5d]" />
            <span className="text-[#496f5d] text-sm font-medium">News & Knowledge</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-[#49516f] mb-4">
            Stay Informed
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Latest news, legal updates, and visa information for property buyers in Thailand
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex flex-wrap justify-center gap-2 bg-white rounded-2xl p-2 shadow-lg border border-gray-100">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-[#496f5d] text-white shadow-md'
                      : 'text-gray-600 hover:text-[#496f5d] hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Posts - Horizontal scroll on mobile, 3 in row on desktop */}
        <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory md:grid md:grid-cols-3 md:overflow-visible md:pb-0 -mx-4 px-4 md:mx-0 md:px-0">
          {displayPosts.slice(0, 3).map((post, i) => (
            <Link
              key={post.id || i}
              href={post.slug ? `/knowledge/${post.slug}` : '#'}
              className="flex-shrink-0 w-[300px] md:w-auto snap-center"
            >
              <article className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group cursor-pointer border border-gray-100 h-full">
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
                      {activeTab === 'LOCAL_NEWS' && <Newspaper className="w-12 h-12 text-gray-300" />}
                      {activeTab === 'LEGAL' && <Scale className="w-12 h-12 text-gray-300" />}
                      {activeTab === 'VISA' && <Plane className="w-12 h-12 text-gray-300" />}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6">
                  {/* Category & Date */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${CATEGORY_COLORS[post.category]}`}>
                      {CATEGORY_LABELS[post.category]}
                    </span>
                    <span className="text-gray-400 text-xs flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      {new Date(post.createdAt).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-bold text-[#49516f] mb-2 group-hover:text-[#496f5d] transition-colors line-clamp-2">
                    {post.title}
                  </h3>

                  {/* Excerpt */}
                  <p className="text-gray-500 text-sm line-clamp-2">
                    {post.excerpt || 'Read more about this topic...'}
                  </p>
                </div>
              </article>
            </Link>
          ))}
        </div>

        {/* Scroll indicator for mobile */}
        <div className="flex justify-center gap-2 mt-4 md:hidden">
          <span className="text-xs text-gray-400">Swipe to see more</span>
          <ArrowRight className="w-4 h-4 text-gray-400" />
        </div>

        {/* See More Button */}
        <div className="mt-10 text-center">
          <Link
            href="/knowledge"
            className="inline-flex items-center gap-2 bg-[#496f5d] hover:bg-[#3d5c4d] text-white px-8 py-4 rounded-full font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            View All Articles
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}

// Placeholder posts when no real posts exist
function getPlaceholderPosts(category: TabId): Post[] {
  const placeholders: Record<TabId, Post[]> = {
    ALL: [],
    LOCAL_NEWS: [
      {
        id: 'placeholder-1',
        slug: '',
        title: 'Pattaya Real Estate Market Update 2025',
        excerpt: 'Latest trends and developments in the Pattaya property market.',
        category: 'LOCAL_NEWS',
        coverImage: null,
        createdAt: new Date().toISOString(),
        authorName: null,
      },
      {
        id: 'placeholder-2',
        slug: '',
        title: 'New Infrastructure Projects in Eastern Thailand',
        excerpt: 'How new roads and rail links are affecting property values.',
        category: 'LOCAL_NEWS',
        coverImage: null,
        createdAt: new Date().toISOString(),
        authorName: null,
      },
      {
        id: 'placeholder-3',
        slug: '',
        title: 'Top Areas for Investment in 2025',
        excerpt: 'Discover the best neighborhoods for property investment.',
        category: 'LOCAL_NEWS',
        coverImage: null,
        createdAt: new Date().toISOString(),
        authorName: null,
      },
    ],
    LEGAL: [
      {
        id: 'placeholder-4',
        slug: '',
        title: 'Foreign Ownership Laws in Thailand',
        excerpt: 'Understanding the legal framework for foreign property buyers.',
        category: 'LEGAL',
        coverImage: null,
        createdAt: new Date().toISOString(),
        authorName: null,
      },
      {
        id: 'placeholder-5',
        slug: '',
        title: 'Condo Ownership for Foreigners',
        excerpt: 'Complete guide to buying a condominium as a foreigner.',
        category: 'LEGAL',
        coverImage: null,
        createdAt: new Date().toISOString(),
        authorName: null,
      },
      {
        id: 'placeholder-6',
        slug: '',
        title: 'Land Lease Agreements Explained',
        excerpt: 'What you need to know about long-term land leases.',
        category: 'LEGAL',
        coverImage: null,
        createdAt: new Date().toISOString(),
        authorName: null,
      },
    ],
    VISA: [
      {
        id: 'placeholder-7',
        slug: '',
        title: 'Thailand Elite Visa Guide',
        excerpt: 'Everything about the Thailand Elite visa program for investors.',
        category: 'VISA',
        coverImage: null,
        createdAt: new Date().toISOString(),
        authorName: null,
      },
      {
        id: 'placeholder-8',
        slug: '',
        title: 'Retirement Visa Requirements',
        excerpt: 'How to obtain a retirement visa for long-term stay in Thailand.',
        category: 'VISA',
        coverImage: null,
        createdAt: new Date().toISOString(),
        authorName: null,
      },
      {
        id: 'placeholder-9',
        slug: '',
        title: 'Digital Nomad Visa 2025',
        excerpt: 'New visa options for remote workers and digital nomads.',
        category: 'VISA',
        coverImage: null,
        createdAt: new Date().toISOString(),
        authorName: null,
      },
    ],
  };

  // For ALL tab, combine one from each category
  if (category === 'ALL') {
    return [
      placeholders.LOCAL_NEWS[0],
      placeholders.LEGAL[0],
      placeholders.VISA[0],
    ];
  }

  return placeholders[category];
}
