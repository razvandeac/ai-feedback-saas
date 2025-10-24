import { Block } from "@/src/lib/studio/blocks/types";

export type Path = number[];
export const ROOT_ID = "root";

export function getChildrenAtPath(root: Block[], path: Path): Block[] {
  if (path.length === 0) return root;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let cur: any = { data: { children: root } };
  for (const idx of path) {
    const arr: Block[] = cur.data?.children ?? root;
    cur = arr[idx];
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (cur as any).data?.children ?? [];
}

export function findPathById(root: Block[], id: string): Path | null {
  const stack: { path: Path; node: Block }[] = [];
  root.forEach((b, i) => stack.push({ path: [i], node: b }));
  while (stack.length) {
    const { path, node } = stack.pop()!;
    if (node.id === id) return path;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const kids = (node as any).data?.children as Block[] | undefined;
    if (Array.isArray(kids)) {
      kids.forEach((k, i) => stack.push({ path: [...path, i], node: k }));
    }
  }
  return null;
}

export function removeAtPath(root: Block[], path: Path): { next: Block[]; removed: Block } {
  const next = structuredClone(root) as Block[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let parent: any = { data: { children: next } };
  for (let i = 0; i < path.length - 1; i++) parent = parent.data.children[path[i]];
  const idx = path[path.length - 1];
  const arr: Block[] = parent.data.children ?? next;
  const [removed] = arr.splice(idx, 1);
  return { next, removed };
}

export function insertAtPath(root: Block[], path: Path, item: Block): Block[] {
  const next = structuredClone(root) as Block[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let parent: any = { data: { children: next } };
  for (let i = 0; i < path.length - 1; i++) parent = parent.data.children[path[i]];
  const arr: Block[] = parent.data.children ?? next;
  const idx = path[path.length - 1];
  arr.splice(idx, 0, item);
  return next;
}
