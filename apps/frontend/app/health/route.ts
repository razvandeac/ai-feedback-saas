import { NextRequest } from "next/server";
import { supabase } from "../../lib/supabaseClient";
import { execSync } from "child_process";

const gitSha = (() => {
  try { return execSync("git rev-parse --short HEAD").toString().trim(); }
  catch { return "unknown"; }
})();

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
  const ts = new Date().toISOString();
  const payload = { ok: true, supabase: supa, env: presentEnv, version: gitSha, built_at: ts };
  
  return new Response(JSON.stringify(payload), { 
    headers: { "Content-Type": "application/json" }
  });
}
