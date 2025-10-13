import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { randomKey } from "@/lib/random-key";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { data: org } = await sb
    .from("organizations")
    .select("id")
    .eq("slug", slug)
    .single();

  if (!org) return NextResponse.json([], { status: 200 });

  const { data, error } = await sb
    .from("projects")
    .select("id, name, key, created_at")
    .eq("org_id", org.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data ?? []);
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const name = (body?.name ?? "").toString().trim();
  if (!name) return NextResponse.json({ error: "name required" }, { status: 400 });

  // Find org
  const { data: org, error: orgErr } = await sb
    .from("organizations")
    .select("id, slug")
    .eq("slug", slug)
    .single();
  if (orgErr || !org) return NextResponse.json({ error: "org not found" }, { status: 404 });

  // Insert (RLS checks admin role)
  const key = randomKey();
  const { data, error } = await sb
    .from("projects")
    .insert({ org_id: org.id, name, key })
    .select("id, name, key, created_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

