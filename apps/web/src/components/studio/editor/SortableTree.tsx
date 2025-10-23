"use client";
import React from "react";
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  DragOverlay,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Block } from "@/src/lib/studio/blocks/types";
import {
  findPathById,
  insertAtPath,
  removeAtPath,
} from "./tree";

function SortableRow({ block, children }: { block: Block; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
}

export function SortableTree({
  blocks,
  onChange,
  renderBlock,
}: {
  blocks: Block[];
  onChange: (next: Block[]) => void;
  renderBlock: (b: Block) => React.ReactNode; // this renders ONE block (with BlockRenderer inside)
}) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;

    const fromPath = findPathById(blocks, String(active.id));
    const toPath = findPathById(blocks, String(over.id));
    if (!fromPath || !toPath) return;

    // Same parent: reorder via arrayMove
    if (fromPath.length === toPath.length && fromPath.slice(0, -1).every((v, i) => v === toPath[i])) {
      const parentPath = fromPath.slice(0, -1);
      // Remove, then insert at new index within same array
      const { next, removed } = removeAtPath(blocks, fromPath);
      const newIndex = toPath[toPath.length - 1];
      const next2 = insertAtPath(next, [...parentPath, newIndex], removed);
      onChange(next2);
      return;
    }

    // Different parents: remove at fromPath, insert at toPath parent
    const { next, removed } = removeAtPath(blocks, fromPath);
    const insertIndex = toPath[toPath.length - 1];
    const parentPath = toPath.slice(0, -1);
    const next2 = insertAtPath(next, [...parentPath, insertIndex], removed);
    onChange(next2);
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={flattenIds(blocks)} strategy={verticalListSortingStrategy}>
        {blocks.map((b) => (
          <div key={b.id} className="mb-2">
            <SortableRow block={b}>
              {renderBlock(b)}
            </SortableRow>
          </div>
        ))}
      </SortableContext>
      <DragOverlay />
    </DndContext>
  );
}

function flattenIds(items: Block[]): string[] {
  // The SortableContext needs a list; we only need top-level here.
  return items.map((b) => b.id);
}
