import { Block } from "@/src/lib/studio/blocks/types";

export type Path = number[]; // index path into blocks tree

export function getAtPath(root: Block[], path: Path): Block | null {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let cur: any = { data: { children: root } };
  for (const idx of path) {
    const arr: Block[] = cur.data?.children ?? root;
    if (!arr || arr[idx] == null) return null;
    cur = arr[idx];
  }
  return cur as Block;
}

export function setAtPath(root: Block[], path: Path, value: Block): Block[] {
  if (path.length === 0) return [value]; // not expected for root replace
  const next = structuredClone(root) as Block[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let parent: any = { data: { children: next } };
  for (let i = 0; i < path.length - 1; i++) {
    const idx = path[i];
    parent = (i === 0 ? parent.data.children : parent.data.children)[idx];
    if (!parent.data) parent.data = {};
    if (!Array.isArray(parent.data.children)) parent.data.children = [];
  }
  const lastIdx = path[path.length - 1];
  const arr: Block[] = parent.data?.children ?? next;
  arr[lastIdx] = value;
  return next;
}

export function removeAtPath(root: Block[], path: Path): { next: Block[]; removed: Block } {
  const next = structuredClone(root) as Block[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let parent: any = { data: { children: next } };
  for (let i = 0; i < path.length - 1; i++) {
    parent = parent.data.children[path[i]];
    if (!parent.data) parent.data = {};
    if (!Array.isArray(parent.data.children)) parent.data.children = [];
  }
  const lastIdx = path[path.length - 1];
  const arr: Block[] = parent.data.children ?? next;
  const [removed] = arr.splice(lastIdx, 1);
  return { next, removed };
}

export function insertAtPath(root: Block[], path: Path, item: Block): Block[] {
  const next = structuredClone(root) as Block[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let parent: any = { data: { children: next } };
  for (let i = 0; i < path.length - 1; i++) {
    parent = parent.data.children[path[i]];
    if (!parent.data) parent.data = {};
    if (!Array.isArray(parent.data.children)) parent.data.children = [];
  }
  const arr: Block[] = parent.data.children ?? next;
  const idx = path[path.length - 1];
  arr.splice(idx, 0, item);
  return next;
}

/** Find a path (indices) by id; DFS */
export function findPathById(root: Block[], id: string): Path | null {
  const stack: { path: Path; node: Block }[] = [];
  root.forEach((b, i) => stack.push({ path: [i], node: b }));
  while (stack.length) {
    const { path, node } = stack.pop()!;
    if (node.id === id) return path;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const kids = (node as any).data?.children as Block[] | undefined;
    if (Array.isArray(kids)) kids.forEach((k, i) => stack.push({ path: [...path, i], node: k }));
  }
  return null;
}
