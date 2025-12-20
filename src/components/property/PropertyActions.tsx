'use client';

import { useState, useEffect } from 'react';
import { Heart, GitCompare } from 'lucide-react';

interface PropertyActionsProps {
  propertyId: string;
  variant?: 'default' | 'compact';
  showLabels?: boolean;
}

export default function PropertyActions({ 
  propertyId, 
  variant = 'default',
  showLabels = true 
}: PropertyActionsProps) {
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isInComparison, setIsInComparison] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkStatus();
  }, [propertyId]);

  const checkStatus = async () => {
    try {
      const [wishlistRes, comparisonRes] = await Promise.all([
        fetch('/api/wishlist'),
        fetch('/api/comparison')
      ]);
      
      const wishlistData = await wishlistRes.json();
      const comparisonData = await comparisonRes.json();
      
      setIsInWishlist(wishlistData.wishlist?.some((p: any) => p.id === propertyId) || false);
      setIsInComparison(comparisonData.comparison?.some((p: any) => p.id === propertyId) || false);
    } catch (error) {
      console.error('Error checking status:', error);
    }
  };

  const toggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (loading) return;
    setLoading(true);

    try {
      if (isInWishlist) {
        await fetch(`/api/wishlist?propertyId=${propertyId}`, {
          method: 'DELETE',
        });
        setIsInWishlist(false);
      } else {
        await fetch('/api/wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ propertyId }),
        });
        setIsInWishlist(true);
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleComparison = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (loading) return;
    setLoading(true);

    try {
      if (isInComparison) {
        await fetch(`/api/comparison?propertyId=${propertyId}`, {
          method: 'DELETE',
        });
        setIsInComparison(false);
      } else {
        const res = await fetch('/api/comparison', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ propertyId }),
        });
        
        if (res.ok) {
          setIsInComparison(true);
        } else {
          const data = await res.json();
          alert(data.error || 'Failed to add to comparison');
        }
      }
    } catch (error) {
      console.error('Error toggling comparison:', error);
    } finally {
      setLoading(false);
    }
  };

  if (variant === 'compact') {
    return (
      <div className="flex gap-2">
        <button
          onClick={toggleWishlist}
          disabled={loading}
          className={`p-2 rounded-full transition-all ${
            isInWishlist
              ? 'bg-red-500 text-white hover:bg-red-600'
              : 'bg-white/90 backdrop-blur text-gray-700 hover:bg-red-50 hover:text-red-500'
          } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          title={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart className={`w-5 h-5 ${isInWishlist ? 'fill-current' : ''}`} />
        </button>
        
        <button
          onClick={toggleComparison}
          disabled={loading}
          className={`p-2 rounded-full transition-all ${
            isInComparison
              ? 'bg-blue-500 text-white hover:bg-blue-600'
              : 'bg-white/90 backdrop-blur text-gray-700 hover:bg-blue-50 hover:text-blue-500'
          } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          title={isInComparison ? 'Remove from comparison' : 'Add to comparison'}
        >
          <GitCompare className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      <button
        onClick={toggleWishlist}
        disabled={loading}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
          isInWishlist
            ? 'bg-red-500 text-white hover:bg-red-600'
            : 'bg-white border border-gray-300 text-gray-700 hover:bg-red-50 hover:border-red-300 hover:text-red-500'
        } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <Heart className={`w-5 h-5 ${isInWishlist ? 'fill-current' : ''}`} />
        {showLabels && (
          <span>{isInWishlist ? 'Saved' : 'Save'}</span>
        )}
      </button>
      
      <button
        onClick={toggleComparison}
        disabled={loading}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
          isInComparison
            ? 'bg-blue-500 text-white hover:bg-blue-600'
            : 'bg-white border border-gray-300 text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-500'
        } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <GitCompare className="w-5 h-5" />
        {showLabels && (
          <span>{isInComparison ? 'In Comparison' : 'Compare'}</span>
        )}
      </button>
    </div>
  );
}
