"use client";
import { useCallback, useMemo, useRef, useState, useEffect } from "react";
import { WidgetConfig } from "@/src/lib/studio/WidgetConfigSchema";
import { BlockSchema } from "@/src/lib/studio/blocks/types";
import { z } from "zod";

type HistoryEntry = { config: WidgetConfig; ts: number };

const MAX_HISTORY = 50;

export function useEditorState(initial: WidgetConfig) {
  const [config, setConfig] = useState<WidgetConfig>(initial);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);

  const undoStack = useRef<HistoryEntry[]>([{ config: initial, ts: Date.now() }]);
  const redoStack = useRef<HistoryEntry[]>([]);

  const snapshot = useCallback((next: WidgetConfig) => {
    const top = undoStack.current[undoStack.current.length - 1];
    if (top && JSON.stringify(top.config) === JSON.stringify(next)) return;
    undoStack.current.push({ config: next, ts: Date.now() });
    if (undoStack.current.length > MAX_HISTORY) undoStack.current.shift();
    redoStack.current = [];
  }, []);

  // Capture structural changes (DnD, block additions/removals)
  useEffect(() => {
    snapshot(config);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(config.blocks)]);

  const setConfigWithHistory = useCallback((updater: (prev: WidgetConfig) => WidgetConfig) => {
    setConfig(prev => {
      const next = updater(prev);
      snapshot(next);
      setDirty(true);
      return next;
    });
  }, [snapshot]);

  const canUndo = undoStack.current.length > 1;
  const canRedo = redoStack.current.length > 0;

  const undo = useCallback(() => {
    if (!canUndo) return;
    const current = undoStack.current.pop();
    if (!current) return;
    const prev = undoStack.current[undoStack.current.length - 1];
    if (prev) {
      redoStack.current.push(current);
      setConfig(prev.config);
      setDirty(true);
    }
  }, [canUndo]);

  const redo = useCallback(() => {
    if (!canRedo) return;
    const next = redoStack.current.pop();
    if (!next) return;
    undoStack.current.push(next);
    setConfig(next.config);
    setDirty(true);
  }, [canRedo]);

  // Validation
  const issues = useMemo(() => {
    try {
      // Validate blocks only. Theme is already safe by schema defaults.
      const result = z.object({ blocks: z.array(BlockSchema) }).safeParse({ blocks: config.blocks });
      if (!result.success) {
        return result.error.issues.map(i => ({ path: i.path.join("."), message: i.message }));
      }
      return [];
    } catch {
      return [{ path: "", message: "Validation failed" }];
    }
  }, [config]);

  return {
    config, setConfig, setConfigWithHistory,
    dirty, setDirty,
    saving, setSaving,
    saveError, setSaveError,
    lastSavedAt, setLastSavedAt,
    undo, redo, canUndo, canRedo,
    issues
  };
}
