import { supabase, isSupabaseConfigured } from '../supabase'
import type { Category, CreateCategoryInput, UpdateCategoryInput } from '../types'
import { MOCK_CATEGORIES } from './mock-data'

export async function getCategories(): Promise<Category[]> {
  if (!isSupabaseConfigured || !supabase) return MOCK_CATEGORIES

  const { data, error } = await supabase
    .from('category')
    .select('*')
    .order('order')

  if (error) { console.error(error); return MOCK_CATEGORIES }
  return data ?? []
}

export async function getRootCategories(): Promise<Category[]> {
  const all = await getCategories()
  return all.filter(c => c.parent_id === null)
}

export async function getSubcategories(parentId: string): Promise<Category[]> {
  const all = await getCategories()
  return all.filter(c => c.parent_id === parentId)
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const all = await getCategories()
  return all.find(c => c.slug === slug) ?? null
}

export async function createCategory(input: CreateCategoryInput): Promise<Category | null> {
  if (!isSupabaseConfigured || !supabase) return null

  const { data, error } = await supabase
    .from('category')
    .insert(input)
    .select()
    .single()

  if (error) { console.error(error); return null }
  return data
}

export async function updateCategory(id: string, input: UpdateCategoryInput): Promise<Category | null> {
  if (!isSupabaseConfigured || !supabase) return null

  const { data, error } = await supabase
    .from('category')
    .update(input)
    .eq('id', id)
    .select()
    .single()

  if (error) { console.error(error); return null }
  return data
}

export async function deleteCategory(id: string): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false

  const { error } = await supabase.from('category').delete().eq('id', id)
  if (error) { console.error(error); return false }
  return true
}
