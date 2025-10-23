"use client";
import React from "react";

export function SaveBanner({ saving, lastSavedAt, error }: { saving: boolean; lastSavedAt: number | null; error: string | null }) {
  return (
    <div className="fixed bottom-4 right-4 rounded-lg shadow px-3 py-2 bg-white/90 dark:bg-neutral-900/90 border">
      {error ? <span className="text-red-600">Save error: {error}</span>
        : saving ? <span>Saving…</span>
        : lastSavedAt ? <span>Saved</span> : <span>Ready</span>}
    </div>
  );
}
