import { NextResponse } from "next/server";
import { getRouteSupabase } from "@/lib/supabaseServer";
import { randomKey } from "@/lib/random-key";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const sb = await getRouteSupabase();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const newKey = randomKey();

  // Update (RLS ensures admin)
  const { data, error } = await sb
    .from("projects")
    .update({ key: newKey })
    .eq("id", id)
    .select("id, name, key")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

