import { supabase, isSupabaseConfigured } from '../supabase'
import type { Tag } from '../types'

export type CreateTagInput = Omit<Tag, 'id'>
export type UpdateTagInput = Partial<CreateTagInput>

export async function getTags(): Promise<Tag[]> {
  if (!isSupabaseConfigured || !supabase) return []

  const { data, error } = await supabase
    .from('tag')
    .select('*')
    .order('name')

  if (error) { console.error(error); return [] }
  return data ?? []
}

export async function getTagUsageCounts(): Promise<Record<string, number>> {
  if (!isSupabaseConfigured || !supabase) return {}

  const { data, error } = await supabase
    .from('article_tag')
    .select('tag_id')

  if (error) { console.error(error); return {} }

  return (data ?? []).reduce<Record<string, number>>((acc, row) => {
    acc[row.tag_id] = (acc[row.tag_id] ?? 0) + 1
    return acc
  }, {})
}

export async function createTag(input: CreateTagInput): Promise<Tag | null> {
  if (!isSupabaseConfigured || !supabase) return null

  const { data, error } = await supabase
    .from('tag')
    .insert(input)
    .select()
    .single()

  if (error) { console.error(error); return null }
  return data
}

export async function updateTag(id: string, input: UpdateTagInput): Promise<Tag | null> {
  if (!isSupabaseConfigured || !supabase) return null

  const { data, error } = await supabase
    .from('tag')
    .update(input)
    .eq('id', id)
    .select()
    .single()

  if (error) { console.error(error); return null }
  return data
}

export async function deleteTag(id: string): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false

  const { error } = await supabase.from('tag').delete().eq('id', id)
  if (error) { console.error(error); return false }
  return true
}
