import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const sb = await supabaseServer();
  
  const { data: org } = await sb
    .from("organizations")
    .select("name")
    .eq("slug", slug)
    .maybeSingle();

  return NextResponse.json({ label: org?.name || slug });
}

