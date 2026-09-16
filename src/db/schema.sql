-- ==============================================================================
-- VISTORA — Production Database Schema (PostgreSQL / Supabase)
-- Discover. Save. Create.
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES (Extends auth.users in Supabase)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  website TEXT,
  followers_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  saves_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. MEDIA (Indexed photos, videos & user creations)
CREATE TABLE IF NOT EXISTS public.media (
  id TEXT PRIMARY KEY, -- provider:id or uuid
  type TEXT NOT NULL CHECK (type IN ('photo', 'video')),
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT NOT NULL,
  preview_url TEXT NOT NULL,
  original_url TEXT NOT NULL,
  width INTEGER NOT NULL,
  height INTEGER NOT NULL,
  duration INTEGER DEFAULT 0,
  aspect_ratio NUMERIC(5,2),
  tags TEXT[] DEFAULT '{}',
  author TEXT NOT NULL,
  author_url TEXT,
  source TEXT NOT NULL, -- 'pixabay', 'user', etc.
  source_url TEXT,
  views_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  saves_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. COLLECTIONS (User-curated inspiration boards)
CREATE TABLE IF NOT EXISTS public.collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_private BOOLEAN DEFAULT FALSE,
  cover_url TEXT,
  item_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. COLLECTION ITEMS (Many-to-many relationship)
CREATE TABLE IF NOT EXISTS public.collection_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  collection_id UUID NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  media_id TEXT NOT NULL REFERENCES public.media(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(collection_id, media_id)
);

-- 5. LIKES (User media endorsements)
CREATE TABLE IF NOT EXISTS public.likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  media_id TEXT NOT NULL REFERENCES public.media(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, media_id)
);

-- 6. FOLLOWS (Creator following system)
CREATE TABLE IF NOT EXISTS public.follows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);

-- 7. COMMENTS (Discussion & insights)
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  media_id TEXT NOT NULL REFERENCES public.media(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('like', 'save', 'follow', 'comment', 'system')),
  target_id TEXT,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. SEARCH HISTORY & ANALYTICS
CREATE TABLE IF NOT EXISTS public.search_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  category TEXT,
  result_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.search_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type TEXT NOT NULL, -- 'page_view', 'search', 'media_view', 'like', 'save', 'follow'
  payload JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- INDEXES FOR PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_media_tags ON public.media USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_media_type ON public.media (type);
CREATE INDEX IF NOT EXISTS idx_media_created ON public.media (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_collections_owner ON public.collections (owner_id);
CREATE INDEX IF NOT EXISTS idx_collection_items_col ON public.collection_items (collection_id);
CREATE INDEX IF NOT EXISTS idx_collection_items_media ON public.collection_items (media_id);
CREATE INDEX IF NOT EXISTS idx_likes_user_media ON public.likes (user_id, media_id);
CREATE INDEX IF NOT EXISTS idx_follows_pair ON public.follows (follower_id, following_id);
CREATE INDEX IF NOT EXISTS idx_comments_media ON public.comments (media_id);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Profiles: Public can view, owner can update
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Collections: Public collections viewable by all; private only by owner
CREATE POLICY "Public collections are viewable by all" ON public.collections
  FOR SELECT USING (is_private = false OR auth.uid() = (SELECT user_id FROM public.profiles WHERE id = owner_id));
CREATE POLICY "Users can create collections" ON public.collections
  FOR INSERT WITH CHECK (auth.uid() = (SELECT user_id FROM public.profiles WHERE id = owner_id));
CREATE POLICY "Users can update own collections" ON public.collections
  FOR UPDATE USING (auth.uid() = (SELECT user_id FROM public.profiles WHERE id = owner_id));
CREATE POLICY "Users can delete own collections" ON public.collections
  FOR DELETE USING (auth.uid() = (SELECT user_id FROM public.profiles WHERE id = owner_id));

-- Media: readable by everyone
CREATE POLICY "Media is readable by everyone" ON public.media
  FOR SELECT USING (true);
