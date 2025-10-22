import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const adminSupabase = getSupabaseAdmin();
  
  // Use admin client to bypass RLS issues
  const { data: org } = await adminSupabase
    .from("organizations")
    .select("name")
    .eq("slug", slug)
    .maybeSingle();

  return NextResponse.json({ label: org?.name || slug });
}

