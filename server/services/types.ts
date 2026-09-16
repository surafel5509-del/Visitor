import { MediaItem, MediaType, SearchFilters } from '../../src/types';

export interface ProviderSearchResult {
  items: MediaItem[];
  total: number;
  totalHits: number;
  page: number;
  perPage: number;
  provider: string;
}

export interface MediaProvider {
  name: string;
  isAvailable(): boolean;
  searchPhotos(query: string, filters: SearchFilters): Promise<ProviderSearchResult>;
  searchVideos(query: string, filters: SearchFilters): Promise<ProviderSearchResult>;
  getMedia(id: string, type: MediaType): Promise<MediaItem | null>;
}
