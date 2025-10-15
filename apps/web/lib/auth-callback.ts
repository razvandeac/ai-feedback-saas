import { supabase } from "./supabaseClient";

/**
 * Handle Supabase auth tokens from URL (hash or query)
 * Returns error message if failed, null if successful
 */
export async function handleSupabaseAuthReturn(url: string): Promise<string | null> {
  try {
    const sb = supabase;

    // Parse tokens from hash fragment
    const hashData = new URLSearchParams(url.split("#")[1] || "");
    const accessToken = hashData.get("access_token");
    const refreshToken = hashData.get("refresh_token");

    // Check for errors in hash or query
    const hashError = hashData.get("error_description") || hashData.get("error");
    if (hashError) {
      return decodeURIComponent(hashError);
    }

    // If we have tokens in the hash, set the session
    if (accessToken && refreshToken) {
      const { data, error } = await sb.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken
      });

      if (error) return error.message;
      if (!data.session) return "Could not establish session";
      return null; // Success
    }

    // Check for code in query string
    const urlObj = new URL(url);
    const code = urlObj.searchParams.get("code");
    
    if (code) {
      const { error } = await sb.auth.exchangeCodeForSession(code);
      if (error) return error.message;
      return null; // Success
    }

    return "No auth data found in URL";
  } catch (err) {
    return err instanceof Error ? err.message : "Authentication failed";
  }
}
