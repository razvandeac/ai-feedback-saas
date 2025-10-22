'use client'

import { useCallback, useEffect, useRef, useState, useTransition } from 'react'
import { type WidgetConfig } from '@/src/lib/studio/WidgetConfigSchema'
import { listBlockTypes, getBlockDef } from '@/src/lib/studio/blocks/registry'
import '@/src/lib/studio/blocks/registry.builtin' // Initialize built-in blocks
import BlockRenderer from '@/src/components/studio/BlockRenderer'
import { updateWidget } from '@/src/server/studio/repo'

/** Simple undo/redo stack */
type Snapshot = WidgetConfig
const MAX_STACK = 30

export default function Studio({ projectId, orgId, initialConfig }: { projectId: string; orgId: string; initialConfig: WidgetConfig }) {
  const [config, setConfig] = useState<WidgetConfig>(initialConfig)
  const [saving, startSaving] = useTransition()
  const [saveMsg, setSaveMsg] = useState<string>('')

  // Undo/Redo stacks
  const undoRef = useRef<Snapshot[]>([])
  const redoRef = useRef<Snapshot[]>([])
  const lastSaveRef = useRef<number>(Date.now())

  // Helper to push snapshots
  const pushSnapshot = useCallback((next: Snapshot) => {
    const stack = undoRef.current
    stack.push(next)
    if (stack.length > MAX_STACK) stack.shift()
    redoRef.current = []
  }, [])

  // Unified state update with snapshotting
  const updateConfig = useCallback((mutate: (prev: WidgetConfig) => WidgetConfig) => {
    setConfig(prev => {
      const before = prev
      const after = mutate(prev)
      if (JSON.stringify(before) !== JSON.stringify(after)) {
        pushSnapshot(before)
      }
      return after
    })
  }, [pushSnapshot])

  // Undo/Redo actions
  const undo = useCallback(() => {
    const last = undoRef.current.pop()
    if (!last) return
    redoRef.current.push(config)
    setConfig(last)
  }, [config])

  const redo = useCallback(() => {
    const next = redoRef.current.pop()
    if (!next) return
    undoRef.current.push(config)
    setConfig(next)
  }, [config])

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey
      if (!mod) return
      if (e.key.toLowerCase() === 'z' && !e.shiftKey) { e.preventDefault(); undo() }
      if (e.key.toLowerCase() === 'z' && e.shiftKey) { e.preventDefault(); redo() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [undo, redo])

  // Debounced autosave
  useEffect(() => {
    const t = setTimeout(() => {
      startSaving(async () => {
        const since = Date.now() - lastSaveRef.current
        if (since < 200) return
        lastSaveRef.current = Date.now()
        
        try {
          await updateWidget(projectId, {
            orgId,
            name: 'Widget', // Placeholder
            widget_config: config,
          })
          setSaveMsg('All changes saved')
        } catch (error) {
          setSaveMsg('Save error: ' + (error as Error).message)
        }
      })
    }, 800)
    return () => clearTimeout(t)
  }, [config, projectId, orgId])

  // Block management
  const addBlock = useCallback((type: string) => {
    const def = getBlockDef(type)
    if (!def) return

    // Create a default block based on type
    let defaultData = {}
    if (type === 'text') {
      defaultData = { text: 'Sample text', align: 'left' as const }
    } else if (type === 'image') {
      defaultData = { url: 'https://via.placeholder.com/300x200', alt: 'Sample image' }
    } else if (type === 'container') {
      defaultData = { direction: 'vertical' as const, gap: 8, children: [] }
    } else if (type === 'legacy') {
      defaultData = {}
    }

    updateConfig(prev => ({
      ...prev,
      blocks: [
        ...prev.blocks,
        {
          id: crypto.randomUUID(),
          type,
          version: 1,
          data: defaultData,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any, // Type assertion needed due to complex union types
      ],
    }))
  }, [updateConfig])

  const removeBlock = useCallback((id: string) => {
    updateConfig(prev => ({
      ...prev,
      blocks: prev.blocks.filter(block => block.id !== id),
    }))
  }, [updateConfig])

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
      {/* Left rail: Add blocks + Theme + Save */}
      <div className="space-y-6">
        <section className="border rounded-xl p-4 space-y-3">
          <h2 className="font-semibold">Add blocks</h2>
          {listBlockTypes().map(type => (
            <button
              key={type}
              className="w-full border rounded px-3 py-2 text-left"
              onClick={() => addBlock(type)}
            >
              + {type}
            </button>
          ))}

          <div className="flex gap-2 pt-2">
            <button className="border rounded px-3 py-2 w-full" onClick={undo}>
              Undo
            </button>
            <button className="border rounded px-3 py-2 w-full" onClick={redo}>
              Redo
            </button>
          </div>

          <div className={`text-sm ${saving ? 'text-gray-500' : 'text-gray-600'} pt-2`}>
            {saving ? 'Saving…' : (saveMsg || 'All changes saved')}
          </div>
        </section>

        <section className="border rounded-xl p-4 space-y-3">
          <h2 className="font-semibold">Theme</h2>
          <div className="space-y-3">
            <label className="block">
              <span className="text-sm text-gray-700">Variant</span>
              <select
                value={config.theme.variant}
                onChange={(e) => updateConfig(prev => ({
                  ...prev,
                  theme: { ...prev.theme, variant: e.target.value as 'light' | 'dark' }
                }))}
                className="w-full border rounded px-2 py-1"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </label>
            
            <label className="block">
              <span className="text-sm text-gray-700">Primary Color</span>
              <input
                type="color"
                value={config.theme.primaryColor}
                onChange={(e) => updateConfig(prev => ({
                  ...prev,
                  theme: { ...prev.theme, primaryColor: e.target.value }
                }))}
                className="w-full h-9 border rounded"
              />
            </label>
            
            <label className="block">
              <span className="text-sm text-gray-700">Background Color</span>
              <input
                type="color"
                value={config.theme.backgroundColor}
                onChange={(e) => updateConfig(prev => ({
                  ...prev,
                  theme: { ...prev.theme, backgroundColor: e.target.value }
                }))}
                className="w-full h-9 border rounded"
              />
            </label>
          </div>
        </section>
      </div>

      {/* Middle: Block list */}
      <div className="space-y-6">
        <section className="border rounded-xl p-4 space-y-3">
          <h2 className="font-semibold">Blocks</h2>
          <div className="space-y-2">
            {config.blocks.map(block => (
              <div key={block.id} className="border rounded p-2 flex items-center justify-between">
                <span className="text-sm">{block.type}</span>
                <button
                  onClick={() => removeBlock(block.id)}
                  className="text-xs underline opacity-70"
                >
                  Remove
                </button>
              </div>
            ))}
            {config.blocks.length === 0 && (
              <div className="text-sm text-gray-500">No blocks yet. Add from the left.</div>
            )}
          </div>
        </section>
      </div>

      {/* Right: Preview */}
      <div className="xl:col-span-2">
        <section className="border rounded-xl p-4 space-y-3">
          <h2 className="font-semibold">Preview</h2>
          <div 
            className="border rounded-xl p-4"
            style={{
              backgroundColor: config.theme.backgroundColor,
              color: config.theme.primaryColor,
              borderRadius: `${config.theme.borderRadius}px`,
              fontFamily: config.theme.fontFamily,
            }}
          >
            <BlockRenderer blocks={config.blocks} />
          </div>
        </section>
      </div>
    </div>
  )
}
