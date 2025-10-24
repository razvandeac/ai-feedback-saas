"use client";
import React from "react";
import { useEditorCtx } from "@/src/components/studio/editor/EditorContext";
import { Block } from "@/src/lib/studio/blocks/types";
import { ContainerFrame } from "./editor/ContainerFrame";

type Props = {
  blocks: Block[];
  path?: string[];
  onChange?: (next: Block[]) => void;
};

export default function BlockRenderer({ blocks, path, onChange }: Props) {
  const { selectedId, setSelectedId } = useEditorCtx();

  const baseCls = "rounded p-2 mb-2 transition border border-transparent hover:border-neutral-300 focus-within:border-blue-400";

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
        const cls = isActive
          ? `${baseCls} border-blue-500 bg-blue-50`
          : baseCls;

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
                  onChange={(e) => patchAt(i, { data: { text: e.target.value, align: block.data.align } })}
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

                  <ContainerFrame id={block.id}>
                    {(children ?? []).map((child, ci) => (
                      <div key={child.id} className="mb-2">
                        <BlockRenderer
                          blocks={[child as Block]}
                          path={[...(path ?? []), block.id, "children", String(ci)]}
                          onChange={(nextOne) => {
                            const nextKids = children.slice();
                            nextKids[ci] = nextOne[0];
                            patchAt(i, { data: { children: nextKids, direction: block.data.direction, gap: block.data.gap } });
                          }}
                        />
                      </div>
                    ))}
                  </ContainerFrame>

                  {children.length === 0 && (
                    <div className="text-xs italic opacity-60 py-2">Empty container. Drag here or press &quot;/&quot;.</div>
                  )}
                </div>
              );
            }

        // image blocks
        if (block.type === "image") {
          return (
            <div
              key={block.id}
              className={cls}
              onClick={(e) => { e.stopPropagation(); setSelectedId(block.id); }}
            >
              <img
                src={block.data.url}
                alt={block.data.alt ?? ""}
                className="max-w-full rounded"
              />
            </div>
          );
        }

        // Unknown block type fallback
        return (
          <div
            key={(block as Block).id}
            className={cls}
            onClick={(e) => { e.stopPropagation(); setSelectedId((block as Block).id); }}
          >
            <p className="text-xs opacity-60">Unknown block type: {(block as Block).type}</p>
          </div>
        );
      })}
    </>
  );
}
