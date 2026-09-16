/**
 * VISTORA Global Visual Discovery Platform
 * TypeScript Type Definitions
 */

export type MediaType = 'photo' | 'video';

export interface MediaItem {
  id: string;
  type: MediaType;
  title: string;
  description?: string;
  thumbnailUrl: string;
  previewUrl: string;
  originalUrl: string;
  width: number;
  height: number;
  duration?: number;
  aspectRatio?: number;
  author: string;
  authorUrl: string;
  source: string;
  sourceUrl: string;
  tags?: string[];
  likesCount?: number;
  viewsCount?: number;
  isLiked?: boolean;
  isSaved?: boolean;
}

export interface UserPreferences {
  preferredCategories: string[];
  preferredMediaType: 'all' | 'photo' | 'video';
  onboardingCompleted: boolean;
}

export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  bio: string;
  website?: string;
  followersCount: number;
  followingCount: number;
  likesCount?: number;
  savesCount?: number;
  isFollowing?: boolean;
  badge?: string;
  preferences?: UserPreferences;
}

export interface Collection {
  id: string;
  ownerId: string;
  ownerName: string;
  ownerAvatar?: string;
  name: string;
  description: string;
  isPrivate: boolean;
  coverUrl: string;
  itemCount: number;
  createdAt: string;
  items?: MediaItem[];
}

export interface ColorSwatch {
  name: string;
  hex: string;
  description?: string;
}

export interface IdeaElement {
  title: string;
  description: string;
  iconName?: string;
}

export interface IdeaPage {
  slug: string;
  title: string;
  tagline: string;
  category: string;
  coverUrl: string;
  inspirationOverview: string;
  colorPalette: ColorSwatch[];
  architectureElements: IdeaElement[];
  relatedSearches: string[];
  items: MediaItem[];
  savedCount: number;
  isSaved?: boolean;
  isFollowing?: boolean;
}

export interface CommentItem {
  id: string;
  mediaId: string;
  userId: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  content: string;
  createdAt: string;
  likesCount: number;
  isLiked?: boolean;
}

export interface NotificationItem {
  id: string;
  type: 'like' | 'save' | 'follow' | 'comment' | 'system';
  actorName: string;
  actorAvatar: string;
  message: string;
  targetId?: string;
  targetThumbnail?: string;
  isRead: boolean;
  createdAt: string;
}

export interface KeyStatus {
  keyIndex: number;
  maskedKey: string;
  status: 'active' | 'cooldown' | 'disabled' | 'standby';
  failureCount: number;
  lastUsed?: string;
  cooldownUntil?: string;
}

export interface ProviderHealth {
  providerName: string;
  status: 'healthy' | 'degraded' | 'cooldown' | 'standby';
  totalConfiguredKeys: number;
  activeKeys: number;
  requestCount: number;
  errorCount: number;
  cacheHits: number;
  keys: KeyStatus[];
}

export interface SearchFilters {
  type?: 'all' | 'photo' | 'video';
  orientation?: 'all' | 'horizontal' | 'vertical';
  order?: 'popular' | 'latest';
  category?: string;
  page?: number;
  perPage?: number;
}
