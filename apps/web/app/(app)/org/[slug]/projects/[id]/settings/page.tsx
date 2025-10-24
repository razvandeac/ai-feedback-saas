import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import EmbedSnippet from "@/components/projects/embed-snippet";
import Link from "next/link";
import { getProjectWithWidget, ensureProjectWidget } from "@/src/server/projects/repo";

export const revalidate = 0;

export default async function ProjectSettingsPage({
  params
}: {
  params: Promise<{ slug: string; id: string }>
}) {
  const { slug, id } = await params;
  const adminSupabase = getSupabaseAdmin();
  
  // Get project with widget information
  const proj = await getProjectWithWidget(id);
  if (!proj) return <div className="p-6">Project not found</div>;

  // Ensure widget exists for this project
  const widgetId = proj.widget?.id || await ensureProjectWidget(proj.id, proj.org_id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold">{proj.name} Settings</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Configure project settings and embed code. Use Studio to customize widget appearance.
        </p>
      </div>
      
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div>
            <h2 className="text-sm font-medium mb-2">Widget Configuration</h2>
            <div className="rounded-2xl border bg-white p-4">
              <p className="text-sm text-neutral-600 mb-3">
                Customize your widget's appearance and behavior in Studio.
              </p>
              <Link href={`/org/${slug}/projects/${id}/studio/${widgetId}`}>
                <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                  Open Studio
                </button>
              </Link>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <EmbedSnippet projectKey={proj.key} />
        </div>
      </div>
    </div>
  );
}