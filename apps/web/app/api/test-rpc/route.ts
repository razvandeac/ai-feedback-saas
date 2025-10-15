import { NextResponse } from "next/server";
import { getRouteSupabase } from "@/lib/supabaseServer";

export async function GET() {
  const sb = await getRouteSupabase();
  
  try {
    // Test if RPC exists and works
    const { data, error } = await sb.rpc("get_users_lite", { ids: [] });
    
    return NextResponse.json({
      success: !error,
      error: error?.message || null,
      data: data,
      message: error ? "RPC function failed" : "RPC function works!"
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({
      success: false,
      error: message,
      message: "RPC function doesn't exist or can't be called"
    }, { status: 500 });
  }
}

