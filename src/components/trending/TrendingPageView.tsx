import React, { useEffect, useState } from 'react';
import { Flame, Sparkles, TrendingUp, Play } from 'lucide-react';
import { useVistora } from '../../context/VistoraContext';
import { MasonryFeed } from '../media/MasonryFeed';
import { Collection, MediaItem, UserProfile } from '../../types';

export const TrendingPageView: React.FC = () => {
  const {
    setSearchQuery,
    setCurrentTab,
    setSelectedCreatorUsername,
    setSelectedCollectionId,
    followedUsers,
    toggleFollow,
    setActiveViewerMedia,
    setFeedItems,
  } = useVistora();

  const [trendingSearches, setTrendingSearches] = useState<string[]>([]);
  const [trendingPhotos, setTrendingPhotos] = useState<MediaItem[]>([]);
  const [trendingVideos, setTrendingVideos] = useState<MediaItem[]>([]);
  const [trendingCreators, setTrendingCreators] = useState<UserProfile[]>([]);
  const [trendingCollections, setTrendingCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTrending = async () => {
      setIsLoading(true);
      try {
        const res = await fetch('/api/trending');
        const data = await res.json();
        if (data.success) {
          setTrendingSearches(data.data.trendingSearches || []);
          setTrendingPhotos(data.data.trendingPhotos || []);
          setTrendingVideos(data.data.trendingVideos || []);
          setTrendingCreators(data.data.trendingCreators || []);
          setTrendingCollections(data.data.trendingCollections || []);
        }
      } catch (e) {
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrending();
  }, []);

  const handleSearchClick = (term: string) => {
    setSearchQuery(term);
    setCurrentTab('home');
  };

  return (
    <div className="w-full pb-20 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF4B8] dark:bg-[#FFD21F]/20 text-[#171717] dark:text-[#FFDF4D] text-xs font-bold uppercase tracking-wider mb-2">
          <Flame className="w-3.5 h-3.5 fill-[#FFD21F] text-[#FFD21F]" />
          Realtime Pulse
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-black text-[#171717] dark:text-white">
          Trending on Vistora
        </h1>
        <p className="text-sm text-[#666666] dark:text-[#A0A0A0] mt-1 max-w-xl">
          What the global community is searching, saving, and creating today.
        </p>
      </div>

      {/* Trending Search Topics */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[#888888] mb-3 flex items-center gap-1.5">
          <TrendingUp className="w-4 h-4 text-[#FFD21F]" /> Top Searches
        </h2>
        <div className="flex flex-wrap gap-2">
          {trendingSearches.map((term, i) => (
            <button
              key={term}
              onClick={() => handleSearchClick(term)}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-[#1A1A1A] border border-[#EAEAEA] dark:border-[#2A2A2A] hover:border-[#FFD21F] hover:bg-[#FFF4B8] dark:hover:bg-[#FFD21F]/15 text-[#171717] dark:text-gray-200 text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-2xs"
            >
              <span className="text-[#FFD21F] font-bold">#{i + 1}</span>
              <span>{term}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Featured Creators Spotlight */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="font-display text-xl font-bold text-[#171717] dark:text-white mb-4">
          Featured Creators Spotlight
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {trendingCreators.map(c => {
            const isFollowing = followedUsers.has(c.username);

            return (
              <div
                key={c.id}
                className="bg-white dark:bg-[#1A1A1A] p-5 rounded-3xl border border-[#EAEAEA] dark:border-[#2A2A2A] shadow-xs hover:shadow-md transition-all flex flex-col items-center text-center"
              >
                <div
                  onClick={() => {
                    setSelectedCreatorUsername(c.username);
                    setCurrentTab('creator');
                  }}
                  className="cursor-pointer group"
                >
                  <img
                    src={c.avatarUrl}
                    alt={c.displayName}
                    className="w-16 h-16 rounded-full object-cover border-2 border-[#FFD21F] mb-3 group-hover:scale-105 transition-transform"
                  />
                  <h3 className="font-bold text-sm text-[#171717] dark:text-white group-hover:text-[#FFD21F] transition-colors">
                    {c.displayName}
                  </h3>
                  <p className="text-xs text-[#888888]">@{c.username}</p>
                </div>

                <p className="text-xs text-[#555555] dark:text-gray-300 mt-2 line-clamp-2">
                  {c.bio}
                </p>

                <div className="mt-4 pt-3 border-t border-[#EAEAEA] dark:border-[#2A2A2A] w-full flex items-center justify-between">
                  <span className="text-xs text-[#888888] font-medium">
                    {c.followersCount} followers
                  </span>
                  <button
                    onClick={() => toggleFollow(c.username)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      isFollowing
                        ? 'bg-[#F2F2F2] dark:bg-[#252525] text-[#171717] dark:text-white'
                        : 'bg-[#FFD21F] hover:bg-[#F2C410] text-[#171717]'
                    }`}
                  >
                    {isFollowing ? 'Following' : 'Follow'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Trending Motion & Videos Section */}
      {trendingVideos.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h2 className="font-display text-xl font-bold text-[#171717] dark:text-white mb-4 flex items-center gap-2">
            <Play className="w-5 h-5 text-[#FFD21F] fill-[#FFD21F]" />
            Trending Visual Motion
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {trendingVideos.map(vid => (
              <div
                key={vid.id}
                onClick={() => {
                  setFeedItems(trendingVideos);
                  setActiveViewerMedia(vid);
                }}
                className="group relative rounded-2xl overflow-hidden aspect-video bg-black cursor-pointer shadow-md"
              >
                <img
                  src={vid.thumbnailUrl}
                  alt={vid.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-3 text-white">
                  <div className="flex items-center gap-1.5 text-xs font-bold truncate">
                    <Play className="w-3.5 h-3.5 fill-[#FFD21F] text-[#FFD21F]" />
                    {vid.title}
                  </div>
                  <span className="text-[10px] text-gray-300">by {vid.author}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trending Photos Stream */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <h2 className="font-display text-xl font-bold text-[#171717] dark:text-white mb-4">
          Trending Visual Photography
        </h2>
        <MasonryFeed items={trendingPhotos} isLoading={isLoading} />
      </div>
    </div>
  );
};
