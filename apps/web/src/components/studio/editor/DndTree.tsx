"use client";
import React from "react";
import {
  DndContext, DragEndEvent, PointerSensor, useSensor, useSensors, rectIntersection,
} from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Block } from "@/src/lib/studio/blocks/types";
import { ROOT_ID, findPathById, insertAtPath, removeAtPath } from "./tree";
import { DropZone } from "./DropZone";

function Row({ block, children }: { block: Block; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });
  const style: React.CSSProperties = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
  return <div ref={setNodeRef} style={style} {...attributes} {...listeners}>{children}</div>;
}

function Level({
  parentPath, parentId, blocks, depth, renderBlock,
}: {
  parentPath: number[];
  parentId: string;
  blocks: Block[];
  depth: number;
  renderBlock: (b: Block) => React.ReactNode;
}) {
  return (
    <>
      {/* Insert at index 0 */}
      <DropZone id={`dz:${parentId}:0`} depth={depth} size={blocks.length === 0 ? "lg" : "sm"} />
      <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
        {blocks.map((b, i) => (
          <div key={b.id} className="mb-2">
            <Row block={b}>{renderBlock(b)}</Row>
            {/* Insert between i and i+1 */}
            <DropZone id={`dz:${parentId}:${i+1}`} depth={depth} />
            {/* If container, render its level recursively */}
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {Array.isArray((b as any).data?.children) && (
              <div className="ml-3 mt-2">
                <Level
                  parentPath={[...parentPath, i]}
                  parentId={b.id}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  blocks={(b as any).data.children}
                  depth={depth + 1}
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
}: {
  blocks: Block[];
  onChange: (next: Block[]) => void;
  renderBlock: (b: Block) => React.ReactNode;
}) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over) return;
    const activeId = String(active.id);
    const overId = String(over.id);

    // 1) Drop on zone: dz:<parentId>:<index>
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

    // 2) Drop on another block: same-parent reorder
    const fromPath = findPathById(blocks, activeId);
    const toPath = findPathById(blocks, overId);
    if (!fromPath || !toPath) return;

    const sameParent =
      fromPath.length === toPath.length &&
      fromPath.slice(0, -1).every((v, i) => v === toPath[i]);

    if (sameParent) {
      const parentPath = fromPath.slice(0, -1);
      const { next, removed } = removeAtPath(blocks, fromPath);
      const targetIdx = toPath[toPath.length - 1];
      onChange(insertAtPath(next, [...parentPath, targetIdx], removed));
    }
  }

  return (
    <DndContext sensors={sensors} collisionDetection={rectIntersection} onDragEnd={handleDragEnd}>
      <Level parentPath={[]} parentId={ROOT_ID} blocks={blocks} depth={0} renderBlock={renderBlock} />
    </DndContext>
  );
}