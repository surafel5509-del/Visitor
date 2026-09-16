import React, { useState } from 'react';
import { X, Plus, Check, Lock, Globe, Bookmark } from 'lucide-react';
import { useVistora } from '../../context/VistoraContext';

export const SaveCollectionModal: React.FC = () => {
  const {
    mediaToSave,
    setMediaToSave,
    collections,
    saveMediaToCollection,
    createCollection,
  } = useVistora();

  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newColName, setNewColName] = useState('');
  const [newColDesc, setNewColDesc] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);

  if (!mediaToSave) return null;

  const handleSelectCollection = async (collectionId: string) => {
    await saveMediaToCollection(collectionId, mediaToSave);
    setMediaToSave(null);
  };

  const handleCreateAndSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColName.trim()) return;

    const created = await createCollection(newColName, newColDesc, isPrivate);
    if (created) {
      await saveMediaToCollection(created.id, mediaToSave);
      setMediaToSave(null);
      setIsCreatingNew(false);
      setNewColName('');
      setNewColDesc('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        onClick={e => e.stopPropagation()}
        className="w-full max-w-md bg-white dark:bg-[#1A1A1A] rounded-3xl shadow-2xl overflow-hidden border border-[#EAEAEA] dark:border-[#2A2A2A]"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#EAEAEA] dark:border-[#2A2A2A]">
          <div className="flex items-center gap-3">
            <img
              src={mediaToSave.thumbnailUrl}
              alt={mediaToSave.title}
              className="w-10 h-10 rounded-lg object-cover border border-[#EAEAEA] dark:border-[#333333]"
            />
            <div>
              <h3 className="font-display font-bold text-base text-[#171717] dark:text-white">
                Save to Collection
              </h3>
              <p className="text-xs text-[#888888] truncate max-w-[220px]">
                {mediaToSave.title}
              </p>
            </div>
          </div>

          <button
            onClick={() => setMediaToSave(null)}
            className="p-1.5 text-gray-400 hover:text-[#171717] dark:hover:text-white rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Existing Collections List */}
        {!isCreatingNew ? (
          <div className="p-5">
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {collections.map(col => {
                const isAlreadyInCol = col.items?.some(i => i.id === mediaToSave.id);

                return (
                  <div
                    key={col.id}
                    onClick={() => !isAlreadyInCol && handleSelectCollection(col.id)}
                    className={`flex items-center justify-between p-3 rounded-2xl transition-all cursor-pointer ${
                      isAlreadyInCol
                        ? 'bg-[#FFF4B8]/50 dark:bg-[#FFD21F]/10 border border-[#FFD21F]/30 opacity-80 cursor-default'
                        : 'hover:bg-[#F6F6F6] dark:hover:bg-[#252525] border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-200 shrink-0">
                        <img
                          src={col.coverUrl || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=300&q=80'}
                          alt={col.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-[#171717] dark:text-white flex items-center gap-1.5">
                          {col.name}
                          {col.isPrivate && <Lock className="w-3 h-3 text-[#888888]" />}
                        </h4>
                        <p className="text-xs text-[#888888]">
                          {col.itemCount || col.items?.length || 0} items
                        </p>
                      </div>
                    </div>

                    <button
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                        isAlreadyInCol
                          ? 'bg-[#FFD21F] text-[#171717] flex items-center gap-1'
                          : 'bg-[#171717] dark:bg-white text-white dark:text-[#171717] hover:bg-[#FFD21F] dark:hover:bg-[#FFD21F] hover:text-[#171717]'
                      }`}
                    >
                      {isAlreadyInCol ? (
                        <>
                          <Check className="w-3.5 h-3.5 stroke-[3]" /> Saved
                        </>
                      ) : (
                        'Save'
                      )}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Create Collection Button */}
            <div className="mt-4 pt-4 border-t border-[#EAEAEA] dark:border-[#2A2A2A]">
              <button
                onClick={() => setIsCreatingNew(true)}
                className="w-full py-3 flex items-center justify-center gap-2 rounded-2xl bg-[#F6F6F6] dark:bg-[#252525] hover:bg-[#FFF4B8] dark:hover:bg-[#FFD21F]/20 text-[#171717] dark:text-white font-bold text-sm transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 text-[#FFD21F]" /> Create New Collection
              </button>
            </div>
          </div>
        ) : (
          /* Create New Collection Inline Form */
          <form onSubmit={handleCreateAndSave} className="p-5 space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#666666] dark:text-[#A0A0A0] mb-1">
                Collection Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Modern Ceramics, Dream House..."
                value={newColName}
                onChange={e => setNewColName(e.target.value)}
                className="w-full px-4 py-2.5 text-sm bg-[#F5F5F5] dark:bg-[#222222] text-[#171717] dark:text-white rounded-xl border border-transparent focus:border-[#FFD21F] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#666666] dark:text-[#A0A0A0] mb-1">
                Description (Optional)
              </label>
              <input
                type="text"
                placeholder="What is this board exploring?"
                value={newColDesc}
                onChange={e => setNewColDesc(e.target.value)}
                className="w-full px-4 py-2.5 text-sm bg-[#F5F5F5] dark:bg-[#222222] text-[#171717] dark:text-white rounded-xl border border-transparent focus:border-[#FFD21F] focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-[#F5F5F5] dark:bg-[#222222]">
              <div className="flex items-center gap-2.5">
                {isPrivate ? <Lock className="w-4 h-4 text-[#888888]" /> : <Globe className="w-4 h-4 text-[#888888]" />}
                <div>
                  <p className="text-xs font-bold text-[#171717] dark:text-white">
                    {isPrivate ? 'Private Collection' : 'Public Collection'}
                  </p>
                  <p className="text-[11px] text-[#888888]">
                    {isPrivate ? 'Only you can see this collection' : 'Anyone on Vistora can discover this'}
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={isPrivate}
                onChange={e => setIsPrivate(e.target.checked)}
                className="w-4 h-4 accent-[#FFD21F] rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsCreatingNew(false)}
                className="flex-1 py-2.5 rounded-full border border-[#EAEAEA] dark:border-[#333333] text-xs font-bold text-[#666666] dark:text-gray-300 hover:bg-[#F5F5F5] dark:hover:bg-[#222222] transition-colors cursor-pointer"
              >
                Back
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-full bg-[#FFD21F] hover:bg-[#F2C410] text-[#171717] text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                Create & Save
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
