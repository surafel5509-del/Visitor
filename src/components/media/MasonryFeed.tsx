import React, { useMemo } from 'react';
import { MediaItem } from '../../types';
import { MediaCard } from './MediaCard';
import { Sparkles } from 'lucide-react';
import { useVistora } from '../../context/VistoraContext';

interface MasonryFeedProps {
  items: MediaItem[];
  isLoading?: boolean;
  emptyTitle?: string;
  emptySubtitle?: string;
  onExploreClick?: () => void;
}

export const MasonryFeed: React.FC<MasonryFeedProps> = ({
  items,
  isLoading = false,
  emptyTitle = 'No visual ideas found',
  emptySubtitle = 'Start discovering ideas and save your favorites here.',
  onExploreClick,
}) => {
  const { setActiveViewerMedia, setFeedItems } = useVistora();

  // Distribute items across columns for balanced masonry layout
  // 2 on mobile, 3 on md, 5 on lg/xl
  const useColumns = (colCount: number) => {
    return useMemo(() => {
      const cols: MediaItem[][] = Array.from({ length: colCount }, () => []);
      const colHeights: number[] = Array(colCount).fill(0);

      items.forEach(item => {
        // Find shortest column
        let shortestIdx = 0;
        let minHeight = colHeights[0];
        for (let i = 1; i < colCount; i++) {
          if (colHeights[i] < minHeight) {
            minHeight = colHeights[i];
            shortestIdx = i;
          }
        }

        cols[shortestIdx].push(item);
        // Estimate height from aspect ratio
        const aspect = item.aspectRatio || 1.2;
        colHeights[shortestIdx] += (1 / aspect) * 100;
      });

      return cols;
    }, [items, colCount]);
  };

  const cols2 = useColumns(2);
  const cols3 = useColumns(3);
  const cols5 = useColumns(5);

  const handleMediaClick = (media: MediaItem) => {
    setFeedItems(items);
    setActiveViewerMedia(media);
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {Array.from({ length: 15 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl bg-gray-200 dark:bg-[#1B1B1B] animate-pulse"
              style={{ height: `${(i % 3 + 1) * 120 + 80}px` }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center">
        <div className="w-14 h-14 mx-auto rounded-full bg-[#FFF4B8] dark:bg-[#FFD21F]/20 flex items-center justify-center text-[#171717] dark:text-[#FFDF4D] mb-4">
          <Sparkles className="w-6 h-6 text-[#FFD21F]" />
        </div>
        <h3 className="font-display font-bold text-xl text-[#171717] dark:text-white">
          {emptyTitle}
        </h3>
        <p className="mt-2 text-sm text-[#666666] dark:text-[#A0A0A0]">
          {emptySubtitle}
        </p>
        {onExploreClick && (
          <button
            onClick={onExploreClick}
            className="mt-6 px-6 py-2.5 bg-[#FFD21F] hover:bg-[#F2C410] active:scale-95 text-[#171717] font-bold text-sm rounded-full transition-all shadow-sm cursor-pointer"
          >
            Explore Ideas
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      {/* Mobile: 2 Columns */}
      <div className="grid grid-cols-2 gap-3 md:hidden">
        {cols2.map((col, cIdx) => (
          <div key={`col-2-${cIdx}`} className="flex flex-col">
            {col.map(item => (
              <MediaCard
                key={item.id}
                media={item}
                onClick={() => handleMediaClick(item)}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Tablet: 3 Columns */}
      <div className="hidden md:grid lg:hidden grid-cols-3 gap-4">
        {cols3.map((col, cIdx) => (
          <div key={`col-3-${cIdx}`} className="flex flex-col">
            {col.map(item => (
              <MediaCard
                key={item.id}
                media={item}
                onClick={() => handleMediaClick(item)}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Desktop: 5 Columns */}
      <div className="hidden lg:grid grid-cols-5 gap-4">
        {cols5.map((col, cIdx) => (
          <div key={`col-5-${cIdx}`} className="flex flex-col">
            {col.map(item => (
              <MediaCard
                key={item.id}
                media={item}
                onClick={() => handleMediaClick(item)}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
