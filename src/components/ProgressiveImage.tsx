import React, { useState, useRef, useEffect } from 'react';
import { getOptimizedImageUrl, getBlurPlaceholderUrl, getOptimalFormat } from '../utils/imageOptimization';

interface ProgressiveImageProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  onLoad?: () => void;
  onError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
  placeholder?: string;
  blurDataURL?: string;
}

const ProgressiveImage: React.FC<ProgressiveImageProps> = ({
  src,
  alt,
  className = '',
  priority = false,
  onLoad,
  onError,
  placeholder,
  blurDataURL
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showBlur, setShowBlur] = useState(true);
  const imgRef = useRef<HTMLImageElement>(null);

  // Generate optimized URLs
  const optimizedSrc = getOptimizedImageUrl(src, {
    format: getOptimalFormat('webp'),
    quality: priority ? 90 : 85
  });

  const placeholderSrc = placeholder || blurDataURL || getBlurPlaceholderUrl(src);

  // Handle image loading
  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
    onLoad?.();
    
    // Hide blur placeholder after a short delay for smooth transition
    setTimeout(() => setShowBlur(false), 300);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setImageError(true);
    setImageLoaded(false);
    onError?.(e);
  };

  // Lazy loading with Intersection Observer (skip for priority images)
  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;

    // For priority images, load immediately
    if (priority) {
      if (img.dataset.src) {
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
      }
      return;
    }

    // For non-priority images, use intersection observer
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const imgElement = entry.target as HTMLImageElement;
            if (imgElement.dataset.src) {
              imgElement.src = imgElement.dataset.src;
              imgElement.removeAttribute('data-src');
              observer.unobserve(imgElement);
            }
          }
        });
      },
      {
        rootMargin: '100px',
        threshold: 0.1
      }
    );

    observer.observe(img);

    return () => {
      observer.disconnect();
    };
  }, [priority]);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Blur placeholder */}
      {showBlur && (
        <img
          src={placeholderSrc}
          alt=""
          className="absolute inset-0 w-full h-full object-cover filter blur-sm scale-110"
          style={{ 
            transition: 'opacity 0.3s ease-out',
            opacity: imageLoaded ? 0 : 1 
          }}
        />
      )}
      
      {/* Main image */}
      <img
        ref={imgRef}
        data-src={optimizedSrc}
        alt={alt}
        className={`w-full h-full object-cover transition-all duration-300 ease-out ${
          imageLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        onLoad={handleImageLoad}
        onError={handleImageError}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        referrerPolicy="no-referrer"
        crossOrigin="anonymous"
      />
      
      {/* Error state */}
      {imageError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-center text-gray-400">
            <svg className="w-12 h-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-xs">Image unavailable</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressiveImage;
