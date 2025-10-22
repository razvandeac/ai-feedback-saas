import { z } from 'zod'

export const ThemeSchema = z.object({
  color: z.string().default('#111827'),
  background: z.string().default('#ffffff'),
  radius: z.number().int().min(0).max(24).default(12),
  fontSize: z.enum(['sm','base','lg']).default('base'),
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
  rating: RatingBlockSchema.default({}),
  comment: CommentBlockSchema.default({}),
  nps: NpsBlockSchema.default({}),
})

/** NEW: order array controls which blocks render & in what order */
export const OrderSchema = z
  .array(z.enum(['rating', 'comment', 'nps']))
  .default(['rating', 'comment'])

export const WidgetConfigSchema = z.object({
  theme: ThemeSchema.default({}),
  blocks: BlocksSchema.default({}),
  order: OrderSchema, // NEW
})

export type WidgetConfig = z.infer<typeof WidgetConfigSchema>

export const DEFAULT_WIDGET_CONFIG: WidgetConfig = WidgetConfigSchema.parse({})
