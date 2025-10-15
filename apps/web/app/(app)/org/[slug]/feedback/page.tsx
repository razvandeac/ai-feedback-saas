export const revalidate = 0;
import { supabaseServer } from "@/lib/supabase-server";
import FeedbackFilterBar from "@/components/filters/feedback-filter-bar";
import FeedbackTable from "@/components/feedback/feedback-table";
import EmptyState from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { notFound } from "next/navigation";

export default async function FeedbackPage({ 
  params,
  searchParams
}: { 
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const search = await searchParams;
  
  const sb = await supabaseServer();
  const { data: org } = await sb.from("organizations").select("id,slug,name").eq("slug", slug).single();
  if (!org) notFound();

  // Get projects for filter dropdown
  const { data: projects } = await sb
    .from("projects")
    .select("id, name")
    .eq("org_id", org.id)
    .order("name");

  if (!projects || projects.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-lg font-semibold">Feedback</h1>
        <EmptyState 
          title="No projects yet" 
          description="Create a project to start receiving feedback." 
        />
      </div>
    );
  }

  // Parse filters from URL
  const projectFilter = typeof search.project === "string" ? search.project : undefined;
  const ratingFilter = typeof search.rating === "string" ? search.rating : undefined;
  const qFilter = typeof search.q === "string" ? search.q : undefined;
  const fromFilter = typeof search.from === "string" ? search.from : undefined;
  const toFilter = typeof search.to === "string" ? search.to : undefined;
  const page = Math.max(1, parseInt(typeof search.page === "string" ? search.page : "1", 10));
  const pageSize = 20;

  // Build query with filters - query database directly (not via API)
  const pids = projects.map(p => p.id);
  let query = sb
    .from("feedback")
    .select("id, project_id, rating, comment, created_at", { count: "exact" })
    .in("project_id", pids);

  if (projectFilter) query = query.eq("project_id", projectFilter);
  if (ratingFilter === "null") query = query.is("rating", null);
  if (ratingFilter && ratingFilter !== "null") query = query.eq("rating", Number(ratingFilter));
  if (fromFilter) query = query.gte("created_at", new Date(fromFilter).toISOString());
  if (toFilter) query = query.lte("created_at", new Date(toFilter).toISOString());
  if (qFilter) query = query.ilike("comment", `%${qFilter}%`);

  const fromRow = (page - 1) * pageSize;
  const toRow = fromRow + pageSize - 1;
  query = query.order("created_at", { ascending: false }).range(fromRow, toRow);

  const { data: rows, count } = await query;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">User feedback</h1>
          <p className="text-sm text-neutral-500">Filter by project, rating, date, or search in comments.</p>
        </div>
        {(() => {
          const qs = new URLSearchParams();
          if (projectFilter) qs.set("project", projectFilter);
          if (ratingFilter) qs.set("rating", ratingFilter);
          if (qFilter) qs.set("q", qFilter);
          if (fromFilter) qs.set("from", fromFilter);
          if (toFilter) qs.set("to", toFilter);
          return (
            <a
              className="inline-block"
              href={`/api/orgs/${org.slug}/feedback/export?${qs.toString()}`}
            >
              <Button variant="outline" size="sm">Download CSV</Button>
            </a>
          );
        })()}
      </div>
      <FeedbackFilterBar projects={projects} />
      <FeedbackTable 
        initial={rows ?? []} 
        total={count ?? 0}
        page={page}
        pageSize={pageSize}
        projects={projects}
        orgSlug={org.slug}
      />
    </div>
  );
}
