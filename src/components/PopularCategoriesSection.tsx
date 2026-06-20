'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Link } from '@/src/compat/router';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import OptimizedImage from './OptimizedImage';

export interface CategorySliderItem {
  id: string;
  name: string;
  sublabel?: string;
  image: string;
  link: string;
}

export interface PopularCategoriesSectionProps {
  config?: {
    enabled?: boolean;
    title?: string;
    items?: CategorySliderItem[];
  };
}

const defaultItems: CategorySliderItem[] = [
  {
    id: 'canvas',
    name: 'Canvas',
    sublabel: 'Art Prints',
    image: 'https://images.pexels.com/photos/1090638/pexels-photo-1090638.jpeg?auto=compress&cs=tinysrgb&w=400',
    link: '/categories/abstract',
  },
  {
    id: 'football',
    name: 'Football',
    image: 'https://images.pexels.com/photos/3621122/pexels-photo-3621122.jpeg?auto=compress&cs=tinysrgb&w=400',
    link: '/categories/cars', // Defaulting to an active category, user can customize
  },
  {
    id: 'poster-packs',
    name: 'Poster Packs',
    image: 'https://images.pexels.com/photos/6758531/pexels-photo-6758531.jpeg?auto=compress&cs=tinysrgb&w=400',
    link: '/categories/paintings',
  },
  {
    id: 'summer',
    name: 'Summer',
    image: 'https://images.pexels.com/photos/189349/pexels-photo-189349.jpeg?auto=compress&cs=tinysrgb&w=400',
    link: '/categories/watercolor',
  },
];

const PopularCategoriesSection: React.FC<PopularCategoriesSectionProps> = ({ config }) => {
  const isEnabled = config?.enabled !== false;
  const title = config?.title || 'Popular Categories';
  const items = config?.items && config.items.length > 0 ? config.items : defaultItems;

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const checkScrollLimits = () => {
    const container = scrollContainerRef.current;
    if (container) {
      const { scrollLeft, scrollWidth, clientWidth } = container;
      setShowLeftArrow(scrollLeft > 10);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollLimits);
      // Run once initially
      checkScrollLimits();
      // Handle resize
      window.addEventListener('resize', checkScrollLimits);
    }
    return () => {
      if (container) {
        container.removeEventListener('scroll', checkScrollLimits);
      }
      window.removeEventListener('resize', checkScrollLimits);
    };
  }, [items]);

  const handleScroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollAmount = container.clientWidth * 0.75;
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (!isEnabled) return null;

  return (
    <section className="py-12 px-4 bg-white relative select-none">
      <div className="max-w-7xl mx-auto relative">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 font-sans tracking-tight">
            {title}
          </h2>
        </div>

        {/* Carousel Wrapper */}
        <div className="relative group">
          {/* Left Arrow Button */}
          {showLeftArrow && (
            <button
              onClick={() => handleScroll('left')}
              className="absolute -left-2 sm:-left-5 top-1/2 -translate-y-1/2 z-20 bg-white hover:bg-gray-50 text-gray-700 p-2.5 sm:p-3 rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.08)] border border-gray-100 transition-all duration-200 hover:scale-110 flex items-center justify-center focus:outline-none"
              aria-label="Previous categories"
            >
              <ChevronLeft size={20} className="stroke-[2.5]" />
            </button>
          )}

          {/* Right Arrow Button */}
          {showRightArrow && (
            <button
              onClick={() => handleScroll('right')}
              className="absolute -right-2 sm:-right-5 top-1/2 -translate-y-1/2 z-20 bg-white hover:bg-gray-50 text-gray-700 p-2.5 sm:p-3 rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.08)] border border-gray-100 transition-all duration-200 hover:scale-110 flex items-center justify-center focus:outline-none"
              aria-label="Next categories"
            >
              <ChevronRight size={20} className="stroke-[2.5]" />
            </button>
          )}

          {/* Scrollable track */}
          <div
            ref={scrollContainerRef}
            className="flex justify-start md:justify-evenly gap-6 md:gap-0 overflow-x-auto scrollbar-hide scroll-smooth py-2 px-6 md:px-0 snap-x snap-mandatory"
          >
            {items.map((item) => (
              <Link
                key={item.id}
                to={item.link}
                className="flex flex-col items-center flex-shrink-0 snap-start group w-24 sm:w-28 md:w-32"
              >
                {/* Circle Container */}
                <div className="relative w-full aspect-square rounded-full overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-gray-100/50 bg-gray-50 flex items-center justify-center">
                  <OptimizedImage
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-500 scale-100 group-hover:scale-[1.06]"
                    width={280}
                    height={280}
                  />
                </div>

                {/* Labels */}
                <div className="mt-4 text-center">
                  <span className="block text-sm sm:text-base font-semibold text-gray-800 tracking-tight leading-tight group-hover:text-gray-950 transition-colors duration-200">
                    {item.name}
                  </span>
                  {item.sublabel && (
                    <span className="block text-xs text-gray-500 mt-0.5 tracking-normal leading-none font-medium">
                      {item.sublabel}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PopularCategoriesSection;
