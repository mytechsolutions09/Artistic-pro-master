import React, { useState, useEffect, useRef } from 'react';
import { optimizeImageUrl, preloadImage } from '../utils/imageOptimization';
import { getOptimalImageQuality, isSlowConnection } from '../utils/performanceUtils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  onError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
  onClick?: () => void;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  width,
  height,
  priority = false,
  onError,
  onClick
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);
  const [imageSrc, setImageSrc] = useState<string>('');

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || !imgRef.current) return;

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
        rootMargin: '100px', // Start loading 100px before image enters viewport
        threshold: 0.01
      }
    );

    observer.observe(imgRef.current);

    return () => {
      observer.disconnect();
    };
  }, [priority]);

  // Optimize image URL and preload if priority
  useEffect(() => {
    if (!isInView) return;

    const quality = getOptimalImageQuality();
    const optimizedSrc = optimizeImageUrl(src, width, quality);
    
    // Preload priority images
    if (priority) {
      preloadImage(optimizedSrc)
        .then(() => {
          setImageSrc(optimizedSrc);
          setIsLoaded(true);
        })
        .catch(() => {
          setImageSrc(optimizedSrc);
        });
    } else {
      setImageSrc(optimizedSrc);
    }
  }, [isInView, src, width, priority]);

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
    <div className="relative overflow-hidden" style={{ width: '100%', height: '100%' }}>
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
      <img
        ref={imgRef}
        src={isInView ? imageSrc : ''}
        alt={alt}
        className={`${className} ${!isLoaded ? 'opacity-0' : 'opacity-100'} transition-opacity duration-500`}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        fetchpriority={priority ? 'high' : 'auto'}
        onLoad={handleLoad}
        onError={handleError}
        onClick={onClick}
        style={{
          width: '100%',
          height: '100%',
        }}
      />
    </div>
  );
};

export default OptimizedImage;

