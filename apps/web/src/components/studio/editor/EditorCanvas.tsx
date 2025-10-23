"use client";
import React, { useState } from "react";
import BlockRenderer from "@/src/components/studio/BlockRenderer";
import { Block } from "@/src/lib/studio/blocks/types";
import { moveBlock } from "./dnd";

export function EditorCanvas({
  blocks,
  onChange,
  onInsertAt,
}: {
  blocks: Block[];
  onChange: (next: Block[]) => void;
  onInsertAt: (idx: number, type: string) => void;
}) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  return (
    <div className="space-y-2">
      {blocks.map((b, i) => (
        <div
          key={b.id}
          draggable
          onDragStart={() => setDragIndex(i)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => {
            if (dragIndex === null || dragIndex === i) return;
            onChange(moveBlock(blocks, dragIndex, i));
            setDragIndex(null);
          }}
          className="border rounded p-2"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs opacity-70">{b.type}</span>
            <div className="space-x-2">
              <button className="text-xs underline" onClick={() => onInsertAt(i, "text")}>+ text</button>
              <button className="text-xs underline" onClick={() => onInsertAt(i, "image")}>+ image</button>
              <button className="text-xs underline" onClick={() => onInsertAt(i, "container")}>+ container</button>
            </div>
          </div>
          <BlockRenderer blocks={[b]} />
        </div>
      ))}
    </div>
  );
}
