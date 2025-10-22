'use client'

import { useEffect, useState, useTransition } from 'react'
import { WidgetConfigSchema, type WidgetConfig, DEFAULT_WIDGET_CONFIG } from '@/lib/widget/schema'
import { saveWidgetConfig } from '@/app/actions/widget'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1">
      <div className="text-sm text-gray-700">{label}</div>
      {children}
    </label>
  )
}

function Preview({ config }: { config: WidgetConfig }) {
  const fs = { sm: 'text-sm', base: 'text-base', lg: 'text-lg' }[config.theme.fontSize]
  const rad = `rounded-[${config.theme.radius}px]`
  return (
    <div className="border rounded-xl p-4" style={{ background: config.theme.background, color: config.theme.color }}>
      {config.blocks.rating.enabled && (
        <div className="mb-4">
          <div className={`mb-2 ${fs} font-medium`}>{config.blocks.rating.label}</div>
          <div className="flex gap-2">
            {Array.from({ length: config.blocks.rating.max }).map((_, i) => (
              <button key={i} className={`border px-3 py-1 rounded ${rad}`}>{i + 1}</button>
            ))}
          </div>
        </div>
      )}
      {config.blocks.comment.enabled && (
        <div className="mb-2">
          <div className={`mb-2 ${fs} font-medium`}>{config.blocks.comment.label}</div>
          <textarea
            placeholder={config.blocks.comment.placeholder}
            className={`w-full border px-3 py-2 rounded ${rad}`}
            rows={3}
          />
        </div>
      )}
      <button className={`mt-3 border px-3 py-2 ${rad}`}>Send feedback</button>
    </div>
  )
}

export default function Studio({ projectId, initial }: { projectId: string; initial: unknown }) {
  const [config, setConfig] = useState<WidgetConfig>(() => {
    try {
      // Try to parse the initial data, fallback to default if it fails
      return WidgetConfigSchema.parse(initial)
    } catch (error) {
      console.warn('Failed to parse initial widget config:', error)
      console.warn('Initial data:', initial)
      return DEFAULT_WIDGET_CONFIG
    }
  })
  const [saving, startSaving] = useTransition()
  const [saveMsg, setSaveMsg] = useState<string>('')

  // basic autosave (debounced)
  useEffect(() => {
    const t = setTimeout(() => {
      startSaving(async () => {
        const res = await saveWidgetConfig(projectId, config)
        setSaveMsg('Saved at ' + new Date().toLocaleTimeString())
        if ('error' in res) setSaveMsg('Save error: ' + (res as { error: string }).error)
      })
    }, 800)
    return () => clearTimeout(t)
  }, [config, projectId])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Sidebar */}
      <aside className="lg:col-span-1 border rounded-xl p-4 space-y-6">
        <div>
          <h2 className="font-semibold mb-3">Theme</h2>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Text color">
              <input type="color" value={config.theme.color}
                onChange={(e) => setConfig({ ...config, theme: { ...config.theme, color: e.target.value } })}
                className="w-full h-9 border rounded" />
            </Field>
            <Field label="Background">
              <input type="color" value={config.theme.background}
                onChange={(e) => setConfig({ ...config, theme: { ...config.theme, background: e.target.value } })}
                className="w-full h-9 border rounded" />
            </Field>
            <Field label="Radius">
              <input type="range" min={0} max={24} value={config.theme.radius}
                onChange={(e) => setConfig({ ...config, theme: { ...config.theme, radius: Number(e.target.value) } })}
                className="w-full" />
            </Field>
            <Field label="Font size">
              <select value={config.theme.fontSize}
                onChange={(e) => setConfig({ ...config, theme: { ...config.theme, fontSize: e.target.value as 'sm' | 'base' | 'lg' } })}
                className="w-full border rounded px-2 py-1">
                <option value="sm">sm</option>
                <option value="base">base</option>
                <option value="lg">lg</option>
              </select>
            </Field>
          </div>
        </div>

        <div>
          <h2 className="font-semibold mb-3">Blocks</h2>
          <div className="space-y-4">
            <div className="border rounded p-3">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={config.blocks.rating.enabled}
                  onChange={(e) => setConfig({ ...config, blocks: { ...config.blocks, rating: { ...config.blocks.rating, enabled: e.target.checked } } })} />
                <span>Rating</span>
              </label>
              <Field label="Label">
                <input className="w-full border rounded px-2 py-1"
                  value={config.blocks.rating.label}
                  onChange={(e) => setConfig({ ...config, blocks: { ...config.blocks, rating: { ...config.blocks.rating, label: e.target.value } } })} />
              </Field>
              <Field label="Max">
                <input type="number" min={3} max={10} className="w-full border rounded px-2 py-1"
                  value={config.blocks.rating.max}
                  onChange={(e) => setConfig({ ...config, blocks: { ...config.blocks, rating: { ...config.blocks.rating, max: Number(e.target.value) } } })} />
              </Field>
            </div>

            <div className="border rounded p-3">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={config.blocks.comment.enabled}
                  onChange={(e) => setConfig({ ...config, blocks: { ...config.blocks, comment: { ...config.blocks.comment, enabled: e.target.checked } } })} />
                <span>Comment</span>
              </label>
              <Field label="Label">
                <input className="w-full border rounded px-2 py-1"
                  value={config.blocks.comment.label}
                  onChange={(e) => setConfig({ ...config, blocks: { ...config.blocks, comment: { ...config.blocks.comment, label: e.target.value } } })} />
              </Field>
              <Field label="Placeholder">
                <input className="w-full border rounded px-2 py-1"
                  value={config.blocks.comment.placeholder}
                  onChange={(e) => setConfig({ ...config, blocks: { ...config.blocks, comment: { ...config.blocks.comment, placeholder: e.target.value } } })} />
              </Field>
              <Field label="Min length">
                <input type="number" min={0} max={500} className="w-full border rounded px-2 py-1"
                  value={config.blocks.comment.minLength}
                  onChange={(e) => setConfig({ ...config, blocks: { ...config.blocks, comment: { ...config.blocks.comment, minLength: Number(e.target.value) } } })} />
              </Field>
            </div>
          </div>
        </div>

        <div className="text-sm text-gray-600">{saving ? 'Saving…' : (saveMsg || 'Saved')}</div>
      </aside>

      {/* Preview */}
      <section className="lg:col-span-2">
        <Preview config={config} />
      </section>
    </div>
  )
}
