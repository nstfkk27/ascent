import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Calendar, User, ArrowLeft, Clock } from 'lucide-react';
import { notFound } from 'next/navigation';

export default async function InsightDetailPage({ params }: { params: { id: string } }) {
  const post = await prisma.post.findUnique({
    where: { id: params.id },
  });

  if (!post) {
    notFound();
  }

  // Calculate read time (approx)
  const words = post.content.split(/\s+/).length;
  const readTime = Math.ceil(words / 200);

  return (
    <article className="min-h-screen bg-white pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/insights" className="inline-flex items-center text-gray-500 hover:text-[#496f5d] mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Insights
        </Link>
        
        <header className="mb-10 text-center">
          <div className="inline-block px-3 py-1 bg-green-50 text-[#496f5d] text-sm font-bold rounded-full uppercase tracking-wider mb-4">
            {post.category.replace('_', ' ')}
          </div>
          
          <h1 className="text-3xl md:text-5xl font-bold text-[#49516f] mb-6 leading-tight">
            {post.title}
          </h1>
          
          <div className="flex flex-wrap items-center justify-center gap-6 text-gray-500 text-sm">
            <span className="flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              {new Date(post.createdAt).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </span>
            {post.authorName && (
              <span className="flex items-center">
                <User className="w-4 h-4 mr-2" />
                {post.authorName}
              </span>
            )}
            <span className="flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              {readTime} min read
            </span>
          </div>
        </header>

        {post.coverImage && (
          <div className="mb-12 rounded-2xl overflow-hidden shadow-lg h-[400px] w-full relative">
            <img 
              src={post.coverImage} 
              alt={post.title} 
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="prose prose-lg prose-headings:text-[#49516f] prose-a:text-[#496f5d] max-w-none text-gray-700">
          {/* Simple rendering for now, could be Markdown later */}
          {post.content.split('\n').map((paragraph, idx) => (
             <p key={idx}>{paragraph}</p>
          ))}
        </div>
      </div>
    </article>
  );
}
