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
      console.log('🔔 Auth state change:', event, session ? 'Session exists' : 'No session');
      
      if (event === 'SIGNED_IN' && pathname === '/login') {
        console.log('✅ SIGNED_IN detected, redirecting to dashboard');
        window.location.href = '/dashboard';
      }
      
      if (event === 'SIGNED_OUT') {
        console.log('👋 SIGNED_OUT detected, redirecting to login');
        window.location.href = '/login';
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

