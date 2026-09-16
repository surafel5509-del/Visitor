import React, { useState } from 'react';
import { Plus, Lock, Globe, ArrowLeft, Trash2, Layers, Sparkles } from 'lucide-react';
import { useVistora } from '../../context/VistoraContext';
import { MasonryFeed } from '../media/MasonryFeed';

export const CollectionsPageView: React.FC = () => {
  const {
    collections,
    createCollection,
    selectedCollectionId,
    setSelectedCollectionId,
    fetchCollections,
    showToast,
  } = useVistora();

  const [isCreating, setIsCreating] = useState(false);
  const [newColName, setNewColName] = useState('');
  const [newColDesc, setNewColDesc] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);

  // Active single collection view
  const activeCol = collections.find(c => c.id === selectedCollectionId);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColName.trim()) return;

    const res = await createCollection(newColName, newColDesc, isPrivate);
    if (res) {
      setIsCreating(false);
      setNewColName('');
      setNewColDesc('');
    }
  };

  const handleRemoveFromCollection = async (mediaId: string) => {
    if (!activeCol) return;
    try {
      const res = await fetch(`/api/collections/${activeCol.id}/items/${mediaId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        showToast('Item removed from board', 'info');
        fetchCollections();
      }
    } catch (e) {
      showToast('Failed to remove item', 'warning');
    }
  };

  if (activeCol) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 animate-in fade-in duration-200">
        {/* Top Back Navigation */}
        <button
          onClick={() => setSelectedCollectionId(null)}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold text-[#666666] dark:text-[#A0A0A0] hover:text-[#171717] dark:hover:text-white hover:bg-[#F6F6F6] dark:hover:bg-[#1E1E1E] transition-colors cursor-pointer mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Collections
        </button>

        {/* Collection Header Banner */}
        <div className="bg-white dark:bg-[#1A1A1A] rounded-3xl p-6 sm:p-8 border border-[#EAEAEA] dark:border-[#2A2A2A] shadow-xs mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#FFF4B8] dark:bg-[#FFD21F]/20 text-[#171717] dark:text-[#FFDF4D]">
                  {activeCol.isPrivate ? <Lock className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
                  {activeCol.isPrivate ? 'Private Board' : 'Public Board'}
                </span>
                <span className="text-xs text-[#888888]">
                  Created {activeCol.createdAt}
                </span>
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#171717] dark:text-white">
                {activeCol.name}
              </h1>
              {activeCol.description && (
                <p className="text-sm text-[#666666] dark:text-[#A0A0A0] mt-1.5 max-w-xl">
                  {activeCol.description}
                </p>
              )}
            </div>

            <div className="text-xs text-[#888888]">
              <span className="font-bold text-[#171717] dark:text-white text-lg mr-1">
                {activeCol.items?.length || 0}
              </span>
              items saved
            </div>
          </div>
        </div>

        {/* Feed of items */}
        <MasonryFeed
          items={activeCol.items || []}
          emptyTitle="This collection is empty"
          emptySubtitle="Explore visual works and tap the Save button to organize them here."
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#EAEAEA] dark:border-[#2A2A2A] mb-8">
        <div>
          <h1 className="font-display text-3xl font-black text-[#171717] dark:text-white">
            Saved Collections
          </h1>
          <p className="text-sm text-[#666666] dark:text-[#A0A0A0] mt-1">
            Organize architecture, photography, video references, and concept boards.
          </p>
        </div>

        <button
          onClick={() => setIsCreating(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#FFD21F] hover:bg-[#F2C410] active:scale-95 text-[#171717] text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer select-none"
        >
          <Plus className="w-4 h-4 stroke-[3]" /> New Collection
        </button>
      </div>

      {/* Inline Create Form Modal */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <form
            onSubmit={handleCreate}
            onClick={e => e.stopPropagation()}
            className="w-full max-w-md bg-white dark:bg-[#1A1A1A] p-6 rounded-3xl border border-[#EAEAEA] dark:border-[#2A2A2A] shadow-2xl space-y-4"
          >
            <h2 className="font-display text-lg font-bold text-[#171717] dark:text-white">
              Create New Collection
            </h2>

            <div>
              <label className="block text-xs font-bold text-[#666666] dark:text-[#A0A0A0] uppercase mb-1">
                Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Minimalist Lofts, Raw Materials..."
                value={newColName}
                onChange={e => setNewColName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-[#F5F5F5] dark:bg-[#222222] text-[#171717] dark:text-white rounded-xl border border-transparent focus:border-[#FFD21F] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#666666] dark:text-[#A0A0A0] uppercase mb-1">
                Description
              </label>
              <input
                type="text"
                placeholder="Brief summary of board theme"
                value={newColDesc}
                onChange={e => setNewColDesc(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-[#F5F5F5] dark:bg-[#222222] text-[#171717] dark:text-white rounded-xl border border-transparent focus:border-[#FFD21F] focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-[#F5F5F5] dark:bg-[#222222]">
              <span className="text-xs font-semibold text-[#171717] dark:text-white">
                Private Collection
              </span>
              <input
                type="checkbox"
                checked={isPrivate}
                onChange={e => setIsPrivate(e.target.checked)}
                className="w-4 h-4 accent-[#FFD21F] rounded"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="flex-1 py-2 rounded-full border border-[#EAEAEA] dark:border-[#333333] text-xs font-bold text-[#666666] dark:text-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 rounded-full bg-[#FFD21F] hover:bg-[#F2C410] text-[#171717] text-xs font-bold shadow-xs"
              >
                Create Board
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Grid of Collections */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {collections.map(col => (
          <div
            key={col.id}
            onClick={() => setSelectedCollectionId(col.id)}
            className="group rounded-3xl overflow-hidden bg-white dark:bg-[#1A1A1A] border border-[#EAEAEA] dark:border-[#2A2A2A] shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer"
          >
            {/* Cover image / 3-collage preview */}
            <div className="aspect-[4/3] bg-gray-100 dark:bg-[#222222] overflow-hidden relative">
              <img
                src={col.coverUrl || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=500&q=80'}
                alt={col.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

              {col.isPrivate && (
                <div className="absolute top-3 right-3 p-1.5 rounded-full bg-black/60 text-white backdrop-blur-sm">
                  <Lock className="w-3.5 h-3.5" />
                </div>
              )}
            </div>

            {/* Collection Metadata */}
            <div className="p-4">
              <h3 className="font-display font-bold text-base text-[#171717] dark:text-white group-hover:text-[#FFD21F] transition-colors truncate">
                {col.name}
              </h3>
              <p className="text-xs text-[#888888] mt-1 flex items-center justify-between">
                <span>{col.itemCount || col.items?.length || 0} items</span>
                <span>by {col.ownerName}</span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
