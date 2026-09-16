-- Vistora production data model layered safely into the existing ShopMe Supabase project.
-- All application-owned tables use the vistora_ prefix to avoid collisions with ShopMe tables.

create extension if not exists pgcrypto;

create table if not exists public.vistora_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique check (char_length(username) between 3 and 40),
  display_name text not null default 'Vistora Explorer',
  bio text not null default '',
  website text not null default '',
  avatar_url text,
  badge text not null default 'Creator',
  followers_count integer not null default 0 check (followers_count >= 0),
  following_count integer not null default 0 check (following_count >= 0),
  likes_count integer not null default 0 check (likes_count >= 0),
  saves_count integer not null default 0 check (saves_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.vistora_collections (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 120),
  description text not null default '',
  is_private boolean not null default false,
  cover_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.vistora_collection_items (
  collection_id uuid not null references public.vistora_collections(id) on delete cascade,
  media_id text not null,
  provider text not null default 'pixabay',
  media_type text not null default 'photo' check (media_type in ('photo','video')),
  media_json jsonb not null default '{}'::jsonb,
  added_at timestamptz not null default now(),
  primary key (collection_id, media_id)
);

create table if not exists public.vistora_likes (
  user_id uuid not null references auth.users(id) on delete cascade,
  media_id text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, media_id)
);

create table if not exists public.vistora_follows (
  follower_id uuid not null references auth.users(id) on delete cascade,
  following_username text not null,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_username)
);

create table if not exists public.vistora_comments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  media_id text not null,
  content text not null check (char_length(content) between 1 and 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.vistora_idea_saves (
  user_id uuid not null references auth.users(id) on delete cascade,
  slug text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, slug)
);

create table if not exists public.vistora_idea_follows (
  user_id uuid not null references auth.users(id) on delete cascade,
  slug text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, slug)
);

create table if not exists public.vistora_search_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  query text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.vistora_stripe_customers (
  user_id uuid primary key references auth.users(id) on delete cascade,
  stripe_customer_id text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.vistora_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  stripe_customer_id text not null,
  stripe_subscription_id text not null unique,
  stripe_price_id text,
  status text not null,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  canceled_at timestamptz,
  trial_end timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.vistora_stripe_webhook_events (
  id text primary key,
  event_type text not null,
  processed_at timestamptz not null default now()
);

create index if not exists vistora_collections_owner_idx on public.vistora_collections(owner_id);
create index if not exists vistora_collection_items_media_idx on public.vistora_collection_items(media_id);
create index if not exists vistora_likes_media_idx on public.vistora_likes(media_id);
create index if not exists vistora_follows_username_idx on public.vistora_follows(following_username);
create index if not exists vistora_comments_media_idx on public.vistora_comments(media_id, created_at desc);
create index if not exists vistora_search_history_user_idx on public.vistora_search_history(user_id, created_at desc);
create index if not exists vistora_subscriptions_status_idx on public.vistora_subscriptions(status);

create or replace function public.vistora_handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  base_username text;
  candidate text;
begin
  base_username := lower(regexp_replace(coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1), 'user'), '[^a-zA-Z0-9_]', '', 'g'));
  base_username := left(case when char_length(base_username) >= 3 then base_username else 'user_' || substr(new.id::text, 1, 8) end, 32);
  candidate := base_username;

  if exists (select 1 from public.vistora_profiles where username = candidate) then
    candidate := left(base_username, 23) || '_' || substr(new.id::text, 1, 8);
  end if;

  insert into public.vistora_profiles (id, username, display_name, avatar_url)
  values (
    new.id,
    candidate,
    coalesce(nullif(new.raw_user_meta_data->>'display_name', ''), candidate),
    nullif(new.raw_user_meta_data->>'avatar_url', '')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists vistora_on_auth_user_created on auth.users;
create trigger vistora_on_auth_user_created
after insert on auth.users
for each row execute function public.vistora_handle_new_user();

alter table public.vistora_profiles enable row level security;
alter table public.vistora_collections enable row level security;
alter table public.vistora_collection_items enable row level security;
alter table public.vistora_likes enable row level security;
alter table public.vistora_follows enable row level security;
alter table public.vistora_comments enable row level security;
alter table public.vistora_idea_saves enable row level security;
alter table public.vistora_idea_follows enable row level security;
alter table public.vistora_search_history enable row level security;
alter table public.vistora_stripe_customers enable row level security;
alter table public.vistora_subscriptions enable row level security;
alter table public.vistora_stripe_webhook_events enable row level security;

-- Public profile reads; users manage only their own profile.
drop policy if exists vistora_profiles_public_read on public.vistora_profiles;
create policy vistora_profiles_public_read on public.vistora_profiles for select using (true);
drop policy if exists vistora_profiles_self_insert on public.vistora_profiles;
create policy vistora_profiles_self_insert on public.vistora_profiles for insert with check ((select auth.uid()) = id);
drop policy if exists vistora_profiles_self_update on public.vistora_profiles;
create policy vistora_profiles_self_update on public.vistora_profiles for update using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

-- Collections: public collections are readable; private collections only by owners.
drop policy if exists vistora_collections_read on public.vistora_collections;
create policy vistora_collections_read on public.vistora_collections for select using (not is_private or (select auth.uid()) = owner_id);
drop policy if exists vistora_collections_insert on public.vistora_collections;
create policy vistora_collections_insert on public.vistora_collections for insert with check ((select auth.uid()) = owner_id);
drop policy if exists vistora_collections_update on public.vistora_collections;
create policy vistora_collections_update on public.vistora_collections for update using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);
drop policy if exists vistora_collections_delete on public.vistora_collections;
create policy vistora_collections_delete on public.vistora_collections for delete using ((select auth.uid()) = owner_id);

-- Collection items inherit visibility from their collection.
drop policy if exists vistora_collection_items_read on public.vistora_collection_items;
create policy vistora_collection_items_read on public.vistora_collection_items for select using (
  exists (select 1 from public.vistora_collections c where c.id = collection_id and (not c.is_private or c.owner_id = (select auth.uid())))
);
drop policy if exists vistora_collection_items_insert on public.vistora_collection_items;
create policy vistora_collection_items_insert on public.vistora_collection_items for insert with check (
  exists (select 1 from public.vistora_collections c where c.id = collection_id and c.owner_id = (select auth.uid()))
);
drop policy if exists vistora_collection_items_delete on public.vistora_collection_items;
create policy vistora_collection_items_delete on public.vistora_collection_items for delete using (
  exists (select 1 from public.vistora_collections c where c.id = collection_id and c.owner_id = (select auth.uid()))
);

-- Social data is user-owned for mutations, with public reads where appropriate.
drop policy if exists vistora_likes_public_read on public.vistora_likes;
create policy vistora_likes_public_read on public.vistora_likes for select using (true);
drop policy if exists vistora_likes_self_insert on public.vistora_likes;
create policy vistora_likes_self_insert on public.vistora_likes for insert with check ((select auth.uid()) = user_id);
drop policy if exists vistora_likes_self_delete on public.vistora_likes;
create policy vistora_likes_self_delete on public.vistora_likes for delete using ((select auth.uid()) = user_id);

drop policy if exists vistora_follows_public_read on public.vistora_follows;
create policy vistora_follows_public_read on public.vistora_follows for select using (true);
drop policy if exists vistora_follows_self_insert on public.vistora_follows;
create policy vistora_follows_self_insert on public.vistora_follows for insert with check ((select auth.uid()) = follower_id);
drop policy if exists vistora_follows_self_delete on public.vistora_follows;
create policy vistora_follows_self_delete on public.vistora_follows for delete using ((select auth.uid()) = follower_id);

drop policy if exists vistora_comments_public_read on public.vistora_comments;
create policy vistora_comments_public_read on public.vistora_comments for select using (true);
drop policy if exists vistora_comments_self_insert on public.vistora_comments;
create policy vistora_comments_self_insert on public.vistora_comments for insert with check ((select auth.uid()) = user_id);
drop policy if exists vistora_comments_self_update on public.vistora_comments;
create policy vistora_comments_self_update on public.vistora_comments for update using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists vistora_comments_self_delete on public.vistora_comments;
create policy vistora_comments_self_delete on public.vistora_comments for delete using ((select auth.uid()) = user_id);

-- Idea and search state is private to the user.
drop policy if exists vistora_idea_saves_self_all on public.vistora_idea_saves;
create policy vistora_idea_saves_self_all on public.vistora_idea_saves for all using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists vistora_idea_follows_self_all on public.vistora_idea_follows;
create policy vistora_idea_follows_self_all on public.vistora_idea_follows for all using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists vistora_search_history_self_all on public.vistora_search_history;
create policy vistora_search_history_self_all on public.vistora_search_history for all using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- Billing records are only readable by the owning user. Webhook writes use the service role.
drop policy if exists vistora_stripe_customers_self_read on public.vistora_stripe_customers;
create policy vistora_stripe_customers_self_read on public.vistora_stripe_customers for select using ((select auth.uid()) = user_id);
drop policy if exists vistora_subscriptions_self_read on public.vistora_subscriptions;
create policy vistora_subscriptions_self_read on public.vistora_subscriptions for select using ((select auth.uid()) = user_id);

-- Webhook events are server-only; no client policies are granted.

-- Grants for Data API roles.
grant select on public.vistora_profiles, public.vistora_collections, public.vistora_collection_items, public.vistora_likes, public.vistora_follows, public.vistora_comments to anon, authenticated;
grant insert, update, delete on public.vistora_profiles, public.vistora_collections, public.vistora_collection_items, public.vistora_likes, public.vistora_follows, public.vistora_comments to authenticated;
grant select, insert, update, delete on public.vistora_idea_saves, public.vistora_idea_follows, public.vistora_search_history to authenticated;
grant select on public.vistora_stripe_customers, public.vistora_subscriptions to authenticated;
