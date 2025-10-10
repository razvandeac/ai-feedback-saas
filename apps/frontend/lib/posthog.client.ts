import type { PostHog } from "posthog-js";

let ph: PostHog | null = null;

export async function initPosthog() {
  if (typeof window === "undefined") return null;
  if (ph) return ph;
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) return null;
  const { default: posthog } = await import("posthog-js");
  ph = posthog;
  posthog.init(key, { api_host: "https://app.posthog.com" });
  posthog.capture("pageview");
  return ph;
}
