"use client";
import React from "react";
import { useDroppable } from "@dnd-kit/core";

export function DropZone({ id, depth = 0, size = "sm" }: { id: string; depth?: number; size?: "sm"|"lg" }) {
  const { isOver, setNodeRef } = useDroppable({ id });
  const h = size === "lg" ? 24 : 8;
  return (
    <div ref={setNodeRef} className="my-1"
      style={{
        height: h,
        marginLeft: depth * 12,
        borderRadius: 4,
        background: isOver ? "rgba(59,130,246,0.35)" : "transparent",
        outline: "1px dashed rgba(0,0,0,0.12)",
        outlineOffset: -4,
      }}
    />
  );
}
