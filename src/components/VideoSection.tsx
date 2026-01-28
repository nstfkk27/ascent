'use client';

import { useState } from 'react';
import { Play, Home, Mic, BookOpen, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface VideoItem {
  id: string;
  title: string;
  embedUrl: string;
  category: 'property' | 'podcast' | 'knowledge';
}

// Video data - add more videos here as needed
const VIDEOS: VideoItem[] = [
  {
    id: '1',
    title: 'Property Tour',
    embedUrl: 'https://www.facebook.com/plugins/video.php?height=476&href=https%3A%2F%2Fwww.facebook.com%2Freel%2F722355720828238%2F&show_text=false&width=267&t=0',
    category: 'property',
  },
  {
    id: '2',
    title: 'Podcast Episode',
    embedUrl: '', // Add podcast embed URL when available
    category: 'podcast',
  },
  {
    id: '3',
    title: 'Market Knowledge',
    embedUrl: '', // Add knowledge embed URL when available
    category: 'knowledge',
  },
];

const TABS = [
  { id: 'property', label: 'Property View', icon: Home },
  { id: 'podcast', label: 'Podcast', icon: Mic },
  { id: 'knowledge', label: 'Knowledge', icon: BookOpen },
] as const;

export default function VideoSection() {
  const [activeTab, setActiveTab] = useState<'property' | 'podcast' | 'knowledge'>('property');

  const currentVideo = VIDEOS.find(v => v.category === activeTab);

  return (
    <section className="py-24 bg-gradient-to-br from-gray-900 via-[#49516f] to-gray-900 relative overflow-hidden">
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
            <Play className="w-4 h-4 text-white" />
            <span className="text-white/90 text-sm font-medium">Watch & Learn</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Pattaya Property Insights
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Quick tours, market tips, and local insights from our team
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-white/10 backdrop-blur-sm rounded-full p-1 border border-white/20">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-[#496f5d] text-white shadow-lg'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Video Display */}
        <div className="flex justify-center">
          <div className="w-full max-w-sm">
            {currentVideo?.embedUrl ? (
              <div className="relative aspect-[9/16] rounded-2xl overflow-hidden shadow-2xl">
                <iframe
                  src={currentVideo.embedUrl}
                  className="w-full h-full"
                  style={{ border: 'none', overflow: 'hidden' }}
                  scrolling="no"
                  frameBorder="0"
                  allowFullScreen={true}
                  allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                />
              </div>
            ) : (
              <div className="relative aspect-[9/16] rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-[#496f5d] to-[#49516f]">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4">
                      <Play className="w-8 h-8 text-white fill-white ml-1" />
                    </div>
                    <span className="text-white text-lg font-medium">Coming Soon</span>
                    <p className="text-white/60 text-sm mt-2">Stay tuned for new content</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* See More Button */}
        <div className="mt-10 text-center">
          <Link
            href="/videos"
            className="inline-flex items-center gap-2 bg-[#496f5d] hover:bg-[#3d5c4d] text-white px-8 py-4 rounded-full font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            See More Videos
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
