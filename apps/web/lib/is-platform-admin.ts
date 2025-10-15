import { getServerSupabase } from "@/lib/supabaseServer";

export async function isPlatformAdmin() {
  const supabase = await getServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return { ok: false as const, user: null };

  const { data } = await supabase
    .from("platform_admins")
    .select("email")
    .eq("email", user.email)
    .maybeSingle();

  return { ok: !!data, user };
}

