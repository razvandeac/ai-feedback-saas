"use client";
import React from "react";

export function DragHandle({ setRef }: { setRef: (el: HTMLDivElement | null) => void }) {
  return (
    <div
      ref={setRef as React.RefCallback<HTMLDivElement>}
      title="Drag"
      className="h-6 w-6 flex items-center justify-center rounded border border-neutral-300 bg-white text-neutral-500 cursor-grab hover:bg-neutral-50 active:cursor-grabbing"
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.preventDefault()}
      aria-label="Drag"
    >
      {/* grip icon */}
      <svg width="14" height="14" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="2">
        <circle cx="7" cy="7" r="1"/><circle cx="12" cy="7" r="1"/><circle cx="17" cy="7" r="1"/>
        <circle cx="7" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="17" cy="12" r="1"/>
      </svg>
    </div>
  );
}
