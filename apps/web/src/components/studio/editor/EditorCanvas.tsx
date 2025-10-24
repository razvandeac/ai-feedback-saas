"use client";
import React from "react";
import { Block } from "@/src/lib/studio/blocks/types";
import BlockRenderer from "@/src/components/studio/BlockRenderer";
import { DndTree } from "./DndTree";
import { IconButton } from "@/src/components/common/IconButton";

export function EditorCanvas({
  blocks, onChange, onInsertAt,
}: { blocks: Block[]; onChange: (next: Block[]) => void; onInsertAt: (idx: number, type: string) => void; }) {
  return (
    <div className="space-y-2">
      <DndTree
        blocks={blocks}
        onChange={onChange}
        renderBlock={(b) => (
          <div className="rounded border border-neutral-200 bg-white">
            <div className="flex items-center justify-between px-2 py-1 border-b bg-neutral-50">
              <div className="flex items-center gap-2">
                {/* Drag handle is rendered inside Row now; keep title if you want */}
                <span className="text-[11px] uppercase tracking-wide text-neutral-500">{b.type}</span>
              </div>
              <IconButton title="Delete block" onClick={() => onChange(blocks.filter(x => x.id !== b.id))} />
            </div>
            <div className="p-2">
              <BlockRenderer
                blocks={[b]}
                onChange={(nextOne) => {
                  const i = blocks.findIndex(x => x.id === b.id);
                  if (i < 0) return;
                  const copy = blocks.slice();
                  copy[i] = nextOne[0];
                  onChange(copy);
                }}
              />
            </div>
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
