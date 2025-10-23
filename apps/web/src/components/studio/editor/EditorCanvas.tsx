"use client";
import React from "react";
import BlockRenderer from "@/src/components/studio/BlockRenderer";
import { Block } from "@/src/lib/studio/blocks/types";

export function EditorCanvas({
  blocks,
  onChange,
  onInsertAt,
  issues = [],
}: {
  blocks: Block[];
  onChange: (next: Block[]) => void;
  onInsertAt: (idx: number, type: string) => void;
  issues?: { path: string; message: string }[];
}) {
  return (
    <div className="space-y-2">
      <BlockRenderer blocks={blocks} onChange={onChange} issues={issues} />
      
      {/* Insert buttons at the bottom */}
      <div className="flex gap-2 pt-4 border-t">
        <button className="text-xs underline" onClick={() => onInsertAt(blocks.length, "text")}>+ text</button>
        <button className="text-xs underline" onClick={() => onInsertAt(blocks.length, "image")}>+ image</button>
        <button className="text-xs underline" onClick={() => onInsertAt(blocks.length, "container")}>+ container</button>
      </div>
    </div>
  );
}
