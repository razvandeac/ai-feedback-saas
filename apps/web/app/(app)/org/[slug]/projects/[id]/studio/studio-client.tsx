'use client'

import React, { useCallback, useState, useEffect } from 'react'
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
import { EditorProvider, useEditorCtx } from '@/src/components/studio/editor/EditorContext'
import { Toast } from '@/src/components/common/Toast'
import { v4 as uuid } from 'uuid'
import { hasUnpublishedChanges } from '@/src/lib/studio/diff'

function StudioContent({ widgetId, orgId, initialConfig, publishedConfig, version }: { 
  widgetId: string
  orgId: string
  initialConfig: WidgetConfig
  publishedConfig?: WidgetConfig
  version: number
}) {
  const { config, setConfigWithHistory, dirty, setDirty, saving, setSaving, saveError, setSaveError, lastSavedAt, setLastSavedAt, undo, redo, canUndo, canRedo, issues } =
    useEditorState(initialConfig);

  const { selectedId, setSelectedId } = useEditorCtx();
  const [toast, setToast] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [currentVersion, setCurrentVersion] = useState(version);
  const [publishedConfigState, setPublishedConfigState] = useState(publishedConfig);

  // Compute unpublished changes
  const unpublished = hasUnpublishedChanges(config, publishedConfigState);

  const publish = useCallback(async () => {
    if (issues.length > 0) {
      setToast("Cannot publish: please fix validation errors first");
      return;
    }
    
    setPublishing(true);
    try {
      const res = await fetch(`/api/studio/widgets/${widgetId}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgId }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      
      // Update published config to match current draft
      setPublishedConfigState(config);
      setCurrentVersion(data.version);
      setToast(`Published successfully! (v${data.version})`);
    } catch (error) {
      setToast(`Publish failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setPublishing(false);
    }
  }, [widgetId, orgId, issues.length, config]);

  // Config size guard
  useEffect(() => {
    const bytes = new Blob([JSON.stringify(config)]).size;
    if (bytes > 500 * 1024) setToast("Warning: widget is large (>500KB). Consider simplifying.");
    else if (toast) setToast(null);
  }, [config, toast]);

  useKeyboard({
    getIdsInOrder: () => (config.blocks ?? []).map(b => b.id),
    selectedId,
    setSelectedId,
    undo,
    redo,
    onDeleteSelected: () => {
      if (!selectedId) return;
      setConfigWithHistory(prev => ({ ...prev, blocks: (prev.blocks ?? []).filter(b => b.id !== selectedId) }));
      setSelectedId(null);
    },
  });

  const save = useCallback(async (cfg: WidgetConfig) => {
    const res = await fetch(`/api/studio/widgets/${widgetId}/config`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ widget_config: cfg }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  }, [widgetId]);

  useAutosave({
    config,
    dirty,
    setDirty,
    setSaving,
    setSaveError,
    setLastSavedAt,
    save,
    debounceMs: 700,
    hasErrors: issues.length > 0,
  });

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
      throw new Error(`Unknown block type: ${type}`);
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
          {unpublished ? (
            <span className="text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-700">Unpublished changes</span>
          ) : (
            <span className="text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-700">Published v{currentVersion}</span>
          )}
          <button disabled={!canUndo} className="border rounded px-2 py-1 disabled:opacity-40" onClick={undo}>Undo</button>
          <button disabled={!canRedo} className="border rounded px-2 py-1 disabled:opacity-40" onClick={redo}>Redo</button>
          <ValidationBadge issues={issues} />
          <button 
            disabled={publishing || issues.length > 0 || !unpublished} 
            className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-40 disabled:cursor-not-allowed" 
            onClick={publish}
            title={!unpublished ? "No changes to publish" : issues.length > 0 ? "Fix validation errors before publishing" : undefined}
          >
            {publishing ? "Publishing..." : "Publish"}
          </button>
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
          />
        </main>
      </div>

      <SaveBanner saving={saving} lastSavedAt={lastSavedAt} error={saveError} />
      {toast && <Toast message={toast} />}
    </div>
  )
}

export default function Studio({ widgetId, orgId, initialConfig, publishedConfig, version }: { 
  widgetId: string
  orgId: string
  initialConfig: WidgetConfig
  publishedConfig?: WidgetConfig
  version: number
}) {
  return (
    <EditorProvider>
      <StudioContent 
        widgetId={widgetId} 
        orgId={orgId} 
        initialConfig={initialConfig}
        publishedConfig={publishedConfig}
        version={version}
      />
    </EditorProvider>
  )
}
