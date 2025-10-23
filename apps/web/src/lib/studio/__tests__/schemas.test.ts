import { ThemeSchema, WidgetConfigSchema } from '@/src/lib/studio/WidgetConfigSchema'
import { BlockSchema } from '@/src/lib/studio/blocks/types'

describe('Studio Schemas', () => {
  describe('ThemeSchema', () => {
    it('should validate valid theme', () => {
      const theme = {
        variant: 'light',
        primaryColor: '#000000',
        backgroundColor: '#ffffff',
        fontFamily: 'Inter',
        borderRadius: 8,
      }
      expect(() => ThemeSchema.parse(theme)).not.toThrow()
    })

    it('should apply defaults', () => {
      const theme = ThemeSchema.parse({})
      expect(theme.variant).toBe('light')
      expect(theme.primaryColor).toBe('#000000')
      expect(theme.backgroundColor).toBe('#ffffff')
      expect(theme.fontFamily).toBe('Inter')
      expect(theme.borderRadius).toBe(8)
    })

    it('should reject invalid colors', () => {
      expect(() => ThemeSchema.parse({ primaryColor: 'invalid' })).toThrow()
      expect(() => ThemeSchema.parse({ backgroundColor: 'not-a-color' })).toThrow()
    })
  })

  describe('BlockSchema', () => {
    it('should validate text block', () => {
      const block = {
        id: crypto.randomUUID(),
        type: 'text',
        version: 1,
        data: { text: 'Hello', align: 'left' },
      }
      expect(() => BlockSchema.parse(block)).not.toThrow()
    })

    it('should validate image block', () => {
      const block = {
        id: crypto.randomUUID(),
        type: 'image',
        version: 1,
        data: { url: 'https://example.com/image.jpg', alt: 'Test' },
      }
      expect(() => BlockSchema.parse(block)).not.toThrow()
    })

    it('should validate container block', () => {
      const block = {
        id: crypto.randomUUID(),
        type: 'container',
        version: 1,
        data: { direction: 'vertical', gap: 8 },
      }
      expect(() => BlockSchema.parse(block)).not.toThrow()
    })
  })

  describe('WidgetConfigSchema', () => {
    it('should validate complete widget config', () => {
      const config = {
        theme: {
          variant: 'light',
          primaryColor: '#000000',
          backgroundColor: '#ffffff',
          fontFamily: 'Inter',
          borderRadius: 8,
        },
        blocks: [
          {
            id: crypto.randomUUID(),
            type: 'text',
            version: 1,
            data: { text: 'Hello', align: 'left' },
          },
        ],
      }
      expect(() => WidgetConfigSchema.parse(config)).not.toThrow()
    })

    it('should apply theme defaults', () => {
      const config = {
        theme: {},
        blocks: [],
      }
      const parsed = WidgetConfigSchema.parse(config)
      expect(parsed.theme.variant).toBe('light')
      expect(parsed.theme.primaryColor).toBe('#000000')
    })
  })
})
