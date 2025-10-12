'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

/**
 * AuthListener Component
 * Listens to Supabase auth state changes and handles routing
 * 
 * Place this in your root layout to handle auth globally
 */
export function AuthListener() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session && pathname === '/login') {
        router.replace('/dashboard');
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && pathname === '/login') {
        router.replace('/dashboard');
        router.refresh();
      }
      
      if (event === 'SIGNED_OUT') {
        router.replace('/login');
        router.refresh();
      }

      // Refresh the page to update server components
      if (event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        router.refresh();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router, pathname]);

  return null;
}

