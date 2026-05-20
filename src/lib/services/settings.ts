import { supabase, isSupabaseConfigured } from '../supabase'

export type SettingsMap = Record<string, string>

export async function getSettings(): Promise<SettingsMap> {
  if (!isSupabaseConfigured || !supabase) return {}

  const { data, error } = await supabase
    .from('site_setting')
    .select('key, value')

  if (error) { console.error(error); return {} }

  return Object.fromEntries((data ?? []).map(r => [r.key, r.value]))
}

export async function saveSettings(settings: SettingsMap): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false

  const rows = Object.entries(settings).map(([key, value]) => ({ key, value }))
  if (rows.length === 0) return true

  const { error } = await supabase
    .from('site_setting')
    .upsert(rows, { onConflict: 'key' })

  if (error) { console.error(error); return false }
  return true
}
