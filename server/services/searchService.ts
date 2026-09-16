import { MediaItem, MediaType, SearchFilters } from '../../src/types';
import { CURATED_MEDIA } from './curatedData';
import { pixabayKeyManager } from './keyManager';
import { pixabayProvider } from './pixabayProvider';
import { store } from './store';
import { ProviderSearchResult } from './types';

interface CacheEntry {
  timestamp: number;
  data: ProviderSearchResult;
}

export class SearchService {
  private cache = new Map<string, CacheEntry>();
  private CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes cache

  private getCacheKey(type: string, query: string, filters: SearchFilters): string {
    return `${type}:${query.toLowerCase().trim()}:${filters.orientation || 'all'}:${filters.order || 'popular'}:${filters.category || 'all'}:${filters.page || 1}`;
  }

  public async search(type: 'all' | 'photo' | 'video', query: string, filters: SearchFilters): Promise<ProviderSearchResult> {
    const cleanQuery = (query || '').trim();
    const isDiscovery = !cleanQuery && (!filters.category || filters.category === 'all');
    const cacheKey = this.getCacheKey(type, cleanQuery, filters);
    const now = Date.now();

    // Track search in history
    if (cleanQuery) {
      store.searchHistory.unshift({ query: cleanQuery, timestamp: now });
      if (store.searchHistory.length > 50) store.searchHistory.pop();
      store.searchEventsCount++;
    }

    // Check cache (for discovery feeds, bypass cache so every visit and category click yields fresh rotating content)
    if (!isDiscovery) {
      const cached = this.cache.get(cacheKey);
      if (cached && (now - cached.timestamp) < this.CACHE_TTL_MS) {
        pixabayKeyManager.cacheHits++;
        return cached.data;
      }
    }

    let items: MediaItem[] = [];
    let total = 0;
    let providerName = 'curated';

    // Attempt real Pixabay if configured
    if (pixabayProvider.isAvailable()) {
      try {
        if (type === 'video') {
          const videoRes = await pixabayProvider.searchVideos(cleanQuery, filters);
          items = videoRes.items;
          total = videoRes.total;
          providerName = 'pixabay-video';
        } else if (type === 'photo') {
          const photoRes = await pixabayProvider.searchPhotos(cleanQuery, filters);
          items = photoRes.items;
          total = photoRes.total;
          providerName = 'pixabay-photo';
        } else {
          // 'all' -> query both in parallel
          const [photos, videos] = await Promise.allSettled([
            pixabayProvider.searchPhotos(cleanQuery, filters),
            pixabayProvider.searchVideos(cleanQuery, { ...filters, perPage: 8 }),
          ]);

          const photoItems = photos.status === 'fulfilled' ? photos.value.items : [];
          const videoItems = videos.status === 'fulfilled' ? videos.value.items : [];
          
          // Interweave photos and videos
          items = this.interweaveMedia(photoItems, videoItems);
          total = (photos.status === 'fulfilled' ? photos.value.total : 0) + (videos.status === 'fulfilled' ? videos.value.total : 0);
          providerName = 'pixabay-hybrid';
        }
      } catch (err) {
        console.warn(`[VISTORA SearchService] Provider query failed, falling back to curated visual library. Error:`, (err as any)?.message);
      }
    }

    // Fallback or blend curated high-res media if provider returned empty or had no keys
    if (items.length === 0) {
      const filteredCurated = this.filterCuratedMedia(cleanQuery, type, filters);
      // For discovery, shuffle items to provide fresh non-repetitive variety
      if (isDiscovery) {
        items = [...filteredCurated].sort(() => Math.random() - 0.5);
      } else {
        items = filteredCurated;
      }
      total = filteredCurated.length;
      providerName = 'vistora-curated';
    }

    // Annotate with user like & save states
    const annotatedItems = items.map(item => ({
      ...item,
      isLiked: store.userLikes.has(item.id),
      isSaved: store.userSavedMedia.has(item.id),
    }));

    const result: ProviderSearchResult = {
      items: annotatedItems,
      total,
      totalHits: total,
      page: filters.page || 1,
      perPage: filters.perPage || 24,
      provider: providerName,
    };

    // Store in cache
    this.cache.set(cacheKey, { timestamp: now, data: result });
    return result;
  }

  private filterCuratedMedia(query: string, type: string, filters: SearchFilters): MediaItem[] {
    const qLower = query.toLowerCase();
    const catLower = (filters.category || '').toLowerCase();

    return CURATED_MEDIA.filter(item => {
      // Type filter
      if (type === 'photo' && item.type !== 'photo') return false;
      if (type === 'video' && item.type !== 'video') return false;

      // Orientation filter
      if (filters.orientation === 'horizontal' && (item.aspectRatio || 1) < 1.05) return false;
      if (filters.orientation === 'vertical' && (item.aspectRatio || 1) >= 1.05) return false;

      // Category filter
      if (catLower && catLower !== 'all') {
        const matchesCategory = item.tags?.some(t => t.toLowerCase() === catLower);
        if (!matchesCategory) return false;
      }

      // Query filter
      if (!qLower) return true;

      const titleMatch = item.title.toLowerCase().includes(qLower);
      const descMatch = (item.description || '').toLowerCase().includes(qLower);
      const tagMatch = item.tags?.some(t => t.toLowerCase().includes(qLower));
      const authorMatch = item.author.toLowerCase().includes(qLower);

      return titleMatch || descMatch || tagMatch || authorMatch;
    });
  }

  private interweaveMedia(photos: MediaItem[], videos: MediaItem[]): MediaItem[] {
    const combined: MediaItem[] = [];
    let pIdx = 0;
    let vIdx = 0;

    while (pIdx < photos.length || vIdx < videos.length) {
      // Push 4 photos then 1 video
      for (let i = 0; i < 4 && pIdx < photos.length; i++) {
        combined.push(photos[pIdx++]);
      }
      if (vIdx < videos.length) {
        combined.push(videos[vIdx++]);
      }
    }
    return combined;
  }

  public getTrendingKeywords(): string[] {
    return [
      'Modern Architecture',
      'Minimalist Workspace',
      'Nordic Interior',
      'Cinematic Ocean',
      'Desert Dunes Sunset',
      'Cyberpunk Tokyo',
      'Raw Rammed Earth',
      'Travertine Kitchen',
      'Vintage Automotive',
      'Cosmic Deep Field',
    ];
  }
}

export const searchService = new SearchService();
