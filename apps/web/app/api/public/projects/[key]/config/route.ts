import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { withCORS, preflight, forbidCORS } from "@/lib/cors";

// Helper function for public API responses with proper CORS headers
function createPublicResponse(data: any, status: number = 200) {
  const response = NextResponse.json(data, { status });
  
  // Add CORS headers for public API
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type");
  response.headers.set("Vary", "Origin");
  
  return response;
}

export async function OPTIONS(
  req: Request,
  { params }: { params: Promise<{ key: string }> }
) {
  // For public API, always allow OPTIONS requests
  return createPublicResponse(null, 204);
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ key: string }> }
) {
  const { key } = await params;
  const sb = getSupabaseAdmin();
  const cleanKey = (key || "").trim();

  // Validate key early
  if (!/^[a-zA-Z0-9_-]{6,64}$/.test(cleanKey)) {
    return createPublicResponse({ error: "invalid key" }, 400);
  }

  // Fetch project (and allowed origins + flag)
  const { data: proj } = await sb
    .from("projects")
    .select("id, name, key, allowed_origins, require_project_origins")
    .eq("key", cleanKey)
    .maybeSingle();

  const extra = (proj?.allowed_origins as string[] | null) || null;
  const projectOnly = !!(proj?.require_project_origins);

  // For public API, if no project-specific restrictions, allow all origins
  const finalExtra = (!projectOnly && (!extra || extra.length === 0)) ? ["*"] : extra;

  // Simple CORS check for public API
  const origin = req.headers.get("origin");
  const allowRequest = !origin || finalExtra?.includes("*") || (finalExtra && finalExtra.includes(origin));

  if (!allowRequest) {
    return createPublicResponse({ error: "origin not allowed" }, 403);
  }

  if (!proj) {
    return createPublicResponse({ error: "project not found" }, 404);
  }

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
      ...(cfg?.settings as Record<string, unknown> || {})
    }
  };

  return createPublicResponse(payload);
}

