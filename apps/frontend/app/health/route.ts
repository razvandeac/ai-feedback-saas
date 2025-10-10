import { NextRequest } from "next/server";
import { supabase } from "../../lib/supabaseClient";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest) {
  let supa = "ok";
  try {
    const { error } = await supabase.from("feedback").select("id", { count: "exact", head: true }).limit(1);
    if (error) supa = "fail";
  } catch { 
    supa = "fail"; 
  }
  
  const presentEnv = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"].filter(k => !!process.env[k as keyof NodeJS.ProcessEnv]);
  
  return new Response(JSON.stringify({ ok: true, supabase: supa, env: presentEnv }), { 
    headers: { "Content-Type": "application/json" }
  });
}
