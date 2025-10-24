"use client";
import React from "react";
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
  rectIntersection,
  DragOverlay,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Block } from "@/src/lib/studio/blocks/types";
import { DropZone } from "./DropZone";
import {
  findPathById,
  insertAtPath,
  removeAtPath,
  ROOT_ID,
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

type Props = {
  parentId: string;              // NEW: id of the parent container (ROOT_ID for top level)
  blocks: Block[];
  depth?: number;
  onChange: (next: Block[]) => void;
  renderBlock: (b: Block) => React.ReactNode;
};

export function SortableTree({ parentId, blocks, depth = 0, onChange, renderBlock }: Props) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over) return;

    const overId = String(over.id);
    const activeId = String(active.id);

    // 1) Handle drop on a DropZone (insert into a specific parent/index)
    if (overId.startsWith("dz:")) {
      // dz:<parentId>:<index>
      const [, parent, indexStr] = overId.split(":");
      const index = parseInt(indexStr, 10);

      const fromPath = findPathById(blocks, activeId);
      if (!fromPath) return;

      const { next, removed } = removeAtPath(blocks, fromPath);

      // parent ROOT => insert at top-level
      if (parent === ROOT_ID) {
        const result = insertAtPath(next, [index], removed);
        onChange(result);
        return;
      }

      // find parent path by id
      const parentPath = findPathById(next, parent);
      if (!parentPath) return;

      const targetPath = [...parentPath, index];
      const result = insertAtPath(next, targetPath, removed);
      onChange(result);
      return;
    }

    // 2) Handle drop on another item (same-parent reorder)
    if (activeId !== overId) {
      const fromPath = findPathById(blocks, activeId);
      const toPath = findPathById(blocks, overId);
      if (!fromPath || !toPath) return;

      // Same parent → remove then insert at new index
      if (fromPath.length === toPath.length && fromPath.slice(0, -1).every((v, i) => v === toPath[i])) {
        const parentPath = fromPath.slice(0, -1);
        const { next, removed } = removeAtPath(blocks, fromPath);
        const index = toPath[toPath.length - 1];
        const result = insertAtPath(next, [...parentPath, index], removed);
        onChange(result);
      }
    }
  }

  // SortableContext items: only actual block ids at this level
  const items = blocks.map(b => b.id);

      return (
        <DndContext
          sensors={sensors}
          collisionDetection={rectIntersection}  // IMPORTANT for DropZones
          onDragEnd={handleDragEnd}
        >
          {/* Leading DropZone to insert at index 0 */}
          <DropZone id={`dz:${parentId}:0`} depth={depth} size={blocks.length === 0 ? "lg" : "sm"} />

          <SortableContext items={items} strategy={verticalListSortingStrategy}>
            {blocks.map((b, i) => (
              <div key={b.id} className="mb-2">
                <SortableRow block={b}>
                  {renderBlock(b)}
                </SortableRow>

                {/* DropZone between items i and i+1 */}
                <DropZone id={`dz:${parentId}:${i + 1}`} depth={depth} />
              </div>
            ))}
          </SortableContext>

          <DragOverlay />
        </DndContext>
      );
}
