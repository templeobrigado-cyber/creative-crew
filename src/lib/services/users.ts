import { supabase, isSupabaseConfigured } from '../supabase'
import type { AdminUser, UserRole } from '../types'

export interface CreateUserInput {
  email: string
  display_name: string
  role: UserRole
  is_active: boolean
}

export async function getAdminUsers(): Promise<AdminUser[]> {
  if (!isSupabaseConfigured || !supabase) return []

  const { data, error } = await supabase
    .from('admin_user')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) { console.error(error); return [] }
  return data ?? []
}

export async function createAdminUser(input: CreateUserInput): Promise<AdminUser | null> {
  if (!isSupabaseConfigured || !supabase) return null

  const { data, error } = await supabase
    .from('admin_user')
    .insert(input)
    .select()
    .single()

  if (error) { console.error(error); return null }
  return data
}

export async function updateAdminUser(
  id: string,
  input: Partial<CreateUserInput>
): Promise<AdminUser | null> {
  if (!isSupabaseConfigured || !supabase) return null

  const { data, error } = await supabase
    .from('admin_user')
    .update(input)
    .eq('id', id)
    .select()
    .single()

  if (error) { console.error(error); return null }
  return data
}

export async function deleteAdminUser(id: string): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false

  const { error } = await supabase.from('admin_user').delete().eq('id', id)
  if (error) { console.error(error); return false }
  return true
}
