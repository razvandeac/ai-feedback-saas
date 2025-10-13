const STAR = "*.";

function normalizeHost(h: string) {
  try {
    const u = new URL(h);
    return u.host.toLowerCase();
  } catch {
    // maybe already a host
    return h.replace(/^https?:\/\//, "").toLowerCase();
  }
}

function parseAllowed() {
  const raw = process.env.CORS_ALLOWED_ORIGINS || "";
  return raw
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);
}

function originAllowed(origin: string | null) {
  const allowNoOrigin = (process.env.CORS_ALLOW_NO_ORIGIN || "false").toLowerCase() === "true";
  if (!origin) return allowNoOrigin; // e.g., curl, server-side

  const allowed = parseAllowed();
  if (allowed.includes("*")) return true;

  try {
    const o = new URL(origin);
    const oHost = o.host.toLowerCase();

    for (const entry of allowed) {
      // exact scheme+host
      if (entry.startsWith("http://") || entry.startsWith("https://")) {
        if (origin.toLowerCase() === entry.toLowerCase()) return true;
        continue;
      }
      const host = normalizeHost(entry);
      if (host.startsWith(STAR)) {
        // wildcard subdomain: *.example.com
        const base = host.slice(STAR.length);
        if (oHost === base) return true;
        if (oHost.endsWith("." + base)) return true;
      } else {
        if (oHost === host) return true;
      }
    }
  } catch {
    return false;
  }
  return false;
}

export function withCORS(res: Response, req: Request, methods: string[]) {
  const origin = req.headers.get("origin");
  const ok = originAllowed(origin);
  const hdrs = new Headers(res.headers);

  // Reflect allowed origin, else do not set ACAO
  if (ok && origin) hdrs.set("Access-Control-Allow-Origin", origin);
  if (ok && !origin) hdrs.set("Access-Control-Allow-Origin", "*"); // non-browser
  hdrs.set("Vary", "Origin");
  hdrs.set("Access-Control-Allow-Methods", methods.join(", "));
  hdrs.set("Access-Control-Allow-Headers", "Content-Type");
  hdrs.set("Access-Control-Max-Age", "600");

  // Security headers
  hdrs.set("X-Content-Type-Options", "nosniff");
  hdrs.set("Referrer-Policy", "no-referrer");
  hdrs.set("Permissions-Policy", "interest-cohort=()");

  return new Response(res.body, { status: res.status, headers: hdrs });
}

export function preflight(req: Request, methods: string[]) {
  // Always answer OPTIONS with allowed headers; browser will still block if Origin disallowed
  const res = new Response(null, { status: 204 });
  return withCORS(res, req, methods);
}

export function forbidCORS(req: Request) {
  // 403 without ACAO so browser blocks
  return new Response(JSON.stringify({ error: "origin not allowed" }), {
    status: 403,
    headers: { "content-type": "application/json" }
  });
}

