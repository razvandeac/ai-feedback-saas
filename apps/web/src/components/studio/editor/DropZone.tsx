"use client";
import React from "react";
import { useDroppable } from "@dnd-kit/core";

export function DropZone({
  id, depth = 0, size = "sm", dragging = false, label,
}: { id: string; depth?: number; size?: "sm"|"lg"; dragging?: boolean; label?: string }) {
  const { isOver, setNodeRef } = useDroppable({ id });
  if (!dragging) return null; // only show while dragging

  const h = size === "lg" ? 36 : 14;
  return (
    <div
      ref={setNodeRef}
      className="my-1 flex items-center"
      style={{
        height: h,
        marginLeft: depth * 14,
        borderRadius: 6,
        background: isOver ? "rgba(59,130,246,0.20)" : "rgba(0,0,0,0.03)",
        outline: isOver ? "2px solid rgba(59,130,246,0.55)" : "1px dashed rgba(0,0,0,0.18)",
        outlineOffset: -4,
      }}
    >
      <span className="text-[11px] px-2 text-neutral-500 select-none">{label ?? "Move here"}</span>
    </div>
  );
}
