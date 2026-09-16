import React, { useEffect, useState } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Heart,
  Bookmark,
  Share2,
  Download,
  ExternalLink,
  MessageSquare,
  Send,
  Trash2,
  Check,
} from 'lucide-react';
import { CommentItem, MediaItem } from '../../types';
import { useVistora } from '../../context/VistoraContext';
import { VideoPlayer } from './VideoPlayer';

export const MediaViewerModal: React.FC = () => {
  const {
    activeViewerMedia,
    setActiveViewerMedia,
    feedItems,
    likedMediaIds,
    savedMediaIds,
    toggleLike,
    setMediaToSave,
    showToast,
    currentUser,
    setSelectedCreatorUsername,
    setCurrentTab,
  } = useVistora();

  const [comments, setComments] = useState<CommentItem[]>([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // Keyboard navigation: ESC, Left, Right
  useEffect(() => {
    if (!activeViewerMedia) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveViewerMedia(null);
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeViewerMedia, feedItems]);

  // Fetch comments for active item
  useEffect(() => {
    if (!activeViewerMedia) return;

    const fetchComments = async () => {
      try {
        const res = await fetch(`/api/comments/${activeViewerMedia.id}`);
        const data = await res.json();
        if (data.success) {
          setComments(data.data || []);
        }
      } catch (e) {
        setComments([]);
      }
    };

    fetchComments();
  }, [activeViewerMedia]);

  if (!activeViewerMedia) return null;

  const currentIndex = feedItems.findIndex(item => item.id === activeViewerMedia.id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex !== -1 && currentIndex < feedItems.length - 1;

  const handlePrev = () => {
    if (hasPrev) {
      setActiveViewerMedia(feedItems[currentIndex - 1]);
    }
  };

  const handleNext = () => {
    if (hasNext) {
      setActiveViewerMedia(feedItems[currentIndex + 1]);
    }
  };

  const isLiked = likedMediaIds.has(activeViewerMedia.id);
  const isSaved = savedMediaIds.has(activeViewerMedia.id);

  const handleShare = async () => {
    const url = `${window.location.origin}?media=${activeViewerMedia.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: activeViewerMedia.title,
          text: `Discover "${activeViewerMedia.title}" on VISTORA`,
          url,
        });
        return;
      } catch (e) {}
    }
    navigator.clipboard.writeText(url);
    showToast('Link copied to clipboard!', 'info');
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = activeViewerMedia.originalUrl || activeViewerMedia.previewUrl;
    link.download = `${activeViewerMedia.title.toLowerCase().replace(/\s+/g, '-')}.${
      activeViewerMedia.type === 'video' ? 'mp4' : 'jpg'
    }`;
    link.target = '_blank';
    link.rel = 'noreferrer';
    link.click();
    showToast('Download started', 'info');
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || isSubmittingComment) return;

    setIsSubmittingComment(true);
    try {
      const res = await fetch(`/api/comments/${activeViewerMedia.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newCommentText }),
      });
      const data = await res.json();
      if (data.success) {
        setComments(prev => [data.data, ...prev]);
        setNewCommentText('');
        showToast('Comment posted', 'success');
      }
    } catch (e) {
      showToast('Could not post comment', 'warning');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await fetch(`/api/comments/${commentId}`, { method: 'DELETE' });
      setComments(prev => prev.filter(c => c.id !== commentId));
      showToast('Comment removed', 'info');
    } catch (e) {}
  };

  const relatedItems = feedItems
    .filter(item => item.id !== activeViewerMedia.id)
    .slice(0, 4);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      {/* Top Close Button & Nav Controls */}
      <button
        onClick={() => setActiveViewerMedia(null)}
        aria-label="Close media viewer"
        className="fixed top-4 right-4 z-50 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur-md flex items-center justify-center transition-all cursor-pointer shadow-lg"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Prev Navigation Arrow */}
      {hasPrev && (
        <button
          onClick={handlePrev}
          aria-label="Previous item"
          className="fixed left-3 top-1/2 -translate-y-1/2 z-50 w-12 h-12 rounded-full bg-black/40 hover:bg-[#FFD21F] text-white hover:text-[#171717] backdrop-blur-md hidden md:flex items-center justify-center transition-all cursor-pointer shadow-xl hover:scale-105"
        >
          <ChevronLeft className="w-7 h-7" />
        </button>
      )}

      {/* Next Navigation Arrow */}
      {hasNext && (
        <button
          onClick={handleNext}
          aria-label="Next item"
          className="fixed right-3 top-1/2 -translate-y-1/2 z-50 w-12 h-12 rounded-full bg-black/40 hover:bg-[#FFD21F] text-white hover:text-[#171717] backdrop-blur-md hidden md:flex items-center justify-center transition-all cursor-pointer shadow-xl hover:scale-105"
        >
          <ChevronRight className="w-7 h-7" />
        </button>
      )}

      {/* Main Container Card */}
      <div
        onClick={e => e.stopPropagation()}
        className="relative w-full max-w-6xl max-h-[92vh] bg-white dark:bg-[#151515] rounded-3xl overflow-hidden shadow-2xl flex flex-col lg:flex-row border border-[#EAEAEA] dark:border-[#252525]"
      >
        {/* Left Side: Media Display */}
        <div 
          className="flex-1 min-h-[300px] lg:min-h-[550px] bg-[#0A0A0A] flex items-center justify-center overflow-hidden p-2 sm:p-4 select-none"
          onContextMenu={e => {
            e.preventDefault();
            e.stopPropagation();
            return false;
          }}
          style={{ WebkitTouchCallout: 'none', userSelect: 'none' }}
        >
          {activeViewerMedia.type === 'video' ? (
            <VideoPlayer
              src={activeViewerMedia.originalUrl || activeViewerMedia.previewUrl}
              poster={activeViewerMedia.thumbnailUrl}
              autoPlay={false}
            />
          ) : (
            <div
              className="relative flex items-center justify-center max-h-[82vh] w-auto max-w-full select-none"
              onContextMenu={e => {
                e.preventDefault();
                e.stopPropagation();
                return false;
              }}
              style={{ WebkitTouchCallout: 'none', userSelect: 'none' }}
            >
              <img
                src={activeViewerMedia.originalUrl || activeViewerMedia.previewUrl}
                alt={activeViewerMedia.title}
                draggable={false}
                data-no-callout="true"
                onContextMenu={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  return false;
                }}
                className="max-h-[82vh] w-auto max-w-full object-contain rounded-xl select-none pointer-events-none"
                style={{
                  WebkitTouchCallout: 'none',
                  userSelect: 'none',
                  pointerEvents: 'none',
                }}
              />
              {/* Protective transparent touch shield: intercepts touch gestures to prevent native mobile callouts */}
              <div
                className="media-shield absolute inset-0 z-10 select-none cursor-default"
                data-no-callout="true"
                onContextMenu={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  return false;
                }}
                style={{ WebkitTouchCallout: 'none', userSelect: 'none' }}
              />
            </div>
          )}
        </div>

        {/* Right Side: Details & Comments */}
        <div className="w-full lg:w-[420px] flex flex-col justify-between bg-white dark:bg-[#161616] p-5 sm:p-6 overflow-y-auto max-h-[50vh] lg:max-h-[92vh]">
          <div>
            {/* Header: Author Info & Top Action Buttons */}
            <div className="flex items-center justify-between pb-4 border-b border-[#EAEAEA] dark:border-[#252525]">
              <div
                onClick={() => {
                  const cleanedUsername = activeViewerMedia.author.toLowerCase().replace(/\s+/g, '');
                  setSelectedCreatorUsername(cleanedUsername);
                  setCurrentTab('creator');
                  setActiveViewerMedia(null);
                }}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-full bg-[#FFF4B8] dark:bg-[#FFD21F]/20 flex items-center justify-center font-bold text-sm text-[#171717] dark:text-[#FFDF4D] border border-[#FFD21F]/30">
                  {activeViewerMedia.author.charAt(0)}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#171717] dark:text-white group-hover:text-[#FFD21F] transition-colors truncate max-w-[140px]">
                    {activeViewerMedia.author}
                  </h3>
                  <p className="text-xs text-[#888888] flex items-center gap-1">
                    {activeViewerMedia.source}
                    <ExternalLink className="w-3 h-3 text-[#888888]" />
                  </p>
                </div>
              </div>

              {/* Save & Like Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleLike(activeViewerMedia)}
                  className={`p-2 rounded-full transition-colors cursor-pointer ${
                    isLiked
                      ? 'bg-[#FFF4B8] dark:bg-[#FFD21F]/20 text-[#171717] dark:text-[#FFDF4D]'
                      : 'hover:bg-[#F5F5F5] dark:hover:bg-[#222222] text-[#666666] dark:text-gray-300'
                  }`}
                  aria-label="Like media"
                >
                  <Heart className={`w-5 h-5 ${isLiked ? 'fill-[#FFD21F] text-[#FFD21F]' : ''}`} />
                </button>

                <button
                  onClick={() => setMediaToSave(activeViewerMedia)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer shadow-xs ${
                    isSaved
                      ? 'bg-[#FFD21F] text-[#171717]'
                      : 'bg-[#171717] dark:bg-white text-white dark:text-[#171717] hover:bg-[#FFD21F] dark:hover:bg-[#FFD21F] hover:text-[#171717]'
                  }`}
                >
                  {isSaved ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Bookmark className="w-3.5 h-3.5" />}
                  <span>{isSaved ? 'Saved' : 'Save'}</span>
                </button>
              </div>
            </div>

            {/* Title & Description */}
            <div className="mt-4">
              <h2 className="font-display text-xl font-bold text-[#171717] dark:text-white">
                {activeViewerMedia.title}
              </h2>
              {activeViewerMedia.description && (
                <p className="mt-2 text-xs text-[#666666] dark:text-[#A0A0A0] leading-relaxed">
                  {activeViewerMedia.description}
                </p>
              )}
            </div>

            {/* Tags */}
            {activeViewerMedia.tags && activeViewerMedia.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {activeViewerMedia.tags.map(t => (
                  <span
                    key={t}
                    className="px-2.5 py-0.5 rounded-md text-[11px] bg-[#F5F5F5] dark:bg-[#222222] text-[#555555] dark:text-gray-300"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            )}

            {/* Action Bar (Share, Download, Details) */}
            <div className="mt-4 flex items-center gap-2 pt-3 border-t border-[#EAEAEA] dark:border-[#252525]">
              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#F5F5F5] dark:bg-[#222222] hover:bg-[#FFF4B8] dark:hover:bg-[#FFD21F]/20 text-[#171717] dark:text-gray-200 transition-colors cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" /> Share
              </button>

              <button
                onClick={handleDownload}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#F5F5F5] dark:bg-[#222222] hover:bg-[#FFF4B8] dark:hover:bg-[#FFD21F]/20 text-[#171717] dark:text-gray-200 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" /> Download
              </button>

              <a
                href={activeViewerMedia.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#F5F5F5] dark:bg-[#222222] hover:bg-[#FFF4B8] dark:hover:bg-[#FFD21F]/20 text-[#666666] hover:text-[#171717] dark:text-[#A0A0A0] dark:hover:text-white transition-colors ml-auto border border-[#EAEAEA] dark:border-[#2A2A2A]"
                title="View original on Pixabay under Content License"
              >
                <span>Pixabay License</span> <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Comments Section */}
            <div className="mt-5 pt-4 border-t border-[#EAEAEA] dark:border-[#252525]">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#171717] dark:text-white uppercase tracking-wider mb-3">
                <MessageSquare className="w-3.5 h-3.5 text-[#FFD21F]" />
                Comments ({comments.length})
              </div>

              {/* Comment Input */}
              <form onSubmit={handleAddComment} className="flex gap-2 mb-3">
                <input
                  type="text"
                  placeholder="Add a comment or perspective..."
                  value={newCommentText}
                  onChange={e => setNewCommentText(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs bg-[#F5F5F5] dark:bg-[#222222] text-[#171717] dark:text-white rounded-full border border-transparent focus:border-[#FFD21F] focus:outline-none placeholder:text-[#888888]"
                />
                <button
                  type="submit"
                  disabled={!newCommentText.trim() || isSubmittingComment}
                  className="w-8 h-8 rounded-full bg-[#FFD21F] hover:bg-[#F2C410] disabled:opacity-40 text-[#171717] flex items-center justify-center transition-all cursor-pointer shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>

              {/* Comment List */}
              <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                {comments.length === 0 ? (
                  <p className="text-xs text-[#888888] italic py-2">
                    No comments yet. Share what inspires you!
                  </p>
                ) : (
                  comments.map(c => (
                    <div
                      key={c.id}
                      className="p-2.5 bg-[#F9F9F9] dark:bg-[#1F1F1F] rounded-xl flex items-start justify-between gap-2 group"
                    >
                      <div className="flex items-start gap-2">
                        <div className="w-6 h-6 rounded-full bg-[#FFD21F] text-[#171717] text-[10px] font-bold flex items-center justify-center shrink-0">
                          {c.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-[#171717] dark:text-white">
                              {c.displayName || c.username}
                            </span>
                            <span className="text-[10px] text-[#888888]">{c.createdAt}</span>
                          </div>
                          <p className="text-xs text-[#444444] dark:text-gray-300 mt-0.5 leading-snug">
                            {c.content}
                          </p>
                        </div>
                      </div>

                      {/* Delete own comment */}
                      {(c.username === currentUser.username || c.userId === currentUser.id) && (
                        <button
                          onClick={() => handleDeleteComment(c.id)}
                          title="Delete comment"
                          className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 p-1 transition-opacity cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Related Visual Ideas Thumbnails */}
            {relatedItems.length > 0 && (
              <div className="mt-5 pt-4 border-t border-[#EAEAEA] dark:border-[#252525]">
                <p className="text-xs font-bold text-[#171717] dark:text-white uppercase tracking-wider mb-2">
                  Related Ideas
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {relatedItems.map(item => (
                    <div
                      key={item.id}
                      onClick={() => setActiveViewerMedia(item)}
                      className="aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity bg-gray-200"
                    >
                      <img
                        src={item.thumbnailUrl}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
