'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Map, LayoutGrid, Building2, Home } from 'lucide-react';

const TYPING_PHRASES = [
  'Riviera Jomtien',
  'Copacabana',
  'Supalai Parkville',
  'Baan Balina 3',
];

interface SearchResult {
  id: string;
  name: string;
  type: 'project' | 'property' | 'city';
  city?: string;
}

export default function HeroSearch() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [placeholder, setPlaceholder] = useState('');
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  // Fetch suggestions when query changes
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.trim().length < 2) {
        setSuggestions([]);
        setShowDropdown(false);
        return;
      }

      try {
        const response = await fetch(`/api/search/autocomplete?q=${encodeURIComponent(query)}`);
        if (response.ok) {
          const data = await response.json();
          setSuggestions(data.results || []);
          setShowDropdown(true);
        }
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      }
    };

    const debounce = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
      setShowDropdown(false);
    }
  };

  const handleSuggestionClick = (suggestion: SearchResult) => {
    if (suggestion.type === 'project') {
      router.push(`/projects/${suggestion.id}`);
    } else if (suggestion.type === 'city') {
      router.push(`/properties?city=${encodeURIComponent(suggestion.name)}`);
    } else {
      router.push(`/properties/${suggestion.id}`);
    }
    setQuery('');
    setShowDropdown(false);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Search Input */}
      <div className="relative">
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

      {/* Autocomplete Dropdown */}
      {showDropdown && suggestions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute top-full mt-2 w-full bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 max-h-96 overflow-y-auto"
        >
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.id}
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full px-5 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-100 last:border-0"
            >
              {suggestion.type === 'project' ? (
                <Building2 className="w-5 h-5 text-amber-600 flex-shrink-0" />
              ) : suggestion.type === 'city' ? (
                <Map className="w-5 h-5 text-green-600 flex-shrink-0" />
              ) : (
                <Home className="w-5 h-5 text-blue-600 flex-shrink-0" />
              )}
              <div className="flex-1">
                <div className="font-medium text-gray-900">{suggestion.name}</div>
                {suggestion.city && (
                  <div className="text-sm text-gray-500">{suggestion.city}</div>
                )}
              </div>
              <div className="text-xs text-gray-400 uppercase">
                {suggestion.type}
              </div>
            </button>
          ))}
        </div>
      )}
      </div>

      {/* View Toggle */}
      <div className="flex items-center justify-center mt-4 gap-3">
        <span className="text-white text-sm drop-shadow-md">Search by</span>
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
