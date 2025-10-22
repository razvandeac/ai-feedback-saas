"use client";
import React from "react";
import { getBlockDef } from "@/src/lib/studio/blocks/registry";
import { Block } from "@/src/lib/studio/blocks/types";

export default function BlockRenderer({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks.map((block) => {
        const def = getBlockDef(block.type);
        if (!def) return <div key={block.id}>Unknown block: {block.type}</div>;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return <div key={block.id}>{def.render(block as any)}</div>;
      })}
    </>
  );
}
