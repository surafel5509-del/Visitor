import React, { useState } from 'react';
import { User, Sun, Moon, Activity, Shield, Save, ExternalLink } from 'lucide-react';
import { useVistora } from '../../context/VistoraContext';

export const SettingsView: React.FC = () => {
  const {
    currentUser,
    setCurrentUser,
    isDarkMode,
    toggleDarkMode,
    setIsHealthModalOpen,
    showToast,
  } = useVistora();

  const [displayName, setDisplayName] = useState(currentUser.displayName);
  const [bio, setBio] = useState(currentUser.bio || '');
  const [website, setWebsite] = useState(currentUser.website || '');
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatarUrl);
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch('/api/auth/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName, bio, website, avatarUrl }),
      });
      const data = await res.json();
      if (data.success) {
        setCurrentUser(prev => ({
          ...prev,
          displayName,
          bio,
          website,
          avatarUrl,
        }));
        showToast('Profile updated successfully!', 'success');
      }
    } catch (e) {
      showToast('Could not save profile', 'warning');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-200">
      <div className="pb-6 border-b border-[#EAEAEA] dark:border-[#2A2A2A] mb-8">
        <h1 className="font-display text-3xl font-black text-[#171717] dark:text-white">
          Settings & Preferences
        </h1>
        <p className="text-sm text-[#666666] dark:text-[#A0A0A0] mt-1">
          Manage your VISTORA visual identity, workspace theme, and system metrics.
        </p>
      </div>

      <div className="space-y-8">
        {/* Profile Card */}
        <div className="bg-white dark:bg-[#1A1A1A] rounded-3xl p-6 sm:p-8 border border-[#EAEAEA] dark:border-[#2A2A2A] shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#888888] mb-6">
            <User className="w-4 h-4 text-[#FFD21F]" /> Public Creator Profile
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-5">
            {/* Avatar Preview & URL */}
            <div className="flex flex-col sm:flex-row items-center gap-5 pb-5 border-b border-[#EAEAEA] dark:border-[#252525]">
              <img
                src={avatarUrl}
                alt="Avatar preview"
                className="w-20 h-20 rounded-full object-cover border-2 border-[#FFD21F]"
              />
              <div className="flex-1 w-full">
                <label className="block text-xs font-bold text-[#666666] dark:text-[#A0A0A0] uppercase mb-1">
                  Avatar Image URL
                </label>
                <input
                  type="url"
                  value={avatarUrl}
                  onChange={e => setAvatarUrl(e.target.value)}
                  className="w-full px-4 py-2 text-sm bg-[#F5F5F5] dark:bg-[#222222] text-[#171717] dark:text-white rounded-xl border border-transparent focus:border-[#FFD21F] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#666666] dark:text-[#A0A0A0] uppercase mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm bg-[#F5F5F5] dark:bg-[#222222] text-[#171717] dark:text-white rounded-xl border border-transparent focus:border-[#FFD21F] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#666666] dark:text-[#A0A0A0] uppercase mb-1">
                  Website / Portfolio
                </label>
                <input
                  type="text"
                  value={website}
                  onChange={e => setWebsite(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-4 py-2.5 text-sm bg-[#F5F5F5] dark:bg-[#222222] text-[#171717] dark:text-white rounded-xl border border-transparent focus:border-[#FFD21F] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#666666] dark:text-[#A0A0A0] uppercase mb-1">
                Bio & Creative Focus
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={e => setBio(e.target.value)}
                placeholder="What design aesthetics or photography topics do you curate?"
                className="w-full px-4 py-2.5 text-sm bg-[#F5F5F5] dark:bg-[#222222] text-[#171717] dark:text-white rounded-xl border border-transparent focus:border-[#FFD21F] focus:outline-none resize-none"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#FFD21F] hover:bg-[#F2C410] active:scale-95 text-[#171717] font-bold text-xs sm:text-sm transition-all shadow-xs cursor-pointer select-none"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        </div>

        {/* Appearance & Workspace Theme */}
        <div className="bg-white dark:bg-[#1A1A1A] rounded-3xl p-6 sm:p-8 border border-[#EAEAEA] dark:border-[#2A2A2A] shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#888888] mb-6">
            <Sun className="w-4 h-4 text-[#FFD21F]" /> Appearance & Canvas Theme
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Light Mode Option */}
            <div
              onClick={() => isDarkMode && toggleDarkMode()}
              className={`p-5 rounded-2xl border-2 transition-all cursor-pointer ${
                !isDarkMode
                  ? 'border-[#FFD21F] bg-[#FFF4B8]/20 shadow-xs'
                  : 'border-[#EAEAEA] dark:border-[#2A2A2A] hover:border-gray-400'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <Sun className="w-5 h-5 text-[#FFD21F]" />
                {!isDarkMode && (
                  <span className="text-[10px] font-bold bg-[#FFD21F] text-[#171717] px-2 py-0.5 rounded-full">
                    Active
                  </span>
                )}
              </div>
              <h3 className="text-sm font-bold text-[#171717] dark:text-white">
                Vistora Studio Light
              </h3>
              <p className="text-xs text-[#666666] dark:text-[#A0A0A0] mt-1">
                Pure white base with signature #FFD21F yellow lighting and sharp contrast.
              </p>
            </div>

            {/* Dark Mode Option */}
            <div
              onClick={() => !isDarkMode && toggleDarkMode()}
              className={`p-5 rounded-2xl border-2 transition-all cursor-pointer ${
                isDarkMode
                  ? 'border-[#FFD21F] bg-[#FFD21F]/10 shadow-xs'
                  : 'border-[#EAEAEA] dark:border-[#2A2A2A] hover:border-gray-400'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <Moon className="w-5 h-5 text-[#FFD21F]" />
                {isDarkMode && (
                  <span className="text-[10px] font-bold bg-[#FFD21F] text-[#171717] px-2 py-0.5 rounded-full">
                    Active
                  </span>
                )}
              </div>
              <h3 className="text-sm font-bold text-[#171717] dark:text-white">
                Deep Obsidian Dark
              </h3>
              <p className="text-xs text-[#666666] dark:text-[#A0A0A0] mt-1">
                Deep graphite neutral background with warm yellow accents for night sessions.
              </p>
            </div>
          </div>
        </div>

        {/* Multi-Key & Provider Health Section */}
        <div className="bg-white dark:bg-[#1A1A1A] rounded-3xl p-6 sm:p-8 border border-[#EAEAEA] dark:border-[#2A2A2A] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#888888] mb-1">
              <Activity className="w-4 h-4 text-[#FFD21F]" /> Provider Health & Rotation
            </div>
            <h3 className="font-display font-bold text-base text-[#171717] dark:text-white">
              Live Pixabay Multi-Key Monitor
            </h3>
            <p className="text-xs text-[#666666] dark:text-[#A0A0A0] mt-0.5">
              Inspect active API credentials, cooldown statuses, rate limit metrics, and response caches.
            </p>
          </div>

          <button
            onClick={() => setIsHealthModalOpen(true)}
            className="px-5 py-2.5 rounded-full bg-[#171717] dark:bg-white text-white dark:text-[#171717] hover:bg-[#FFD21F] dark:hover:bg-[#FFD21F] hover:text-[#171717] text-xs font-bold transition-colors cursor-pointer"
          >
            Open Status Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};
