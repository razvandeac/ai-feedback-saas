"use client";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

function parseTextarea(s: string) {
  return s.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
}
function toTextarea(list: string[] | null | undefined) {
  return (list ?? []).join("\n");
}

export default function AllowedOriginsEditor({
  projectId,
  initialOrigins,
  initialRequireOnly
}: {
  projectId: string;
  initialOrigins: string[] | null;
  initialRequireOnly?: boolean;
}) {
  const [text, setText] = useState<string>(toTextarea(initialOrigins));
  const [requireOnly, setRequireOnly] = useState<boolean>(!!initialRequireOnly);
  const [pending, start] = useTransition();

  async function save() {
    const arr = parseTextarea(text);
    toast.loading("Saving origins…", { id: "orig" });
    const res = await fetch(`/api/projects/${projectId}/origins`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        allowed_origins: arr.length ? arr : null,
        require_project_origins: requireOnly
      })
    });
    if (!res.ok) {
      toast.error(await res.text(), { id: "orig" });
      return;
    }
    toast.success("Saved", { id: "orig" });
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="text-sm font-medium">Allowed origins (one per line)</label>
        <textarea
          className="w-full min-h-[120px] rounded-2xl border p-3 text-sm"
          placeholder="Examples:
https://app.acme.com
*.acme.com
http://localhost:3000"
          value={text}
          onChange={(e)=>setText(e.target.value)}
        />
        <div className="text-xs text-neutral-500 mt-1">
          Supports full origins (https://app.example.com) or wildcard subdomains like <code>*.example.com</code>.
          Leave empty to fall back to global env allow-list.
        </div>
      </div>

      <div className="flex items-center justify-between rounded-2xl border bg-blue-50 border-blue-200 p-3">
        <div className="flex-1">
          <div className="text-sm font-medium text-blue-900">Project-only mode</div>
          <div className="text-xs text-blue-800">
            Ignore global env origins and use ONLY this project&apos;s list. Enables complete CORS isolation.
          </div>
        </div>
        <Switch checked={requireOnly} onCheckedChange={setRequireOnly} />
      </div>

      <div className="flex justify-end">
        <Button onClick={()=>start(save)} disabled={pending}>Save</Button>
      </div>
    </div>
  );
}

