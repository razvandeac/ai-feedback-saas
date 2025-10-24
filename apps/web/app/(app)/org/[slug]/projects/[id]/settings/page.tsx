import EmbedSnippet from "@/components/projects/embed-snippet";
import Link from "next/link";
import { getProjectWithWidget } from "@/src/server/projects/repo";

export const revalidate = 0;

export default async function ProjectSettingsPage({
  params
}: {
  params: Promise<{ slug: string; id: string }>
}) {
  const { slug, id } = await params;
  
  // Get project with widget information
  const proj = await getProjectWithWidget(id);
  if (!proj) return <div className="p-6">Project not found</div>;

  // For now, skip widget operations until migration is applied
  // TODO: Re-enable widget operations after migration

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold">{proj.name} Settings</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Configure project settings and embed code. Widget Studio temporarily disabled until migration is applied.
        </p>
      </div>
      
      {/* Widget operations disabled until migration is applied */}
      <div className="rounded-2xl border bg-amber-50 p-4 text-amber-800">
        <p className="text-sm">
          <strong>Widget Studio temporarily disabled</strong> - Database migration needs to be applied first.
        </p>
      </div>
      
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div>
            <h2 className="text-sm font-medium mb-2">Project Information</h2>
            <div className="rounded-2xl border bg-white p-4">
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium">Project ID:</span>
                  <span className="text-sm text-neutral-600 ml-2">{proj.id}</span>
                </div>
                <div>
                  <span className="text-sm font-medium">Project Key:</span>
                  <span className="text-sm text-neutral-600 ml-2">{proj.key}</span>
                </div>
              </div>
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