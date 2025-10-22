import { z } from 'zod'

// Legacy schema for backward compatibility
const LegacyThemeSchema = z.string().default('light')
const LegacyBlocksSchema = z.object({
  showRating: z.boolean().default(true),
  showComment: z.boolean().default(true),
}).optional()

// New schema
export const ThemeSchema = z.object({
  color: z.string().default('#111827'),   // text color
  background: z.string().default('#ffffff'),
  radius: z.number().int().min(0).max(24).default(12),
  fontSize: z.enum(['sm','base','lg']).default('base'),
})

export const BlocksSchema = z.object({
  rating: z.object({
    enabled: z.boolean().default(true),
    label: z.string().default('How would you rate your experience?'),
    max: z.number().int().min(3).max(10).default(5),
  }),
  comment: z.object({
    enabled: z.boolean().default(true),
    label: z.string().default('Tell us more'),
    placeholder: z.string().default('Your thoughts…'),
    minLength: z.number().int().min(0).max(500).default(0),
  }),
})

// Flexible schema that can handle both legacy and new formats
export const WidgetConfigSchema = z.union([
  // New format
  z.object({
    theme: ThemeSchema,
    blocks: BlocksSchema,
  }),
  // Legacy format - transform to new format
  z.object({
    theme: LegacyThemeSchema,
    title: z.string().optional(),
    logoUrl: z.string().optional(),
    showRating: z.boolean().optional(),
    showComment: z.boolean().optional(),
    blocks: LegacyBlocksSchema,
  }).transform((legacy) => ({
    theme: {
      color: '#111827',
      background: '#ffffff',
      radius: 12,
      fontSize: 'base' as const,
    },
    blocks: {
      rating: {
        enabled: legacy.showRating ?? true,
        label: 'How would you rate your experience?',
        max: 5,
      },
      comment: {
        enabled: legacy.showComment ?? true,
        label: 'Tell us more',
        placeholder: 'Your thoughts…',
        minLength: 0,
      },
    },
  }))
])

export type WidgetConfig = z.infer<typeof WidgetConfigSchema>

// sensible default
export const DEFAULT_WIDGET_CONFIG: WidgetConfig = {
  theme: {
    color: '#111827',
    background: '#ffffff',
    radius: 12,
    fontSize: 'base',
  },
  blocks: {
    rating: {
      enabled: true,
      label: 'How would you rate your experience?',
      max: 5,
    },
    comment: {
      enabled: true,
      label: 'Tell us more',
      placeholder: 'Your thoughts…',
      minLength: 0,
    },
  },
}
