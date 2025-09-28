import React from 'react';

interface ImageSkeletonProps {
  className?: string;
  aspectRatio?: 'square' | 'video' | 'portrait' | 'landscape';
  showText?: boolean;
}

const ImageSkeleton: React.FC<ImageSkeletonProps> = ({ 
  className = '', 
  aspectRatio = 'square',
  showText = false 
}) => {
  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case 'square':
        return 'aspect-square';
      case 'video':
        return 'aspect-video';
      case 'portrait':
        return 'aspect-[3/4]';
      case 'landscape':
        return 'aspect-[4/3]';
      default:
        return 'aspect-square';
    }
  };

  return (
    <div className={`relative overflow-hidden bg-gray-200 rounded-lg ${getAspectRatioClass()} ${className}`}>
      {/* Animated shimmer effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
      </div>
      
      {/* Optional text placeholder */}
      {showText && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 bg-gray-300 rounded-full mx-auto mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-300 rounded w-24 mx-auto animate-pulse"></div>
          </div>
        </div>
      )}
      
      {/* Loading indicator */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-pink-500 rounded-full animate-spin"></div>
      </div>
    </div>
  );
};

export default ImageSkeleton;
