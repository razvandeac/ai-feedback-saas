"use client";
import React from "react";

export function IconButton({ title, onClick }: { title: string; onClick: () => void }) {
  return (
    <button
      title={title}
      aria-label={title}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-white border border-neutral-300 shadow-sm hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
      style={{ pointerEvents: "auto" }}
    >
      {/* Trash icon */}
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="3 6 5 6 21 6"/>
        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
        <path d="M10 11v6M14 11v6"/>
        <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/>
      </svg>
    </button>
  );
}
