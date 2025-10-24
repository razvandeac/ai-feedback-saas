"use client";
import React from "react";
import { Block } from "@/src/lib/studio/blocks/types";
import BlockRenderer from "@/src/components/studio/BlockRenderer";
import { SortableTree } from "./SortableTree";
import { ROOT_ID } from "./tree";

export function EditorCanvas({
  blocks,
  onChange,
  onInsertAt,
}: {
  blocks: Block[];
  onChange: (next: Block[]) => void;
  onInsertAt: (idx: number, type: string) => void;
}) {
  return (
    <div className="space-y-2">
      <SortableTree
        parentId={ROOT_ID}
        blocks={blocks}
        onChange={onChange}
        renderBlock={(b) => (
          <div className="border rounded p-2 relative">
            <button
              className="absolute top-1 right-1 text-xs px-1 py-0.5 border rounded hover:bg-red-50"
              onClick={() => {
                onChange(blocks.filter(x => x.id !== b.id));
              }}
              aria-label="Delete block"
              title="Delete block"
            >
              Delete
            </button>
            <BlockRenderer
              blocks={[b]}
              onChange={(nextOne) => {
                const copy = blocks.slice();
                const idx = blocks.findIndex((x) => x.id === b.id);
                if (idx >= 0) {
                  copy[idx] = nextOne[0];
                  onChange(copy);
                }
              }}
            />
          </div>
        )}
      />
      <div className="pt-2 border-t">
        <button className="text-sm underline mr-2" onClick={() => onInsertAt(blocks.length, "text")}>+ text</button>
        <button className="text-sm underline mr-2" onClick={() => onInsertAt(blocks.length, "image")}>+ image</button>
        <button className="text-sm underline" onClick={() => onInsertAt(blocks.length, "container")}>+ container</button>
      </div>
    </div>
  );
}
