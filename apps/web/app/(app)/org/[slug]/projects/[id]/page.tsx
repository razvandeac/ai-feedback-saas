export const revalidate = 0;
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import RecentEvents from "@/components/projects/recent-events";
import { getProjectWithWidget, ensureProjectWidget } from "@/src/server/projects/repo";

export default async function ProjectOverview({ params }: { params: Promise<{ slug: string; id: string }> }) {
  const { slug, id } = await params;
  const adminSupabase = getSupabaseAdmin();

  try {
    // Get project with widget information
    const proj = await getProjectWithWidget(id);
    if (!proj) return notFound();

    // Ensure widget exists for this project
    let widgetId: string;
    try {
      widgetId = proj.widget?.id || await ensureProjectWidget(proj.id, proj.org_id);
    } catch (error) {
      // Error creating widget
      // If widget creation fails, show error page with details
      return (
        <div className="p-6 space-y-4">
          <h1 className="text-lg font-semibold">{proj.name}</h1>
          <div className="rounded-2xl border bg-red-50 p-4 text-red-800">
            <p className="text-sm">
              <strong>Error creating widget</strong>
            </p>
            <details className="mt-2">
              <summary className="cursor-pointer text-xs">Click to see error details</summary>
              <pre className="mt-2 text-xs bg-red-100 p-2 rounded overflow-auto">
                {JSON.stringify(error, null, 2)}
              </pre>
            </details>
            <p className="text-xs mt-2">
              Project ID: {proj.id}<br/>
              Org ID: {proj.org_id}
            </p>
          </div>
        </div>
      );
    }

    // Basic counts for this project using admin client
    const [{ count: feedbackCount }, { count: eventsCount }] = await Promise.all([
      adminSupabase.from("feedback").select("*", { count: "exact", head: true }).eq("project_id", id),
      adminSupabase.from("events").select("*", { count: "exact", head: true }).eq("project_id", id),
    ]);


    return (
      <div className="p-6 space-y-4">
        <h1 className="text-lg font-semibold">{proj.name}</h1>
        
        <div className="flex gap-2">
          {widgetId ? (
            <Link href={`/org/${slug}/projects/${id}/studio/${widgetId}`}>
              <Button className="bg-blue-600 text-white hover:bg-blue-700">Open Studio</Button>
            </Link>
          ) : (
            <Button disabled className="bg-gray-400 text-white">Studio Loading...</Button>
          )}
          <Link href={`/org/${slug}/projects/${id}/widget`}>
            <Button variant="outline">Preview</Button>
          </Link>
          <form action={`/api/studio/widgets/${widgetId}/publish`} method="post">
            <input type="hidden" name="orgId" value={proj.org_id} />
            <Button type="submit" variant="outline">Publish</Button>
          </form>
        </div>
        {/* Published status */}
        <p className="text-xs text-neutral-500">
          Published version: v{proj.widget?.version ?? 1} {proj.widget?.published_at ? `· ${new Date(proj.widget.published_at).toLocaleString()}` : ""}
        </p>

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
              <Link href={`/org/${slug}/projects/${id}/studio/${widgetId}`} className="block p-3 rounded-2xl border hover:bg-neutral-50 transition-colors">
                <div className="font-medium text-sm">Widget Studio</div>
                <div className="text-xs text-neutral-500">Design and customize your feedback widget</div>
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
  } catch (error) {
    // Project overview error
    return (
      <div className="p-6 space-y-4">
        <h1 className="text-lg font-semibold">Error Loading Project</h1>
        <div className="rounded-2xl border bg-red-50 p-4 text-red-800">
          <p className="text-sm">
            <strong>Server Error</strong> - Please check the server logs for details.
          </p>
        </div>
      </div>
    );
  }
}