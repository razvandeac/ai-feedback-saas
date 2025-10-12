"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-client";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (typeof window !== "undefined" ? window.location.origin : "");

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const sb = supabaseBrowser();

  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle auth tokens in URL hash and check for existing session
  useEffect(() => {
    const url = typeof window !== "undefined" ? window.location.href : undefined;
    if (!url) return;

    // Check for errors in query string or hash fragment
    const queryError = params.get("error");
    const hashParams = new URLSearchParams(window.location.hash.slice(1));
    const hashError = hashParams.get("error");
    const errorDescription = hashParams.get("error_description") || params.get("error");

    if (queryError || hashError) {
      const errorMsg = decodeURIComponent(errorDescription || queryError || hashError || "Authentication failed");
      setError(errorMsg);
      router.replace("/login");
      return;
    }

    // Check if we have auth tokens in the hash (Supabase magic link fallback)
    const hasAuthHash = url.includes("#access_token=") || url.includes("#refresh_token=");

    if (hasAuthHash) {
      console.log("Auth tokens found in URL hash, setting session...");
      (async () => {
        try {
          // Use setSession to explicitly set the tokens from the URL
          // Supabase client will parse them from the hash automatically
          const hashData = new URLSearchParams(window.location.hash.slice(1));
          const accessToken = hashData.get("access_token");
          const refreshToken = hashData.get("refresh_token");

          if (accessToken && refreshToken) {
            const { data, error: setError } = await sb.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken
            });

            if (setError) {
              console.error("Set session error:", setError);
              setError(setError.message);
              router.replace("/login");
              return;
            }

            if (data.session) {
              console.log("Session established successfully");
              const next = params.get("next") || "/";
              router.replace(next);
              return;
            }
          }

          setError("Could not establish session");
          router.replace("/login");
        } catch (err) {
          console.error("Auth error:", err);
          setError("Authentication failed");
          router.replace("/login");
        }
      })();
      return;
    }

    // Check if user is already logged in
    (async () => {
      const { data: { session } } = await sb.auth.getSession();
      if (session) {
        router.replace("/");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const redirectTo = `${SITE_URL}/auth/callback?next=/`;
    console.log("Sending magic link with redirectTo:", redirectTo);
    const { error: submitError } = await sb.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: redirectTo
      }
    });
    setLoading(false);
    if (submitError) {
      setError(submitError.message);
    } else {
      setSent(true);
    }
  }

  return (
    <div className="min-h-screen grid place-items-center p-6">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4">
        <h1 className="text-xl font-semibold">Sign in to Vamoot</h1>
        
        {error && (
          <div className="p-3 rounded bg-red-50 border border-red-200 text-red-800 text-sm">
            {error}
          </div>
        )}

        {sent ? (
          <div className="space-y-2">
            <p className="font-medium">Check your email!</p>
            <p className="text-sm text-gray-600">
              We sent a magic link to <span className="font-medium">{email}</span>
            </p>
            <p className="text-sm text-gray-600">
              Click the link to sign in. It should redirect to this browser.
            </p>
          </div>
        ) : (
          <>
            <input
              type="email"
              required
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded p-2"
            />
            <button disabled={loading} type="submit" className="w-full rounded p-2 border hover:bg-gray-50 disabled:opacity-50">
              {loading ? "Sending…" : "Send magic link"}
            </button>
          </>
        )}
      </form>
    </div>
  );
}
