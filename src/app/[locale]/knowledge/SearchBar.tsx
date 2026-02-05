'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, X } from 'lucide-react';

export default function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');

  useEffect(() => {
    setQuery(searchParams.get('q') || '');
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    
    if (query.trim()) {
      params.set('q', query.trim());
    } else {
      params.delete('q');
    }
    
    router.push(`/knowledge?${params.toString()}`);
  };

  const clearSearch = () => {
    setQuery('');
    const params = new URLSearchParams(searchParams.toString());
    params.delete('q');
    router.push(`/knowledge?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSearch} className="w-full max-w-2xl mx-auto mb-8">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search articles by title, content, or keywords..."
          className="w-full pl-12 pr-12 py-4 rounded-xl border-2 border-gray-200 focus:border-[#496f5d] focus:outline-none text-gray-700 placeholder-gray-400 transition-colors"
        />
        {query && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        )}
      </div>
      {query && (
        <p className="text-sm text-gray-500 mt-2 text-center">
          Searching for: <span className="font-semibold text-gray-700">&quot;{query}&quot;</span>
        </p>
      )}
    </form>
  );
}
