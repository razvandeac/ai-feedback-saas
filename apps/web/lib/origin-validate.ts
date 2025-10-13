// Accepts full origins (https://app.example.com) or host patterns (*.example.com), localhost:port allowed
export function isValidOriginEntry(s: string): boolean {
  const x = s.trim();
  if (!x) return false;

  // Full origin with scheme
  const fullOrigin = /^(https?:)\/\/([^\s/]+)$/i;
  if (fullOrigin.test(x)) {
    try {
      const u = new URL(x);
      if (!/^https?:$/.test(u.protocol)) return false;
      if (!u.hostname) return false;
      return true;
    } catch { return false; }
  }

  // Wildcard host: *.example.com
  const wildcard = /^\*\.[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  if (wildcard.test(x)) return true;

  // Bare host (optional port), e.g., example.com, localhost:3000
  const bare = /^(localhost(\:\d+)?|[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)+(\:\d+)?)$/;
  return bare.test(x);
}

export function cleanOrigins(list: string[] | null | undefined): string[] | null {
  if (!list || list.length === 0) return null;
  const trimmed = list.map(s => s.trim()).filter(Boolean);
  const uniq = Array.from(new Set(trimmed));
  const valid = uniq.filter(isValidOriginEntry).slice(0, 50);
  return valid.length ? valid : null;
}

