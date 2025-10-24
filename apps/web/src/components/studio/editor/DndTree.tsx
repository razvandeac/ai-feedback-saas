"use client";
import React, { useState } from "react";
import {
  DndContext, DragEndEvent, PointerSensor, useSensor, useSensors, rectIntersection,
} from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Block } from "@/src/lib/studio/blocks/types";
import { ROOT_ID, findPathById, insertAtPath, removeAtPath, getChildrenAtPath } from "./tree";
import { DropZone } from "./DropZone";
import { DragHandle } from "@/src/components/common/DragHandle";
import { ContainerFrame } from "./ContainerFrame";

function Row({ block, children }: { block: Block; children: React.ReactNode }) {
  // Use activator handle only
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });
  const style: React.CSSProperties = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.6 : 1 };

  return (
    <div ref={setNodeRef} style={style}>
      <div className="flex items-start gap-2">
        <DragHandle setRef={setActivatorNodeRef} />
        <div className="flex-1" {...attributes} {...listeners /* still needed for keyboard dnd */}>
          {children}
        </div>
      </div>
    </div>
  );
}

function Level({
  parentId, blocks, depth, dragging, renderBlock,
}: {
  parentId: string; blocks: Block[]; depth: number; dragging: boolean;
  renderBlock: (b: Block) => React.ReactNode;
}) {
  return (
    <>
      <DropZone
        id={`dz:${parentId}:0`}
        depth={depth}
        size={blocks.length === 0 ? "lg" : "sm"}
        dragging={dragging}
        label={blocks.length === 0 ? "Drop inside container" : "Drop at start"}
      />
      <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
        {blocks.map((b, i) => (
          <div key={b.id} className="mb-2">
            <Row block={b}>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {Array.isArray((b as any).data?.children) ? (
                <ContainerFrame id={b.id}>
                  {renderBlock(b)}
                </ContainerFrame>
              ) : (
                renderBlock(b)
              )}
            </Row>
            <DropZone id={`dz:${parentId}:${i+1}`} depth={depth} dragging={dragging} />
            {/* If container, render its children recursively */}
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {Array.isArray((b as any).data?.children) && (
              <div className="ml-3 mt-2">
                <Level
                  parentId={b.id}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  blocks={(b as any).data.children}
                  depth={depth + 1}
                  dragging={dragging}
                  renderBlock={renderBlock}
                />
              </div>
            )}
          </div>
        ))}
      </SortableContext>
    </>
  );
}

export function DndTree({
  blocks, onChange, renderBlock,
}: { blocks: Block[]; onChange: (next: Block[]) => void; renderBlock: (b: Block) => React.ReactNode; }) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const [dragging, setDragging] = useState(false);

  function handleDragStart() { setDragging(true); }
  function handleDragEnd(e: DragEndEvent) {
    setDragging(false);
    const { active, over } = e;
    if (!over) return;
    const activeId = String(active.id);
    const overId = String(over.id);

    // 1) Drop on an explicit slot
    if (overId.startsWith("dz:")) {
      const [, parentId, idxStr] = overId.split(":");
      const insertIndex = Number(idxStr);
      const fromPath = findPathById(blocks, activeId);
      if (!fromPath) return;
      const { next, removed } = removeAtPath(blocks, fromPath);

      if (parentId === ROOT_ID) {
        onChange(insertAtPath(next, [insertIndex], removed));
        return;
      }
      const parentPath = findPathById(next, parentId);
      if (!parentPath) return;
      onChange(insertAtPath(next, [...parentPath, insertIndex], removed));
      return;
    }

    // 2) NEW: Drop on container frame -> insert at end
    if (overId.startsWith("container:")) {
      const containerId = overId.split(":")[1];
      const fromPath = findPathById(blocks, activeId);
      if (!fromPath) return;
      const { next, removed } = removeAtPath(blocks, fromPath);

      if (containerId === ROOT_ID) {
        // (not used; root handled by dz: slots)
        onChange(insertAtPath(next, [getChildrenAtPath(next, []).length], removed));
        return;
      }
      const parentPath = findPathById(next, containerId);
      if (!parentPath) return;
      // compute end index = current children length
      const endIdx = getChildrenAtPath(next, parentPath).length;
      onChange(insertAtPath(next, [...parentPath, endIdx], removed));
      return;
    }

    // 3) Same-parent reorder by dropping on another item
    const fromPath = findPathById(blocks, activeId);
    const toPath = findPathById(blocks, overId);
    if (!fromPath || !toPath) return;
    const sameParent = fromPath.length === toPath.length && fromPath.slice(0, -1).every((v, i) => v === toPath[i]);
    if (sameParent) {
      const parentPath = fromPath.slice(0, -1);
      const { next, removed } = removeAtPath(blocks, fromPath);
      const idx = toPath[toPath.length - 1];
      onChange(insertAtPath(next, [...parentPath, idx], removed));
    }
  }

  return (
    <DndContext sensors={sensors} collisionDetection={rectIntersection} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <Level parentId={ROOT_ID} blocks={blocks} depth={0} dragging={dragging} renderBlock={renderBlock} />
    </DndContext>
  );
}