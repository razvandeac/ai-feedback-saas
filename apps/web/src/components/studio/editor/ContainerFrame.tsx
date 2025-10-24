"use client";
import React from "react";
import { useDroppable } from "@dnd-kit/core";

export function ContainerFrame({ id, children }: { id: string; children: React.ReactNode }) {
  const { isOver, setNodeRef } = useDroppable({ id: `container:${id}` });
  return (
    <div
      ref={setNodeRef}
      className={isOver ? "rounded bg-blue-50/60 p-2" : "rounded p-2"}
      style={{ transition: "background 120ms ease" }}
    >
      {children}
    </div>
  );
}
