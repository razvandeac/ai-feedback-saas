import { supabaseServer } from "@/lib/supabase-server";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import EmptyState from "@/components/empty-state";
import { notFound } from "next/navigation";

export default async function ProjectsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const sb = await supabaseServer();
  const { data: org } = await sb.from("organizations").select("id,slug,name").eq("slug", slug).single();
  if (!org) notFound();

  const { data: rows } = await sb
    .from("projects")
    .select("id, name, key, created_at")
    .eq("org_id", org.id)
    .order("created_at", { ascending: false });

  if (!rows || rows.length === 0) {
    return (
      <EmptyState
        title="No projects yet"
        description="Create your first project to start collecting feedback."
        action={<a href="/onboarding" className="inline-block border rounded-2xl px-4 py-2">Create a project</a>}
      />
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">Projects</h1>
      <div className="rounded-3xl border bg-white">
        <Table>
          <THead>
            <TR>
              <TH>Name</TH>
              <TH>Key</TH>
              <TH>Created</TH>
            </TR>
          </THead>
          <TBody>
            {rows.map(r => (
              <TR key={r.id}>
                <TD className="font-medium">{r.name}</TD>
                <TD><code className="text-xs">{r.key}</code></TD>
                <TD>{new Date(r.created_at).toLocaleDateString()}</TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </div>
    </div>
  );
}
