export type RadiusKey = 'none' | 'small' | 'medium' | 'large'

const RADIUS_STORAGE_KEY = 'faq_radius_key'

const RADIUS_MAP: Record<RadiusKey, { sm: string; md: string; lg: string; label: string; preview: string }> = {
  none:   { sm: '0px',  md: '0px',  lg: '0px',  label: 'なし',  preview: '■' },
  small:  { sm: '2px',  md: '4px',  lg: '6px',  label: '小',    preview: '▢' },
  medium: { sm: '4px',  md: '8px',  lg: '12px', label: '中',    preview: '▣' },
  large:  { sm: '8px',  md: '16px', lg: '24px', label: '大',    preview: '◉' },
}

export const RADIUS_OPTIONS = Object.entries(RADIUS_MAP).map(([key, val]) => ({
  key: key as RadiusKey,
  ...val,
}))

export function applyRadius(key: RadiusKey) {
  const r = RADIUS_MAP[key]
  if (!r) return
  const root = document.documentElement
  root.style.setProperty('--radius-sm', r.sm)
  root.style.setProperty('--radius-md', r.md)
  root.style.setProperty('--radius-lg', r.lg)
  localStorage.setItem(RADIUS_STORAGE_KEY, key)
}

export function getStoredRadius(): RadiusKey {
  return (localStorage.getItem(RADIUS_STORAGE_KEY) as RadiusKey) || 'medium'
}

export function initRadius() {
  applyRadius(getStoredRadius())
}
