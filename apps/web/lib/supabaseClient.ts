import { createClient } from '@supabase/supabase-js';

// Ensure environment variables are defined
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_URL');
}

if (!supabaseAnonKey) {
  throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

/**
 * Supabase client with persisted sessions
 * 
 * This client automatically:
 * - Persists auth sessions to localStorage
 * - Refreshes tokens when they expire
 * - Syncs auth state across browser tabs
 * 
 * Use this for client-side operations in React components.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Persist session to localStorage (default behavior)
    persistSession: true,
    // Automatically refresh tokens
    autoRefreshToken: true,
    // Detect session changes in other tabs
    detectSessionInUrl: true,
    // Storage key for session data
    storageKey: 'pulseai-auth-token',
    // Use localStorage for session persistence
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  },
});

/**
 * Helper to get the current user
 * Returns null if no user is authenticated
 */
export const getCurrentUser = async () => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.error('Error fetching user:', error);
    return null;
  }

  return user;
};

/**
 * Helper to get the current session
 * Returns null if no active session
 */
export const getCurrentSession = async () => {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    console.error('Error fetching session:', error);
    return null;
  }

  return session;
};

/**
 * Helper to sign out the current user
 */
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

export default supabase;

