'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { GitCompare, X } from 'lucide-react';

export default function ComparisonBar() {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    checkComparisonCount();
    
    // Poll for updates every 2 seconds when bar is visible
    const interval = setInterval(() => {
      if (isVisible) {
        checkComparisonCount();
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [isVisible]);

  const checkComparisonCount = async () => {
    try {
      const res = await fetch('/api/comparison');
      const data = await res.json();
      const newCount = data.comparison?.length || 0;
      setCount(newCount);
      setIsVisible(newCount > 0);
    } catch (error) {
      console.error('Error checking comparison count:', error);
    }
  };

  const clearComparison = async () => {
    try {
      const res = await fetch('/api/comparison');
      const data = await res.json();
      const properties = data.comparison || [];
      
      // Delete all items
      await Promise.all(
        properties.map((p: any) => 
          fetch(`/api/comparison?propertyId=${p.id}`, { method: 'DELETE' })
        )
      );
      
      setCount(0);
      setIsVisible(false);
    } catch (error) {
      console.error('Error clearing comparison:', error);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5">
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-2xl shadow-2xl p-4 pr-6 flex items-center gap-4 min-w-[280px]">
        <div className="bg-white/20 p-3 rounded-xl">
          <GitCompare className="w-6 h-6" />
        </div>
        
        <div className="flex-1">
          <div className="font-bold text-lg">{count} {count === 1 ? 'Property' : 'Properties'}</div>
          <div className="text-sm text-blue-100">Ready to compare</div>
        </div>

        <div className="flex gap-2">
          <Link
            href="/compare"
            className="px-4 py-2 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors text-sm"
          >
            Compare
          </Link>
          
          <button
            onClick={clearComparison}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            title="Clear all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
