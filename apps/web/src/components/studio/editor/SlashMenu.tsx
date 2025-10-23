"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { listBlockTypes } from "@/src/lib/studio/blocks/registry";

export function SlashMenu({ onPick, anchorRef }: { onPick: (t: string) => void; anchorRef: React.RefObject<HTMLElement> }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const all = useMemo(() => listBlockTypes(), []);
  const items = useMemo(() => all.filter(t => t.includes(q.toLowerCase())).slice(0, 8), [all, q]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "/" && document.activeElement && anchorRef.current?.contains(document.activeElement)) {
        setOpen(true);
        setQ("");
      } else if (open && e.key === "Escape") {
        setOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, anchorRef]);

  if (!open) return null;
  return (
    <div className="absolute z-50 mt-2 w-64 border rounded bg-white dark:bg-neutral-900 shadow">
      <input className="w-full border-b px-2 py-1" autoFocus placeholder="Type to search…" value={q} onChange={e => setQ(e.target.value)} />
      {items.map(t => (
        <button key={t} className="w-full text-left px-2 py-1 hover:bg-neutral-50 dark:hover:bg-neutral-800" onClick={() => { onPick(t); setOpen(false); }}>
          {t}
        </button>
      ))}
    </div>
  );
}
