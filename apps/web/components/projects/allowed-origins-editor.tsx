"use client";
import { useEffect, useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { isValidOriginEntry } from "@/lib/origin-validate";

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
  const [loading, setLoading] = useState(true);
  const [pending, start] = useTransition();

  useEffect(() => {
    (async () => {
      setLoading(true);
      const r = await fetch(`/api/projects/${projectId}/origins`);
      const j = await r.json();
      if (r.ok) {
        setText(toTextarea(j.allowed_origins));
        setRequireOnly(!!j.require_project_origins);
      }
      setLoading(false);
    })();
  }, [projectId]);

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

  const lines = useMemo(() => text.split(/\r?\n/), [text]);
  const lineValidity = useMemo(() => lines.map(l => !l.trim() || isValidOriginEntry(l)), [lines]);
  const hasInvalid = lineValidity.some(v => v === false);

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Allowed origins (one per line)</label>
      <textarea
        className={`w-full min-h-[140px] rounded-2xl border p-3 text-sm ${hasInvalid ? "border-red-500" : ""}`}
        placeholder="Examples:
https://app.acme.com
*.acme.com
http://localhost:3000"
        value={text}
        onChange={(e)=>setText(e.target.value)}
      />
      {hasInvalid && (
        <div className="text-xs text-red-600">
          One or more lines are invalid. Each line must be a full origin (https://app.example.com),
          a wildcard like <code>*.example.com</code>, or a host (example.com / localhost:3000).
        </div>
      )}
      {lines.map((l, i) => !lineValidity[i] ? (
        <div key={i} className="text-[11px] text-red-600">Line {i+1}: &quot;{l}&quot; is not a valid origin.</div>
      ) : null)}

      <div className="mt-2 flex items-center gap-2">
        <input
          id="require-only"
          type="checkbox"
          checked={requireOnly}
          onChange={(e)=>setRequireOnly(e.target.checked)}
        />
        <label htmlFor="require-only" className="text-sm">
          Require per-project list only (ignore global env allow-list)
        </label>
      </div>
      <div className="text-xs text-neutral-500">
        Supports full origins (https://app.example.com) or wildcard subdomains like <code>*.example.com</code>.
        Leave empty to fall back to global env allow-list.
      </div>
      <div className="flex justify-end">
        <Button onClick={()=>start(save)} disabled={pending || hasInvalid || loading}>Save</Button>
      </div>
    </div>
  );
}

