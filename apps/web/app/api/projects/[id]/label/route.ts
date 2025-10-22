import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const adminSupabase = getSupabaseAdmin();
  
  // Use admin client to bypass RLS issues
  const { data: proj } = await adminSupabase
    .from("projects")
    .select("name")
    .eq("id", id)
    .maybeSingle();

  return NextResponse.json({ label: proj?.name || id });
}

