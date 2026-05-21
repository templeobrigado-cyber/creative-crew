export type RadiusKey = 'none' | 'small' | 'medium' | 'large'

const RADIUS_STORAGE_KEY = 'faq_radius_key'

const RADIUS_MAP: Record<RadiusKey, { base: string; sm: string; md: string; lg: string; label: string }> = {
  none:   { base: '0px',  sm: '0px',  md: '0px',  lg: '0px',  label: 'なし' },
  small:  { base: '3px',  sm: '2px',  md: '4px',  lg: '6px',  label: '小' },
  medium: { base: '6px',  sm: '4px',  md: '8px',  lg: '12px', label: '中' },
  large:  { base: '10px', sm: '8px',  md: '16px', lg: '24px', label: '大' },
}

export const RADIUS_OPTIONS = Object.entries(RADIUS_MAP).map(([key, val]) => ({
  key: key as RadiusKey,
  ...val,
}))

export function applyRadius(key: RadiusKey) {
  const r = RADIUS_MAP[key]
  if (!r) return
  const root = document.documentElement
  // --r-* は @theme inline の --radius-* が参照するランタイム変数
  root.style.setProperty('--r-base', r.base)
  root.style.setProperty('--r-sm', r.sm)
  root.style.setProperty('--r-md', r.md)
  root.style.setProperty('--r-lg', r.lg)
  localStorage.setItem(RADIUS_STORAGE_KEY, key)
}

export function getStoredRadius(): RadiusKey {
  return (localStorage.getItem(RADIUS_STORAGE_KEY) as RadiusKey) || 'medium'
}

export function initRadius() {
  applyRadius(getStoredRadius())
}
