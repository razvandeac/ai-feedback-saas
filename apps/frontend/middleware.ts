import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname, searchParams } = new URL(req.url);

  // Gate /submit with SUBMIT_DEV_TOKEN (skip in production if you prefer)
  if (pathname.startsWith("/submit")) {
    const expected = process.env.SUBMIT_DEV_TOKEN;
    const token = searchParams.get("token") || req.headers.get("x-dev-token");
    if (expected && token !== expected) {
      return new NextResponse("Forbidden: invalid dev token", { status: 403 });
    }
  }

  return NextResponse.next();
}

export const config = { matcher: ["/submit/:path*"] };
