const STAR = "*.";

function normalizeHost(h: string) {
  try {
    const u = new URL(h);
    return u.host.toLowerCase();
  } catch {
    return h.replace(/^https?:\/\//, "").toLowerCase();
  }
}

export function parseEnvAllowed(): string[] {
  const raw = process.env.CORS_ALLOWED_ORIGINS || "";
  return raw.split(",").map(s => s.trim()).filter(Boolean);
}

function originAllowedFromList(origin: string | null, list: string[], allowNoOrigin: boolean) {
  if (!origin) return allowNoOrigin;
  if (list.includes("*")) return true;

  let o: URL | null = null;
  try { o = new URL(origin); } catch { return false; }
  const oHost = o!.host.toLowerCase();

  for (const entry of list) {
    if (!entry) continue;
    if (entry.startsWith("http://") || entry.startsWith("https://")) {
      if (origin.toLowerCase() === entry.toLowerCase()) return true;
      continue;
    }
    const host = normalizeHost(entry);
    if (host.startsWith(STAR)) {
      const base = host.slice(STAR.length);
      if (oHost === base) return true;
      if (oHost.endsWith("." + base)) return true;
    } else {
      if (oHost === host) return true;
    }
  }
  return false;
}

export function withCORS(
  res: Response,
  req: Request,
  methods: string[],
  extraAllowed?: string[] | null
) {
  const origin = req.headers.get("origin");
  const allowNoOrigin = (process.env.CORS_ALLOW_NO_ORIGIN || "false").toLowerCase() === "true";
  const envList = parseEnvAllowed();
  const merged = Array.from(new Set([...(envList || []), ...((extraAllowed || []) as string[])]));
  const ok = originAllowedFromList(origin, merged, allowNoOrigin);

  const hdrs = new Headers(res.headers);
  if (ok && origin) hdrs.set("Access-Control-Allow-Origin", origin);
  if (ok && !origin) hdrs.set("Access-Control-Allow-Origin", "*");
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

export function preflight(req: Request, methods: string[], extraAllowed?: string[] | null) {
  const res = new Response(null, { status: 204 });
  return withCORS(res, req, methods, extraAllowed);
}

export function forbidCORS(req: Request) {
  return new Response(JSON.stringify({ error: "origin not allowed" }), {
    status: 403,
    headers: { "content-type": "application/json" }
  });
}

