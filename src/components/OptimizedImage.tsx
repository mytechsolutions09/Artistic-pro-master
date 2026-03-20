'use client'

import React, { useState, useEffect, useRef } from 'react';
import { optimizeImageUrl, preloadImage } from '../utils/imageOptimization';
import { getOptimalImageQuality } from '../utils/performanceUtils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  priority?: boolean;
  onError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
  onClick?: () => void;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  width,
  priority = false,
  onError,
  onClick
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority); // Start with true for priority images
  const imgRef = useRef<HTMLImageElement>(null);
  const [imageSrc, setImageSrc] = useState<string>('');

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
    if (!src) return;
    
    // For priority images, load immediately
    // For non-priority, wait until in view
    if (!priority && !isInView) {
      setImageSrc('');
      return;
    }

    // Reset loaded state when src changes
    setIsLoaded(false);

    const quality = getOptimalImageQuality();
    const optimizedSrc = optimizeImageUrl(src, width, quality);
    
    setImageSrc(optimizedSrc);
  }, [src, width, priority, isInView]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setIsLoaded(true); // Still remove blur even on error
    if (onError) {
      onError(e);
    }
  };

  return (
    <div ref={imgRef} className="relative overflow-hidden" style={{ width: '100%', height: '100%' }}>
      {/* Blur placeholder */}
      {!isLoaded && (
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
          className={`${className} ${!isLoaded ? 'opacity-0' : 'opacity-100'} transition-opacity duration-500`}
          loading={priority ? 'eager' : 'lazy'}
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





