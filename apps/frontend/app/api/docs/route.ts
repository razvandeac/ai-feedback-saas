import fs from "fs";
import path from "path";
import { NextRequest } from "next/server";

export const dynamic = "force-static";

export async function GET(_req: NextRequest) {
  const file = path.join(process.cwd(), "docs", "api.md");
  const md = fs.readFileSync(file, "utf8");
  return new Response(md, {
    status: 200,
    headers: { "Content-Type": "text/markdown; charset=utf-8" }
  });
}
