import React, { createContext, useContext, useState, useEffect } from 'react';
import { Collection, MediaItem, NotificationItem, UserProfile, UserPreferences } from '../types';
import { supabase, getStoredUser, signOutUser, setStoredUser } from '../lib/supabase';

export type ActiveTab = 'home' | 'explore' | 'photos' | 'videos' | 'trending' | 'collections' | 'ideas' | 'creator' | 'settings';

interface ToastInfo {
  id: string;
  message: string;
  type?: 'success' | 'info' | 'warning';
}

interface VistoraContextType {
  // Navigation & Routing
  currentTab: ActiveTab;
  setCurrentTab: (tab: ActiveTab) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  selectedIdeaSlug: string | null;
  setSelectedIdeaSlug: (slug: string | null) => void;
  selectedCreatorUsername: string | null;
  setSelectedCreatorUsername: (username: string | null) => void;
  selectedCollectionId: string | null;
  setSelectedCollectionId: (id: string | null) => void;

  // Media Viewer Modal
  activeViewerMedia: MediaItem | null;
  setActiveViewerMedia: (media: MediaItem | null) => void;
  feedItems: MediaItem[];
  setFeedItems: React.Dispatch<React.SetStateAction<MediaItem[]>>;

  // User & Social State
  currentUser: UserProfile;
  setCurrentUser: React.Dispatch<React.SetStateAction<UserProfile>>;
  userPreferences: UserPreferences;
  updateUserPreferences: (prefs: UserPreferences) => void;
  likedMediaIds: Set<string>;
  savedMediaIds: Set<string>;
  followedUsers: Set<string>;
  toggleLike: (media: MediaItem) => Promise<void>;
  toggleFollow: (username: string) => Promise<void>;
  signOut: () => Promise<void>;

  // Collections
  collections: Collection[];
  fetchCollections: () => Promise<void>;
  saveMediaToCollection: (collectionId: string, media: MediaItem) => Promise<void>;
  createCollection: (name: string, description: string, isPrivate: boolean) => Promise<Collection | null>;
  mediaToSave: MediaItem | null;
  setMediaToSave: (media: MediaItem | null) => void;

  // Notifications
  notifications: NotificationItem[];
  unreadNotifsCount: number;
  markNotificationsAsRead: () => Promise<void>;

  // UI & Canvas Theme (Light Mode Default)
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  toasts: ToastInfo[];
  showToast: (message: string, type?: 'success' | 'info' | 'warning') => void;
  removeToast: (id: string) => void;

  // Modals & Creative Tools
  isCreateModalOpen: boolean;
  setIsCreateModalOpen: (open: boolean) => void;
  isHealthModalOpen: boolean;
  setIsHealthModalOpen: (open: boolean) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  isOnboardingOpen: boolean;
  setIsOnboardingOpen: (open: boolean) => void;
  editingMedia: MediaItem | null;
  setEditingMedia: (media: MediaItem | null) => void;
}

const VistoraContext = createContext<VistoraContextType | undefined>(undefined);

const DEFAULT_USER: UserProfile = {
  id: 'usr_vistora_creator',
  username: 'elena_v',
  displayName: 'Elena Vance',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  bio: 'Visual curator & spatial designer. Exploring natural light, travertine materiality, and brutalist forms.',
  website: 'https://vistora.app/creator/elena_v',
  followersCount: 1420,
  followingCount: 52,
  likesCount: 382,
  savesCount: 145,
  badge: 'Staff Pick',
};

export const VistoraProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTab, setCurrentTab] = useState<ActiveTab>('home');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedIdeaSlug, setSelectedIdeaSlug] = useState<string | null>(null);
  const [selectedCreatorUsername, setSelectedCreatorUsername] = useState<string | null>(null);
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);

  const [activeViewerMedia, setActiveViewerMedia] = useState<MediaItem | null>(null);
  const [feedItems, setFeedItems] = useState<MediaItem[]>([]);
  const [mediaToSave, setMediaToSave] = useState<MediaItem | null>(null);

  // Authenticated user state
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    const stored = getStoredUser();
    return stored || DEFAULT_USER;
  });

  const [likedMediaIds, setLikedMediaIds] = useState<Set<string>>(new Set(['arch-101', 'nature-201', 'interior-301']));
  const [savedMediaIds, setSavedMediaIds] = useState<Set<string>>(new Set(['arch-101', 'arch-102', 'arch-103', 'nature-201', 'interior-301', 'tech-601']));
  const [followedUsers, setFollowedUsers] = useState<Set<string>>(new Set(['marcusvance', 'soratanaka']));

  const [collections, setCollections] = useState<Collection[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // STRICT REQUIREMENT: LIGHT MODE MUST BE DEFAULT
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('vistora-theme');
    return saved === 'dark'; // Only dark if user explicitly chose it previously
  });

  const [toasts, setToasts] = useState<ToastInfo[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isHealthModalOpen, setIsHealthModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [editingMedia, setEditingMedia] = useState<MediaItem | null>(null);

  const [userPreferences, setUserPreferences] = useState<UserPreferences>(() => {
    try {
      const saved = localStorage.getItem('vistora_user_prefs');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      preferredCategories: ['Architecture', 'Nature', 'Minimalist Interior', 'Cinematic'],
      preferredMediaType: 'all',
      onboardingCompleted: false,
    };
  });

  const updateUserPreferences = (newPrefs: UserPreferences) => {
    setUserPreferences(newPrefs);
    try {
      localStorage.setItem('vistora_user_prefs', JSON.stringify(newPrefs));
    } catch (e) {}
    setCurrentUser(prev => ({
      ...prev,
      preferences: newPrefs,
    }));
  };

  // Listen to Supabase Auth state changes if client is configured
  useEffect(() => {
    if (supabase) {
      const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          const meta = session.user.user_metadata || {};
          const profile: UserProfile = {
            id: session.user.id,
            username: meta.username || session.user.email?.split('@')[0] || 'curator',
            displayName: meta.display_name || meta.username || 'Curator',
            avatarUrl: meta.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
            bio: meta.bio || 'Visual explorer on VISTORA.',
            followersCount: 0,
            followingCount: 0,
            badge: 'Verified',
          };
          setCurrentUser(profile);
          localStorage.setItem('vistora_auth_user', JSON.stringify(profile));
        }
      });

      return () => {
        authListener.subscription.unsubscribe();
      };
    }
  }, []);

  // Sync theme class
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('vistora-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('vistora-theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(prev => !prev);

  const showToast = (message: string, type: 'success' | 'info' | 'warning' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3800);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const signOut = async () => {
    await signOutUser();
    setCurrentUser(DEFAULT_USER);
    showToast('Signed out successfully', 'info');
  };

  // Initial data loading
  const fetchCollections = async () => {
    try {
      const res = await fetch('/api/collections');
      const data = await res.json();
      if (data.success && data.data) {
        setCollections(data.data);
      }
    } catch (e) {
      console.warn('Failed to load collections:', e);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      if (data.success && data.data) {
        setNotifications(data.data);
      }
    } catch (e) {
      console.warn('Failed to load notifications:', e);
    }
  };

  useEffect(() => {
    fetchCollections();
    fetchNotifications();
  }, []);

  const toggleLike = async (media: MediaItem) => {
    const isCurrentlyLiked = likedMediaIds.has(media.id);
    const newLiked = new Set(likedMediaIds);

    if (isCurrentlyLiked) {
      newLiked.delete(media.id);
      showToast('Removed from your favorites', 'info');
    } else {
      newLiked.add(media.id);
      showToast(`Added "${media.title || 'Visual Work'}" to favorites!`, 'success');
    }
    setLikedMediaIds(newLiked);

    try {
      await fetch('/api/social/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mediaId: media.id }),
      });
    } catch (e) {}
  };

  const toggleFollow = async (username: string) => {
    const isFollowing = followedUsers.has(username);
    const newFollowed = new Set(followedUsers);

    if (isFollowing) {
      newFollowed.delete(username);
      showToast(`Unfollowed @${username}`, 'info');
    } else {
      newFollowed.add(username);
      showToast(`Now following @${username}!`, 'success');
    }
    setFollowedUsers(newFollowed);

    try {
      await fetch('/api/social/follow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });
    } catch (e) {}
  };

  const saveMediaToCollection = async (collectionId: string, media: MediaItem) => {
    try {
      const res = await fetch(`/api/collections/${collectionId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mediaItem: media }),
      });

      const data = await res.json();
      if (data.success) {
        setSavedMediaIds(prev => new Set(prev).add(media.id));
        setCollections(prev =>
          prev.map(c => (c.id === collectionId ? { ...c, itemCount: c.itemCount + 1 } : c))
        );
        showToast(`Saved to "${data.data?.collectionName || 'Collection'}"!`, 'success');
      }
    } catch (e) {
      showToast('Could not save to board', 'warning');
    }
  };

  const createCollection = async (name: string, description: string, isPrivate: boolean) => {
    try {
      const res = await fetch('/api/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, isPrivate }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setCollections(prev => [data.data, ...prev]);
        showToast(`Created new collection "${name}"`, 'success');
        return data.data;
      }
    } catch (e) {
      showToast('Could not create collection', 'warning');
    }
    return null;
  };

  const markNotificationsAsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    try {
      await fetch('/api/notifications/read', { method: 'POST' });
    } catch (e) {}
  };

  const unreadNotifsCount = notifications.filter(n => !n.isRead).length;

  return (
    <VistoraContext.Provider
      value={{
        currentTab,
        setCurrentTab,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        selectedIdeaSlug,
        setSelectedIdeaSlug,
        selectedCreatorUsername,
        setSelectedCreatorUsername,
        selectedCollectionId,
        setSelectedCollectionId,
        activeViewerMedia,
        setActiveViewerMedia,
        feedItems,
        setFeedItems,
        currentUser,
        setCurrentUser,
        userPreferences,
        updateUserPreferences,
        likedMediaIds,
        savedMediaIds,
        followedUsers,
        toggleLike,
        toggleFollow,
        signOut,
        collections,
        fetchCollections,
        saveMediaToCollection,
        createCollection,
        mediaToSave,
        setMediaToSave,
        notifications,
        unreadNotifsCount,
        markNotificationsAsRead,
        isDarkMode,
        toggleDarkMode,
        toasts,
        showToast,
        removeToast,
        isCreateModalOpen,
        setIsCreateModalOpen,
        isHealthModalOpen,
        setIsHealthModalOpen,
        isAuthModalOpen,
        setIsAuthModalOpen,
        isOnboardingOpen,
        setIsOnboardingOpen,
        editingMedia,
        setEditingMedia,
      }}
    >
      {children}
    </VistoraContext.Provider>
  );
};

export const useVistora = (): VistoraContextType => {
  const context = useContext(VistoraContext);
  if (!context) {
    throw new Error('useVistora must be used within a VistoraProvider');
  }
  return context;
};
