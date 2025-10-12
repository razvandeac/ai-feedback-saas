"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-client";

export default function AuthCallback() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      const sb = supabaseBrowser();

      // Check for error in URL
      const urlError = params.get("error_description") || params.get("error");
      if (urlError) {
        console.error("Auth error:", urlError);
        router.replace(`/login?error=${encodeURIComponent(urlError)}`);
        return;
      }

      try {
        // For magic links, check if session is already established
        const { data: { session } } = await sb.auth.getSession();
        
        if (session) {
          // Session already exists, redirect
          const next = params.get("next") || "/";
          router.replace(next);
          return;
        }

        // Try to exchange code if present
        const code = params.get("code");
        if (code) {
          const { error: exchangeError } = await sb.auth.exchangeCodeForSession(code);
          if (exchangeError) {
            console.error("Exchange error:", exchangeError);
            setError(exchangeError.message);
            setTimeout(() => {
              router.replace(`/login?error=${encodeURIComponent(exchangeError.message)}`);
            }, 2000);
            return;
          }
        }

        // Final check: do we have a session now?
        const { data: { session: finalSession } } = await sb.auth.getSession();
        if (finalSession) {
          const next = params.get("next") || "/";
          router.replace(next);
        } else {
          router.replace("/login?error=No session established");
        }
      } catch (err) {
        console.error("Callback error:", err);
        const errorMsg = err instanceof Error ? err.message : "Authentication failed";
        router.replace(`/login?error=${encodeURIComponent(errorMsg)}`);
      }
    };
    run();
  }, [router, params]);

  if (error) {
    return (
      <div className="p-6 text-center">
        <div className="text-red-600">Error: {error}</div>
        <div className="text-sm text-gray-600 mt-2">Redirecting to login...</div>
      </div>
    );
  }

  return <div className="p-6">Signing you in…</div>;
}
