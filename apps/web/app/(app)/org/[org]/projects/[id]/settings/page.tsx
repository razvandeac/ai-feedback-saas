import React from "react";
import { getProjectWithWidget } from "@/src/server/projects/repo";
import BlockRenderer from "@/components/studio/BlockRenderer";
import Link from "next/link";

export default async function ProjectSettings({ 
  params 
}: { 
  params: Promise<{ org: string; id: string }> 
}) {
  const { org, id } = await params;
  const proj = await getProjectWithWidget(id);
  const cfg = proj.widget?.published_config ?? proj.widget?.widget_config;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-lg font-semibold">Settings</h1>

      <section className="space-y-2">
        <h2 className="text-base font-medium">Embed</h2>
        <pre className="rounded bg-neutral-50 p-3 text-xs overflow-auto">{`
<script src="https://cdn.vamoot.js" async></script>
<div id="vamoot-widget" data-project="${proj.id}" data-widget="${proj.widget?.id}"></div>`}</pre>
        <Link 
          href={`/org/${org}/projects/${proj.id}/studio/${proj.widget?.id}`}
          className="text-sm underline"
        >
          Edit in Studio →
        </Link>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-medium">Published preview</h2>
        <div className="rounded-2xl border bg-white p-6">
          <BlockRenderer blocks={cfg?.blocks ?? []} />
        </div>
      </section>
    </div>
  );
}
