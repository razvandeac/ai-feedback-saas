'use client'

import { useEffect, useState, useTransition } from 'react'
import { WidgetConfigSchema, type WidgetConfig, DEFAULT_WIDGET_CONFIG } from '@/lib/widget/schema'
import { saveWidgetConfig } from '@/app/actions/widget'
import { BlockRegistry, type BlockId } from '@/lib/widget/blocks'
import {
  DndContext, DragEndEvent, PointerSensor, useSensor, useSensors
} from '@dnd-kit/core'
import {
  SortableContext, arrayMove, useSortable, verticalListSortingStrategy
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1">
      <div className="text-sm text-gray-700">{label}</div>
      {children}
    </label>
  )
}

/** Sortable Item for the block list */
function SortableItem({ id, label, onRemove, selected, onSelect }: {
  id: string; label: string; onRemove: () => void; selected: boolean; onSelect: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id })
  const style = { transform: CSS.Transform.toString(transform), transition }
  return (
    <div ref={setNodeRef} style={style} className={`border rounded p-2 flex items-center justify-between ${selected ? 'bg-gray-50' : ''}`}>
      <button {...attributes} {...listeners} className="cursor-grab px-2 text-sm opacity-60">↕</button>
      <button onClick={onSelect} className="flex-1 text-left">{label}</button>
      <button onClick={onRemove} className="text-xs underline opacity-70 px-2">Remove</button>
    </div>
  )
}

function Preview({ config }: { config: WidgetConfig }) {
  return (
    <div className="border rounded-xl p-4" style={{ background: config.theme.background, color: config.theme.color }}>
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
  )
}

export default function Studio({ projectId, initial }: { projectId: string; initial: unknown }) {
  const [config, setConfig] = useState<WidgetConfig>(() => {
    try {
      return WidgetConfigSchema.parse(initial)
    } catch (error) {
      console.warn('Failed to parse initial widget config, using defaults:', error)
      return DEFAULT_WIDGET_CONFIG
    }
  })
  const [saving, startSaving] = useTransition()
  const [saveMsg, setSaveMsg] = useState<string>('')

  const [selected, setSelected] = useState<BlockId | null>(config.order[0] ?? null)

  // DnD setup
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e
    if (!over || active.id === over.id) return
    setConfig((prev) => {
      const oldIndex = prev.order.findIndex(x => x === active.id)
      const newIndex = prev.order.findIndex(x => x === over.id)
      return { ...prev, order: arrayMove(prev.order, oldIndex, newIndex) }
    })
  }

  // Autosave (debounced-ish)
  useEffect(() => {
    const t = setTimeout(() => {
      startSaving(async () => {
        const res = await saveWidgetConfig(projectId, config)
        setSaveMsg('Saved at ' + new Date().toLocaleTimeString())
        if ('error' in res) setSaveMsg('Save error: ' + (res as { error: string }).error)
      })
    }, 600)
    return () => clearTimeout(t)
  }, [config, projectId])

  // Mutators
  function toggleEnabled(id: BlockId, value: boolean) {
    setConfig((prev) => {
      const blocks = { ...prev.blocks }
      if (id === 'rating') blocks.rating = { ...blocks.rating, enabled: value }
      if (id === 'comment') blocks.comment = { ...blocks.comment, enabled: value }
      if (id === 'nps') blocks.nps = { ...blocks.nps, enabled: value }
      return { ...prev, blocks }
    })
  }

  function addBlock(id: BlockId) {
    setConfig((prev) => {
      if (prev.order.includes(id)) return prev
      // enable on add
      const blocks = { ...prev.blocks }
      if (id === 'rating') blocks.rating = { ...blocks.rating, enabled: true }
      if (id === 'comment') blocks.comment = { ...blocks.comment, enabled: true }
      if (id === 'nps') blocks.nps = { ...blocks.nps, enabled: true }
      return { ...prev, order: [...prev.order, id], blocks }
    })
    setSelected(id)
  }

  function removeBlock(id: BlockId) {
    setConfig((prev) => ({ ...prev, order: prev.order.filter(x => x !== id) }))
    setSelected((cur) => (cur === id ? null : cur))
  }

  // Inspector forms per block
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
              onChange={(e) => setConfig({ ...config, blocks: { ...config.blocks, rating: { ...b, label: e.target.value } } })} />
          </Field>
          <Field label="Max">
            <input type="number" min={3} max={10} className="w-full border rounded px-2 py-1"
              value={b.max}
              onChange={(e) => setConfig({ ...config, blocks: { ...config.blocks, rating: { ...b, max: Number(e.target.value) } } })} />
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
              onChange={(e) => setConfig({ ...config, blocks: { ...config.blocks, comment: { ...b, label: e.target.value } } })} />
          </Field>
          <Field label="Placeholder">
            <input className="w-full border rounded px-2 py-1"
              value={b.placeholder}
              onChange={(e) => setConfig({ ...config, blocks: { ...config.blocks, comment: { ...b, placeholder: e.target.value } } })} />
          </Field>
          <Field label="Min length">
            <input type="number" min={0} max={500} className="w-full border rounded px-2 py-1"
              value={b.minLength}
              onChange={(e) => setConfig({ ...config, blocks: { ...config.blocks, comment: { ...b, minLength: Number(e.target.value) } } })} />
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
              onChange={(e) => setConfig({ ...config, blocks: { ...config.blocks, nps: { ...b, label: e.target.value } } })} />
          </Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Min">
              <input type="number" min={0} max={5} className="w-full border rounded px-2 py-1"
                value={b.min}
                onChange={(e) => setConfig({ ...config, blocks: { ...config.blocks, nps: { ...b, min: Number(e.target.value) } } })} />
            </Field>
            <Field label="Max">
              <input type="number" min={5} max={10} className="w-full border rounded px-2 py-1"
                value={b.max}
                onChange={(e) => setConfig({ ...config, blocks: { ...config.blocks, nps: { ...b, max: Number(e.target.value) } } })} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Left label">
              <input className="w-full border rounded px-2 py-1"
                value={b.leftLabel}
                onChange={(e) => setConfig({ ...config, blocks: { ...config.blocks, nps: { ...b, leftLabel: e.target.value } } })} />
            </Field>
            <Field label="Right label">
              <input className="w-full border rounded px-2 py-1"
                value={b.rightLabel}
                onChange={(e) => setConfig({ ...config, blocks: { ...config.blocks, nps: { ...b, rightLabel: e.target.value } } })} />
            </Field>
          </div>
        </div>
      )
    }

    return null
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Palette */}
      <aside className="border rounded-xl p-4 space-y-3">
        <h2 className="font-semibold">Add blocks</h2>
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
        <div className="text-sm text-gray-600 pt-2">{saving ? 'Saving…' : (saveMsg || 'Saved')}</div>
      </aside>

      {/* Sortable list */}
      <aside className="border rounded-xl p-4 space-y-3">
        <h2 className="font-semibold">Order</h2>
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
      </aside>

      {/* Inspector */}
      <aside className="border rounded-xl p-4 space-y-3">
        <h2 className="font-semibold">Inspector</h2>
        <Inspector />
      </aside>

      {/* Live preview */}
      <section className="lg:col-span-1 border rounded-xl p-4">
        <h2 className="font-semibold mb-3">Preview</h2>
        <Preview config={config} />
      </section>
    </div>
  )
}