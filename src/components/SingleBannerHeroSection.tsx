import React from 'react';
import { Link } from '@/src/compat/router';
import { ArrowRight } from 'lucide-react';
import OptimizedImage from './OptimizedImage';
import { SingleBannerHeroConfig } from '../types';

interface SingleBannerHeroSectionProps {
  config: SingleBannerHeroConfig;
}

const SingleBannerHeroSection: React.FC<SingleBannerHeroSectionProps> = ({ config }) => {
  if (!config) return null;

  const {
    title,
    subtitle,
    buttonText,
    buttonLink,
    image,
    height = 'medium',
    textColor = 'light',
    overlayOpacity = 40,
    alignment = 'center',
  } = config;

  // Height mappings (for gradient backgrounds)
  const heightClasses = {
    small: 'h-[260px] sm:h-[340px]',
    medium: 'h-[360px] sm:h-[480px]',
    large: 'h-[460px] sm:h-[620px]',
  };

  // Alignment classes inside max-w-7xl content grid
  const alignmentGridClasses = {
    left: 'items-start text-left mr-auto max-w-2xl',
    center: 'items-center text-center mx-auto max-w-3xl',
    right: 'items-end text-right ml-auto max-w-2xl',
  };

  const isLight = textColor === 'light';

  return (
    <section className="p-0 bg-white">
      <div className={`relative w-full ${image ? 'h-auto' : heightClasses[height]} overflow-hidden group flex`}>
        {/* Background Image / Gradient */}
        {image ? (
          <>
            <img
              src={image}
              alt={title}
              className="w-full h-auto block select-none pointer-events-none"
            />
            {/* Overlay for contrast */}
            <div 
              className="absolute inset-0 z-10 transition-opacity duration-300 pointer-events-none" 
              style={{ backgroundColor: `rgba(0, 0, 0, ${overlayOpacity / 100})` }}
            />
          </>
        ) : (
          <div
            className={`absolute inset-0 bg-gradient-to-br ${
              isLight ? 'from-gray-800 to-gray-950' : 'from-gray-50 to-gray-200'
            } z-0`}
          />
        )}

        {/* Content Area (Absolute overlay aligned inside max-w-7xl container) */}
        <div className="absolute inset-0 z-20 w-full h-full flex items-center">
          <div className={`max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 flex flex-col ${alignmentGridClasses[alignment]}`}>
            <h1
              className={`text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-4 transition-colors duration-300 leading-tight font-sans ${
                isLight ? 'text-white drop-shadow-sm' : 'text-gray-900'
              }`}
            >
              {title}
            </h1>
            <p
              className={`text-sm sm:text-base md:text-lg mb-8 max-w-2xl leading-relaxed font-sans font-normal transition-colors duration-300 ${
                isLight ? 'text-white/90 drop-shadow-sm' : 'text-gray-600'
              }`}
            >
              {subtitle}
            </p>

            {buttonText && buttonLink && (
              <div className="flex shrink-0">
                <Link
                  to={buttonLink}
                  className={`inline-flex items-center justify-center px-6 py-3 rounded-full text-xs sm:text-sm font-semibold transition-all duration-300 transform hover:scale-[1.03] shadow-md hover:shadow-lg ${
                    isLight
                      ? 'bg-white text-gray-900 hover:bg-gray-100'
                      : 'bg-gray-900 text-white hover:bg-gray-800'
                  }`}
                >
                  <span>{buttonText}</span>
                  <ArrowRight className="ml-2 w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SingleBannerHeroSection;
