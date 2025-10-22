import { z } from 'zod'

export const ThemeSchema = z.object({
  color: z.string().default('#111827'),
  background: z.string().default('#ffffff'),
  radius: z.number().int().min(0).max(24).default(12),
  fontSize: z.enum(['sm','base','lg']).default('base'),
  /** NEW: name of a preset (e.g., 'slate', 'emerald', 'amber'...) */
  preset: z.string().optional(),
})

export const RatingBlockSchema = z.object({
  enabled: z.boolean().default(true),
  label: z.string().default('How would you rate your experience?'),
  max: z.number().int().min(3).max(10).default(5),
})

export const CommentBlockSchema = z.object({
  enabled: z.boolean().default(true),
  label: z.string().default('Tell us more'),
  placeholder: z.string().default('Your thoughts…'),
  minLength: z.number().int().min(0).max(500).default(0),
})

export const NpsBlockSchema = z.object({
  enabled: z.boolean().default(false),
  label: z.string().default('How likely are you to recommend us to a friend?'),
  min: z.number().int().min(0).max(5).default(0),
  max: z.number().int().min(5).max(10).default(10),
  leftLabel: z.string().default('Not likely'),
  rightLabel: z.string().default('Very likely'),
})

export const BlocksSchema = z.object({
  rating: RatingBlockSchema,
  comment: CommentBlockSchema,
  nps: NpsBlockSchema,
})

/** NEW: order array controls which blocks render & in what order */
export const OrderSchema = z
  .array(z.enum(['rating', 'comment', 'nps']))
  .default(['rating', 'comment'])

/** NEW: studio-only preview options (not used by runtime yet) */
export const PreviewSchema = z.object({
  darkMode: z.boolean().default(false),
  scale: z.number().min(0.75).max(1.25).default(1),
})

// Flexible schema that handles partial data
export const WidgetConfigSchema = z.object({
  theme: ThemeSchema,
  blocks: BlocksSchema,
  order: OrderSchema,
  preview: PreviewSchema, // NEW
}).partial().transform((data) => {
  // Merge with defaults to ensure all fields are present
  return {
    theme: { ...ThemeSchema.parse({}), ...data.theme },
    blocks: {
      rating: { ...RatingBlockSchema.parse({}), ...data.blocks?.rating },
      comment: { ...CommentBlockSchema.parse({}), ...data.blocks?.comment },
      nps: { ...NpsBlockSchema.parse({}), ...data.blocks?.nps },
    },
    order: data.order || ['rating', 'comment'],
    preview: { ...PreviewSchema.parse({}), ...data.preview },
  }
})

export type WidgetConfig = z.infer<typeof WidgetConfigSchema>

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
    nps: {
      enabled: false,
      label: 'How likely are you to recommend us to a friend?',
      min: 0,
      max: 10,
      leftLabel: 'Not likely',
      rightLabel: 'Very likely',
    },
  },
  order: ['rating', 'comment'],
  preview: {
    darkMode: false,
    scale: 1,
  },
}
