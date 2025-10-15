// apps/web/lib/baseUrl.ts
export function getClientBaseUrl() {
  if (typeof window !== 'undefined') return window.location.origin
  return process.env.NEXT_PUBLIC_APP_BASE_URL ?? 'http://localhost:3000'
}
