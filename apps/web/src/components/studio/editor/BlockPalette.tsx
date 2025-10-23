"use client";
import React, { useMemo, useState } from "react";
import { listBlockTypes } from "@/src/lib/studio/blocks/registry";

export function BlockPalette({ onInsert }: { onInsert: (type: string) => void }) {
  const all = useMemo(() => listBlockTypes(), []);
  const [q, setQ] = useState("");
  const items = useMemo(() => all.filter(t => t.includes(q.toLowerCase())), [all, q]);

  return (
    <div className="p-2 border rounded-lg bg-white dark:bg-neutral-900">
      <input className="w-full border rounded px-2 py-1 mb-2" placeholder="Search blocks…" value={q} onChange={e => setQ(e.target.value)} />
      <div className="grid grid-cols-2 gap-2">
        {items.map(t => (
          <button key={t} onClick={() => onInsert(t)} className="border rounded px-2 py-1 hover:bg-neutral-50 dark:hover:bg-neutral-800">
            {t}
          </button>
        ))}
      </div>
    </div>
  );
}
