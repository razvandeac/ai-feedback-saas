export const revalidate = 0;
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { notFound } from "next/navigation";
import Link from "next/link";
import RecentEvents from "@/components/projects/recent-events";
import { getProjectWithWidget } from "@/src/server/projects/repo";

export default async function ProjectOverview({ params }: { params: Promise<{ slug: string; id: string }> }) {
  const { slug, id } = await params;
  const adminSupabase = getSupabaseAdmin();

  // Get project with widget information
  const proj = await getProjectWithWidget(id);
  if (!proj) return notFound();

  // For now, skip widget operations until migration is applied
  // TODO: Re-enable widget operations after migration

  // Basic counts for this project using admin client
  const [{ count: feedbackCount }, { count: eventsCount }] = await Promise.all([
    adminSupabase.from("feedback").select("*", { count: "exact", head: true }).eq("project_id", id),
    adminSupabase.from("events").select("*", { count: "exact", head: true }).eq("project_id", id),
  ]);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-lg font-semibold">{proj.name}</h1>
      
      {/* Widget operations disabled until migration is applied */}
      <div className="rounded-2xl border bg-amber-50 p-4 text-amber-800">
        <p className="text-sm">
          <strong>Widget Studio temporarily disabled</strong> - Database migration needs to be applied first.
        </p>
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
        <RecentEvents projectId={proj.id} />
        <div className="rounded-3xl border bg-white p-4">
          <div className="text-sm font-medium mb-3">Quick actions</div>
          <div className="space-y-2">
            <Link href={`/org/${slug}/feedback?project=${id}`} className="block p-3 rounded-2xl border hover:bg-neutral-50 transition-colors">
              <div className="font-medium text-sm">View all feedback</div>
              <div className="text-xs text-neutral-500">Filter feedback table by this project</div>
            </Link>
            <Link href={`/org/${slug}/projects/${id}/settings`} className="block p-3 rounded-2xl border hover:bg-neutral-50 transition-colors">
              <div className="font-medium text-sm">Project Settings</div>
              <div className="text-xs text-neutral-500">Configure embed code and project settings</div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}