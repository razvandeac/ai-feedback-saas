import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const sb = await supabaseServer();
  
  const { data: proj } = await sb
    .from("projects")
    .select("name")
    .eq("id", id)
    .maybeSingle();

  return NextResponse.json({ label: proj?.name || id });
}

