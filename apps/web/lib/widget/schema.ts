import { z } from 'zod'

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
  }).default({}),
  comment: z.object({
    enabled: z.boolean().default(true),
    label: z.string().default('Tell us more'),
    placeholder: z.string().default('Your thoughts…'),
    minLength: z.number().int().min(0).max(500).default(0),
  }).default({}),
})

export const WidgetConfigSchema = z.object({
  theme: ThemeSchema.default({}),
  blocks: BlocksSchema.default({}),
})

export type WidgetConfig = z.infer<typeof WidgetConfigSchema>

// sensible default
export const DEFAULT_WIDGET_CONFIG: WidgetConfig = WidgetConfigSchema.parse({})
