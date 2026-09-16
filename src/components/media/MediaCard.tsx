import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Heart,
  Bookmark,
  Share2,
  Play,
  Check,
  Maximize2,
  Download,
  MoreHorizontal,
  Copy,
  Search,
  Sliders,
  Video,
  Eye,
} from 'lucide-react';
import { MediaItem } from '../../types';
import { useVistora } from '../../context/VistoraContext';

interface MediaCardProps {
  media: MediaItem;
  onClick: () => void;
}

export const MediaCard: React.FC<MediaCardProps> = ({ media, onClick }) => {
  const {
    likedMediaIds,
    savedMediaIds,
    toggleLike,
    setMediaToSave,
    showToast,
    setSearchQuery,
    setSelectedCreatorUsername,
    setCurrentTab,
    setEditingMedia,
  } = useVistora();

  const [isLoaded, setIsLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const isLiked = likedMediaIds.has(media.id);
  const isSaved = savedMediaIds.has(media.id);

  // Close three-dots dropdown if clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  // Open full-screen viewer
  const handleOpenClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick();
  };

  // Favorite toggle
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleLike(media);
  };

  // Direct download
  const handleDownloadClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDownloading(true);
    showToast('Starting high-res download...', 'info');

    try {
      const targetUrl = media.originalUrl || media.previewUrl || media.thumbnailUrl;
      const response = await fetch(targetUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      const ext = media.type === 'video' ? 'mp4' : 'jpg';
      const cleanTitle = (media.title || 'vistora-visual').toLowerCase().replace(/[^a-z0-9]+/g, '-');
      link.download = `${cleanTitle}.${ext}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      showToast('Download complete!', 'success');
    } catch (err) {
      window.open(media.originalUrl || media.previewUrl, '_blank');
      showToast('Opened visual asset in new tab for direct download', 'info');
    } finally {
      setIsDownloading(false);
    }
  };

  // Edit visual action
  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMenuOpen(false);
    setEditingMedia(media);
  };

  // Three-dots menu actions
  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}?media=${media.id}`;
    navigator.clipboard.writeText(shareUrl);
    showToast('Link copied to clipboard!', 'success');
    setIsMenuOpen(false);
  };

  const handleSearchSimilar = (e: React.MouseEvent) => {
    e.stopPropagation();
    const query = media.tags?.[0] || media.title;
    setSearchQuery(query);
    setCurrentTab('home');
    setIsMenuOpen(false);
  };

  const handleSaveToBoard = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMediaToSave(media);
    setIsMenuOpen(false);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsMenuOpen(false);
      }}
      onClick={() => setIsHovered(prev => !prev)}
      className="group relative mb-5 rounded-2xl overflow-hidden bg-white dark:bg-[#181818] border border-[#EBEBEB] dark:border-[#242424] shadow-xs hover:shadow-xl transition-all duration-300 select-none"
      style={{ WebkitTouchCallout: 'none', userSelect: 'none' }}
    >
      {/* Media Aspect Ratio Container */}
      <div
        className="relative w-full overflow-hidden cursor-pointer select-none"
        onClick={onClick}
        onContextMenu={e => {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }}
        style={{ WebkitTouchCallout: 'none' }}
      >
        {/* Shimmer Placeholder before load */}
        {!isLoaded && (
          <div
            className="w-full bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 dark:from-[#202020] dark:via-[#282828] dark:to-[#202020] animate-pulse"
            style={{
              paddingTop: `${Math.max(65, Math.min(145, (1 / (media.aspectRatio || 1.25)) * 100))}%`,
            }}
          />
        )}

        {/* Media Thumbnail */}
        <img
          src={media.thumbnailUrl || media.previewUrl}
          alt={media.title || 'Visual discovery item'}
          loading="lazy"
          decoding="async"
          draggable={false}
          onLoad={() => setIsLoaded(true)}
          onContextMenu={e => {
            e.preventDefault();
            e.stopPropagation();
            return false;
          }}
          className={`w-full h-auto object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03] select-none pointer-events-none ${
            isLoaded ? 'opacity-100' : 'opacity-0 absolute inset-0'
          }`}
          style={{ WebkitTouchCallout: 'none', userSelect: 'none' }}
        />

        {/* Video Autoplay Preview Highlight on Hover */}
        {media.type === 'video' && isHovered && media.previewUrl && (
          <video
            ref={videoRef}
            src={media.previewUrl}
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none"
          />
        )}

        {/* Center Play Button for Videos */}
        {media.type === 'video' && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <div className="w-12 h-12 rounded-full bg-black/65 backdrop-blur-md border border-white/20 flex items-center justify-center text-[#FFD21F] shadow-xl group-hover:scale-110 group-hover:bg-[#FFD21F] group-hover:text-[#171717] transition-all duration-300">
              <Play className="w-5 h-5 ml-0.5 fill-current" />
            </div>
          </div>
        )}

        {/* Video Badge */}
        {media.type === 'video' && (
          <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md text-white text-[11px] font-bold shadow-md">
            <Video className="w-3.5 h-3.5 text-[#FFD21F]" />
            <span>{media.duration ? `${media.duration}s` : 'Video'}</span>
          </div>
        )}

        {/* IN-PLACE ACTION OVERLAY (Desktop Hover & Mobile Tap) */}
        <div
          className={`absolute inset-0 z-20 bg-gradient-to-t from-black/85 via-black/30 to-transparent transition-opacity duration-200 flex flex-col justify-between p-3.5 ${
            isHovered || isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        >
          {/* Top Bar: Primary Save to Board & Quick Badges */}
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[#FFD21F]">
              {media.source}
            </span>

            {/* Save Button */}
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={handleSaveToBoard}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shadow-md cursor-pointer ${
                isSaved
                  ? 'bg-[#FFD21F] text-[#171717]'
                  : 'bg-white/95 hover:bg-[#FFD21F] text-[#171717] hover:shadow-lg'
              }`}
            >
              {isSaved ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Bookmark className="w-3.5 h-3.5" />}
              <span>{isSaved ? 'Saved' : 'Save'}</span>
            </motion.button>
          </div>

          {/* Bottom Area: Title, Author, and the In-Place Buttons:
              [ Open | Favorite | Download | ••• (More Options with Edit) ]
          */}
          <div className="space-y-2.5">
            <div className="text-white">
              <p className="text-xs sm:text-sm font-bold truncate drop-shadow-md">
                {media.title || 'Untitled Visual'}
              </p>
              <p className="text-[11px] text-gray-300 truncate drop-shadow-xs">
                by {media.author}
              </p>
            </div>

            {/* In-Place Action Bar */}
            <div className="flex items-center justify-between pt-1 border-t border-white/15">
              {/* 1. OPEN BUTTON */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.92 }}
                onClick={handleOpenClick}
                title="Open visual viewer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 hover:bg-[#FFD21F] text-[#171717] text-xs font-bold transition-colors shadow-md cursor-pointer"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Open</span>
              </motion.button>

              {/* Action Icons Group */}
              <div className="flex items-center gap-1.5 relative" ref={menuRef}>
                {/* 2. FAVORITE BUTTON */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.88 }}
                  onClick={handleFavoriteClick}
                  title={isLiked ? 'Favorited' : 'Add to favorites'}
                  className={`p-2 rounded-full backdrop-blur-md transition-all shadow-md cursor-pointer ${
                    isLiked
                      ? 'bg-[#FFD21F] text-[#171717]'
                      : 'bg-black/60 hover:bg-white/90 text-white hover:text-[#171717]'
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-[#171717]' : ''}`} />
                </motion.button>

                {/* 3. DOWNLOAD BUTTON */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.88 }}
                  onClick={handleDownloadClick}
                  disabled={isDownloading}
                  title="Download asset"
                  className="p-2 rounded-full bg-black/60 hover:bg-white/90 text-white hover:text-[#171717] backdrop-blur-md transition-all shadow-md cursor-pointer"
                >
                  <Download className={`w-3.5 h-3.5 ${isDownloading ? 'animate-bounce text-[#FFD21F]' : ''}`} />
                </motion.button>

                {/* 4. THREE-DOTS (•••) BUTTON */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.88 }}
                  onClick={e => {
                    e.stopPropagation();
                    setIsMenuOpen(prev => !prev);
                  }}
                  title="More actions"
                  className={`p-2 rounded-full backdrop-blur-md transition-all shadow-md cursor-pointer ${
                    isMenuOpen
                      ? 'bg-[#FFD21F] text-[#171717]'
                      : 'bg-black/60 hover:bg-white/90 text-white hover:text-[#171717]'
                  }`}
                >
                  <MoreHorizontal className="w-3.5 h-3.5" />
                </motion.button>

                {/* THREE-DOTS POPUP MENU */}
                <AnimatePresence>
                  {isMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, y: 5 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: 5 }}
                      transition={{ duration: 0.15 }}
                      onClick={e => e.stopPropagation()}
                      className="absolute right-0 bottom-10 z-30 w-52 bg-white dark:bg-[#1E1E1E] rounded-2xl shadow-2xl border border-[#E5E5E5] dark:border-[#333333] p-1.5 text-xs text-[#171717] dark:text-gray-200"
                    >
                      {/* EDIT VISUAL OPTION (Only for images or visual assets) */}
                      {media.type === 'photo' && (
                        <button
                          onClick={handleEditClick}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-[#FFF4B8] dark:hover:bg-[#FFD21F]/20 hover:text-[#171717] dark:hover:text-[#FFDF4D] font-bold text-[#171717] dark:text-white transition-colors text-left cursor-pointer"
                        >
                          <Sliders className="w-3.5 h-3.5 text-[#FFD21F]" />
                          <span>Edit Visual & Filters</span>
                        </button>
                      )}

                      <button
                        onClick={handleSaveToBoard}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-[#FFF4B8] dark:hover:bg-[#FFD21F]/20 hover:text-[#171717] dark:hover:text-[#FFDF4D] font-medium transition-colors text-left cursor-pointer"
                      >
                        <Bookmark className="w-3.5 h-3.5 text-[#FFD21F]" />
                        <span>Save to Collection</span>
                      </button>

                      <button
                        onClick={handleCopyLink}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-[#FFF4B8] dark:hover:bg-[#FFD21F]/20 hover:text-[#171717] dark:hover:text-[#FFDF4D] font-medium transition-colors text-left cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5 text-[#FFD21F]" />
                        <span>Copy Image Link</span>
                      </button>

                      <button
                        onClick={handleSearchSimilar}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-[#FFF4B8] dark:hover:bg-[#FFD21F]/20 hover:text-[#171717] dark:hover:text-[#FFDF4D] font-medium transition-colors text-left cursor-pointer"
                      >
                        <Search className="w-3.5 h-3.5 text-[#FFD21F]" />
                        <span>Find Similar Ideas</span>
                      </button>

                      <div className="my-1 border-t border-gray-100 dark:border-gray-800" />

                      <div className="px-3 py-1 text-[10px] text-gray-400 font-mono">
                        {media.width} × {media.height} px
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

