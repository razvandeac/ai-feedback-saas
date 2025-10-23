"use client";
import React from "react";
import { useEditorCtx } from "@/src/components/studio/editor/EditorContext";
import { DndCanvas } from "@/src/components/studio/editor/DndCanvas";
import { Block } from "@/src/lib/studio/blocks/types";

export default function BlockRenderer({ 
  blocks, 
  path = [], 
  onChange,
  issues = []
}: { 
  blocks: Block[]; 
  path?: string[]; 
  onChange?: (next: Block[]) => void;
  issues?: { path: string; message: string }[];
}) {
  const { selectedId, setSelectedId } = useEditorCtx();

  function handleTextEdit(block: Block, i: number, newText: string) {
    const next = [...blocks];
    if (block.type === "text") {
      next[i] = { ...block, data: { ...block.data, text: newText } };
    }
    onChange?.(next);
  }

  function renderBlock(block: Block, i: number) {
    const isActive = selectedId === block.id;
    const hasIssues = issues.some(issue => issue.path.includes(block.id));
    
    const base = "border rounded p-2 mb-2 transition cursor-pointer";
    let cls = base;
    
    if (hasIssues) {
      cls += " border-red-400 bg-red-50";
    } else if (isActive) {
      cls += " border-blue-500 bg-blue-50";
    } else {
      cls += " border-transparent hover:border-neutral-200";
    }

    if (block.type === "text") {
      return (
        <div
          key={block.id}
          className={cls}
          tabIndex={0}
          onClick={() => setSelectedId(block.id)}
          onBlur={() => setSelectedId(null)}
        >
          {isActive ? (
            <textarea
              autoFocus
              value={block.data.text}
              onChange={(e) => handleTextEdit(block, i, e.target.value)}
              className="w-full border-none bg-transparent outline-none resize-none"
              rows={Math.max(1, block.data.text.split('\n').length)}
            />
          ) : (
            <p className="whitespace-pre-wrap">{block.data.text}</p>
          )}
        </div>
      );
    }

    // Containers with nested children
    if (block.type === "container") {
      return (
        <div
          key={block.id}
          className={cls}
          onClick={() => setSelectedId(block.id)}
        >
          <p className="text-xs opacity-60 mb-1">Container ({block.data.direction})</p>
          <BlockRenderer
            blocks={(block.data.children as Block[]) ?? []}
            path={[...path, block.id, "children"]}
            issues={issues}
            onChange={(nextChildren) => {
              const next = [...blocks];
              next[i] = { ...block, data: { ...block.data, children: nextChildren } };
              onChange?.(next);
            }}
          />
        </div>
      );
    }

    // Image blocks
    if (block.type === "image") {
      return (
        <div key={block.id} className={cls} onClick={() => setSelectedId(block.id)}>
          <p className="text-xs opacity-60 mb-1">Image</p>
          <img 
            src={block.data.url} 
            alt={block.data.alt || ""} 
            className="max-w-full h-auto rounded"
          />
        </div>
      );
    }

    // Default (legacy, etc.)
    return (
      <div key={block.id} className={cls} onClick={() => setSelectedId(block.id)}>
        <p className="text-xs opacity-60">{block.type}</p>
      </div>
    );
  }

  return (
    <DndCanvas blocks={blocks} onChange={onChange || (() => {})} render={renderBlock} />
  );
}
