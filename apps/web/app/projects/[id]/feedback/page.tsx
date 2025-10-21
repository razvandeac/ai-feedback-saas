import { redirect } from 'next/navigation';

export default async function LegacyProjectFeedback({
  params,
}: { params: Promise<{ id: string }> }) {
  // If you can resolve the org slug here, you can compute it.
  // For now, send them to a neutral org path that resolves server-side,
  // or keep a static slug like 'demo' until you wire an actual lookup.
  const { id } = await params;
  redirect(`/org/demo/projects/${id}/feedback`);
}
