"use client";
import { useEffect } from "react";

export function useKeyboard(opts: {
  getIdsInOrder: () => string[];       // returns visible top-level ids
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  undo: () => void;
  redo: () => void;
  onDeleteSelected: () => void;        // deletes currently selected block
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const isMac = navigator.platform.toLowerCase().includes("mac");
      const mod = isMac ? e.metaKey : e.ctrlKey;

      // Undo / Redo
      if (mod && e.key.toLowerCase() === "z" && !e.shiftKey) { e.preventDefault(); opts.undo(); return; }
      if ((mod && e.key.toLowerCase() === "z" && e.shiftKey) || (mod && e.key.toLowerCase() === "y")) { e.preventDefault(); opts.redo(); return; }

      // Navigation on top-level list
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        const ids = opts.getIdsInOrder();
        if (ids.length === 0) return;
        const cur = opts.selectedId ? ids.indexOf(opts.selectedId) : -1;
        const next = e.key === "ArrowDown" ? Math.min(cur + 1, ids.length - 1) : Math.max((cur === -1 ? 0 : cur - 1), 0);
        opts.setSelectedId(ids[next]);
      }

      // Delete selected
      if ((e.key === "Delete" || e.key === "Backspace") && opts.selectedId) {
        e.preventDefault();
        opts.onDeleteSelected();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [opts]);
}
