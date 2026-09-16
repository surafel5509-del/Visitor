import React, { useEffect, useState } from 'react';
import { useVistora } from '../context/VistoraContext';
import { HeroSection } from './home/HeroSection';
import { CategoryBar } from './navigation/CategoryBar';
import { MasonryFeed } from './media/MasonryFeed';
import { SearchFilterBar } from './search/SearchFilterBar';
import { ExplorePageView } from './explore/ExplorePageView';
import { TrendingPageView } from './trending/TrendingPageView';
import { CollectionsPageView } from './collections/CollectionsPageView';
import { IdeaHubView } from './ideas/IdeaHubView';
import { CreatorProfileView } from './profile/CreatorProfileView';
import { SettingsView } from './settings/SettingsView';
import { SearchFilters, MediaItem } from '../types';
import { Sparkles, ArrowDown } from 'lucide-react';

export const MainContent: React.FC = () => {
  const {
    currentTab,
    setCurrentTab,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    selectedIdeaSlug,
    selectedCreatorUsername,
    currentUser,
    feedItems,
    setFeedItems,
  } = useVistora();

  const [isLoading, setIsLoading] = useState(false);
  const [totalHits, setTotalHits] = useState(0);
  const [filters, setFilters] = useState<SearchFilters>({
    type: 'all',
    orientation: 'all',
    order: 'popular',
    page: 1,
    perPage: 24,
  });

  // Handle URL deep-linking on first load (e.g. ?media=123 or ?idea=slug)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const mediaParam = params.get('media');
    const ideaParam = params.get('idea');
    const qParam = params.get('q');

    if (qParam) {
      setSearchQuery(qParam);
    }
  }, []);

  // Fetch search or default feed whenever tab, query, category, or filters change
  useEffect(() => {
    if (['explore', 'trending', 'collections', 'ideas', 'creator', 'settings'].includes(currentTab)) {
      return;
    }

    const fetchFeed = async () => {
      setIsLoading(true);
      try {
        let typeParam = filters.type || 'all';
        if (currentTab === 'photos') typeParam = 'photo';
        if (currentTab === 'videos') typeParam = 'video';

        const q = searchQuery || (selectedCategory !== 'all' ? selectedCategory : '');
        const queryParams = new URLSearchParams({
          type: typeParam,
          q,
          category: selectedCategory !== 'all' ? selectedCategory : '',
          orientation: filters.orientation || 'all',
          order: filters.order || 'popular',
          page: String(filters.page || 1),
          perPage: String(filters.perPage || 24),
        });

        const res = await fetch(`/api/search?${queryParams.toString()}`);
        const data = await res.json();

        if (data.success && data.data) {
          setFeedItems(data.data.items || []);
          setTotalHits(data.data.totalHits || data.data.total || 0);
        }
      } catch (err) {
        console.error('Failed to load feed:', err);
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(fetchFeed, 100);
    return () => clearTimeout(timer);
  }, [currentTab, searchQuery, selectedCategory, filters]);

  // View routing
  if (currentTab === 'explore') {
    return <ExplorePageView />;
  }

  if (currentTab === 'trending') {
    return <TrendingPageView />;
  }

  if (currentTab === 'collections') {
    return <CollectionsPageView />;
  }

  if (currentTab === 'ideas') {
    return (
      <IdeaHubView
        slug={selectedIdeaSlug || 'modern-african-house'}
        onBack={() => setCurrentTab('explore')}
      />
    );
  }

  if (currentTab === 'creator') {
    return (
      <CreatorProfileView
        username={selectedCreatorUsername || currentUser.username}
        onBack={() => setCurrentTab('home')}
      />
    );
  }

  if (currentTab === 'settings') {
    return <SettingsView />;
  }

  // Home, Photos, and Videos tabs
  const isSearchActive = Boolean(searchQuery.trim());

  return (
    <main className="w-full pb-20">
      {/* If on Home and not actively searching, show Hero and Category chips */}
      {currentTab === 'home' && !isSearchActive && (
        <>
          <HeroSection />
          <CategoryBar />
        </>
      )}

      {/* If on Photos or Videos tab, show dedicated Header */}
      {currentTab === 'photos' && !isSearchActive && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-2">
          <h1 className="font-display text-3xl font-black text-[#171717] dark:text-white">
            High-Resolution Photography
          </h1>
          <p className="text-sm text-[#666666] dark:text-[#A0A0A0] mt-1">
            Discover editorial captures, architectural studies, and textured landscape compositions.
          </p>
          <div className="mt-4">
            <CategoryBar />
          </div>
        </div>
      )}

      {currentTab === 'videos' && !isSearchActive && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-2">
          <h1 className="font-display text-3xl font-black text-[#171717] dark:text-white">
            Cinematic Motion & Video Loops
          </h1>
          <p className="text-sm text-[#666666] dark:text-[#A0A0A0] mt-1">
            Fluid ocean currents, atmospheric light drifts, and slow-panning architectural studies.
          </p>
        </div>
      )}

      {/* Active Search Results Header */}
      {isSearchActive && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#888888]">
                Search Discovery
              </p>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#171717] dark:text-white mt-0.5">
                "{searchQuery}"
              </h1>
            </div>

            <button
              onClick={() => setSearchQuery('')}
              className="text-xs font-bold text-[#FFD21F] hover:underline cursor-pointer"
            >
              Clear Search
            </button>
          </div>
        </div>
      )}

      {/* Filters (Type, Orientation, Sort Order) */}
      <SearchFilterBar
        filters={filters}
        onChange={newFilters => setFilters(prev => ({ ...prev, ...newFilters }))}
        totalHits={totalHits}
      />

      {/* Masonry Grid Feed */}
      <div className="mt-2">
        <MasonryFeed
          items={feedItems}
          isLoading={isLoading}
          emptyTitle={isSearchActive ? `No results for "${searchQuery}"` : 'No visual works found'}
          emptySubtitle="Try refining your query, exploring categories, or discovering featured Idea Pages."
          onExploreClick={() => {
            setSearchQuery('');
            setCurrentTab('explore');
          }}
        />
      </div>

      {/* Pixabay API Attribution Notice */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-6 border-t border-[#EAEAEA] dark:border-[#202020] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#888888]">
        <p className="flex items-center gap-1.5 text-center sm:text-left">
          <span>Royalty-free photos & videos provided by creators on</span>
          <a
            href="https://pixabay.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-[#171717] dark:text-white hover:text-[#FFD21F] underline transition-colors"
          >
            Pixabay
          </a>
          <span>under the Pixabay Content License.</span>
        </p>
        <p className="text-[11px] text-[#A0A0A0]">
          Cached & rate-limit compliant with Pixabay API v2
        </p>
      </div>
    </main>
  );
};
