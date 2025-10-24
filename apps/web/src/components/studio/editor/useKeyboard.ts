"use client";
import { useEffect } from "react";
import { useEditorCtx } from "./EditorContext";
import { BlockWithLegacy } from "@/src/lib/studio/blocks/types";

export function useKeyboard(opts: {
  undo: () => void;
  redo: () => void;
  blocks: BlockWithLegacy[];
}) {
  const { selectedId, setSelectedId } = useEditorCtx();

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
      } else if (e.key === "ArrowDown" && !mod) {
        e.preventDefault();
        const currentIndex = opts.blocks.findIndex(b => b.id === selectedId);
        if (currentIndex < opts.blocks.length - 1) {
          setSelectedId(opts.blocks[currentIndex + 1].id);
        }
      } else if (e.key === "ArrowUp" && !mod) {
        e.preventDefault();
        const currentIndex = opts.blocks.findIndex(b => b.id === selectedId);
        if (currentIndex > 0) {
          setSelectedId(opts.blocks[currentIndex - 1].id);
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        setSelectedId(null);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [opts, selectedId, setSelectedId]);
}
