'use client'

import React, { useState, useEffect } from 'react';

interface ArtLoaderProps {
  className?: string;
}

const ArtLoader: React.FC<ArtLoaderProps> = ({ className = '' }) => {
  const [currentArtIndex, setCurrentArtIndex] = useState(0);

  // Different art styles/icons that will cycle through
  const artStyles = [
    // Abstract shapes
    { icon: '🎨', name: 'Abstract Art' },
    { icon: '🖼️', name: 'Canvas' },
    { icon: '🎭', name: 'Theater Masks' },
    { icon: '🖌️', name: 'Paint Brush' },
    { icon: '🎪', name: 'Circus' },
    { icon: '🎨', name: 'Artist Palette' },
    { icon: '🖼️', name: 'Framed Picture' },
    { icon: '🎭', name: 'Drama' },
    { icon: '🖌️', name: 'Painting' },
    { icon: '🎪', name: 'Performance' },
    { icon: '🎨', name: 'Creative' },
    { icon: '🖼️', name: 'Gallery' },
    { icon: '🎭', name: 'Artistic' },
    { icon: '🖌️', name: 'Design' },
    { icon: '🎪', name: 'Show' },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentArtIndex((prevIndex) => (prevIndex + 1) % artStyles.length);
    }, 200); // Change every 200ms for fast speed

    return () => clearInterval(interval);
  }, [artStyles.length]);

  return (
    <div className={`flex flex-col items-center justify-center space-y-4 ${className}`}>
      {/* Animated art icon */}
      <div className="relative">
        <div className="w-16 h-16 flex items-center justify-center text-4xl animate-pulse">
          {artStyles[currentArtIndex].icon}
        </div>
        {/* Rotating border effect */}
        <div className="absolute inset-0 w-16 h-16 border-2 border-pink-300 border-t-pink-600 rounded-full animate-spin"></div>
      </div>
      
      {/* Art style name */}
      <div className="text-center">
        <div className="text-sm font-medium text-gray-600 animate-fade-in">
          {artStyles[currentArtIndex].name}
        </div>
        <div className="text-xs text-gray-500 mt-1">
          Loading your artistic experience...
        </div>
      </div>
      
      {/* Progress dots */}
      <div className="flex space-x-1">
        {artStyles.slice(0, 5).map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full transition-colors duration-200 ${
              index === currentArtIndex % 5 ? 'bg-pink-600' : 'bg-pink-200'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default ArtLoader;




