import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function GET() {
  const sb = await supabaseServer();
  
  try {
    // Test if RPC exists and works
    const { data, error } = await sb.rpc("get_users_lite", { ids: [] });
    
    return NextResponse.json({
      success: !error,
      error: error?.message || null,
      data: data,
      message: error ? "RPC function failed" : "RPC function works!"
    });
  } catch (e: any) {
    return NextResponse.json({
      success: false,
      error: e.message,
      message: "RPC function doesn't exist or can't be called"
    }, { status: 500 });
  }
}

