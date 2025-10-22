import React from 'react'
import type { WidgetConfig } from './schema'

export type BlockId = 'rating' | 'comment' | 'nps'

export type BlockDefinition = {
  id: BlockId
  label: string
  renderPreview: (cfg: WidgetConfig, onChange?: (partial: Partial<WidgetConfig>) => void) => React.ReactNode
  defaultEnabled: boolean
}

export const BlockRegistry: Record<BlockId, BlockDefinition> = {
  rating: {
    id: 'rating',
    label: 'Rating',
    defaultEnabled: true,
    renderPreview: (cfg) => {
      const b = cfg.blocks.rating
      return (
        <div className="mb-4">
          <div className="mb-2 font-medium">{b.label}</div>
          <div className="flex gap-2">
            {Array.from({ length: b.max }).map((_, i) => (
              <button key={i} className="border px-3 py-1 rounded">{i + 1}</button>
            ))}
          </div>
        </div>
      )
    },
  },
  comment: {
    id: 'comment',
    label: 'Comment',
    defaultEnabled: true,
    renderPreview: (cfg) => {
      const b = cfg.blocks.comment
      return (
        <div className="mb-2">
          <div className="mb-2 font-medium">{b.label}</div>
          <textarea
            placeholder={b.placeholder}
            className="w-full border px-3 py-2 rounded"
            rows={3}
          />
        </div>
      )
    },
  },
  nps: {
    id: 'nps',
    label: 'NPS',
    defaultEnabled: false,
    renderPreview: (cfg) => {
      const b = cfg.blocks.nps
      return (
        <div className="mb-4">
          <div className="mb-2 font-medium">{b.label}</div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs opacity-70">{b.leftLabel}</span>
            {Array.from({ length: b.max - b.min + 1 }).map((_, i) => {
              const v = b.min + i
              return <button key={v} className="border px-2 py-1 rounded">{v}</button>
            })}
            <span className="text-xs opacity-70">{b.rightLabel}</span>
          </div>
        </div>
      )
    },
  },
}
