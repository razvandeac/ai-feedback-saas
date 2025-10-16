import { NextResponse } from "next/server";
import { getRouteSupabase } from "@/lib/supabaseServer";

export async function POST(req: Request) {
  try {
    const sb = await getRouteSupabase();
    
    // Get the authenticated user
    const { data: { user }, error: userError } = await sb.auth.getUser();
    
    console.log("=== ORG CREATE DEBUG ===");
    console.log("Auth user:", user?.id);
    console.log("User error:", userError);
    console.log("User email:", user?.email);
    
    if (!user) {
      console.error("No authenticated user found");
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const { name, slug } = await req.json();
    if (!name) return NextResponse.json({ error: "name required" }, { status: 400 });

    const desired = (slug || name).toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)+/g,"");

    // Check if slug is taken
    const { data: existing } = await sb
      .from("organizations")
      .select("slug")
      .eq("slug", desired)
      .maybeSingle();
      
    if (existing) {
      console.log("Slug already taken:", desired);
      return NextResponse.json({ error: "slug taken" }, { status: 409 });
    }

    console.log("Attempting to create org:", { name, slug: desired });

    // Try to get session to verify auth state
    const { data: { session } } = await sb.auth.getSession();
    console.log("Session exists:", !!session, "Session user:", session?.user?.id);

    // Insert organization
    const { data, error } = await sb
      .from("organizations")
      .insert({ name, slug: desired })
      .select()
      .single();

    if (error) {
      console.error("Insert error details:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.log("Org created successfully:", data);
    return NextResponse.json({ id: data.id, slug: data.slug });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Internal server error" 
    }, { status: 500 });
  }
}
