import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  ExternalLink,
  Lock,
  Layers,
  Heart,
  Bookmark,
  Sparkles,
  Share2,
  LogIn,
  ShieldCheck,
  Calendar,
  Grid,
} from 'lucide-react';
import { Collection, MediaItem, UserProfile } from '../../types';
import { useVistora } from '../../context/VistoraContext';
import { MasonryFeed } from '../media/MasonryFeed';
import { isSupabaseConfigured } from '../../lib/supabase';

interface CreatorProfileViewProps {
  username: string;
  onBack: () => void;
}

export const CreatorProfileView: React.FC<CreatorProfileViewProps> = ({
  username,
  onBack,
}) => {
  const {
    currentUser,
    showToast,
    setSelectedCollectionId,
    setCurrentTab,
    likedMediaIds,
    savedMediaIds,
    feedItems,
    setIsAuthModalOpen,
  } = useVistora();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [createdMedia, setCreatedMedia] = useState<MediaItem[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [activeTab, setActiveTab] = useState<'created' | 'collections' | 'favorites'>('created');
  const [isLoading, setIsLoading] = useState(true);

  const isSelf = username === currentUser.username;
  const isCloud = isSupabaseConfigured();

  // Compute favorited media items for this user from current feed or created
  const favoritedItems = feedItems.filter(item => likedMediaIds.has(item.id) || savedMediaIds.has(item.id));

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/creator/${username}`);
        const data = await res.json();
        if (data.success) {
          setProfile(data.data.profile);
          setCreatedMedia(data.data.createdMedia || []);
          setCollections(data.data.collections || []);
        } else {
          if (isSelf) {
            setProfile(currentUser);
          }
        }
      } catch (e) {
        if (isSelf) setProfile(currentUser);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [username, isSelf, currentUser]);

  const handleShareProfile = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: profile?.displayName || 'VISTORA Creator',
          text: `Check out ${profile?.displayName} on VISTORA`,
          url,
        });
        return;
      } catch (e) {}
    }
    navigator.clipboard.writeText(url);
    showToast('Profile link copied to clipboard!', 'info');
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-pulse space-y-6">
        <div className="h-44 bg-gray-200 dark:bg-[#1E1E1E] rounded-3xl" />
        <div className="h-64 bg-gray-100 dark:bg-[#181818] rounded-2xl" />
      </div>
    );
  }

  const activeProfile = isSelf ? currentUser : (profile || currentUser);

  return (
    <div className="w-full pb-20 animate-in fade-in duration-200">
      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold text-[#666666] dark:text-[#A0A0A0] hover:text-[#171717] dark:hover:text-white hover:bg-[#F6F6F6] dark:hover:bg-[#1E1E1E] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Feed
        </button>
      </div>

      {/* Profile Header Card */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-3xl bg-white dark:bg-[#181818] p-6 sm:p-8 border border-[#EBEBEB] dark:border-[#242424] shadow-xs"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            {/* Left: Avatar & Info */}
            <div className="flex items-center gap-5">
              <div className="relative">
                <img
                  src={activeProfile.avatarUrl}
                  alt={activeProfile.displayName}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-3 border-[#FFD21F] shadow-sm"
                />
                <span className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-[#FFD21F] text-[#171717] flex items-center justify-center text-[10px] font-black border-2 border-white dark:border-[#181818]">
                  ✓
                </span>
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="font-display text-xl sm:text-2xl font-black text-[#171717] dark:text-white">
                    {activeProfile.displayName}
                  </h1>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-[#FFF4B8] dark:bg-[#FFD21F]/20 text-[#171717] dark:text-[#FFDF4D]">
                    {activeProfile.badge || 'Curator'}
                  </span>
                  {isSelf && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-[#252525] text-gray-600 dark:text-gray-300">
                      {isCloud ? 'Cloud Auth' : 'Local Auth'}
                    </span>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-[#888888] font-medium mt-0.5">
                  @{activeProfile.username}
                </p>

                {activeProfile.bio && (
                  <p className="text-xs sm:text-sm text-[#444444] dark:text-gray-300 mt-2 max-w-xl leading-relaxed">
                    {activeProfile.bio}
                  </p>
                )}

                {activeProfile.website && (
                  <a
                    href={activeProfile.website}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-[#666666] dark:text-[#A0A0A0] hover:text-[#FFD21F] mt-1.5 font-medium transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                    {activeProfile.website.replace(/^https?:\/\//, '')}
                  </a>
                )}
              </div>
            </div>

            {/* Right: Actions & Metrics */}
            <div className="flex flex-col sm:items-end gap-4 w-full sm:w-auto">
              <div className="flex items-center gap-2">
                {isSelf ? (
                  <>
                    <button
                      onClick={() => setCurrentTab('settings')}
                      className="px-5 py-2.5 rounded-full text-xs font-bold bg-[#F2F2F2] dark:bg-[#252525] hover:bg-[#FFF4B8] dark:hover:bg-[#FFD21F]/20 text-[#171717] dark:text-white transition-colors cursor-pointer"
                    >
                      Edit Profile
                    </button>
                    <button
                      onClick={() => setIsAuthModalOpen(true)}
                      className="px-4 py-2.5 rounded-full text-xs font-bold bg-[#FFD21F] hover:bg-[#F2C410] text-[#171717] transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                    >
                      <LogIn className="w-3.5 h-3.5" /> Switch User
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleShareProfile}
                    className="px-5 py-2.5 rounded-full text-xs font-bold bg-[#FFD21F] hover:bg-[#F2C410] text-[#171717] transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <Share2 className="w-3.5 h-3.5" /> Share Creator
                  </button>
                )}

                <button
                  onClick={handleShareProfile}
                  aria-label="Share creator profile"
                  className="p-2.5 rounded-full bg-[#F2F2F2] dark:bg-[#252525] hover:bg-[#FFF4B8] dark:hover:bg-[#FFD21F]/20 text-[#171717] dark:text-white transition-colors cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>

              {/* Stats Bar (Curation & Library Stats - No Follow System) */}
              <div className="flex items-center gap-6 text-xs text-[#666666] dark:text-[#A0A0A0] pt-2 border-t border-[#EAEAEA] dark:border-[#252525] w-full justify-around sm:justify-end">
                <div>
                  <span className="font-bold text-[#171717] dark:text-white text-sm mr-1">
                    {createdMedia.length}
                  </span>
                  Creations
                </div>
                <div>
                  <span className="font-bold text-[#171717] dark:text-white text-sm mr-1">
                    {likedMediaIds.size}
                  </span>
                  Favorites
                </div>
                <div>
                  <span className="font-bold text-[#171717] dark:text-white text-sm mr-1">
                    {collections.length}
                  </span>
                  Boards
                </div>
              </div>
            </div>
          </div>

          {/* Profile Tabs */}
          <div className="mt-8 pt-4 border-t border-[#EAEAEA] dark:border-[#2A2A2A] flex items-center gap-2">
            <button
              onClick={() => setActiveTab('created')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'created'
                  ? 'bg-[#FFD21F] text-[#171717] shadow-xs'
                  : 'text-[#666666] dark:text-[#A0A0A0] hover:bg-[#F5F5F5] dark:hover:bg-[#252525]'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Created ({createdMedia.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('collections')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'collections'
                  ? 'bg-[#FFD21F] text-[#171717] shadow-xs'
                  : 'text-[#666666] dark:text-[#A0A0A0] hover:bg-[#F5F5F5] dark:hover:bg-[#252525]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Boards ({collections.length})</span>
            </button>

            {isSelf && (
              <button
                onClick={() => setActiveTab('favorites')}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'favorites'
                    ? 'bg-[#FFD21F] text-[#171717] shadow-xs'
                    : 'text-[#666666] dark:text-[#A0A0A0] hover:bg-[#F5F5F5] dark:hover:bg-[#252525]'
                }`}
              >
                <Heart className="w-3.5 h-3.5" />
                <span>Favorites ({favoritedItems.length})</span>
              </button>
            )}
          </div>
        </motion.div>
      </div>

      {/* Tab Contents */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
        {activeTab === 'created' && (
          <div>
            <MasonryFeed
              items={createdMedia}
              emptyTitle="No creations published yet"
              emptySubtitle="Click the '+ Create' button at the top to publish your first visual work."
            />
          </div>
        )}

        {activeTab === 'collections' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {collections.length === 0 ? (
              <div className="col-span-full py-16 text-center text-sm text-[#888888]">
                No public collections published yet.
              </div>
            ) : (
              collections.map(col => (
                <div
                  key={col.id}
                  onClick={() => {
                    setSelectedCollectionId(col.id);
                    setCurrentTab('collections');
                  }}
                  className="rounded-3xl overflow-hidden bg-white dark:bg-[#1A1A1A] border border-[#EAEAEA] dark:border-[#2A2A2A] shadow-xs hover:shadow-lg transition-all cursor-pointer group"
                >
                  <div className="aspect-[4/3] bg-gray-200 overflow-hidden relative">
                    <img
                      src={col.coverUrl || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80'}
                      alt={col.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {col.isPrivate && (
                      <div className="absolute top-3 right-3 p-1.5 rounded-full bg-black/60 text-white backdrop-blur-sm">
                        <Lock className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-sm text-[#171717] dark:text-white group-hover:text-[#FFD21F] transition-colors">
                      {col.name}
                    </h3>
                    <p className="text-xs text-[#888888] mt-0.5">
                      {col.itemCount || col.items?.length || 0} items
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'favorites' && (
          <div>
            <MasonryFeed
              items={favoritedItems}
              emptyTitle="No saved favorites yet"
              emptySubtitle="Browse the feed and tap the heart icon on any photo or video to save it here."
            />
          </div>
        )}
      </div>
    </div>
  );
};
