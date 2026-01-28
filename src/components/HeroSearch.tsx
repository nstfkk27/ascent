'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Map, LayoutGrid } from 'lucide-react';

const TYPING_PHRASES = [
  'Riviera Jomtien',
  'Copacabana',
  'Supalai Parkville',
  'Baan Balina 3',
];

export default function HeroSearch() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [placeholder, setPlaceholder] = useState('');
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Typing animation effect
  useEffect(() => {
    if (isFocused || query) return; // Stop animation when focused or has input

    const currentPhrase = TYPING_PHRASES[phraseIndex];
    
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        // Typing
        if (charIndex < currentPhrase.length) {
          setPlaceholder(currentPhrase.substring(0, charIndex + 1));
          setCharIndex(charIndex + 1);
        } else {
          // Pause at end of phrase
          setTimeout(() => setIsDeleting(true), 2000);
        }
      } else {
        // Deleting
        if (charIndex > 0) {
          setPlaceholder(currentPhrase.substring(0, charIndex - 1));
          setCharIndex(charIndex - 1);
        } else {
          setIsDeleting(false);
          setPhraseIndex((phraseIndex + 1) % TYPING_PHRASES.length);
        }
      }
    }, isDeleting ? 30 : 80);

    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, phraseIndex, isFocused, query]);

  // Reset animation when focus is lost and no query
  useEffect(() => {
    if (!isFocused && !query) {
      setCharIndex(0);
      setPlaceholder('');
      setIsDeleting(false);
    }
  }, [isFocused, query]);

  const handleSearch = (viewType: 'map' | 'grid') => {
    const searchQuery = query.trim();
    if (viewType === 'map') {
      router.push(searchQuery ? `/search?query=${encodeURIComponent(searchQuery)}` : '/search');
    } else {
      router.push(searchQuery ? `/properties?query=${encodeURIComponent(searchQuery)}` : '/properties');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch('grid');
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Search Input */}
      <div className="relative flex items-center bg-white rounded-full shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-shadow duration-300">
        <div className="pl-5 pr-2 text-gray-400">
          <Search className="w-5 h-5" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder={isFocused ? 'What are you looking for?' : placeholder || '|'}
          className="flex-1 py-4 px-2 text-gray-900 placeholder-gray-400 focus:outline-none text-base md:text-lg bg-transparent"
        />
        <button
          onClick={() => handleSearch('grid')}
          className="m-1.5 px-6 py-3 bg-[#496f5d] text-white font-semibold rounded-full hover:bg-[#3d5c4d] transition-all duration-300 flex items-center gap-2 shadow-md hover:shadow-lg"
        >
          <Search className="w-4 h-4" />
          <span className="hidden sm:inline">Search</span>
        </button>
      </div>

      {/* View Toggle */}
      <div className="flex items-center justify-center mt-4 gap-3">
        <span className="text-gray-500 text-sm">Search by</span>
        <div className="flex items-center bg-white rounded-full shadow-md border border-gray-100 p-1">
          <button
            onClick={() => handleSearch('map')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium text-gray-600 hover:bg-[#496f5d] hover:text-white transition-all duration-200"
          >
            <Map className="w-4 h-4" />
            Map
          </button>
          <button
            onClick={() => handleSearch('grid')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium text-gray-600 hover:bg-[#496f5d] hover:text-white transition-all duration-200"
          >
            <LayoutGrid className="w-4 h-4" />
            Grid
          </button>
        </div>
      </div>
    </div>
  );
}
