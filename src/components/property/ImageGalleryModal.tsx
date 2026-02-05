'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface ImageGalleryModalProps {
  images: string[];
  title: string;
  initialIndex?: number;
  onClose: () => void;
}

export default function ImageGalleryModal({ 
  images, 
  title, 
  initialIndex = 0,
  onClose 
}: ImageGalleryModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const goToImage = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
        aria-label="Close gallery"
      >
        <X className="w-6 h-6 text-white" />
      </button>

      {/* Main Image */}
      <div className="relative w-full h-full max-w-5xl max-h-[80vh] flex flex-col">
        <div className="relative flex-1 bg-black rounded-lg overflow-hidden">
          <Image
            src={images[currentIndex]}
            alt={`${title} - ${currentIndex + 1}`}
            fill
            className="object-contain"
            priority
          />

          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 bg-white/20 hover:bg-white/40 rounded-full transition-colors"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 bg-white/20 hover:bg-white/40 rounded-full transition-colors"
                aria-label="Next image"
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </button>
            </>
          )}

          {/* Image Counter */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm font-medium">
            {currentIndex + 1} / {images.length}
          </div>
        </div>

        {/* Thumbnail Strip */}
        {images.length > 1 && (
          <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => goToImage(index)}
                className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden transition-all ${
                  currentIndex === index
                    ? 'ring-2 ring-white'
                    : 'opacity-60 hover:opacity-100'
                }`}
              >
                <Image
                  src={image}
                  alt={`${title} - ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
