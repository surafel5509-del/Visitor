import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { pixabayKeyManager } from './server/services/keyManager';
import { pixabayProvider } from './server/services/pixabayProvider';
import { searchService } from './server/services/searchService';
import { CREATORS, store } from './server/services/store';
import { CURATED_MEDIA } from './server/services/curatedData';
import { MediaType, SearchFilters } from './src/types';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Simple IP rate-limiting map
  const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
  const rateLimitMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const clientData = rateLimitMap.get(ip);

    if (!clientData || now > clientData.resetTime) {
      rateLimitMap.set(ip, { count: 1, resetTime: now + 60 * 1000 }); // 1 min window
      return next();
    }

    clientData.count++;
    if (clientData.count > 180) { // 180 requests per minute
      return res.status(429).json({
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many requests. Please slow down and try again shortly.',
        },
      });
    }
    next();
  };

  app.use('/api', rateLimitMiddleware);

  // ==========================================
  // 1. HEALTH & ADMIN DASHBOARD
  // ==========================================
  app.get('/api/health', (_req, res) => {
    res.json({
      success: true,
      data: { status: 'healthy', app: 'VISTORA', timestamp: new Date().toISOString() },
    });
  });

  app.get('/api/admin/health', (_req, res) => {
    const summary = pixabayKeyManager.getHealthSummary();
    res.json({
      success: true,
      data: {
        ...summary,
        totalSearchesLogged: store.searchEventsCount,
        collectionsCount: store.collections.length,
        curatedMediaAvailable: CURATED_MEDIA.length,
      },
    });
  });

  // ==========================================
  // 2. SEARCH & DISCOVERY ENDPOINTS
  // ==========================================
  app.get('/api/search', async (req, res) => {
    try {
      const type = (req.query.type as 'all' | 'photo' | 'video') || 'all';
      const q = (req.query.q as string) || '';
      const category = req.query.category as string;
      const orientation = req.query.orientation as 'all' | 'horizontal' | 'vertical';
      const order = req.query.order as 'popular' | 'latest';
      const page = parseInt(req.query.page as string, 10) || 1;
      const perPage = parseInt(req.query.perPage as string, 10) || 24;

      const filters: SearchFilters = {
        type,
        category,
        orientation,
        order,
        page,
        perPage,
      };

      const result = await searchService.search(type, q, filters);
      res.json({ success: true, data: result });
    } catch (err: any) {
      console.error('[VISTORA API Error /api/search]:', err?.message);
      res.status(500).json({
        success: false,
        error: { code: 'SEARCH_FAILED', message: 'Unable to perform visual search. Please try again.' },
      });
    }
  });

  app.get('/api/photos', async (req, res) => {
    try {
      const q = (req.query.q as string) || '';
      const category = req.query.category as string;
      const page = parseInt(req.query.page as string, 10) || 1;
      const perPage = parseInt(req.query.perPage as string, 10) || 24;

      const result = await searchService.search('photo', q, { category, page, perPage });
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: { code: 'PHOTOS_FAILED', message: 'Unable to load photos.' },
      });
    }
  });

  app.get('/api/videos', async (req, res) => {
    try {
      const q = (req.query.q as string) || '';
      const page = parseInt(req.query.page as string, 10) || 1;
      const perPage = parseInt(req.query.perPage as string, 10) || 24;

      const result = await searchService.search('video', q, { page, perPage });
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: { code: 'VIDEOS_FAILED', message: 'Unable to load videos.' },
      });
    }
  });

  app.get('/api/media/:id', async (req, res) => {
    const { id } = req.params;
    const type = (req.query.type as MediaType) || 'photo';

    // Check curated library first
    const match = CURATED_MEDIA.find(m => m.id === id);
    if (match) {
      return res.json({
        success: true,
        data: {
          ...match,
          isLiked: store.userLikes.has(match.id),
          isSaved: store.userSavedMedia.has(match.id),
        },
      });
    }

    // Otherwise attempt Pixabay
    if (pixabayProvider.isAvailable()) {
      try {
        const item = await pixabayProvider.getMedia(id, type);
        if (item) {
          return res.json({
            success: true,
            data: {
              ...item,
              isLiked: store.userLikes.has(item.id),
              isSaved: store.userSavedMedia.has(item.id),
            },
          });
        }
      } catch (e) {
        // continue to 404
      }
    }

    res.status(404).json({
      success: false,
      error: { code: 'MEDIA_NOT_FOUND', message: 'The requested media item could not be found.' },
    });
  });

  // Search suggestions and recent searches
  app.get('/api/search/suggestions', (req, res) => {
    const q = (req.query.q as string || '').toLowerCase().trim();
    const trendingKeywords = searchService.getTrendingKeywords();
    const recent = store.searchHistory.slice(0, 6).map(h => h.query);

    let suggestions = trendingKeywords;
    if (q) {
      suggestions = trendingKeywords.filter(t => t.toLowerCase().includes(q));
    }

    res.json({
      success: true,
      data: {
        suggestions: suggestions.slice(0, 8),
        recent: Array.from(new Set(recent)),
        trending: trendingKeywords.slice(0, 5),
      },
    });
  });

  // Trending overview
  app.get('/api/trending', async (_req, res) => {
    try {
      const photosRes = await searchService.search('photo', 'architecture', { perPage: 6, order: 'popular' });
      const videosRes = await searchService.search('video', 'ocean', { perPage: 4, order: 'popular' });

      res.json({
        success: true,
        data: {
          trendingSearches: searchService.getTrendingKeywords(),
          trendingPhotos: photosRes.items,
          trendingVideos: videosRes.items,
          trendingCreators: Object.values(CREATORS),
          trendingCollections: store.collections.filter(c => !c.isPrivate),
        },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { code: 'TRENDING_FAILED', message: err?.message } });
    }
  });

  // ==========================================
  // 3. IDEA PAGES (VISTORA Core Differentiator)
  // ==========================================
  app.get('/api/ideas', (_req, res) => {
    const ideas = Object.values(store.ideaPages).map(idea => ({
      slug: idea.slug,
      title: idea.title,
      tagline: idea.tagline,
      category: idea.category,
      coverUrl: idea.coverUrl,
      savedCount: idea.savedCount,
      itemCount: idea.items.length,
      isSaved: store.savedIdeas.has(idea.slug),
      isFollowing: store.followedIdeas.has(idea.slug),
    }));

    res.json({ success: true, data: ideas });
  });

  app.get('/api/ideas/:slug', (req, res) => {
    const { slug } = req.params;
    const idea = store.ideaPages[slug];

    if (!idea) {
      // Dynamic fallback for popular search topic (Item 32)
      const formattedTitle = slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      const dynamicIdea = {
        slug,
        title: formattedTitle,
        tagline: `Curated visual study, materiality, and inspirations around ${formattedTitle}.`,
        category: 'Inspiration Hub',
        coverUrl: CURATED_MEDIA[0].thumbnailUrl,
        inspirationOverview: `Explore deep visual research for ${formattedTitle}. This dynamic Idea Page gathers photography, motion studies, color palettes, and structural details into a dedicated research nexus.`,
        colorPalette: [
          { name: 'Pure White', hex: '#FFFFFF', description: 'Clean primary ground' },
          { name: 'Vistora Yellow', hex: '#FFD21F', description: 'Brand illumination' },
          { name: 'Warm Charcoal', hex: '#2A2A2A', description: 'Structural contrast' },
          { name: 'Muted Sand', hex: '#E5DFD5', description: 'Organic background' },
          { name: 'Slate Deep', hex: '#171717', description: 'Primary typography' },
        ],
        architectureElements: [
          { title: 'Harmonious Proportions', description: 'Spatial layout designed around natural golden ratios and clean sightlines.' },
          { title: 'Material Textures', description: 'Juxtaposition of matte finishes, tactile organic fabrics, and smooth glass.' },
          { title: 'Ambient Lighting', description: 'Carefully staged warm lighting fixtures creating depth and calming shadows.' },
        ],
        relatedSearches: [`${formattedTitle} design`, `${formattedTitle} aesthetics`, 'Modern interiors', 'Visual moodboard'],
        items: CURATED_MEDIA.slice(0, 6),
        savedCount: 140,
        isSaved: store.savedIdeas.has(slug),
        isFollowing: store.followedIdeas.has(slug),
      };
      return res.json({ success: true, data: dynamicIdea });
    }

    res.json({
      success: true,
      data: {
        ...idea,
        isSaved: store.savedIdeas.has(slug),
        isFollowing: store.followedIdeas.has(slug),
      },
    });
  });

  app.post('/api/ideas/:slug/save', (req, res) => {
    const { slug } = req.params;
    const isSaved = store.savedIdeas.has(slug);
    if (isSaved) {
      store.savedIdeas.delete(slug);
    } else {
      store.savedIdeas.add(slug);
    }
    res.json({ success: true, data: { isSaved: !isSaved } });
  });

  app.post('/api/ideas/:slug/follow', (req, res) => {
    const { slug } = req.params;
    const isFollowing = store.followedIdeas.has(slug);
    if (isFollowing) {
      store.followedIdeas.delete(slug);
    } else {
      store.followedIdeas.add(slug);
    }
    res.json({ success: true, data: { isFollowing: !isFollowing } });
  });

  // ==========================================
  // 4. COLLECTIONS & SAVING SYSTEM
  // ==========================================
  app.get('/api/collections', (_req, res) => {
    res.json({ success: true, data: store.collections });
  });

  app.post('/api/collections', (req, res) => {
    const { name, description, isPrivate, coverUrl } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: { code: 'INVALID_NAME', message: 'Collection name is required.' } });
    }

    const newCollection = {
      id: `col-${Date.now()}`,
      ownerId: store.currentUser.id,
      ownerName: store.currentUser.displayName,
      ownerAvatar: store.currentUser.avatarUrl,
      name: name.trim(),
      description: description || '',
      isPrivate: Boolean(isPrivate),
      coverUrl: coverUrl || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
      itemCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
      items: [],
    };

    store.collections.unshift(newCollection);
    res.json({ success: true, data: newCollection });
  });

  app.get('/api/collections/:id', (req, res) => {
    const { id } = req.params;
    const col = store.collections.find(c => c.id === id);
    if (!col) {
      return res.status(404).json({ success: false, error: { code: 'COLLECTION_NOT_FOUND', message: 'Collection not found.' } });
    }
    res.json({ success: true, data: col });
  });

  app.post('/api/collections/:id/items', (req, res) => {
    const { id } = req.params;
    const { media } = req.body;
    const col = store.collections.find(c => c.id === id);
    if (!col) {
      return res.status(404).json({ success: false, error: { code: 'COLLECTION_NOT_FOUND', message: 'Collection not found.' } });
    }

    col.items = col.items || [];
    const alreadySaved = col.items.some(item => item.id === media.id);
    if (!alreadySaved) {
      col.items.unshift(media);
      col.itemCount = col.items.length;
      if (!col.coverUrl || col.coverUrl.includes('placeholder')) {
        col.coverUrl = media.thumbnailUrl;
      }
      store.userSavedMedia.add(media.id);
      store.currentUser.savesCount = (store.currentUser.savesCount || 0) + 1;
    }

    res.json({ success: true, data: { collection: col, saved: true } });
  });

  app.delete('/api/collections/:id/items/:mediaId', (req, res) => {
    const { id, mediaId } = req.params;
    const col = store.collections.find(c => c.id === id);
    if (!col) {
      return res.status(404).json({ success: false, error: { code: 'COLLECTION_NOT_FOUND', message: 'Collection not found.' } });
    }

    col.items = (col.items || []).filter(item => item.id !== mediaId);
    col.itemCount = col.items.length;

    // Check if saved elsewhere
    const savedAnywhere = store.collections.some(c => c.items?.some(i => i.id === mediaId));
    if (!savedAnywhere) {
      store.userSavedMedia.delete(mediaId);
    }

    res.json({ success: true, data: { collection: col } });
  });

  // ==========================================
  // 5. SOCIAL INTERACTIONS (LIKES, FOLLOWS, COMMENTS)
  // ==========================================
  app.post('/api/likes', (req, res) => {
    const { mediaId } = req.body;
    if (!mediaId) return res.status(400).json({ success: false, error: { message: 'mediaId required' } });

    store.userLikes.add(mediaId);
    store.currentUser.likesCount = (store.currentUser.likesCount || 0) + 1;
    res.json({ success: true, data: { isLiked: true } });
  });

  app.delete('/api/likes/:mediaId', (req, res) => {
    const { mediaId } = req.params;
    store.userLikes.delete(mediaId);
    store.currentUser.likesCount = Math.max(0, (store.currentUser.likesCount || 1) - 1);
    res.json({ success: true, data: { isLiked: false } });
  });

  app.post('/api/follows', (req, res) => {
    const { username } = req.body;
    if (!username) return res.status(400).json({ success: false, error: { message: 'username required' } });

    store.userFollows.add(username);
    store.currentUser.followingCount = (store.currentUser.followingCount || 0) + 1;

    const creator = CREATORS[username];
    if (creator) creator.followersCount++;

    res.json({ success: true, data: { isFollowing: true } });
  });

  app.delete('/api/follows/:username', (req, res) => {
    const { username } = req.params;
    store.userFollows.delete(username);
    store.currentUser.followingCount = Math.max(0, (store.currentUser.followingCount || 1) - 1);

    const creator = CREATORS[username];
    if (creator) creator.followersCount = Math.max(0, creator.followersCount - 1);

    res.json({ success: true, data: { isFollowing: false } });
  });

  app.get('/api/comments/:mediaId', (req, res) => {
    const { mediaId } = req.params;
    const comments = store.comments[mediaId] || [];
    res.json({ success: true, data: comments });
  });

  app.post('/api/comments/:mediaId', (req, res) => {
    const { mediaId } = req.params;
    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, error: { message: 'Comment content cannot be empty.' } });
    }

    const newComment = {
      id: `cmt-${Date.now()}`,
      mediaId,
      userId: store.currentUser.id,
      username: store.currentUser.username,
      displayName: store.currentUser.displayName,
      avatarUrl: store.currentUser.avatarUrl,
      content: content.trim(),
      createdAt: 'Just now',
      likesCount: 0,
      isLiked: false,
    };

    if (!store.comments[mediaId]) store.comments[mediaId] = [];
    store.comments[mediaId].unshift(newComment);

    res.json({ success: true, data: newComment });
  });

  app.delete('/api/comments/:commentId', (req, res) => {
    const { commentId } = req.params;
    for (const mediaId of Object.keys(store.comments)) {
      store.comments[mediaId] = store.comments[mediaId].filter(c => c.id !== commentId);
    }
    res.json({ success: true, data: { deleted: true } });
  });

  // ==========================================
  // 6. CREATORS & USER PROFILE
  // ==========================================
  app.get('/api/creator/:username', (req, res) => {
    const { username } = req.params;
    const profile = CREATORS[username] || (username === store.currentUser.username ? store.currentUser : null);

    if (!profile) {
      return res.status(404).json({ success: false, error: { code: 'USER_NOT_FOUND', message: 'Creator profile not found.' } });
    }

    const userCollections = store.collections.filter(c => c.ownerName === profile.displayName || (username === store.currentUser.username && c.ownerId === store.currentUser.id));
    const createdMedia = CURATED_MEDIA.filter(m => m.author.toLowerCase().replace(/\s+/g, '') === username.toLowerCase());

    res.json({
      success: true,
      data: {
        profile: {
          ...profile,
          isFollowing: store.userFollows.has(username),
        },
        collections: userCollections,
        createdMedia,
      },
    });
  });

  app.get('/api/auth/me', (_req, res) => {
    res.json({
      success: true,
      data: {
        user: store.currentUser,
        savedCount: store.userSavedMedia.size,
        likesCount: store.userLikes.size,
        followingCount: store.userFollows.size,
      },
    });
  });

  app.post('/api/auth/update-profile', (req, res) => {
    const { displayName, bio, website, avatarUrl } = req.body;
    if (displayName) store.currentUser.displayName = displayName.trim();
    if (bio !== undefined) store.currentUser.bio = bio.trim();
    if (website !== undefined) store.currentUser.website = website.trim();
    if (avatarUrl) store.currentUser.avatarUrl = avatarUrl.trim();

    res.json({ success: true, data: store.currentUser });
  });

  app.get('/api/notifications', (_req, res) => {
    res.json({ success: true, data: store.notifications });
  });

  app.post('/api/notifications/read', (_req, res) => {
    store.notifications.forEach(n => { n.isRead = true; });
    res.json({ success: true, data: { unreadCount: 0 } });
  });

  // ==========================================
  // 7. VITE MIDDLEWARE / SPA FALLBACK
  // ==========================================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[VISTORA] Production server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
