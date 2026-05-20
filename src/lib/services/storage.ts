import { supabase, isSupabaseConfigured } from '../supabase'

const BUCKET = 'article-images'

export async function uploadImage(file: File): Promise<string | null> {
  if (!isSupabaseConfigured || !supabase) return null

  const ext = file.name.split('.').pop() ?? 'jpg'
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  })

  if (error) { console.error(error); return null }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return data.publicUrl
}
