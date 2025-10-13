import { redirect } from "next/navigation";

export default async function SettingsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  redirect(`/org/${slug}/settings/members`);
}
