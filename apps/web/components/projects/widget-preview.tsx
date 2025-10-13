"use client";
import { useMemo, useState } from "react";

export default function WidgetPreview({ projectKey, siteBase }: { projectKey: string; siteBase: string }) {
  const [bg, setBg] = useState<"light"|"dark">("light");
  const [width, setWidth] = useState(420);

  const src = useMemo(() => {
    const u = new URL(`${siteBase}/embed`);
    u.searchParams.set("key", projectKey);
    return u.toString();
  }, [siteBase, projectKey]);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <label className="text-sm">Background:</label>
        <button className={`text-sm border rounded-xl px-2 py-1 ${bg==="light"?"bg-neutral-100":""}`} onClick={()=>setBg("light")}>Light</button>
        <button className={`text-sm border rounded-xl px-2 py-1 ${bg==="dark"?"bg-neutral-800 text-white":""}`} onClick={()=>setBg("dark")}>Dark</button>
        <div className="ml-4 flex items-center gap-2">
          <label className="text-sm">Width:</label>
          <input type="range" min={320} max={560} value={width} onChange={(e)=>setWidth(parseInt(e.target.value,10))} />
          <span className="text-xs text-neutral-500 w-12">{width}px</span>
        </div>
      </div>
      <div className={`rounded-3xl border p-4 ${bg==="dark" ? "bg-neutral-900" : "bg-neutral-50"}`}>
        <iframe
          title="Vamoot Widget Preview"
          src={src}
          style={{ width, height: 360, border: 0, borderRadius: 16, overflow: "hidden", background: "transparent" } as any}
          loading="lazy"
        />
      </div>
    </div>
  );
}

