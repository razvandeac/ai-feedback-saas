'use client'

import { useCallback, useEffect, useRef, useState, useTransition } from 'react'
import { WidgetConfigSchema, type WidgetConfig } from '@/lib/widget/schema'
import { saveWidgetConfig } from '@/app/actions/widget'
import { BlockRegistry, type BlockId } from '@/lib/widget/blocks'
import { THEME_PRESETS } from '@/lib/widget/themePresets'
import {
  DndContext, DragEndEvent, PointerSensor, useSensor, useSensors
} from '@dnd-kit/core'
import {
  SortableContext, arrayMove, useSortable, verticalListSortingStrategy
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { publishWidget, rollbackWidget, listWidgetVersions } from '@/app/actions/widget'

/** Small UI helpers */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1">
      <div className="text-sm text-gray-700">{label}</div>
      {children}
    </label>
  )
}
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border rounded-xl p-4 space-y-3">
      <h2 className="font-semibold">{title}</h2>
      {children}
    </section>
  )
}

/** Sortable item (unchanged except a11y) */
function SortableItem({ id, label, onRemove, selected, onSelect }: {
  id: string; label: string; onRemove: () => void; selected: boolean; onSelect: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id })
  const style = { transform: CSS.Transform.toString(transform), transition }
  return (
    <div ref={setNodeRef} style={style} className={`border rounded p-2 flex items-center justify-between ${selected ? 'bg-gray-50' : ''}`}>
      <button {...attributes} {...listeners} aria-label="Drag to reorder" className="cursor-grab px-2 text-sm opacity-60">↕</button>
      <button onClick={onSelect} className="flex-1 text-left" aria-pressed={selected}>{label}</button>
      <button onClick={onRemove} className="text-xs underline opacity-70 px-2" aria-label="Remove block">Remove</button>
    </div>
  )
}

/** Preview with dark-mode + scale */
function Preview({ config }: { config: WidgetConfig }) {
  const dark = config.preview?.darkMode
  const scale = config.preview?.scale ?? 1
  const stylePanel: React.CSSProperties = {
    background: config.theme.background,
    color: config.theme.color,
    transform: `scale(${scale})`,
    transformOrigin: 'top left',
  }
  return (
    <div className={`rounded-xl p-4 border ${dark ? 'bg-[#0b1021]' : ''}`}>
      <div className="border rounded-xl p-4" style={stylePanel}>
        {config.order.map((id) => {
          const def = BlockRegistry[id as BlockId]
          if (!def) return null
          const enabled =
            id === 'rating' ? config.blocks.rating.enabled :
            id === 'comment' ? config.blocks.comment.enabled :
            id === 'nps' ? config.blocks.nps.enabled : false
          if (!enabled) return null
          return <div key={id}>{def.renderPreview(config)}</div>
        })}
        <button className="mt-3 border px-3 py-2 rounded">Send feedback</button>
      </div>
    </div>
  )
}

/** Simple undo/redo stack */
type Snapshot = WidgetConfig
const MAX_STACK = 30

export default function Studio({ projectId, initial }: { projectId: string; initial: unknown }) {
  const [config, setConfig] = useState<WidgetConfig>(() => {
    try {
      return WidgetConfigSchema.parse(initial)
    } catch (error) {
      console.warn('Failed to parse initial widget config, using defaults:', error)
      return WidgetConfigSchema.parse({})
    }
  })
  const [saving, startSaving] = useTransition()
  const [saveMsg, setSaveMsg] = useState<string>('')

  // versions
  const [versions, setVersions] = useState<Array<{version:number; published_at:string; published_by:string}>>([])

  // selection
  const [selected, setSelected] = useState<BlockId | null>(config.order[0] ?? null)

  // DnD sensors
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  // Undo/Redo stacks
  const undoRef = useRef<Snapshot[]>([])
  const redoRef = useRef<Snapshot[]>([])
  const lastSaveRef = useRef<number>(Date.now())

  // Helper to push snapshots
  const pushSnapshot = useCallback((next: Snapshot) => {
    const stack = undoRef.current
    stack.push(next)
    if (stack.length > MAX_STACK) stack.shift()
    // clearing redo trail on new change
    redoRef.current = []
  }, [])

  // Unified state update with snapshotting
  const updateConfig = useCallback((mutate: (prev: WidgetConfig) => WidgetConfig) => {
    setConfig(prev => {
      const before = prev
      const after = mutate(prev)
      // only snapshot if actual differences
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

  // Keyboard shortcuts: Cmd/Ctrl+Z / Shift+Cmd/Ctrl+Z
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

  // Load versions
  useEffect(() => {
    (async () => {
      const res = await listWidgetVersions(projectId)
      if ('versions' in res) setVersions(res.versions as unknown as Array<{version:number; published_at:string; published_by:string}>)
    })()
  }, [projectId])

  // Debounced autosave (throttle: ≥800ms since last keystroke)
  useEffect(() => {
    const t = setTimeout(() => {
      startSaving(async () => {
        const since = Date.now() - lastSaveRef.current
        if (since < 200) return // guard against rapid double calls
        lastSaveRef.current = Date.now()
        const res = await saveWidgetConfig(projectId, config)
        setSaveMsg('All changes saved')
        if ('error' in res) setSaveMsg('Save error: ' + (res as { error: string }).error)
      })
    }, 800)
    return () => clearTimeout(t)
  }, [config, projectId])

  // DnD
  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e
    if (!over || active.id === over.id) return
    updateConfig(prev => {
      const oldIndex = prev.order.findIndex(x => x === active.id)
      const newIndex = prev.order.findIndex(x => x === over.id)
      return { ...prev, order: arrayMove(prev.order, oldIndex, newIndex) }
    })
  }

  // Mutators
  function toggleEnabled(id: BlockId, value: boolean) {
    updateConfig(prev => {
      const blocks = { ...prev.blocks }
      if (id === 'rating') blocks.rating = { ...blocks.rating, enabled: value }
      if (id === 'comment') blocks.comment = { ...blocks.comment, enabled: value }
      if (id === 'nps') blocks.nps = { ...blocks.nps, enabled: value }
      return { ...prev, blocks }
    })
  }
  function addBlock(id: BlockId) {
    updateConfig(prev => {
      if (prev.order.includes(id)) return prev
      const blocks = { ...prev.blocks }
      if (id === 'rating') blocks.rating = { ...blocks.rating, enabled: true }
      if (id === 'comment') blocks.comment = { ...blocks.comment, enabled: true }
      if (id === 'nps') blocks.nps = { ...blocks.nps, enabled: true }
      return { ...prev, order: [...prev.order, id], blocks }
    })
    setSelected(id)
  }
  function removeBlock(id: BlockId) {
    updateConfig(prev => ({ ...prev, order: prev.order.filter(x => x !== id) }))
    setSelected(cur => (cur === id ? null : cur))
  }

  // Theme helpers
  function applyPreset(id: string) {
    const preset = THEME_PRESETS.find(p => p.id === id)
    if (!preset) return
    updateConfig(prev => ({
      ...prev,
      theme: { ...prev.theme, preset: id, color: preset.color, background: preset.background }
    }))
  }

  /** Inspector UI */
  function Inspector() {
    if (!selected) return <div className="text-sm text-gray-500">Select a block to edit its settings.</div>

    if (selected === 'rating') {
      const b = config.blocks.rating
      return (
        <div className="space-y-3">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={b.enabled} onChange={(e) => toggleEnabled('rating', e.target.checked)} />
            <span>Enabled</span>
          </label>
          <Field label="Label">
            <input className="w-full border rounded px-2 py-1"
              value={b.label}
              onChange={(e) => updateConfig(prev => ({ ...prev, blocks: { ...prev.blocks, rating: { ...b, label: e.target.value } } }))} />
          </Field>
          <Field label="Max">
            <input type="number" min={3} max={10} className="w-full border rounded px-2 py-1"
              value={b.max}
              onChange={(e) => updateConfig(prev => ({ ...prev, blocks: { ...prev.blocks, rating: { ...b, max: Number(e.target.value) } } }))} />
          </Field>
        </div>
      )
    }

    if (selected === 'comment') {
      const b = config.blocks.comment
      return (
        <div className="space-y-3">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={b.enabled} onChange={(e) => toggleEnabled('comment', e.target.checked)} />
            <span>Enabled</span>
          </label>
          <Field label="Label">
            <input className="w-full border rounded px-2 py-1"
              value={b.label}
              onChange={(e) => updateConfig(prev => ({ ...prev, blocks: { ...prev.blocks, comment: { ...b, label: e.target.value } } }))} />
          </Field>
          <Field label="Placeholder">
            <input className="w-full border rounded px-2 py-1"
              value={b.placeholder}
              onChange={(e) => updateConfig(prev => ({ ...prev, blocks: { ...prev.blocks, comment: { ...b, placeholder: e.target.value } } }))} />
          </Field>
          <Field label="Min length">
            <input type="number" min={0} max={500} className="w-full border rounded px-2 py-1"
              value={b.minLength}
              onChange={(e) => updateConfig(prev => ({ ...prev, blocks: { ...prev.blocks, comment: { ...b, minLength: Number(e.target.value) } } }))} />
          </Field>
        </div>
      )
    }

    if (selected === 'nps') {
      const b = config.blocks.nps
      return (
        <div className="space-y-3">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={b.enabled} onChange={(e) => toggleEnabled('nps', e.target.checked)} />
            <span>Enabled</span>
          </label>
          <Field label="Label">
            <input className="w-full border rounded px-2 py-1"
              value={b.label}
              onChange={(e) => updateConfig(prev => ({ ...prev, blocks: { ...prev.blocks, nps: { ...b, label: e.target.value } } }))} />
          </Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Min">
              <input type="number" min={0} max={5} className="w-full border rounded px-2 py-1"
                value={b.min}
                onChange={(e) => updateConfig(prev => ({ ...prev, blocks: { ...prev.blocks, nps: { ...b, min: Number(e.target.value) } } }))} />
            </Field>
            <Field label="Max">
              <input type="number" min={5} max={10} className="w-full border rounded px-2 py-1"
                value={b.max}
                onChange={(e) => updateConfig(prev => ({ ...prev, blocks: { ...prev.blocks, nps: { ...b, max: Number(e.target.value) } } }))} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Left label">
              <input className="w-full border rounded px-2 py-1"
                value={b.leftLabel}
                onChange={(e) => updateConfig(prev => ({ ...prev, blocks: { ...prev.blocks, nps: { ...b, leftLabel: e.target.value } } }))} />
            </Field>
            <Field label="Right label">
              <input className="w-full border rounded px-2 py-1"
                value={b.rightLabel}
                onChange={(e) => updateConfig(prev => ({ ...prev, blocks: { ...prev.blocks, nps: { ...b, rightLabel: e.target.value } } }))} />
            </Field>
          </div>
        </div>
      )
    }

    return null
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
      {/* Left rail: Add + Theme + Save/Publish */}
      <div className="space-y-6">
        <Section title="Add blocks">
          {(['rating','comment','nps'] as BlockId[]).map((id) => {
            const def = BlockRegistry[id]
            const already = config.order.includes(id)
            return (
              <button
                key={id}
                className="w-full border rounded px-3 py-2 text-left disabled:opacity-50"
                disabled={already}
                onClick={() => addBlock(id)}
              >
                + {def.label}
              </button>
            )
          })}

          <div className="flex gap-2 pt-2">
            <button className="border rounded px-3 py-2 w-full" onClick={undo} aria-label="Undo (Ctrl/Cmd+Z)">Undo</button>
            <button className="border rounded px-3 py-2 w-full" onClick={redo} aria-label="Redo (Shift+Ctrl/Cmd+Z)">Redo</button>
          </div>

          <button
            className="w-full border rounded px-3 py-2 mt-2"
            onClick={() => {
              startSaving(async () => {
                const res = await publishWidget(projectId)
                if ('error' in res) { setSaveMsg('Publish error: ' + (res as { error: string }).error); return }
                setSaveMsg(`Published v${(res as { version: number }).version}`)
                const v = await listWidgetVersions(projectId)
                if ('versions' in v) setVersions(v.versions as unknown as Array<{version:number; published_at:string; published_by:string}>)
              })
            }}
          >
            Publish
          </button>

          <div className={`text-sm ${saving ? 'text-gray-500' : 'text-gray-600'} pt-2`} role="status">
            {saving ? 'Saving…' : (saveMsg || 'All changes saved')}
          </div>
        </Section>

        <Section title="Theme">
          <Field label="Preset">
            <select
              value={config.theme.preset ?? ''}
              onChange={(e) => applyPreset(e.target.value)}
              className="w-full border rounded px-2 py-1"
            >
              <option value="">Custom</option>
              {THEME_PRESETS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Text color">
              <input type="color" value={config.theme.color}
                onChange={(e) => updateConfig(prev => ({ ...prev, theme: { ...prev.theme, color: e.target.value } }))}
                className="w-full h-9 border rounded" />
            </Field>
            <Field label="Background">
              <input type="color" value={config.theme.background}
                onChange={(e) => updateConfig(prev => ({ ...prev, theme: { ...prev.theme, background: e.target.value } }))}
                className="w-full h-9 border rounded" />
            </Field>
            <Field label="Radius">
              <input type="range" min={0} max={24} value={config.theme.radius}
                onChange={(e) => updateConfig(prev => ({ ...prev, theme: { ...prev.theme, radius: Number(e.target.value) } }))}
                className="w-full" />
            </Field>
            <Field label="Font size">
              <select value={config.theme.fontSize}
                onChange={(e) => updateConfig(prev => ({ ...prev, theme: { ...prev.theme, fontSize: e.target.value as 'sm' | 'base' | 'lg' } }))}
                className="w-full border rounded px-2 py-1">
                <option value="sm">sm</option>
                <option value="base">base</option>
                <option value="lg">lg</option>
              </select>
            </Field>
          </div>
        </Section>

        <Section title="Preview options">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={!!config.preview?.darkMode}
              onChange={(e) => updateConfig(prev => ({ ...prev, preview: { ...(prev.preview ?? {}), darkMode: e.target.checked } }))}
            />
            <span>Dark mode</span>
          </label>
          <Field label="Scale">
            <input
              type="range"
              min={0.75} max={1.25} step={0.05}
              value={config.preview?.scale ?? 1}
              onChange={(e) => updateConfig(prev => ({ ...prev, preview: { ...(prev.preview ?? {}), scale: Number(e.target.value) } }))}
              className="w-full"
            />
          </Field>
        </Section>
      </div>

      {/* Middle: Order + Inspector */}
      <div className="space-y-6">
        <Section title="Order">
          <DndContext sensors={sensors} onDragEnd={onDragEnd}>
            <SortableContext items={config.order} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {config.order.map((id) => {
                  const def = BlockRegistry[id as BlockId]
                  return (
                    <SortableItem
                      key={id}
                      id={id}
                      label={def?.label ?? id}
                      onRemove={() => removeBlock(id as BlockId)}
                      selected={selected === id}
                      onSelect={() => setSelected(id as BlockId)}
                    />
                  )
                })}
                {config.order.length === 0 && (
                  <div className="text-sm text-gray-500">No blocks yet. Add from the left.</div>
                )}
              </div>
            </SortableContext>
          </DndContext>
        </Section>

        <Section title="Inspector">
          <Inspector />
        </Section>
      </div>

      {/* Right: Versions + Preview (stack on smaller screens) */}
      <div className="space-y-6 xl:col-span-2">
        <Section title="Versions">
          <ul className="space-y-2 text-sm">
            {versions.length === 0 && <li className="text-gray-500">No published versions yet.</li>}
            {versions.map(v => (
              <li key={v.version} className="flex items-center justify-between border rounded px-2 py-1">
                <span>v{v.version} · {new Date(v.published_at).toLocaleString()}</span>
                <button
                  className="underline"
                  onClick={() => {
                    // restore + reload to sync local state
                    (async () => {
                      const res = await rollbackWidget(projectId, v.version)
                      if ('error' in res) { setSaveMsg('Rollback error: ' + (res as { error: string }).error); return }
                      setSaveMsg(`Rolled back to v${v.version}`); location.reload()
                    })()
                  }}
                >
                  Restore
                </button>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Preview">
          <Preview config={config} />
        </Section>
      </div>
    </div>
  )
}