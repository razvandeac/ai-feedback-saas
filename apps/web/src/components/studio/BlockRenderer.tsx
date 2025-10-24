"use client";
import React from "react";
import { useEditorCtx } from "@/src/components/studio/editor/EditorContext";
import { Block } from "@/src/lib/studio/blocks/types";
import { SortableTree } from "./editor/SortableTree";

type Props = {
  blocks: Block[];
  path?: string[];
  onChange?: (next: Block[]) => void;
};

export default function BlockRenderer({ blocks, onChange }: Props) {
  const { selectedId, setSelectedId } = useEditorCtx();

  function patchAt(index: number, patch: Partial<Block>) {
    if (!onChange) return;
    const next = blocks.slice();
    const currentBlock = next[index];
    if (patch.data) {
      next[index] = { ...currentBlock, ...patch, data: { ...currentBlock.data, ...patch.data } } as Block;
    } else {
      next[index] = { ...currentBlock, ...patch } as Block;
    }
    onChange(next);
  }

  return (
    <>
      {blocks.map((block, i) => {
        const isActive = selectedId === block.id;
        const base = "border rounded p-2 mb-2 transition";
        const cls = isActive ? base + " border-blue-500 bg-blue-50" : base + " border-transparent hover:border-neutral-200";

        if (block.type === "text") {
          return (
            <div
              key={block.id}
              className={cls}
              tabIndex={0}
              onClick={(e) => { e.stopPropagation(); setSelectedId(block.id); }}
            >
              {isActive ? (
                <textarea
                  autoFocus
                  value={block.data.text ?? ""}
                  onChange={(e) => patchAt(i, { data: { text: e.target.value } })}
                  onBlur={() => setSelectedId(null)}
                  className="w-full border-none bg-transparent outline-none resize-none"
                  placeholder="Type…"
                />
              ) : (
                <p>{block.data.text ?? ""}</p>
              )}
            </div>
          );
        }

        if (block.type === "container") {
          const children = block.data.children ?? [];
          return (
            <div
              key={block.id}
              className={cls}
              onClick={(e) => { e.stopPropagation(); setSelectedId(block.id); }}
            >
              <p className="text-xs opacity-60 mb-1">Container ({block.data.direction})</p>

              <SortableTree
                parentId={block.id}         // <<— important
                blocks={children as Block[]}
                onChange={(nextChildren) => {
                  patchAt(i, { data: { children: nextChildren } });
                }}
                renderBlock={(child) => (
                  <BlockRenderer
                    blocks={[child]}
                    onChange={(nextOne) => {
                      const nextKids = children.slice();
                      const idx = children.findIndex((x) => x.id === child.id);
                      if (idx >= 0) nextKids[idx] = nextOne[0];
                      patchAt(i, { data: { children: nextKids } });
                    }}
                  />
                )}
              />
            </div>
          );
        }

        // image, legacy, others
        return (
          <div
            key={block.id}
            className={cls}
            onClick={(e) => { e.stopPropagation(); setSelectedId(block.id); }}
          >
            <p className="text-xs opacity-60">{block.type}</p>
          </div>
        );
      })}
    </>
  );
}
