import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { UserProfile } from '../types';

const env = (import.meta as unknown as { env?: Record<string, string> }).env || {};

// Public client configuration: Vite env vars override these values when configured in Vercel.
// The Supabase publishable key is safe for browser use; never put a service-role key here.
const supabaseUrl = env.VITE_SUPABASE_URL || 'https://adgonsebgrypnsapopqb.supabase.co';
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_zhGC53-0p-zSK451U-i6ig_dcm1u9NM';

export const isSupabaseConfigured = () => Boolean(supabaseUrl && supabaseAnonKey);

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
});

const avatarFallback = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';
const LOCAL_USER_STORAGE_KEY = 'vistora_auth_user';

export interface AuthResponse { success: boolean; user?: UserProfile; error?: string; isCloudAuth?: boolean; }

function toProfile(row: any, email = ''): UserProfile {
  return {
    id: row.user_id,
    username: row.username || email.split('@')[0] || 'vistora_user',
    displayName: row.display_name || row.username || 'Vistora Explorer',
    avatarUrl: row.avatar_url || avatarFallback,
    bio: row.bio || 'Visual curator on VISTORA.',
    website: row.website || '',
    followersCount: row.followers_count || 0,
    followingCount: row.following_count || 0,
    likesCount: row.likes_count || 0,
    savesCount: row.saves_count || 0,
    badge: 'Creator',
  };
}

async function loadProfile(user: any): Promise<UserProfile> {
  const { data } = await supabase.from('vistora_profiles').select('*').eq('user_id', user.id).maybeSingle();
  if (data) return toProfile(data, user.email || '');
  const metadata = user.user_metadata || {};
  return toProfile({ user_id: user.id, username: metadata.username, display_name: metadata.display_name, avatar_url: metadata.avatar_url }, user.email || '');
}

export async function signUpWithSupabase(email: string, password: string, displayName: string, username: string): Promise<AuthResponse> {
  if (!isSupabaseConfigured()) return { success: false, error: 'Supabase is not configured.' };
  try {
    const cleanEmail = email.trim().toLowerCase();
    const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
    const { data, error } = await supabase.auth.signUp({ email: cleanEmail, password, options: { data: { display_name: displayName.trim(), username: cleanUsername, avatar_url: avatarFallback } } });
    if (error) return { success: false, error: error.message };
    if (!data.user) return { success: false, error: 'Account could not be created.' };
    const profile = await loadProfile(data.user);
    localStorage.setItem(LOCAL_USER_STORAGE_KEY, JSON.stringify(profile));
    return { success: true, user: profile, isCloudAuth: true };
  } catch (e: any) { return { success: false, error: e?.message || 'Supabase signup failed.' }; }
}

export async function signInWithSupabase(email: string, password: string): Promise<AuthResponse> {
  if (!isSupabaseConfigured()) return { success: false, error: 'Supabase is not configured.' };
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
    if (error) return { success: false, error: error.message };
    if (!data.user) return { success: false, error: 'Invalid account session.' };
    const profile = await loadProfile(data.user);
    localStorage.setItem(LOCAL_USER_STORAGE_KEY, JSON.stringify(profile));
    return { success: true, user: profile, isCloudAuth: true };
  } catch (e: any) { return { success: false, error: e?.message || 'Supabase login failed.' }; }
}

export async function signOutUser(): Promise<void> {
  await supabase.auth.signOut();
  localStorage.removeItem(LOCAL_USER_STORAGE_KEY);
}

export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  if (!isSupabaseConfigured()) return null;
  const { data } = await supabase.auth.getUser();
  if (!data.user) return null;
  const profile = await loadProfile(data.user);
  localStorage.setItem(LOCAL_USER_STORAGE_KEY, JSON.stringify(profile));
  return profile;
}

export function getStoredUser(): UserProfile | null { try { const raw = localStorage.getItem(LOCAL_USER_STORAGE_KEY); return raw ? JSON.parse(raw) : null; } catch { return null; } }
export function setStoredUser(user: UserProfile): void { localStorage.setItem(LOCAL_USER_STORAGE_KEY, JSON.stringify(user)); }
export function clearStoredUser(): void { localStorage.removeItem(LOCAL_USER_STORAGE_KEY); }
