export const revalidate = 0;
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { getClientBaseUrl } from "@/lib/baseUrl";
import Link from "next/link";
import WidgetPreview from "@/components/projects/widget-preview";
import { CodeBlock } from "@/components/ui/code";
import CopyButton from "@/components/ui/copy-button";
import AllowedOriginsEditor from "@/components/projects/allowed-origins-editor";
import { getProjectWithWidget, ensureProjectWidget } from "@/src/server/projects/repo";
import BlockRenderer from "@/src/components/studio/BlockRenderer";

export default async function ProjectWidgetPage({
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
  const cfg = proj.widget?.published_config ?? proj.widget?.widget_config;

  const siteBase = getClientBaseUrl();

  const iframeSnippet =
`<iframe
  src="${siteBase}/embed?key=${proj.key}"
  style="width:100%;max-width:420px;height:360px;border:0;border-radius:16px;overflow:hidden"
  loading="lazy"
></iframe>`;

  const scriptSnippet =
`<!-- Coming soon: drop-in button+modal script -->
<script defer src="${siteBase}/widget.es.js" data-project-key="${proj.key}"></script>
<button data-vamoot-open>Send feedback</button>`;

  return (
    <div className="p-6 space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Preview</h1>
        <div className="flex gap-2">
          <Link href={`/org/${slug}/projects/${id}/studio/${widgetId}`}>
            <button className="text-sm text-brand hover:underline">Edit in Studio →</button>
          </Link>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          <div className="text-sm font-medium">Live preview</div>
          <div className="rounded-2xl border bg-white p-6">
            <BlockRenderer blocks={cfg?.blocks ?? []} />
          </div>
          <div className="rounded-2xl border p-3 bg-amber-50 text-amber-800 text-xs">
            This preview renders the <b>published</b> version. Edit in Studio and click Publish to update.
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <div className="text-sm font-medium mb-1">Project key</div>
            <div className="rounded-2xl border bg-white p-3 text-sm flex items-center justify-between">
              <code>{proj.key}</code>
              <CopyButton text={proj.key} />
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
              projectId={proj.id} 
              initialOrigins={proj.allowed_origins as string[] | null}
              initialRequireOnly={!!(proj.require_project_origins)}
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