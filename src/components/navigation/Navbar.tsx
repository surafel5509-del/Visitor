import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Plus,
  Sun,
  Moon,
  X,
  Clock,
  TrendingUp,
  User,
  Bookmark,
  Settings,
  Sparkles,
  Layers,
  Compass,
  Image,
  Video,
  Flame,
  LogIn,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import { ActiveTab, useVistora } from '../../context/VistoraContext';
import { VistoraLogo } from '../ui/VistoraLogo';

export const Navbar: React.FC = () => {
  const {
    currentTab,
    setCurrentTab,
    searchQuery,
    setSearchQuery,
    currentUser,
    isDarkMode,
    toggleDarkMode,
    setIsCreateModalOpen,
    setIsAuthModalOpen,
    setIsOnboardingOpen,
    signOut,
    setSelectedCreatorUsername,
    setSelectedCollectionId,
    setSelectedIdeaSlug,
  } = useVistora();

  const [inputVal, setInputVal] = useState(searchQuery);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [trendingKeywords, setTrendingKeywords] = useState<string[]>([]);

  const searchBoxRef = useRef<HTMLDivElement>(null);
  const notifBoxRef = useRef<HTMLDivElement>(null);
  const profileBoxRef = useRef<HTMLDivElement>(null);

  // Sync inputVal when global query changes externally
  useEffect(() => {
    setInputVal(searchQuery);
  }, [searchQuery]);

  // Fetch search suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const res = await fetch(`/api/search/suggestions?q=${encodeURIComponent(inputVal)}`);
        const data = await res.json();
        if (data.success) {
          setSuggestions(data.data.suggestions || []);
          setRecentSearches(data.data.recent || []);
          setTrendingKeywords(data.data.trending || []);
        }
      } catch (e) {}
    };

    const timer = setTimeout(fetchSuggestions, 200);
    return () => clearTimeout(timer);
  }, [inputVal]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
      if (notifBoxRef.current && !notifBoxRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
      if (profileBoxRef.current && !profileBoxRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (queryToSearch?: string) => {
    const q = (queryToSearch !== undefined ? queryToSearch : inputVal).trim();
    setSearchQuery(q);
    setIsSearchFocused(false);
    setSelectedIdeaSlug(null);
    setSelectedCreatorUsername(null);
    setSelectedCollectionId(null);
    if (currentTab !== 'photos' && currentTab !== 'videos' && currentTab !== 'explore') {
      setCurrentTab('home');
    }
  };

  const navLinks: { tab: ActiveTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { tab: 'home', label: 'Home', icon: Compass },
    { tab: 'explore', label: 'Explore', icon: Sparkles },
    { tab: 'photos', label: 'Photos', icon: Image },
    { tab: 'videos', label: 'Videos', icon: Video },
    { tab: 'trending', label: 'Trending', icon: Flame },
    { tab: 'collections', label: 'Collections', icon: Layers },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-[#111111]/95 backdrop-blur-md border-b border-[#EAEAEA] dark:border-[#222222] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        {/* Left: Brand Logo & Desktop Nav Links */}
        <div className="flex items-center gap-6 xl:gap-8">
          <div
            onClick={() => {
              setCurrentTab('home');
              setSearchQuery('');
              setSelectedIdeaSlug(null);
              setSelectedCreatorUsername(null);
              setSelectedCollectionId(null);
            }}
          >
            <VistoraLogo size="md" />
          </div>

          <nav className="hidden lg:flex items-center gap-1.5" aria-label="Main Navigation">
            {navLinks.map(({ tab, label }) => {
              const isActive = currentTab === tab && !searchQuery;
              return (
                <button
                  key={tab}
                  onClick={() => {
                    setCurrentTab(tab);
                    setSearchQuery('');
                    setSelectedIdeaSlug(null);
                    setSelectedCreatorUsername(null);
                    setSelectedCollectionId(null);
                  }}
                  className={`px-3.5 py-1.5 rounded-full text-sm font-semibold transition-all cursor-pointer select-none ${
                    isActive
                      ? 'bg-[#FFD21F] text-[#171717] shadow-sm'
                      : 'text-[#666666] dark:text-[#A0A0A0] hover:text-[#171717] dark:hover:text-white hover:bg-[#F6F6F6] dark:hover:bg-[#1B1B1B]'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Center: Search Bar with Suggestions */}
        <div ref={searchBoxRef} className="flex-1 max-w-xl relative">
          <div className="relative flex items-center">
            <div className="absolute left-3.5 text-[#888888] pointer-events-none">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Search photos, videos, ideas..."
              value={inputVal}
              onFocus={() => setIsSearchFocused(true)}
              onChange={e => setInputVal(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleSearchSubmit();
                if (e.key === 'Escape') setIsSearchFocused(false);
              }}
              className="w-full pl-10 pr-24 py-2.5 bg-[#F4F4F4] dark:bg-[#1B1B1B] text-[#171717] dark:text-white text-sm rounded-full border border-transparent focus:border-[#FFD21F] focus:bg-white dark:focus:bg-[#111111] focus:outline-none focus:ring-2 focus:ring-[#FFD21F]/30 transition-all placeholder:text-[#888888]"
            />
            {inputVal && (
              <button
                onClick={() => {
                  setInputVal('');
                  setSearchQuery('');
                }}
                className="absolute right-12 text-[#888888] hover:text-[#171717] dark:hover:text-white p-1"
                aria-label="Clear search input"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => handleSearchSubmit()}
              aria-label="Submit search"
              className="absolute right-1.5 px-3 py-1.5 bg-[#FFD21F] hover:bg-[#F2C410] text-[#171717] rounded-full text-xs font-bold transition-all shadow-xs flex items-center justify-center cursor-pointer"
            >
              Search
            </button>
          </div>

          {/* Search Suggestions & Trending Dropdown */}
          {isSearchFocused && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#1A1A1A] border border-[#EAEAEA] dark:border-[#2A2A2A] rounded-2xl shadow-xl p-3 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
              {/* Recent searches */}
              {recentSearches.length > 0 && !inputVal && (
                <div className="mb-3">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#888888] px-2.5 py-1 uppercase tracking-wider">
                    <Clock className="w-3.5 h-3.5" /> Recent Searches
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {recentSearches.map(term => (
                      <button
                        key={term}
                        onClick={() => {
                          setInputVal(term);
                          handleSearchSubmit(term);
                        }}
                        className="px-3 py-1 text-xs bg-[#F5F5F5] dark:bg-[#252525] hover:bg-[#FFF4B8] dark:hover:bg-[#FFD21F]/20 text-[#171717] dark:text-gray-200 rounded-full transition-colors cursor-pointer"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggestions */}
              <div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#888888] px-2.5 py-1 uppercase tracking-wider">
                  <TrendingUp className="w-3.5 h-3.5 text-[#FFD21F]" />{' '}
                  {inputVal ? 'Suggestions' : 'Trending on Vistora'}
                </div>
                <div className="mt-1 space-y-0.5">
                  {(inputVal ? suggestions : trendingKeywords).slice(0, 6).map(item => (
                    <button
                      key={item}
                      onClick={() => {
                        setInputVal(item);
                        handleSearchSubmit(item);
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 text-sm text-left hover:bg-[#F8F8F8] dark:hover:bg-[#222222] rounded-xl text-[#171717] dark:text-white transition-colors cursor-pointer group"
                    >
                      <span className="flex items-center gap-2">
                        <Search className="w-3.5 h-3.5 text-[#888888] group-hover:text-[#FFD21F] transition-colors" />
                        {item}
                      </span>
                      <span className="text-[11px] text-[#888888] opacity-0 group-hover:opacity-100 transition-opacity">
                        Explore →
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Actions: Create, Theme, Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Create Button (Yellow) */}
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#FFD21F] hover:bg-[#F2C410] text-[#171717] text-sm font-bold rounded-full transition-all shadow-sm hover:shadow active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">Create</span>
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="p-2 text-[#666666] dark:text-[#A0A0A0] hover:text-[#171717] dark:hover:text-white hover:bg-[#F6F6F6] dark:hover:bg-[#1B1B1B] rounded-full transition-colors cursor-pointer"
            aria-label="Toggle Dark Mode"
          >
            {isDarkMode ? <Sun className="w-5 h-5 text-[#FFD21F]" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Profile Menu */}
          <div ref={profileBoxRef} className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 p-1 hover:bg-[#F6F6F6] dark:hover:bg-[#1B1B1B] rounded-full transition-colors cursor-pointer"
              aria-label="User profile menu"
            >
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.displayName}
                className="w-8 h-8 rounded-full object-cover border border-[#EAEAEA] dark:border-[#333333]"
              />
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-[#1A1A1A] border border-[#EAEAEA] dark:border-[#2A2A2A] rounded-2xl shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="px-3 py-2.5 border-b border-[#EAEAEA] dark:border-[#2A2A2A]">
                  <p className="font-bold text-sm text-[#171717] dark:text-white truncate">
                    {currentUser.displayName}
                  </p>
                  <p className="text-xs text-[#888888] truncate">@{currentUser.username}</p>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      setSelectedCreatorUsername(currentUser.username);
                      setCurrentTab('creator');
                      setIsProfileOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-[#171717] dark:text-gray-200 hover:bg-[#F6F6F6] dark:hover:bg-[#252525] rounded-xl transition-colors cursor-pointer"
                  >
                    <User className="w-4 h-4 text-[#888888]" /> My Profile
                  </button>

                  <button
                    onClick={() => {
                      setCurrentTab('collections');
                      setIsProfileOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-[#171717] dark:text-gray-200 hover:bg-[#F6F6F6] dark:hover:bg-[#252525] rounded-xl transition-colors cursor-pointer"
                  >
                    <Bookmark className="w-4 h-4 text-[#888888]" /> Saved Boards
                  </button>

                  <button
                    onClick={() => {
                      setIsOnboardingOpen(true);
                      setIsProfileOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-[#171717] dark:text-gray-200 hover:bg-[#FFF4B8] dark:hover:bg-[#FFD21F]/20 rounded-xl transition-colors cursor-pointer font-medium"
                  >
                    <Sparkles className="w-4 h-4 text-[#FFD21F]" /> Personalize Visual Feed
                  </button>

                  <button
                    onClick={() => {
                      setCurrentTab('settings');
                      setIsProfileOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-[#171717] dark:text-gray-200 hover:bg-[#F6F6F6] dark:hover:bg-[#252525] rounded-xl transition-colors cursor-pointer"
                  >
                    <Settings className="w-4 h-4 text-[#888888]" /> Settings
                  </button>

                  <div className="my-1 border-t border-[#EAEAEA] dark:border-[#2A2A2A]" />

                  <button
                    onClick={() => {
                      setIsAuthModalOpen(true);
                      setIsProfileOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-[#171717] dark:text-gray-200 hover:bg-[#F6F6F6] dark:hover:bg-[#252525] rounded-xl transition-colors cursor-pointer"
                  >
                    <LogIn className="w-4 h-4 text-[#888888]" /> Sign In / Switch Account
                  </button>

                  <button
                    onClick={() => {
                      signOut();
                      setIsProfileOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
