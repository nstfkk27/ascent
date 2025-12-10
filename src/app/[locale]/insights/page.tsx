import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Calendar, User, ArrowRight } from 'lucide-react';

// Force dynamic to ensure we get fresh data if not using revalidate
export const dynamic = 'force-dynamic';

export default async function InsightsPage() {
  // Fetch published posts
  const posts = await prisma.post.findMany({
    where: { published: true },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-[#49516f] mb-4">Market Insights</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Stay updated with the latest trends, investment advice, and legal updates in Pattaya&apos;s real estate market.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <Link key={post.id} href={`/insights/${post.id}`} className="group">
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 h-full flex flex-col">
                <div className="h-48 bg-gray-200 relative overflow-hidden">
                  {post.coverImage ? (
                    <img 
                      src={post.coverImage} 
                      alt={post.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400">
                      No Image
                    </div>
                  )}
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-[#496f5d] uppercase tracking-wider">
                    {post.category.replace('_', ' ')}
                  </div>
                </div>
                
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center text-xs text-gray-500 mb-3 gap-4">
                    <span className="flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                    {post.authorName && (
                      <span className="flex items-center">
                        <User className="w-3 h-3 mr-1" />
                        {post.authorName}
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-xl font-bold text-[#49516f] mb-3 group-hover:text-[#496f5d] transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  
                  <p className="text-gray-500 text-sm line-clamp-3 mb-4 flex-1">
                    {post.excerpt || post.content.substring(0, 150)}...
                  </p>
                  
                  <span className="inline-flex items-center text-[#496f5d] font-semibold text-sm group-hover:underline mt-auto">
                    Read Article <ArrowRight className="ml-2 w-4 h-4" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
          
          {posts.length === 0 && (
            <div className="col-span-full text-center py-20 text-gray-500">
              No articles found. Check back soon!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
