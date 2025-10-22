export const revalidate = 0;
import { getServerSupabase } from "@/lib/supabaseServer";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import RecentEvents from "@/components/projects/recent-events";

export default async function ProjectDetailPage({
  params
}: {
  params: Promise<{ slug: string; id: string }>
}) {
  const { slug, id } = await params;
  const sb = await getServerSupabase();
  const adminSupabase = getSupabaseAdmin();

  // Use admin client to bypass RLS issues
  const { data: project } = await adminSupabase
    .from("projects")
    .select("id, name, key, created_at")
    .eq("id", id)
    .single();

  if (!project) return notFound();

  // Basic counts for this project using admin client
  const [{ count: feedbackCount }, { count: eventsCount }] = await Promise.all([
    adminSupabase.from("feedback").select("*", { count: "exact", head: true }).eq("project_id", id),
    adminSupabase.from("events").select("*", { count: "exact", head: true }).eq("project_id", id),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">{project.name}</h1>
          <p className="text-sm text-neutral-500">Project overview</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/org/${slug}/projects/${id}/widget`}>
            <Button variant="outline" size="sm">Widget</Button>
          </Link>
          <Link href={`/org/${slug}/projects/${id}/settings`}>
            <Button variant="outline" size="sm">Settings</Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-3xl border bg-white p-4">
          <div className="text-xs text-neutral-500">Total feedback</div>
          <div className="mt-1 text-2xl font-semibold">{feedbackCount ?? 0}</div>
        </div>
        <div className="rounded-3xl border bg-white p-4">
          <div className="text-xs text-neutral-500">Total events</div>
          <div className="mt-1 text-2xl font-semibold">{eventsCount ?? 0}</div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <RecentEvents projectId={project.id} />
        <div className="rounded-3xl border bg-white p-4">
          <div className="text-sm font-medium mb-3">Quick actions</div>
          <div className="space-y-2">
            <Link href={`/org/${slug}/feedback?project=${id}`} className="block p-3 rounded-2xl border hover:bg-neutral-50 transition-colors">
              <div className="font-medium text-sm">View all feedback</div>
              <div className="text-xs text-neutral-500">Filter feedback table by this project</div>
            </Link>
            <Link href={`/org/${slug}/projects/${id}/widget`} className="block p-3 rounded-2xl border hover:bg-neutral-50 transition-colors">
              <div className="font-medium text-sm">Embed widget</div>
              <div className="text-xs text-neutral-500">Get code snippet and configure appearance</div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

