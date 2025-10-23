import { Block } from "@/src/lib/studio/blocks/types";

export function moveBlock(blocks: Block[], fromIdx: number, toIdx: number): Block[] {
  const next = blocks.slice();
  const [b] = next.splice(fromIdx, 1);
  next.splice(toIdx, 0, b);
  return next;
}

export function insertBlock(blocks: Block[], idx: number, block: Block): Block[] {
  const next = blocks.slice();
  next.splice(idx, 0, block);
  return next;
}
