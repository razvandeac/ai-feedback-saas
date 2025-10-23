"use client";
import { useEffect, useRef } from "react";
import { WidgetConfig } from "@/src/lib/studio/WidgetConfigSchema";

type SaveFn = (config: WidgetConfig) => Promise<void>;

export function useAutosave(opts: {
  config: WidgetConfig;
  dirty: boolean;
  setDirty: (b: boolean) => void;
  setSaving: (b: boolean) => void;
  setSaveError: (m: string | null) => void;
  setLastSavedAt: (n: number) => void;
  save: SaveFn;
  debounceMs?: number;
}) {
  const { config, dirty, setDirty, setSaving, setSaveError, setLastSavedAt, save, debounceMs = 700 } = opts;
  const timer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!dirty) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      setSaving(true);
      setSaveError(null);
      try {
        await save(config); // optimistic: config already applied
        setDirty(false);
        setLastSavedAt(Date.now());
      } catch (e: any) {
        setSaveError(e?.message ?? "Save failed");
      } finally {
        setSaving(false);
      }
    }, debounceMs);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [config, dirty, debounceMs, save, setDirty, setSaving, setSaveError, setLastSavedAt]);
}
