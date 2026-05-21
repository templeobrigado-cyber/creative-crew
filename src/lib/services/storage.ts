import { supabase, isSupabaseConfigured } from '../supabase'

export type UploadResult = { url: string; error: null } | { url: null; error: string }

export async function uploadImage(file: File, bucket = 'article-images'): Promise<UploadResult> {
  if (!isSupabaseConfigured || !supabase) {
    return { url: null, error: 'Supabase が未設定です' }
  }

  const ext = file.name.split('.').pop() ?? 'jpg'
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  })

  if (error) {
    console.error('[uploadImage]', error)
    return { url: null, error: error.message }
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return { url: data.publicUrl, error: null }
}

export async function uploadSiteAsset(file: File): Promise<UploadResult> {
  return uploadImage(file, 'site-assets')
}
