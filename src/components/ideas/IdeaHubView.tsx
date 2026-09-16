import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Bookmark,
  Share2,
  Check,
  Palette,
  Sparkles,
  Layers,
  Copy,
  Search,
} from 'lucide-react';
import { IdeaPage } from '../../types';
import { useVistora } from '../../context/VistoraContext';
import { MasonryFeed } from '../media/MasonryFeed';

interface IdeaHubViewProps {
  slug: string;
  onBack: () => void;
}

export const IdeaHubView: React.FC<IdeaHubViewProps> = ({ slug, onBack }) => {
  const { showToast, setSearchQuery, setCurrentTab } = useVistora();
  const [idea, setIdea] = useState<IdeaPage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  useEffect(() => {
    const fetchIdea = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/ideas/${slug}`);
        const data = await res.json();
        if (data.success) {
          setIdea(data.data);
        }
      } catch (e) {
        showToast('Unable to load Idea Page', 'warning');
      } finally {
        setIsLoading(false);
      }
    };

    fetchIdea();
  }, [slug]);

  const handleToggleSave = async () => {
    if (!idea) return;
    const willBeSaved = !idea.isSaved;
    setIdea({ ...idea, isSaved: willBeSaved, savedCount: idea.savedCount + (willBeSaved ? 1 : -1) });
    showToast(willBeSaved ? `Saved "${idea.title}" to ideas` : 'Removed from ideas', 'success');

    try {
      await fetch(`/api/ideas/${slug}/save`, { method: 'POST' });
    } catch (e) {}
  };

  const handleToggleFollow = async () => {
    if (!idea) return;
    const willBeFollowing = !idea.isFollowing;
    setIdea({ ...idea, isFollowing: willBeFollowing });
    showToast(willBeFollowing ? `Following "${idea.title}" updates` : 'Unfollowed topic', 'info');

    try {
      await fetch(`/api/ideas/${slug}/follow`, { method: 'POST' });
    } catch (e) {}
  };

  const handleCopyHex = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    showToast(`Copied ${hex} to clipboard!`, 'info');
    setTimeout(() => setCopiedHex(null), 2000);
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: idea?.title || 'VISTORA Idea Page',
          text: idea?.tagline,
          url,
        });
        return;
      } catch (e) {}
    }
    navigator.clipboard.writeText(url);
    showToast('Idea link copied!', 'info');
  };

  const handleRelatedSearch = (term: string) => {
    setSearchQuery(term);
    setCurrentTab('home');
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-pulse">
        <div className="h-80 bg-gray-200 dark:bg-[#1B1B1B] rounded-3xl mb-8" />
        <div className="h-24 bg-gray-200 dark:bg-[#1B1B1B] rounded-2xl mb-6" />
      </div>
    );
  }

  if (!idea) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center">
        <p className="text-base text-[#888888]">Idea topic not found.</p>
        <button
          onClick={onBack}
          className="mt-4 px-5 py-2 bg-[#FFD21F] text-[#171717] font-bold text-xs rounded-full"
        >
          Return to Explore
        </button>
      </div>
    );
  }

  return (
    <div className="w-full pb-20 animate-in fade-in duration-200">
      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold text-[#666666] dark:text-[#A0A0A0] hover:text-[#171717] dark:hover:text-white hover:bg-[#F6F6F6] dark:hover:bg-[#1E1E1E] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Discoveries
        </button>
      </div>

      {/* Hero Banner Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="relative rounded-3xl overflow-hidden shadow-xl min-h-[380px] flex items-end p-6 sm:p-10 text-white">
          {/* Cover Background Image with Gradient Overlay */}
          <img
            src={idea.coverUrl}
            alt={idea.title}
            className="absolute inset-0 w-full h-full object-cover -z-20"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/20 -z-10" />

          {/* Banner Details */}
          <div className="w-full flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#FFD21F] text-[#171717] text-xs font-bold uppercase tracking-wider mb-3">
                <Sparkles className="w-3.5 h-3.5 fill-current" />
                {idea.category} Idea Hub
              </div>
              <h1 className="font-display text-3xl sm:text-5xl font-black tracking-tight drop-shadow-md">
                {idea.title}
              </h1>
              <p className="mt-2 text-sm sm:text-base text-gray-200 max-w-xl font-medium">
                {idea.tagline}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={handleToggleSave}
                className={`flex items-center gap-2 px-6 py-3 rounded-full text-xs sm:text-sm font-bold transition-all shadow-lg active:scale-95 cursor-pointer ${
                  idea.isSaved
                    ? 'bg-white text-[#171717]'
                    : 'bg-[#FFD21F] hover:bg-[#F2C410] text-[#171717]'
                }`}
              >
                {idea.isSaved ? <Check className="w-4 h-4 stroke-[3]" /> : <Bookmark className="w-4 h-4 fill-current" />}
                <span>{idea.isSaved ? 'Saved Idea' : 'Save Idea'}</span>
              </button>

              <button
                onClick={handleToggleFollow}
                className="px-5 py-3 rounded-full text-xs sm:text-sm font-bold bg-white/20 hover:bg-white/30 backdrop-blur-md text-white transition-all cursor-pointer"
              >
                {idea.isFollowing ? 'Following' : 'Follow Hub'}
              </button>

              <button
                onClick={handleShare}
                aria-label="Share idea page"
                className="p-3 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-white transition-all cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Overview & Insights Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left 2 Cols: Inspiration Narrative & Architectural Elements */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-[#1A1A1A] rounded-3xl p-6 sm:p-8 border border-[#EAEAEA] dark:border-[#2A2A2A] shadow-xs">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#888888] mb-3">
                <Layers className="w-4 h-4 text-[#FFD21F]" /> Curatorial Brief
              </div>
              <p className="text-sm sm:text-base text-[#444444] dark:text-gray-200 leading-relaxed">
                {idea.inspirationOverview}
              </p>
            </div>

            {/* Architecture / Design Elements */}
            {idea.architectureElements && idea.architectureElements.length > 0 && (
              <div className="bg-white dark:bg-[#1A1A1A] rounded-3xl p-6 sm:p-8 border border-[#EAEAEA] dark:border-[#2A2A2A] shadow-xs">
                <h3 className="font-display font-bold text-base text-[#171717] dark:text-white mb-4">
                  Core Structural & Design Components
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {idea.architectureElements.map((elem, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-[#F8F8F8] dark:bg-[#222222] border border-[#EAEAEA] dark:border-[#2E2E2E]"
                    >
                      <h4 className="text-sm font-bold text-[#171717] dark:text-white">
                        {elem.title}
                      </h4>
                      <p className="mt-1 text-xs text-[#666666] dark:text-[#A0A0A0] leading-normal">
                        {elem.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Col: Color Palette & Related Searches */}
          <div className="space-y-6">
            {/* Color Palette Swatches */}
            {idea.colorPalette && idea.colorPalette.length > 0 && (
              <div className="bg-white dark:bg-[#1A1A1A] rounded-3xl p-6 border border-[#EAEAEA] dark:border-[#2A2A2A] shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#888888]">
                    <Palette className="w-4 h-4 text-[#FFD21F]" /> Color Palette
                  </div>
                  <span className="text-[10px] text-[#888888]">Click hex to copy</span>
                </div>

                <div className="space-y-3">
                  {idea.colorPalette.map(color => (
                    <div
                      key={color.hex}
                      onClick={() => handleCopyHex(color.hex)}
                      className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-[#F5F5F5] dark:hover:bg-[#222222] transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-xl shadow-xs border border-black/10 shrink-0"
                          style={{ backgroundColor: color.hex }}
                        />
                        <div>
                          <p className="text-xs font-bold text-[#171717] dark:text-white">
                            {color.name}
                          </p>
                          <p className="text-[11px] text-[#888888] font-mono">
                            {color.hex}
                          </p>
                        </div>
                      </div>

                      <button className="p-1 text-gray-400 group-hover:text-[#FFD21F] transition-colors">
                        {copiedHex === color.hex ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Related Searches */}
            {idea.relatedSearches && idea.relatedSearches.length > 0 && (
              <div className="bg-white dark:bg-[#1A1A1A] rounded-3xl p-6 border border-[#EAEAEA] dark:border-[#2A2A2A] shadow-xs">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#888888] mb-3 flex items-center gap-1.5">
                  <Search className="w-3.5 h-3.5 text-[#FFD21F]" /> Related Searches
                </h4>
                <div className="flex flex-wrap gap-2">
                  {idea.relatedSearches.map(term => (
                    <button
                      key={term}
                      onClick={() => handleRelatedSearch(term)}
                      className="px-3 py-1.5 text-xs font-medium bg-[#F5F5F5] dark:bg-[#222222] hover:bg-[#FFF4B8] dark:hover:bg-[#FFD21F]/20 text-[#171717] dark:text-gray-200 rounded-full transition-colors cursor-pointer"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Curated Visual Feed Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
        <div className="flex items-center justify-between pb-4 border-b border-[#EAEAEA] dark:border-[#2A2A2A] mb-6">
          <div>
            <h2 className="font-display text-2xl font-bold text-[#171717] dark:text-white">
              Visual Studies & Inspirations
            </h2>
            <p className="text-xs text-[#888888]">
              High-resolution photography and video captures curated for this study
            </p>
          </div>
          <span className="text-xs font-bold text-[#171717] dark:text-[#FFDF4D] bg-[#FFF4B8] dark:bg-[#FFD21F]/20 px-3 py-1 rounded-full">
            {idea.items.length} works
          </span>
        </div>

        <MasonryFeed items={idea.items} />
      </div>
    </div>
  );
};
