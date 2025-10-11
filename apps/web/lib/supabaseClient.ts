import { createClient } from '@supabase/supabase-js';

// Ensure environment variables are defined
// Use dummy values at build time to prevent errors
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDUxOTIwMDAsImV4cCI6MTk2MDc2ODAwMH0.placeholder';

// Warn at runtime if environment variables are missing
if (typeof window !== 'undefined') {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error('⚠️ Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }
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

