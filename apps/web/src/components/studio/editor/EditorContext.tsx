"use client";
import React, { createContext, useContext, useState } from "react";

type Ctx = {
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
};

const EditorCtx = createContext<Ctx | null>(null);

export function EditorProvider({ children }: { children: React.ReactNode }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  return <EditorCtx.Provider value={{ selectedId, setSelectedId }}>{children}</EditorCtx.Provider>;
}

export function useEditorCtx() {
  const ctx = useContext(EditorCtx);
  if (!ctx) throw new Error("useEditorCtx outside provider");
  return ctx;
}
