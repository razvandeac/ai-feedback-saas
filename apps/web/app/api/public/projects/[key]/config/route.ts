import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

function cors(res: NextResponse) {
  res.headers.set("Access-Control-Allow-Origin", "*");
  res.headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return res;
}

export async function OPTIONS() {
  return cors(new NextResponse(null, { status: 204 }));
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ key: string }> }
) {
  const { key } = await params;
  const sb = supabaseAdmin();

  // 1) Resolve project by key
  const { data: proj, error: pErr } = await sb
    .from("projects")
    .select("id, name, key, org_id")
    .eq("key", key)
    .single();

  if (pErr || !proj) {
    return cors(NextResponse.json({ error: "project not found" }, { status: 404 }));
  }

  // 2) Load widget settings (or default)
  const { data: cfg } = await sb
    .from("widget_config")
    .select("settings")
    .eq("project_id", proj.id)
    .maybeSingle();

  const payload = {
    project: { id: proj.id, name: proj.name },
    settings: {
      theme: "light",
      primaryColor: "#2563eb",
      showRating: true,
      showComment: true,
      title: "We value your feedback!",
      ...(cfg?.settings || {})
    }
  };

  return cors(NextResponse.json(payload));
}

