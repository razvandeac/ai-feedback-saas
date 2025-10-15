"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { handleSupabaseAuthReturn } from "@/lib/auth-callback";
import { supabaseBrowser } from "@/lib/supabase-client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (typeof window !== "undefined" ? window.location.origin : "");

type Mode = "magic" | "otp";

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/";

  const [mode, setMode] = useState<Mode>("magic");
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  // Prefill last email
  useEffect(() => {
    const last = localStorage.getItem("vamoot.lastEmail");
    if (last) setEmail(last);
  }, []);

  // Consume auth tokens if Supabase sent us back here
  useEffect(() => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const hasAuth = url.includes("#access_token=") || url.includes("?code=");
    if (!hasAuth) return;
    (async () => {
      const err = await handleSupabaseAuthReturn(url);
      if (err) {
        console.error("login inline exchange error:", err);
        setErrorMsg(err);
        router.replace(`/login?error=${encodeURIComponent(err)}&next=${encodeURIComponent(next)}`);
      } else {
        router.replace(next);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function sendMagic(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);
    localStorage.setItem("vamoot.lastEmail", email);
    const sb = supabaseBrowser();
    const redirectTo = `${SITE_URL}/auth/callback?next=${encodeURIComponent(next)}`;
    const { error } = await sb.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true, emailRedirectTo: redirectTo }
    });
    setLoading(false);
    if (error) setErrorMsg(error.message);
    else setSent(true);
  }

  async function sendOtp(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);
    localStorage.setItem("vamoot.lastEmail", email);
    const sb = supabaseBrowser();
    
    console.log("Sending 6-digit OTP (no redirect URL)");
    
    // Send WITHOUT emailRedirectTo to get a 6-digit code instead of magic link
    const { error } = await sb.auth.signInWithOtp({
      email,
      options: { 
        shouldCreateUser: true
        // NO emailRedirectTo = should send 6-digit token only
      }
    });
    
    console.log("OTP send result:", error ? `Error: ${error.message}` : "Success");
    
    setLoading(false);
    if (error) setErrorMsg(error.message);
    else setSent(true);
  }

  async function verifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);
    const sb = supabaseBrowser();
    const { error } = await sb.auth.verifyOtp({
      email,
      type: "email",          // email OTP (6-digit code)
      token: otp.trim()
    });
    setLoading(false);
    if (error) {
      setErrorMsg(error.message);
    } else {
      router.replace(next);
    }
  }

  return (
    <div className="min-h-screen grid place-items-center p-6 bg-neutral-50">
      <div className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-semibold">Sign in to Vamoot</h1>

        {/* Mode toggle */}
        <div className="flex gap-2 text-sm">
          <Button
            type="button"
            variant={mode === "magic" ? "subtle" : "outline"}
            size="sm"
            onClick={() => { setMode("magic"); setSent(false); setErrorMsg(""); }}
          >
            Magic link
          </Button>
          <Button
            type="button"
            variant={mode === "otp" ? "subtle" : "outline"}
            size="sm"
            onClick={() => { setMode("otp"); setSent(false); setErrorMsg(""); }}
          >
            6-digit OTP
          </Button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-sm">
            {errorMsg}
          </div>
        )}

        <Input
          type="email"
          required
          placeholder="you@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* Magic link mode */}
        {mode === "magic" && (
          <form onSubmit={sendMagic} className="space-y-3">
            {sent ? (
              <p className="text-sm text-neutral-600">Magic link sent. Open it in this same browser.</p>
            ) : (
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Sending…" : "Send magic link"}
              </Button>
            )}
          </form>
        )}

        {/* OTP mode */}
        {mode === "otp" && (
          <form onSubmit={sent ? verifyOtp : sendOtp} className="space-y-3">
            {!sent ? (
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Sending…" : "Send 6-digit code"}
              </Button>
            ) : (
              <>
                <p className="text-sm text-neutral-600">
                  Check your email for a 6-digit code. (You can also click the link in the email if you prefer.)
                </p>
                <Input
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  placeholder="Enter 6-digit code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="tracking-widest text-center text-lg"
                />
                <Button type="submit" disabled={loading || otp.trim().length < 6} className="w-full">
                  {loading ? "Verifying…" : "Verify code"}
                </Button>
              </>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
