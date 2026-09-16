import { createClient, SupabaseClient, User as SupabaseUser } from '@supabase/supabase-js';
import { UserProfile } from '../types';

// Retrieve Supabase credentials from client-side environment variables
const env = (import.meta as unknown as { env?: Record<string, string> }).env || {};
const supabaseUrl = env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.trim().length > 0 &&
    supabaseAnonKey.trim().length > 0 &&
    !supabaseUrl.includes('your-project')
  );
};

// Initialize real Supabase client if credentials exist
export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

// Local fallback user storage key
const LOCAL_USER_STORAGE_KEY = 'vistora_auth_user';
const LOCAL_ACCOUNTS_KEY = 'vistora_registered_accounts';

export interface AuthResponse {
  success: boolean;
  user?: UserProfile;
  error?: string;
  isCloudAuth?: boolean;
}

/**
 * Register a new user account with Supabase or Local Fallback
 */
export async function signUpWithSupabase(
  email: string,
  password: string,
  displayName: string,
  username: string
): Promise<AuthResponse> {
  const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
  const cleanEmail = email.trim().toLowerCase();

  // 1. If Supabase is configured, use real Supabase Auth
  if (supabase) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            display_name: displayName.trim(),
            username: cleanUsername,
            avatar_url: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80`,
          },
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        const userProfile: UserProfile = {
          id: data.user.id,
          username: cleanUsername,
          displayName: displayName.trim() || cleanUsername,
          avatarUrl: data.user.user_metadata?.avatar_url || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80`,
          bio: 'Visual curator & discovery enthusiast on VISTORA.',
          followersCount: 0,
          followingCount: 0,
          likesCount: 0,
          savesCount: 0,
          badge: 'Creator',
        };

        localStorage.setItem(LOCAL_USER_STORAGE_KEY, JSON.stringify(userProfile));
        return { success: true, user: userProfile, isCloudAuth: true };
      }
    } catch (err: any) {
      console.error('Supabase signup error:', err);
      return { success: false, error: err.message || 'Supabase authentication failed.' };
    }
  }

  // 2. Local fallback registration
  try {
    const raw = localStorage.getItem(LOCAL_ACCOUNTS_KEY);
    const accounts: Array<{ email: string; password: string; profile: UserProfile }> = raw ? JSON.parse(raw) : [];

    if (accounts.some(a => a.email === cleanEmail)) {
      return { success: false, error: 'An account with this email already exists.' };
    }

    const newProfile: UserProfile = {
      id: `usr_${Date.now()}`,
      username: cleanUsername || `user_${Date.now().toString().slice(-4)}`,
      displayName: displayName.trim() || 'Visual Creator',
      avatarUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80`,
      bio: 'Visual curator & inspiration collector on VISTORA.',
      website: 'https://vistora.app',
      followersCount: 1,
      followingCount: 4,
      likesCount: 0,
      savesCount: 0,
      badge: 'Curator',
    };

    accounts.push({ email: cleanEmail, password, profile: newProfile });
    localStorage.setItem(LOCAL_ACCOUNTS_KEY, JSON.stringify(accounts));
    localStorage.setItem(LOCAL_USER_STORAGE_KEY, JSON.stringify(newProfile));

    return { success: true, user: newProfile, isCloudAuth: false };
  } catch (err: any) {
    return { success: false, error: 'Failed to create local account.' };
  }
}

/**
 * Sign in existing user with Supabase or Local Fallback
 */
export async function signInWithSupabase(
  email: string,
  password: string
): Promise<AuthResponse> {
  const cleanEmail = email.trim().toLowerCase();

  // 1. Real Supabase Auth
  if (supabase) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        const metadata = data.user.user_metadata || {};
        const userProfile: UserProfile = {
          id: data.user.id,
          username: metadata.username || cleanEmail.split('@')[0],
          displayName: metadata.display_name || metadata.username || 'Vistora Explorer',
          avatarUrl: metadata.avatar_url || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80`,
          bio: metadata.bio || 'Visual curator on VISTORA.',
          website: metadata.website || '',
          followersCount: 0,
          followingCount: 0,
          likesCount: 0,
          savesCount: 0,
          badge: 'Creator',
        };

        localStorage.setItem(LOCAL_USER_STORAGE_KEY, JSON.stringify(userProfile));
        return { success: true, user: userProfile, isCloudAuth: true };
      }
    } catch (err: any) {
      console.error('Supabase signin error:', err);
      return { success: false, error: err.message || 'Supabase login failed.' };
    }
  }

  // 2. Local fallback verification
  try {
    const raw = localStorage.getItem(LOCAL_ACCOUNTS_KEY);
    const accounts: Array<{ email: string; password: string; profile: UserProfile }> = raw ? JSON.parse(raw) : [];

    const found = accounts.find(a => a.email === cleanEmail && a.password === password);
    if (found) {
      localStorage.setItem(LOCAL_USER_STORAGE_KEY, JSON.stringify(found.profile));
      return { success: true, user: found.profile, isCloudAuth: false };
    }

    // Allow quick demo accounts
    if (cleanEmail === 'demo@vistora.app' || password === 'demo1234') {
      const demoProfile: UserProfile = {
        id: 'usr_demo_1',
        username: 'vistora_demo',
        displayName: 'Demo Curator',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        bio: 'Visual curator exploring architectural and natural aesthetics.',
        website: 'https://vistora.app',
        followersCount: 142,
        followingCount: 88,
        likesCount: 24,
        savesCount: 12,
        badge: 'Staff Pick',
      };
      localStorage.setItem(LOCAL_USER_STORAGE_KEY, JSON.stringify(demoProfile));
      return { success: true, user: demoProfile, isCloudAuth: false };
    }

    return { success: false, error: 'Invalid email or password.' };
  } catch (err: any) {
    return { success: false, error: 'Login verification failed.' };
  }
}

/**
 * Sign out user
 */
export async function signOutUser(): Promise<void> {
  if (supabase) {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error('Error signing out of Supabase:', e);
    }
  }
  localStorage.removeItem(LOCAL_USER_STORAGE_KEY);
}

/**
 * Get initial stored user session
 */
export function getStoredUser(): UserProfile | null {
  try {
    const raw = localStorage.getItem(LOCAL_USER_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    // Ignore error
  }
  return null;
}

/**
 * Persist stored user session
 */
export function setStoredUser(user: UserProfile): void {
  try {
    localStorage.setItem(LOCAL_USER_STORAGE_KEY, JSON.stringify(user));
  } catch (e) {}
}

/**
 * Clear stored user session
 */
export function clearStoredUser(): void {
  try {
    localStorage.removeItem(LOCAL_USER_STORAGE_KEY);
  } catch (e) {}
}
