import { supabaseServer } from "@/lib/supabase-server";

export async function isPlatformAdmin() {
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user?.email) return { ok: false as const, user: null };

  const { data } = await sb
    .from("platform_admins")
    .select("email")
    .eq("email", user.email)
    .maybeSingle();

  return { ok: !!data, user };
}

