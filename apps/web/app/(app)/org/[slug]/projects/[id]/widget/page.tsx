export const revalidate = 0;
import { getServerSupabase } from "@/lib/supabaseServer";
import { getClientBaseUrl } from "@/lib/baseUrl";
import Link from "next/link";
import WidgetPreview from "@/components/projects/widget-preview";
import { CodeBlock } from "@/components/ui/code";
import CopyButton from "@/components/ui/copy-button";
import AllowedOriginsEditor from "@/components/projects/allowed-origins-editor";

export default async function ProjectWidgetPage({
  params
}: {
  params: Promise<{ slug: string; id: string }>
}) {
  const { slug, id } = await params;
  const sb = await getServerSupabase();

  const { data: project } = await sb
    .from("projects")
    .select("id, name, key, allowed_origins, require_project_origins")
    .eq("id", id)
    .single();
  
  if (!project) return <div className="p-6">Project not found</div>;

  const siteBase = getClientBaseUrl();

  const iframeSnippet =
`<iframe
  src="${siteBase}/embed?key=${project.key}"
  style="width:100%;max-width:420px;height:360px;border:0;border-radius:16px;overflow:hidden"
  loading="lazy"
></iframe>`;

  const scriptSnippet =
`<!-- Coming soon: drop-in button+modal script -->
<script defer src="${siteBase}/widget.es.js" data-project-key="${project.key}"></script>
<button data-vamoot-open>Send feedback</button>`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Widget</h1>
          <p className="text-sm text-neutral-500">Preview your widget and copy the embed code.</p>
        </div>
        <Link
          href={`/org/${slug}/projects/${id}/settings`}
          className="text-sm text-brand hover:underline"
        >
          Configure appearance →
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          <div className="text-sm font-medium">Live preview</div>
          <WidgetPreview projectKey={project.key} siteBase={siteBase} />
          <div className="rounded-2xl border p-3 bg-amber-50 text-amber-800 text-xs">
            Rotating the project key will require updating your embed code.
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <div className="text-sm font-medium mb-1">Project key</div>
            <div className="rounded-2xl border bg-white p-3 text-sm flex items-center justify-between">
              <code>{project.key}</code>
              <CopyButton text={project.key} />
            </div>
          </div>

          <div>
            <div className="text-sm font-medium mb-1">Iframe snippet (recommended)</div>
            <CodeBlock code={iframeSnippet} language="html" />
          </div>

          <div>
            <div className="text-sm font-medium mb-1">Script snippet (experimental)</div>
            <CodeBlock code={scriptSnippet} language="html" />
          </div>

          <div className="rounded-3xl border bg-white p-4 space-y-3">
            <AllowedOriginsEditor 
              projectId={project.id} 
              initialOrigins={project.allowed_origins as string[] | null}
              initialRequireOnly={!!(project.require_project_origins)}
            />
            <div className="flex items-start gap-2 text-xs text-neutral-600 bg-blue-50 border border-blue-200 rounded-2xl p-3">
              <span className="font-bold text-blue-900">💡</span>
              <p className="text-blue-800">
                If &quot;Require per-project list only&quot; is checked, calls from origins not listed here will be blocked even if present in the global env allow-list.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

