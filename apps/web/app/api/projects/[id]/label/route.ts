import { NextResponse } from "next/server";
import { getRouteSupabase } from "@/lib/supabaseServer";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const sb = await getRouteSupabase();
  
  const { data: proj } = await sb
    .from("projects")
    .select("name")
    .eq("id", id)
    .maybeSingle();

  return NextResponse.json({ label: proj?.name || id });
}

