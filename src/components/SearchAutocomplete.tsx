'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, MapPin, Hash } from 'lucide-react';
import { createCompoundSlug } from '@/utils/propertyHelpers';

interface Suggestion {
  type: 'project' | 'city' | 'reference';
  id?: string;
  slug?: string;
  name: string;
  nameTh?: string;
  subtitle: string;
  category?: string;
  icon: string;
}

interface SearchAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (suggestion: Suggestion) => void;
  placeholder?: string;
  className?: string;
}

export default function SearchAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = 'Search projects, locations, or ID...',
  className = ''
}: SearchAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const abortControllerRef = useRef<AbortController | null>(null);

  // Fetch suggestions with debounce
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (value.length < 2) {
        setSuggestions([]);
        setIsOpen(false);
        return;
      }

      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();
      setIsLoading(true);

      try {
        const response = await fetch(
          `/api/search/autocomplete?q=${encodeURIComponent(value)}`,
          { signal: abortControllerRef.current.signal }
        );

        if (response.ok) {
          const data = await response.json();
          setSuggestions(data.suggestions || []);
          setIsOpen(data.suggestions.length > 0);
        }
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          console.error('Autocomplete error:', error);
        }
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timer);
  }, [value]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSelect(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleSelect = (suggestion: Suggestion) => {
    setIsOpen(false);
    setSelectedIndex(-1);

    if (onSelect) {
      onSelect(suggestion);
    }

    // Handle navigation based on type
    switch (suggestion.type) {
      case 'project':
        // Navigate to project page
        const projectSlug = suggestion.name.toLowerCase().replace(/\s+/g, '-');
        router.push(`/project/${encodeURIComponent(projectSlug)}`);
        break;
      case 'city':
        // Apply city filter
        onChange(suggestion.name);
        break;
      case 'reference':
        // Navigate to property detail
        if (suggestion.id) {
          const url = suggestion.slug
            ? `/properties/${createCompoundSlug(suggestion.slug, suggestion.id)}`
            : `/properties/${suggestion.id}`;
          router.push(url);
        }
        break;
    }
  };

  const getIcon = (iconType: string) => {
    switch (iconType) {
      case 'building':
        return <Building2 className="w-4 h-4" />;
      case 'map-pin':
        return <MapPin className="w-4 h-4" />;
      case 'hash':
        return <Hash className="w-4 h-4" />;
      default:
        return <Building2 className="w-4 h-4" />;
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'project':
        return 'text-blue-500';
      case 'city':
        return 'text-green-500';
      case 'reference':
        return 'text-purple-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="relative w-full">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => value.length >= 2 && suggestions.length > 0 && setIsOpen(true)}
        placeholder={placeholder}
        className={className}
      />

      {isLoading && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <div className="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {isOpen && suggestions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={`${suggestion.type}-${suggestion.id || suggestion.name}-${index}`}
              onClick={() => handleSelect(suggestion)}
              className={`w-full px-4 py-3 flex items-start gap-3 hover:bg-gray-50 transition-colors text-left ${
                index === selectedIndex ? 'bg-gray-50' : ''
              } ${index !== 0 ? 'border-t border-gray-100' : ''}`}
            >
              <div className={`mt-0.5 ${getIconColor(suggestion.type)}`}>
                {getIcon(suggestion.icon)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 truncate">
                  {suggestion.name}
                  {suggestion.nameTh && (
                    <span className="text-gray-500 ml-2 text-sm">
                      {suggestion.nameTh}
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-500 truncate">
                  {suggestion.subtitle}
                </div>
              </div>
              {suggestion.category && (
                <div className="text-xs text-gray-400 uppercase tracking-wider mt-1">
                  {suggestion.category}
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
