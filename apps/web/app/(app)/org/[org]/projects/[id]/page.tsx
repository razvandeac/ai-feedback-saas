import React from "react";
import { getProjectWithWidget, ensureProjectWidget } from "@/src/server/projects/repo";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function ProjectOverview({ 
  params 
}: { 
  params: Promise<{ org: string; id: string }> 
}) {
  const { org, id } = await params;
  const proj = await getProjectWithWidget(id);
  const widgetId = proj.widget?.id || await ensureProjectWidget(proj.id, proj.org_id);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-lg font-semibold">{proj.name}</h1>
      <div className="flex gap-2">
        <Link href={`/org/${org}/projects/${proj.id}/studio/${widgetId}`}>
          <Button className="bg-blue-600 text-white hover:bg-blue-700">Open Studio</Button>
        </Link>
        <Link href={`/org/${org}/projects/${proj.id}/widget`}>
          <Button variant="outline">Preview</Button>
        </Link>
        <form action={`/api/studio/widgets/${widgetId}/publish`} method="post">
          <input type="hidden" name="orgId" value={proj.org_id} />
          <Button type="submit" variant="outline">Publish</Button>
        </form>
      </div>
    </div>
  );
}
