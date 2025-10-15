"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type WidgetSettings = {
  theme?: string;
  primaryColor?: string;
  logoUrl?: string;
  showRating?: boolean;
  showComment?: boolean;
  title?: string;
};

export default function WidgetConfigForm({ projectId, initial }: { projectId: string; initial: WidgetSettings }) {
  const [settings, setSettings] = useState({
    theme: initial.theme || "light",
    primaryColor: initial.primaryColor || "#2563eb",
    logoUrl: initial.logoUrl || "",
    showRating: initial.showRating ?? true,
    showComment: initial.showComment ?? true,
    title: initial.title || "We value your feedback!"
  });
  const [pending, setPending] = useState(false);

  function update<K extends keyof typeof settings>(k: K, v: typeof settings[K]) {
    setSettings(s => ({ ...s, [k]: v }));
  }

  async function save() {
    setPending(true);
    toast.loading("Saving…", { id: "cfg" });
    try {
      const res = await fetch(`/api/projects/${projectId}/config`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ settings })
      });
      if (!res.ok) {
        toast.error("Failed", { id: "cfg" });
      } else {
        toast.success("Saved", { id: "cfg" });
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="rounded-3xl border bg-white p-4 space-y-4 max-w-lg">
      <div>
        <label className="block text-sm font-medium mb-1">Title</label>
        <Input value={settings.title} onChange={e=>update("title", e.target.value)} />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Primary color</label>
        <Input type="color" value={settings.primaryColor} onChange={e=>update("primaryColor", e.target.value)} />
      </div>
      <div className="flex items-center justify-between">
        <label className="text-sm">Show rating</label>
        <Switch checked={settings.showRating} onCheckedChange={v=>update("showRating", v)} />
      </div>
      <div className="flex items-center justify-between">
        <label className="text-sm">Show comment</label>
        <Switch checked={settings.showComment} onCheckedChange={v=>update("showComment", v)} />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Logo URL (optional)</label>
        <Input value={settings.logoUrl} onChange={e=>update("logoUrl", e.target.value)} />
      </div>
      <div className="flex justify-end">
        <Button onClick={save} disabled={pending}>Save</Button>
      </div>
    </div>
  );
}

