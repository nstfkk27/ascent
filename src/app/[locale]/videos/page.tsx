'use client';

import { useState } from 'react';
import { Play, Home, Mic, BookOpen, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface VideoItem {
  id: string;
  title: string;
  description: string;
  embedUrl: string;
  category: 'property' | 'podcast' | 'knowledge';
}

// Video data - add more videos here as needed
const VIDEOS: VideoItem[] = [
  {
    id: '1',
    title: 'Riviera Jomtien Tour',
    description: 'Take a tour of the stunning Riviera Jomtien beachfront condo',
    embedUrl: 'https://www.facebook.com/plugins/video.php?height=476&href=https%3A%2F%2Fwww.facebook.com%2Freel%2F722355720828238%2F&show_text=false&width=267&t=0',
    category: 'property',
  },
  // Add more property videos here
  {
    id: '2',
    title: 'Podcast Coming Soon',
    description: 'Real estate insights and market discussions',
    embedUrl: '',
    category: 'podcast',
  },
  // Add more podcast videos here
  {
    id: '3',
    title: 'Knowledge Coming Soon',
    description: 'Tips and guides for property buyers',
    embedUrl: '',
    category: 'knowledge',
  },
  // Add more knowledge videos here
];

const TABS = [
  { id: 'all', label: 'All Videos', icon: Play },
  { id: 'property', label: 'Property View', icon: Home },
  { id: 'podcast', label: 'Podcast', icon: Mic },
  { id: 'knowledge', label: 'Knowledge', icon: BookOpen },
] as const;

type TabId = 'all' | 'property' | 'podcast' | 'knowledge';

export default function VideosPage() {
  const [activeTab, setActiveTab] = useState<TabId>('all');

  const filteredVideos = activeTab === 'all' 
    ? VIDEOS 
    : VIDEOS.filter(v => v.category === activeTab);

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Header */}
      <section className="bg-gradient-to-br from-gray-900 via-[#49516f] to-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]"></div>
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
              <Play className="w-4 h-4 text-white" />
              <span className="text-white/90 text-sm font-medium">Video Gallery</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Watch & Learn
            </h1>
            <p className="text-gray-300 max-w-2xl mx-auto text-lg">
              Property tours, podcasts, and market insights from our team
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-12">
        {/* Tabs */}
        <div className="flex justify-center mb-12">
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
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Video Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredVideos.map((video) => (
            <div
              key={video.id}
              className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
            >
              {/* Video Embed */}
              <div className="relative aspect-[9/16]">
                {video.embedUrl ? (
                  <iframe
                    src={video.embedUrl}
                    className="w-full h-full"
                    style={{ border: 'none', overflow: 'hidden' }}
                    scrolling="no"
                    frameBorder="0"
                    allowFullScreen={true}
                    allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#496f5d] to-[#49516f] flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-3">
                        <Play className="w-6 h-6 text-white fill-white ml-1" />
                      </div>
                      <span className="text-white font-medium">Coming Soon</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Video Info */}
              <div className="p-5">
                {/* Category Badge */}
                <div className="mb-3">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                    video.category === 'property' 
                      ? 'bg-blue-100 text-blue-700'
                      : video.category === 'podcast'
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {video.category === 'property' && <Home className="w-3 h-3" />}
                    {video.category === 'podcast' && <Mic className="w-3 h-3" />}
                    {video.category === 'knowledge' && <BookOpen className="w-3 h-3" />}
                    {video.category === 'property' ? 'Property View' : video.category === 'podcast' ? 'Podcast' : 'Knowledge'}
                  </span>
                </div>
                
                <h3 className="text-lg font-semibold text-[#49516f] mb-2">
                  {video.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {video.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredVideos.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Play className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No videos yet</h3>
            <p className="text-gray-500">Check back soon for new content!</p>
          </div>
        )}
      </section>
    </main>
  );
}
