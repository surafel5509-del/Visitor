import React, { useState } from 'react';
import { X, Image, Video, Layers, Sparkles, Upload, Check } from 'lucide-react';
import { useVistora } from '../../context/VistoraContext';
import { MediaItem } from '../../types';

export const CreateModal: React.FC = () => {
  const {
    isCreateModalOpen,
    setIsCreateModalOpen,
    createCollection,
    showToast,
    currentUser,
    setFeedItems,
    setSelectedIdeaSlug,
    setCurrentTab,
  } = useVistora();

  const [createMode, setCreateMode] = useState<'upload' | 'collection' | 'idea'>('upload');

  // Media upload state
  const [mediaTitle, setMediaTitle] = useState('');
  const [mediaDescription, setMediaDescription] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState<'photo' | 'video'>('photo');
  const [mediaTags, setMediaTags] = useState('architecture, modern');

  // Collection state
  const [colName, setColName] = useState('');
  const [colDesc, setColDesc] = useState('');
  const [colPrivate, setColPrivate] = useState(false);

  // Idea state
  const [ideaTitle, setIdeaTitle] = useState('');
  const [ideaTagline, setIdeaTagline] = useState('');
  const [ideaCategory, setIdeaCategory] = useState('Architecture');

  if (!isCreateModalOpen) return null;

  const handleCreateMedia = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mediaTitle.trim() || !mediaUrl.trim()) return;

    const newMedia: MediaItem = {
      id: `usr-media-${Date.now()}`,
      type: mediaType,
      title: mediaTitle.trim(),
      description: mediaDescription.trim(),
      thumbnailUrl: mediaUrl.trim(),
      previewUrl: mediaUrl.trim(),
      originalUrl: mediaUrl.trim(),
      author: currentUser.displayName,
      authorUrl: `https://vistora.app/creator/${currentUser.username}`,
      source: 'vistora-creator',
      sourceUrl: mediaUrl.trim(),
      width: 1200,
      height: 900,
      aspectRatio: 1.33,
      likesCount: 1,
      viewsCount: 12,
      tags: mediaTags.split(',').map(t => t.trim()).filter(Boolean),
      isLiked: true,
      isSaved: false,
    };

    setFeedItems(prev => [newMedia, ...prev]);
    showToast(`Published "${mediaTitle}" to VISTORA!`, 'success');
    setIsCreateModalOpen(false);
  };

  const handleCreateCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!colName.trim()) return;

    const res = await createCollection(colName, colDesc, colPrivate);
    if (res) {
      setIsCreateModalOpen(false);
    }
  };

  const handleCreateIdea = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ideaTitle.trim()) return;

    const slug = ideaTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    setSelectedIdeaSlug(slug);
    setCurrentTab('ideas');
    setIsCreateModalOpen(false);
    showToast(`Created Idea Page: "${ideaTitle}"`, 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        onClick={e => e.stopPropagation()}
        className="w-full max-w-lg bg-white dark:bg-[#1A1A1A] rounded-3xl shadow-2xl overflow-hidden border border-[#EAEAEA] dark:border-[#2A2A2A]"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#EAEAEA] dark:border-[#2A2A2A]">
          <h3 className="font-display font-bold text-lg text-[#171717] dark:text-white">
            Create on VISTORA
          </h3>
          <button
            onClick={() => setIsCreateModalOpen(false)}
            className="p-1.5 text-gray-400 hover:text-[#171717] dark:hover:text-white rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="p-4 bg-[#F8F8F8] dark:bg-[#151515] border-b border-[#EAEAEA] dark:border-[#2A2A2A] grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setCreateMode('upload')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              createMode === 'upload'
                ? 'bg-[#FFD21F] text-[#171717] shadow-xs'
                : 'text-[#666666] dark:text-[#A0A0A0] hover:bg-white dark:hover:bg-[#202020]'
            }`}
          >
            <Upload className="w-3.5 h-3.5" /> Media
          </button>

          <button
            type="button"
            onClick={() => setCreateMode('collection')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              createMode === 'collection'
                ? 'bg-[#FFD21F] text-[#171717] shadow-xs'
                : 'text-[#666666] dark:text-[#A0A0A0] hover:bg-white dark:hover:bg-[#202020]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" /> Collection
          </button>

          <button
            type="button"
            onClick={() => setCreateMode('idea')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              createMode === 'idea'
                ? 'bg-[#FFD21F] text-[#171717] shadow-xs'
                : 'text-[#666666] dark:text-[#A0A0A0] hover:bg-white dark:hover:bg-[#202020]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" /> Idea Page
          </button>
        </div>

        {/* Mode 1: Upload Media */}
        {createMode === 'upload' && (
          <form onSubmit={handleCreateMedia} className="p-6 space-y-4">
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setMediaType('photo')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                  mediaType === 'photo'
                    ? 'border-[#FFD21F] bg-[#FFF4B8]/20 text-[#171717] dark:text-white'
                    : 'border-[#EAEAEA] dark:border-[#2A2A2A] text-[#888888]'
                }`}
              >
                <Image className="w-3.5 h-3.5" /> Photo
              </button>

              <button
                type="button"
                onClick={() => setMediaType('video')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                  mediaType === 'video'
                    ? 'border-[#FFD21F] bg-[#FFF4B8]/20 text-[#171717] dark:text-white'
                    : 'border-[#EAEAEA] dark:border-[#2A2A2A] text-[#888888]'
                }`}
              >
                <Video className="w-3.5 h-3.5" /> Video
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#666666] dark:text-[#A0A0A0] uppercase mb-1">
                Media URL (Image or Video) *
              </label>
              <input
                type="url"
                required
                placeholder="https://images.unsplash.com/... or mp4 link"
                value={mediaUrl}
                onChange={e => setMediaUrl(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#F5F5F5] dark:bg-[#222222] text-[#171717] dark:text-white rounded-xl border border-transparent focus:border-[#FFD21F] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#666666] dark:text-[#A0A0A0] uppercase mb-1">
                Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Sculptural Concrete Facade"
                value={mediaTitle}
                onChange={e => setMediaTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#F5F5F5] dark:bg-[#222222] text-[#171717] dark:text-white rounded-xl border border-transparent focus:border-[#FFD21F] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#666666] dark:text-[#A0A0A0] uppercase mb-1">
                Tags (Comma separated)
              </label>
              <input
                type="text"
                placeholder="architecture, brutalism, modern"
                value={mediaTags}
                onChange={e => setMediaTags(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#F5F5F5] dark:bg-[#222222] text-[#171717] dark:text-white rounded-xl border border-transparent focus:border-[#FFD21F] focus:outline-none"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 rounded-full bg-[#FFD21F] hover:bg-[#F2C410] active:scale-95 text-[#171717] font-bold text-xs sm:text-sm transition-all shadow-xs cursor-pointer"
              >
                Publish Visual Work
              </button>
            </div>
          </form>
        )}

        {/* Mode 2: Collection */}
        {createMode === 'collection' && (
          <form onSubmit={handleCreateCollection} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#666666] dark:text-[#A0A0A0] uppercase mb-1">
                Collection Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Ceramic Studies"
                value={colName}
                onChange={e => setColName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-[#F5F5F5] dark:bg-[#222222] text-[#171717] dark:text-white rounded-xl border border-transparent focus:border-[#FFD21F] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#666666] dark:text-[#A0A0A0] uppercase mb-1">
                Description
              </label>
              <input
                type="text"
                placeholder="Inspirations and material references"
                value={colDesc}
                onChange={e => setColDesc(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-[#F5F5F5] dark:bg-[#222222] text-[#171717] dark:text-white rounded-xl border border-transparent focus:border-[#FFD21F] focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-[#F5F5F5] dark:bg-[#222222]">
              <span className="text-xs font-semibold text-[#171717] dark:text-white">
                Make board private
              </span>
              <input
                type="checkbox"
                checked={colPrivate}
                onChange={e => setColPrivate(e.target.checked)}
                className="w-4 h-4 accent-[#FFD21F] rounded"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 rounded-full bg-[#FFD21F] hover:bg-[#F2C410] active:scale-95 text-[#171717] font-bold text-sm transition-all shadow-xs cursor-pointer"
              >
                Create Board
              </button>
            </div>
          </form>
        )}

        {/* Mode 3: Idea Page */}
        {createMode === 'idea' && (
          <form onSubmit={handleCreateIdea} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#666666] dark:text-[#A0A0A0] uppercase mb-1">
                Idea Topic *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Rammed Earth Pavilions"
                value={ideaTitle}
                onChange={e => setIdeaTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-[#F5F5F5] dark:bg-[#222222] text-[#171717] dark:text-white rounded-xl border border-transparent focus:border-[#FFD21F] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#666666] dark:text-[#A0A0A0] uppercase mb-1">
                Tagline / Curatorial Lens
              </label>
              <input
                type="text"
                placeholder="Exploring earthen thermal mass and organic lines"
                value={ideaTagline}
                onChange={e => setIdeaTagline(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-[#F5F5F5] dark:bg-[#222222] text-[#171717] dark:text-white rounded-xl border border-transparent focus:border-[#FFD21F] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#666666] dark:text-[#A0A0A0] uppercase mb-1">
                Category
              </label>
              <select
                value={ideaCategory}
                onChange={e => setIdeaCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-[#F5F5F5] dark:bg-[#222222] text-[#171717] dark:text-white rounded-xl border border-transparent focus:border-[#FFD21F] focus:outline-none"
              >
                <option value="Architecture">Architecture</option>
                <option value="Interior">Interior Design</option>
                <option value="Nature">Nature & Landscape</option>
                <option value="Fashion">Fashion & Apparel</option>
                <option value="Technology">Technology & Workspace</option>
              </select>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 rounded-full bg-[#FFD21F] hover:bg-[#F2C410] active:scale-95 text-[#171717] font-bold text-sm transition-all shadow-xs cursor-pointer"
              >
                Launch Idea Hub
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
