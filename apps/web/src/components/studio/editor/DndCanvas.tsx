"use client";
import React from "react";
import { DndContext, DragEndEvent, closestCenter } from "@dnd-kit/core";
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Block } from "@/src/lib/studio/blocks/types";

function SortableItem({ block, children }: { block: Block; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: block.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
}

export function DndCanvas({ blocks, onChange, render }: { blocks: Block[]; onChange: (next: Block[]) => void; render: (b: Block, i: number) => React.ReactNode }) {
  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragEnd={(e: DragEndEvent) => {
        const { active, over } = e;
        if (active.id !== over?.id) {
          const oldIndex = blocks.findIndex((b) => b.id === active.id);
          const newIndex = blocks.findIndex((b) => b.id === over?.id);
          onChange(arrayMove(blocks, oldIndex, newIndex));
        }
      }}
    >
      <SortableContext items={blocks} strategy={verticalListSortingStrategy}>
        {blocks.map((b, i) => (
          <SortableItem key={b.id} block={b}>
            {render(b, i)}
          </SortableItem>
        ))}
      </SortableContext>
    </DndContext>
  );
}
