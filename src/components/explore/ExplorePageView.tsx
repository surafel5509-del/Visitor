import React, { useEffect, useState } from 'react';
import { Sparkles, ArrowRight, Layers, Flame } from 'lucide-react';
import { useVistora } from '../../context/VistoraContext';
import { CategoryBar } from '../navigation/CategoryBar';
import { MasonryFeed } from '../media/MasonryFeed';
import { MediaItem } from '../../types';

export const ExplorePageView: React.FC = () => {
  const { setSelectedIdeaSlug, setCurrentTab } = useVistora();
  const [ideas, setIdeas] = useState<any[]>([]);
  const [exploreMedia, setExploreMedia] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchExploreData = async () => {
      setIsLoading(true);
      try {
        const [ideasRes, mediaRes] = await Promise.all([
          fetch('/api/ideas'),
          fetch('/api/search?type=all&perPage=20'),
        ]);

        const ideasData = await ideasRes.json();
        const mediaData = await mediaRes.json();

        if (ideasData.success) setIdeas(ideasData.data || []);
        if (mediaData.success) setExploreMedia(mediaData.data?.items || []);
      } catch (e) {
      } finally {
        setIsLoading(false);
      }
    };

    fetchExploreData();
  }, []);

  return (
    <div className="w-full pb-20 animate-in fade-in duration-200">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4 text-center sm:text-left">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF4B8] dark:bg-[#FFD21F]/20 text-[#171717] dark:text-[#FFDF4D] text-xs font-bold uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5 fill-current text-[#FFD21F]" />
          Visual Direction
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-black text-[#171717] dark:text-white">
          Explore Visual Ideas
        </h1>
        <p className="text-sm text-[#666666] dark:text-[#A0A0A0] mt-1 max-w-2xl">
          Deep-dive into curated Idea Pages, architectural materiality studies, and aesthetic frameworks.
        </p>
      </div>

      {/* Featured Idea Pages Hub Slider / Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <h2 className="font-display text-lg font-bold text-[#171717] dark:text-white mb-4 flex items-center justify-between">
          <span>Curated Idea Pages</span>
          <span className="text-xs text-[#888888] font-normal">Vistora Exclusives</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {ideas.map(idea => (
            <div
              key={idea.slug}
              onClick={() => {
                setSelectedIdeaSlug(idea.slug);
                setCurrentTab('ideas');
              }}
              className="group relative rounded-3xl overflow-hidden shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer bg-white dark:bg-[#1A1A1A] border border-[#EAEAEA] dark:border-[#2A2A2A]"
            >
              <div className="aspect-[16/10] overflow-hidden relative">
                <img
                  src={idea.coverUrl}
                  alt={idea.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-[#FFD21F] text-[#171717] text-[10px] font-black uppercase tracking-wider">
                  {idea.category}
                </div>
              </div>

              <div className="p-5">
                <h3 className="font-display font-bold text-lg text-[#171717] dark:text-white group-hover:text-[#FFD21F] transition-colors">
                  {idea.title}
                </h3>
                <p className="text-xs text-[#666666] dark:text-[#A0A0A0] mt-1 line-clamp-2">
                  {idea.tagline}
                </p>

                <div className="mt-4 pt-3 border-t border-[#EAEAEA] dark:border-[#2A2A2A] flex items-center justify-between text-xs font-semibold">
                  <span className="text-[#888888]">{idea.itemCount} visual works</span>
                  <span className="text-[#171717] dark:text-[#FFD21F] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Explore Idea Hub <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Categories Bar */}
      <div className="mt-8 border-t border-[#EAEAEA] dark:border-[#2A2A2A] pt-4">
        <CategoryBar />
      </div>

      {/* Fresh Discovery Stream */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <h3 className="font-display text-xl font-bold text-[#171717] dark:text-white mb-4">
          Visual Inspiration Stream
        </h3>
        <MasonryFeed items={exploreMedia} isLoading={isLoading} />
      </div>
    </div>
  );
};
