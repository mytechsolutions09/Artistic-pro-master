'use client'

import React, { useState, useEffect, useRef } from 'react';
import { optimizeImageUrl, preloadImage } from '../utils/imageOptimization';
import { getOptimalImageQuality } from '../utils/performanceUtils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  quality?: number;
  priority?: boolean;
  onError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
  onClick?: () => void;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  width,
  quality,
  priority = false,
  onError,
  onClick
}) => {
  const serverSafeSrc = src ? optimizeImageUrl(src, width, quality) : '/placeholder-image.jpg';
  const [isLoaded, setIsLoaded] = useState(priority);
  const [isInView, setIsInView] = useState(priority); // Start with true for priority images
  const imgRef = useRef<HTMLImageElement>(null);
  const [imageSrc, setImageSrc] = useState<string>(priority ? serverSafeSrc : '');
  const [hasError, setHasError] = useState(false);

  // Intersection Observer for lazy loading - ENABLED for non-priority images
  useEffect(() => {
    if (priority) {
      setIsInView(true); // Load immediately for priority images
      return;
    }

    // Use a container div ref for intersection observer
    const container = imgRef.current?.parentElement;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '200px', // Start loading 200px before image enters viewport
        threshold: 0.01
      }
    );

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, [priority]);

  // Optimize image URL and load when in view
  useEffect(() => {
    if (!src) {
      setImageSrc('/placeholder-image.jpg');
      setHasError(false);
      return;
    }
    
    // For priority images, load immediately
    // For non-priority, wait until in view
    if (!priority && !isInView) {
      setImageSrc('');
      return;
    }

    // Reset loaded and error state when src changes
    setIsLoaded(false);
    setHasError(false);

    const resolvedQuality = quality ?? getOptimalImageQuality();
    const optimizedSrc = optimizeImageUrl(src, width, resolvedQuality);
    
    setImageSrc(optimizedSrc);
  }, [src, width, priority, isInView, quality]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (imageSrc !== '/placeholder-image.jpg') {
      setImageSrc('/placeholder-image.jpg');
    } else {
      setHasError(true);
      setIsLoaded(true);
    }
    if (onError) {
      onError(e);
    }
  };

  if (hasError || (!src && !imageSrc)) {
    return (
      <div ref={imgRef} className="relative w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
        <div className="text-center p-4">
          <svg className="w-10 h-10 mx-auto mb-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-xs font-medium text-gray-400 truncate block max-w-[150px] mx-auto">{alt || 'Lurevi Art'}</span>
        </div>
      </div>
    );
  }

  return (
    <div ref={imgRef} className="relative overflow-hidden" style={{ width: '100%', height: '100%' }}>
      {/* Blur placeholder */}
      {!priority && !isLoaded && (
        <div 
          className="absolute inset-0 bg-gray-200 animate-pulse"
          style={{
            filter: 'blur(10px)',
            transform: 'scale(1.1)'
          }}
        />
      )}
      
      {/* Actual image */}
      {imageSrc && (
        <img
          src={imageSrc}
          alt={alt}
          className={`${className} ${(!priority && !isLoaded) ? 'opacity-0' : 'opacity-100'} ${!priority ? 'transition-opacity duration-500' : ''}`}
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : undefined}
          decoding="async"
          onLoad={handleLoad}
          onError={handleError}
          onClick={onClick}
          style={{
            width: '100%',
            height: '100%',
          }}
        />
      )}
    </div>
  );
};

export default OptimizedImage;





