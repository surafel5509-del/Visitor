import { MediaItem, MediaType, SearchFilters } from '../../src/types';
import { pixabayKeyManager } from './keyManager';
import { MediaProvider, ProviderSearchResult } from './types';

const AESTHETIC_PHOTO_TOPICS = [
  'modern architecture',
  'minimalist interior',
  'cinematic landscape',
  'editorial portrait',
  'travertine design',
  'serene ocean waves',
  'nordic aesthetic',
  'desert dunes sunset',
  'cyberpunk urban',
  'macro botanical',
  'brutalist geometry',
  'moody atmospheric light',
];

const AESTHETIC_VIDEO_TOPICS = [
  'cinematic nature',
  'ocean waves loop',
  'aerial drone landscape',
  'architectural light',
  'flowing water abstract',
  'cloud timelapse drift',
  'minimal motion',
  'city rain night',
];

export class PixabayProvider implements MediaProvider {
  public name = 'pixabay';

  public isAvailable(): boolean {
    return pixabayKeyManager.hasConfiguredKeys();
  }

  public async searchPhotos(query: string, filters: SearchFilters): Promise<ProviderSearchResult> {
    const keyInfo = pixabayKeyManager.getNextKey();
    if (!keyInfo) {
      throw new Error('NO_PIXABAY_KEYS_AVAILABLE');
    }

    const { key, keyIndex } = keyInfo;
    const cleanQuery = (query || '').trim();
    
    // If no query is specified, rotate aesthetic topics and randomize page for fresh discovery
    let effectiveQuery = cleanQuery;
    let page = filters.page || 1;
    if (!effectiveQuery) {
      const randomTopic = AESTHETIC_PHOTO_TOPICS[Math.floor(Math.random() * AESTHETIC_PHOTO_TOPICS.length)];
      effectiveQuery = randomTopic;
      if (page === 1) {
        page = Math.floor(Math.random() * 4) + 1; // Pick page 1-4 for fresh rotation
      }
    }

    const perPage = Math.min(filters.perPage || 24, 50);
    const order = filters.order === 'latest' ? 'latest' : 'popular';
    
    // Pixabay parameters
    const params = new URLSearchParams({
      key,
      q: effectiveQuery,
      image_type: 'photo',
      page: page.toString(),
      per_page: perPage.toString(),
      order,
      safesearch: 'true',
    });

    if (filters.orientation && filters.orientation !== 'all') {
      params.append('orientation', filters.orientation);
    }
    if (filters.category && filters.category !== 'all') {
      params.append('category', filters.category.toLowerCase());
    }

    try {
      const response = await fetch(`https://pixabay.com/api/?${params.toString()}`, {
        headers: { 'User-Agent': 'Vistora-Discovery/1.0' },
      });

      if (response.status === 429) {
        pixabayKeyManager.recordFailure(keyIndex, true);
        throw new Error('PIXABAY_RATE_LIMITED');
      }

      if (!response.ok) {
        pixabayKeyManager.recordFailure(keyIndex, false);
        throw new Error(`PIXABAY_HTTP_${response.status}`);
      }

      const data = await response.json();
      pixabayKeyManager.recordSuccess(keyIndex);

      const items: MediaItem[] = (data.hits || []).map((hit: any) => {
        const rawTags = hit.tags ? hit.tags.split(',').map((t: string) => t.trim()) : [];
        const primaryTag = rawTags[0] || 'Visual Idea';
        const title = primaryTag.charAt(0).toUpperCase() + primaryTag.slice(1);

        return {
          id: `pb-${hit.id}`,
          type: 'photo' as MediaType,
          title: title,
          description: `Captured by ${hit.user} on Pixabay. Tags: ${rawTags.join(', ')}`,
          thumbnailUrl: hit.webformatURL || hit.previewURL,
          previewUrl: hit.largeImageURL || hit.webformatURL,
          originalUrl: hit.imageURL || hit.largeImageURL || hit.webformatURL,
          width: hit.imageWidth || 1920,
          height: hit.imageHeight || 1080,
          aspectRatio: (hit.imageWidth && hit.imageHeight) ? Number((hit.imageWidth / hit.imageHeight).toFixed(2)) : 1.5,
          author: hit.user || 'Unknown Creator',
          authorUrl: `https://pixabay.com/users/${hit.user}-${hit.user_id}/`,
          source: 'Pixabay',
          sourceUrl: hit.pageURL,
          tags: rawTags,
          likesCount: hit.likes || 0,
          viewsCount: hit.views || 0,
        };
      });

      return {
        items,
        total: data.total || items.length,
        totalHits: data.totalHits || items.length,
        page,
        perPage,
        provider: this.name,
      };
    } catch (err: any) {
      if (!err.message?.includes('PIXABAY_')) {
        pixabayKeyManager.recordFailure(keyIndex, false);
      }
      throw err;
    }
  }

  public async searchVideos(query: string, filters: SearchFilters): Promise<ProviderSearchResult> {
    const keyInfo = pixabayKeyManager.getNextKey();
    if (!keyInfo) {
      throw new Error('NO_PIXABAY_KEYS_AVAILABLE');
    }

    const { key, keyIndex } = keyInfo;
    const cleanQuery = (query || '').trim();
    let effectiveQuery = cleanQuery;
    let page = filters.page || 1;
    if (!effectiveQuery) {
      const randomTopic = AESTHETIC_VIDEO_TOPICS[Math.floor(Math.random() * AESTHETIC_VIDEO_TOPICS.length)];
      effectiveQuery = randomTopic;
      if (page === 1) {
        page = Math.floor(Math.random() * 3) + 1; // Pick page 1-3 for fresh video rotation
      }
    }

    const perPage = Math.min(filters.perPage || 24, 50);
    const order = filters.order === 'latest' ? 'latest' : 'popular';

    const params = new URLSearchParams({
      key,
      q: effectiveQuery,
      page: page.toString(),
      per_page: perPage.toString(),
      order,
      safesearch: 'true',
    });

    try {
      const response = await fetch(`https://pixabay.com/api/videos/?${params.toString()}`, {
        headers: { 'User-Agent': 'Vistora-Discovery/1.0' },
      });

      if (response.status === 429) {
        pixabayKeyManager.recordFailure(keyIndex, true);
        throw new Error('PIXABAY_RATE_LIMITED');
      }

      if (!response.ok) {
        pixabayKeyManager.recordFailure(keyIndex, false);
        throw new Error(`PIXABAY_HTTP_${response.status}`);
      }

      const data = await response.json();
      pixabayKeyManager.recordSuccess(keyIndex);

      const items: MediaItem[] = (data.hits || []).map((hit: any) => {
        const rawTags = hit.tags ? hit.tags.split(',').map((t: string) => t.trim()) : [];
        const primaryTag = rawTags[0] || 'Motion Story';
        const title = primaryTag.charAt(0).toUpperCase() + primaryTag.slice(1);

        const videoMedium = hit.videos?.medium?.url || hit.videos?.small?.url || hit.videos?.large?.url || '';
        const videoOriginal = hit.videos?.large?.url || videoMedium;
        const width = hit.videos?.medium?.width || 1280;
        const height = hit.videos?.medium?.height || 720;
        const thumbUrl = hit.videos?.medium?.thumbnail
          || hit.videos?.large?.thumbnail
          || hit.videos?.small?.thumbnail
          || hit.videos?.tiny?.thumbnail
          || (hit.picture_id ? `https://i.vimeocdn.com/video/${hit.picture_id}_640x360.jpg` : '')
          || hit.userImageURL;

        return {
          id: `pb-vid-${hit.id}`,
          type: 'video' as MediaType,
          title: title,
          description: `Video created by ${hit.user} on Pixabay. Duration: ${hit.duration}s.`,
          thumbnailUrl: thumbUrl,
          previewUrl: videoMedium,
          originalUrl: videoOriginal,
          width,
          height,
          duration: hit.duration || 10,
          aspectRatio: Number((width / height).toFixed(2)),
          author: hit.user || 'Unknown Creator',
          authorUrl: `https://pixabay.com/users/${hit.user}-${hit.user_id}/`,
          source: 'Pixabay',
          sourceUrl: hit.pageURL,
          tags: rawTags,
          likesCount: hit.likes || 0,
          viewsCount: hit.views || 0,
        };
      });

      return {
        items,
        total: data.total || items.length,
        totalHits: data.totalHits || items.length,
        page,
        perPage,
        provider: this.name,
      };
    } catch (err: any) {
      if (!err.message?.includes('PIXABAY_')) {
        pixabayKeyManager.recordFailure(keyIndex, false);
      }
      throw err;
    }
  }

  public async getMedia(id: string, type: MediaType): Promise<MediaItem | null> {
    const rawId = id.replace(/^pb-(vid-)?/, '');
    const keyInfo = pixabayKeyManager.getNextKey();
    if (!keyInfo) return null;

    const endpoint = type === 'video' ? 'videos/' : '';
    const response = await fetch(`https://pixabay.com/api/${endpoint}?key=${keyInfo.key}&id=${rawId}`);
    if (!response.ok) return null;

    const data = await response.json();
    const hit = data.hits?.[0];
    if (!hit) return null;

    if (type === 'video') {
      return {
        id,
        type: 'video',
        title: hit.tags?.split(',')[0] || 'Motion Feature',
        thumbnailUrl: hit.picture_id ? `https://i.vimeocdn.com/video/${hit.picture_id}_640x360.jpg` : '',
        previewUrl: hit.videos?.medium?.url || '',
        originalUrl: hit.videos?.large?.url || hit.videos?.medium?.url || '',
        width: hit.videos?.medium?.width || 1280,
        height: hit.videos?.medium?.height || 720,
        duration: hit.duration,
        aspectRatio: 1.77,
        author: hit.user,
        authorUrl: `https://pixabay.com/users/${hit.user}-${hit.user_id}/`,
        source: 'Pixabay',
        sourceUrl: hit.pageURL,
        tags: hit.tags ? hit.tags.split(',').map((t: string) => t.trim()) : [],
        likesCount: hit.likes,
        viewsCount: hit.views,
      };
    }

    return {
      id,
      type: 'photo',
      title: hit.tags?.split(',')[0] || 'Visual Discovery',
      thumbnailUrl: hit.webformatURL,
      previewUrl: hit.largeImageURL || hit.webformatURL,
      originalUrl: hit.imageURL || hit.largeImageURL,
      width: hit.imageWidth,
      height: hit.imageHeight,
      aspectRatio: hit.imageWidth / hit.imageHeight,
      author: hit.user,
      authorUrl: `https://pixabay.com/users/${hit.user}-${hit.user_id}/`,
      source: 'Pixabay',
      sourceUrl: hit.pageURL,
      tags: hit.tags ? hit.tags.split(',').map((t: string) => t.trim()) : [],
      likesCount: hit.likes,
      viewsCount: hit.views,
    };
  }
}

export const pixabayProvider = new PixabayProvider();
