import React from 'react';
import { Filter, SlidersHorizontal } from 'lucide-react';
import { SearchFilters } from '../../types';

interface SearchFilterBarProps {
  filters: SearchFilters;
  onChange: (newFilters: Partial<SearchFilters>) => void;
  totalHits?: number;
}

export const SearchFilterBar: React.FC<SearchFilterBarProps> = ({
  filters,
  onChange,
  totalHits,
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3 border-b border-[#EAEAEA] dark:border-[#2A2A2A]">
      {/* Left: Type pills */}
      <div className="flex items-center gap-1.5">
        {(['all', 'photo', 'video'] as const).map(type => {
          const isActive = (filters.type || 'all') === type;
          const label = type === 'all' ? 'All Visuals' : type === 'photo' ? 'Photos' : 'Videos';
          return (
            <button
              key={type}
              onClick={() => onChange({ type, page: 1 })}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#FFD21F] text-[#171717] shadow-xs'
                  : 'bg-[#F5F5F5] dark:bg-[#1E1E1E] text-[#666666] dark:text-[#A0A0A0] hover:text-[#171717] dark:hover:text-white'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Right: Orientation & Order Selectors */}
      <div className="flex items-center gap-2 text-xs">
        {totalHits !== undefined && (
          <span className="text-[#888888] font-semibold mr-2 hidden sm:inline">
            {totalHits} results
          </span>
        )}

        {/* Orientation */}
        <select
          value={filters.orientation || 'all'}
          onChange={e => onChange({ orientation: e.target.value as any, page: 1 })}
          className="px-3 py-1.5 bg-[#F5F5F5] dark:bg-[#1E1E1E] text-[#171717] dark:text-gray-200 rounded-full border border-transparent focus:border-[#FFD21F] focus:outline-none cursor-pointer"
        >
          <option value="all">Any Aspect Ratio</option>
          <option value="horizontal">Horizontal (Landscape)</option>
          <option value="vertical">Vertical (Portrait)</option>
        </select>

        {/* Sort Order */}
        <select
          value={filters.order || 'popular'}
          onChange={e => onChange({ order: e.target.value as any, page: 1 })}
          className="px-3 py-1.5 bg-[#F5F5F5] dark:bg-[#1E1E1E] text-[#171717] dark:text-gray-200 rounded-full border border-transparent focus:border-[#FFD21F] focus:outline-none cursor-pointer"
        >
          <option value="popular">Most Popular</option>
          <option value="latest">Latest Additions</option>
        </select>
      </div>
    </div>
  );
};
