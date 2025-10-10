import { NextRequest } from "next/server";
import { supabase } from "../../../../lib/supabaseClient";
import { hmacHex, safeEqualHex } from "../../../../lib/hmac";
import { FeedbackIngestSchema } from "../../../../../../packages/config/src/schemas";
import { HttpError, badRequest, unauthorized, tooLarge, serverError, json } from "../../../../lib/errors";
import { devThrottle } from "../../../../lib/throttle";

const MAX_BYTES = 256 * 1024;

async function readBodyLimited(req: NextRequest) {
  const reader = req.body?.getReader();
  if (!reader) return ""; // Next.js may provide text() still; fallback for small bodies
  let total = 0; const chunks: Uint8Array[] = [];
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    if (value) {
      total += value.byteLength;
      if (total > MAX_BYTES) throw tooLarge();
      chunks.push(value);
    }
  }
  return new TextDecoder().decode(Buffer.concat(chunks));
}

export async function POST(req: NextRequest) {
  try {
    if (req.headers.get("content-type")?.includes("application/json") !== true) {
      throw badRequest("Content-Type must be application/json");
    }

    // read raw body with size guard (fallback to req.text if needed)
    let raw = "";
    try { raw = await readBodyLimited(req); } catch { raw = await req.text(); }
    if (raw.length > MAX_BYTES) throw tooLarge();

    // HMAC
    const secret = process.env.HMAC_SECRET || "";
    const devBypass = process.env.NODE_ENV !== "production";
    const sig = req.headers.get("x-signature");
    if (!sig && !devBypass) throw unauthorized("missing signature");
    if (sig) {
      if (!secret) throw serverError("server not configured");
      const expected = hmacHex(raw, secret);
      if (!safeEqualHex(sig, expected)) throw unauthorized("invalid signature");
    }

    // Validate payload
    let jsonBody: unknown;
    try { jsonBody = JSON.parse(raw); } catch { throw badRequest("invalid json"); }
    const payload = FeedbackIngestSchema.parse(jsonBody);

    // Dev rate limiting
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
    if (process.env.NODE_ENV !== "production" && !devThrottle(ip)) {
      return json(429, { error: "rate limit (dev)" });
    }

    // Insert
    const { error } = await supabase.from("feedback").insert(payload);
    if (error) throw serverError("db insert failed");

    console.info("ingest_ok");
    return json(200, { status: "ok" });
  } catch (e: unknown) {
    if (e instanceof HttpError) return json(e.status, { error: e.message });
    console.error("ingest unexpected error", e);
    return json(500, { error: "unexpected error" });
  }
}
