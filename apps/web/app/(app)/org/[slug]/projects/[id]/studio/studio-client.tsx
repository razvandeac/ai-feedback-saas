'use client'

import React, { useCallback } from 'react'
import { type WidgetConfig } from '@/src/lib/studio/WidgetConfigSchema'
import { type Block } from '@/src/lib/studio/blocks/types'
import '@/src/lib/studio/blocks/registry.builtin' // Initialize built-in blocks
import { useEditorState } from '@/src/components/studio/editor/useEditorState'
import { useAutosave } from '@/src/components/studio/editor/useAutosave'
import { SaveBanner } from '@/src/components/studio/editor/SaveBanner'
import { BlockPalette } from '@/src/components/studio/editor/BlockPalette'
import { EditorCanvas } from '@/src/components/studio/editor/EditorCanvas'
import { useKeyboard } from '@/src/components/studio/editor/useKeyboard'
import { ValidationBadge } from '@/src/components/studio/editor/ValidationBadge'
import { EditorProvider } from '@/src/components/studio/editor/EditorContext'
import { v4 as uuid } from 'uuid'

function StudioContent({ projectId, initialConfig }: { projectId: string; initialConfig: WidgetConfig }) {
  const { config, setConfigWithHistory, dirty, setDirty, saving, setSaving, saveError, setSaveError, lastSavedAt, setLastSavedAt, undo, redo, canUndo, canRedo, issues } =
    useEditorState(initialConfig);

  useKeyboard({ undo, redo, blocks: config.blocks });

  const save = useCallback(async (cfg: WidgetConfig) => {
    const res = await fetch(`/api/projects/${projectId}/config`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ settings: cfg }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  }, [projectId]);

  useAutosave({ config, dirty, setDirty, setSaving, setSaveError, setLastSavedAt, save });

  const insertAt = useCallback((idx: number, type: string) => {
    let newBlock: Block;
    
    if (type === "text") {
      newBlock = {
        id: uuid(),
        type: "text",
        version: 1,
        data: { text: "New text", align: "left" },
      };
    } else if (type === "image") {
      newBlock = {
        id: uuid(),
        type: "image", 
        version: 1,
        data: { url: "https://placehold.co/600x400", alt: "image" },
      };
    } else if (type === "container") {
      newBlock = {
        id: uuid(),
        type: "container",
        version: 1,
        data: { direction: "vertical", gap: 8, children: [] },
      };
    } else {
      newBlock = {
        id: uuid(),
        type: "legacy",
        version: 1,
        data: {},
      };
    }
    
    setConfigWithHistory(prev => ({ 
      ...prev, 
      blocks: [...prev.blocks.slice(0, idx), newBlock, ...prev.blocks.slice(idx)] 
    }));
  }, [setConfigWithHistory]);

  return (
    <div className="p-6 space-y-4">
      <header className="flex items-center justify-between">
        <div className="text-lg font-semibold">Studio Editor</div>
        <div className="flex items-center gap-2">
          <button disabled={!canUndo} className="border rounded px-2 py-1 disabled:opacity-40" onClick={undo}>Undo</button>
          <button disabled={!canRedo} className="border rounded px-2 py-1 disabled:opacity-40" onClick={redo}>Redo</button>
          <ValidationBadge issues={issues} />
        </div>
      </header>

      <div className="grid grid-cols-12 gap-4">
        <aside className="col-span-3">
          <BlockPalette onInsert={(type) => insertAt(0, type)} />
        </aside>
        <main className="col-span-9">
          <EditorCanvas
            blocks={config.blocks as Block[]}
            onChange={(next) => setConfigWithHistory(prev => ({ ...prev, blocks: next }))}
            onInsertAt={insertAt}
            issues={issues}
          />
        </main>
      </div>

      <SaveBanner saving={saving} lastSavedAt={lastSavedAt} error={saveError} />
    </div>
  )
}

export default function Studio({ projectId, initialConfig }: { projectId: string; initialConfig: WidgetConfig }) {
  return (
    <EditorProvider>
      <StudioContent projectId={projectId} initialConfig={initialConfig} />
    </EditorProvider>
  )
}
