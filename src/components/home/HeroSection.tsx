import React, { useState } from 'react';
import { Search, Sparkles } from 'lucide-react';
import { useVistora } from '../../context/VistoraContext';

export const HeroSection: React.FC = () => {
  const { setSearchQuery } = useVistora();
  const [heroInput, setHeroInput] = useState('');

  const handleHeroSearch = (term?: string) => {
    const q = (term !== undefined ? term : heroInput).trim();
    if (q) {
      setSearchQuery(q);
    }
  };

  const trendingPicks = [
    'Modern African House',
    'Minimalist Workspace',
    'Travertine Kitchen',
    'Nordic Fjord',
    'Tokyo Street Style',
  ];

  return (
    <div className="relative w-full overflow-hidden pt-10 pb-8 sm:pt-14 sm:pb-12 text-center">
      {/* Subtle Yellow Decorative Geometric Accents */}
      <div className="absolute top-4 left-1/4 -translate-x-1/2 w-64 h-64 bg-[#FFD21F]/10 dark:bg-[#FFD21F]/5 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-2 right-1/4 translate-x-1/2 w-80 h-80 bg-[#FFF4B8]/30 dark:bg-[#FFD21F]/5 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Hero Badge */}
      <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#FFF4B8] dark:bg-[#FFD21F]/15 border border-[#FFD21F]/40 text-[#171717] dark:text-[#FFDF4D] text-xs font-bold tracking-wide uppercase mb-4">
        <Sparkles className="w-3.5 h-3.5 text-[#FFD21F]" />
        Vistora Visual Engine 2.0
      </div>

      {/* Main Headline */}
      <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#171717] dark:text-white max-w-3xl mx-auto px-4 leading-[1.1]">
        Discover something <span className="underline decoration-[#FFD21F] decoration-4 underline-offset-4">beautiful</span>.
      </h1>

      {/* Subheadline */}
      <p className="mt-3 text-base sm:text-lg text-[#666666] dark:text-[#A0A0A0] max-w-xl mx-auto px-4">
        Find photos, videos and ideas that inspire what comes next.
      </p>

      {/* Large Search Bar */}
      <div className="mt-8 max-w-2xl mx-auto px-4">
        <form
          onSubmit={e => {
            e.preventDefault();
            handleHeroSearch();
          }}
          className="relative flex items-center bg-white dark:bg-[#1B1B1B] rounded-full shadow-lg border border-[#EAEAEA] dark:border-[#2A2A2A] p-1.5 focus-within:border-[#FFD21F] focus-within:ring-3 focus-within:ring-[#FFD21F]/30 transition-all"
        >
          <div className="pl-4 pr-2 text-[#888888]">
            <Search className="w-5 h-5 text-[#888888]" />
          </div>
          <input
            type="text"
            placeholder="Search photos, videos, ideas, spaces..."
            value={heroInput}
            onChange={e => setHeroInput(e.target.value)}
            className="flex-1 py-2 text-sm sm:text-base bg-transparent text-[#171717] dark:text-white placeholder:text-[#888888] focus:outline-none"
          />
          <button
            type="submit"
            className="px-5 sm:px-7 py-3 bg-[#FFD21F] hover:bg-[#F2C410] active:scale-95 text-[#171717] font-bold text-sm sm:text-base rounded-full transition-all shadow-xs cursor-pointer select-none"
          >
            Search
          </button>
        </form>

        {/* Trending Quick Suggestions */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs">
          <span className="font-semibold text-[#888888]">Trending:</span>
          {trendingPicks.map(pick => (
            <button
              key={pick}
              onClick={() => handleHeroSearch(pick)}
              className="px-2.5 py-1 rounded-full bg-[#F5F5F5] dark:bg-[#202020] text-[#555555] dark:text-gray-300 hover:bg-[#FFF4B8] dark:hover:bg-[#FFD21F]/20 hover:text-[#171717] transition-colors cursor-pointer"
            >
              {pick}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
