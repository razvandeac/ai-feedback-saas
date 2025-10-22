export type ThemePreset = {
  id: string
  label: string
  color: string
  background: string
}

export const THEME_PRESETS: ThemePreset[] = [
  { id: 'slate',   label: 'Slate',   color: '#0f172a', background: '#ffffff' },
  { id: 'zinc',    label: 'Zinc',    color: '#18181b', background: '#ffffff' },
  { id: 'emerald', label: 'Emerald', color: '#064e3b', background: '#ecfdf5' },
  { id: 'indigo',  label: 'Indigo',  color: '#1e1b4b', background: '#eef2ff' },
  { id: 'amber',   label: 'Amber',   color: '#78350f', background: '#fffbeb' },
  { id: 'rose',    label: 'Rose',    color: '#7f1d1d', background: '#fff1f2' },
  { id: 'night',   label: 'Night',   color: '#e5e7eb', background: '#0b1021' }, // darky
]
