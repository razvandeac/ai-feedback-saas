"use client";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

function parseTextarea(s: string) {
  return s.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
}
function toTextarea(list: string[] | null | undefined) {
  return (list ?? []).join("\n");
}

export default function AllowedOriginsEditor({ projectId, initial }: { projectId: string; initial: string[] | null }) {
  const [text, setText] = useState<string>(toTextarea(initial));
  const [pending, start] = useTransition();

  async function save() {
    const arr = parseTextarea(text);
    toast.loading("Saving origins…", { id: "orig" });
    const res = await fetch(`/api/projects/${projectId}/origins`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ allowed_origins: arr.length ? arr : null })
    });
    if (!res.ok) {
      toast.error(await res.text(), { id: "orig" });
      return;
    }
    toast.success("Saved", { id: "orig" });
  }

  return (
    <div className="space-y-2">
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
      <div className="text-xs text-neutral-500">
        Supports full origins (https://app.example.com) or wildcard subdomains like <code>*.example.com</code>.
        Leave empty to fall back to global env allow-list.
      </div>
      <div className="flex justify-end">
        <Button onClick={()=>start(save)} disabled={pending}>Save</Button>
      </div>
    </div>
  );
}

