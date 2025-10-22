"use client";
import React from "react";
import { z } from "zod";
import { BlockSchema } from "./types";

type BlockDef<T extends z.infer<typeof BlockSchema>> = {
  type: string;
  schema: z.ZodType<T>;
  render: (block: T) => React.JSX.Element;
  editor?: (block: T, onChange: (next: T) => void) => React.JSX.Element;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const registry = new Map<string, BlockDef<any>>();

export function register<T extends z.infer<typeof BlockSchema>>(def: BlockDef<T>) {
  registry.set(def.type, def);
  return def;
}

export function getBlockDef(type: string) {
  return registry.get(type);
}

export function listBlockTypes() {
  return Array.from(registry.keys());
}
