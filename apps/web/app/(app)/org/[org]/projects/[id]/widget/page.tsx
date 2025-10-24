import React from "react";
import BlockRenderer from "@/src/components/studio/BlockRenderer";
import { getProjectWithWidget, ensureProjectWidget } from "@/src/server/projects/repo";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function ProjectWidgetPage({ 
  params 
}: { 
  params: Promise<{ org: string; id: string }> 
}) {
  const { org, id } = await params;
  const proj = await getProjectWithWidget(id);
  const widgetId = proj.widget?.id || await ensureProjectWidget(proj.id, proj.org_id);
  const cfg = proj.widget?.published_config ?? proj.widget?.widget_config;

  return (
    <div className="p-6 space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Preview</h1>
        <div className="flex gap-2">
          <Link href={`/org/${org}/projects/${proj.id}/studio/${widgetId}`}>
            <Button variant="outline">Edit in Studio</Button>
          </Link>
          <form action={`/api/studio/widgets/${widgetId}/publish`} method="post">
            <input type="hidden" name="orgId" value={proj.org_id} />
            <Button type="submit" variant="outline">Publish</Button>
          </form>
        </div>
      </header>

      <div className="rounded-2xl border bg-white p-6">
        <BlockRenderer blocks={cfg?.blocks ?? []} />
      </div>

      <p className="text-xs text-neutral-500">
        Preview shows the <b>published</b> version. Edit in Studio and Publish to update.
      </p>
    </div>
  );
}
