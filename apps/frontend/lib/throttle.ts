const hits = new Map<string, number[]>();

export function devThrottle(ip: string, limit = 10, windowMs = 60_000) {
  const now = Date.now();
  const arr = (hits.get(ip) ?? []).filter(t => now - t < windowMs);
  arr.push(now);
  hits.set(ip, arr);
  return arr.length <= limit;
}
