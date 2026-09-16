import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useVistora } from '../../context/VistoraContext';

export const CATEGORIES = [
  'All',
  'Nature',
  'Travel',
  'Architecture',
  'Fashion',
  'Technology',
  'Cars',
  'Food',
  'Interior',
  'Art',
  'Photography',
  'Wallpapers',
  'Business',
  'People',
  'Animals',
  'Space',
  'Sports',
];

export const CategoryBar: React.FC = () => {
  const { selectedCategory, setSelectedCategory, setSearchQuery } = useVistora();
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const handleCategorySelect = (cat: string) => {
    const formatted = cat.toLowerCase();
    setSelectedCategory(formatted);
    if (formatted !== 'all') {
      setSearchQuery(cat);
    } else {
      setSearchQuery('');
    }
  };

  return (
    <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 group">
      {/* Scroll Left Button */}
      <button
        onClick={() => handleScroll('left')}
        aria-label="Scroll categories left"
        className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/90 dark:bg-[#1B1B1B]/90 shadow-md border border-[#EAEAEA] dark:border-[#333333] items-center justify-center text-[#171717] dark:text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:bg-[#FFF4B8] dark:hover:bg-[#FFD21F]/20"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* Horizontal Scroll Track */}
      <div
        ref={scrollRef}
        className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth py-1"
      >
        {CATEGORIES.map(category => {
          const catKey = category.toLowerCase();
          const isActive = selectedCategory === catKey || (selectedCategory === 'all' && category === 'All');

          return (
            <button
              key={category}
              onClick={() => handleCategorySelect(category)}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer select-none ${
                isActive
                  ? 'bg-[#FFD21F] text-[#171717] shadow-xs scale-[1.02]'
                  : 'bg-white dark:bg-[#1B1B1B] text-[#666666] dark:text-[#A0A0A0] border border-[#EAEAEA] dark:border-[#2A2A2A] hover:border-[#FFD21F] hover:text-[#171717] dark:hover:text-white'
              }`}
            >
              {category}
            </button>
          );
        })}
      </div>

      {/* Scroll Right Button */}
      <button
        onClick={() => handleScroll('right')}
        aria-label="Scroll categories right"
        className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/90 dark:bg-[#1B1B1B]/90 shadow-md border border-[#EAEAEA] dark:border-[#333333] items-center justify-center text-[#171717] dark:text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:bg-[#FFF4B8] dark:hover:bg-[#FFD21F]/20"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};
