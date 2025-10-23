"use client";
import { useEffect } from "react";

export function useKeyboard(opts: {
  undo: () => void;
  redo: () => void;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const isMac = navigator.platform.toLowerCase().includes("mac");
      const mod = isMac ? e.metaKey : e.ctrlKey;
      if (mod && e.key.toLowerCase() === "z" && !e.shiftKey) {
        e.preventDefault();
        opts.undo();
      } else if ((mod && e.key.toLowerCase() === "z" && e.shiftKey) || (mod && e.key.toLowerCase() === "y")) {
        e.preventDefault();
        opts.redo();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [opts]);
}
