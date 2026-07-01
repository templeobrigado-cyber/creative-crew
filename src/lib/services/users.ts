import { supabase, isSupabaseConfigured } from '../supabase'

export type UserRole = 'admin' | 'client' | 'creator'

export type User = {
  id: string
  role: UserRole
  name: string
  email: string
  avatar_url: string | null
  line_user_id: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export type CreatorProfile = {
  id: string
  user_id: string
  nickname: string | null
  prefecture: string | null
  occupation: string[] | null
  skills: string[] | null
  experience_years: number | null
  skill_level: string | null
  portfolio_url: string | null
  hourly_rate_min: number | null
  hourly_rate_max: number | null
  remote_ok: boolean
  immediate_ok: boolean
  bio: string | null
  avg_rating: number
  completed_count: number
  created_at: string
  updated_at: string
  user?: User
}

export type ClientProfile = {
  id: string
  user_id: string
  company_name: string | null
  company_url: string | null
  industry: string | null
  bio: string | null
  created_at: string
  user?: User
}

const MOCK_USERS: User[] = [
  { id: '1', role: 'admin',   name: '管理者',               email: 'admin@creativecrew.jp', avatar_url: null, line_user_id: null, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '2', role: 'client',  name: 'サンプル発注者',       email: 'client@example.com',    avatar_url: null, line_user_id: null, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '3', role: 'creator', name: 'サンプルクリエイター', email: 'creator@example.com',   avatar_url: null, line_user_id: null, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
]

export async function getUsers(role?: UserRole): Promise<User[]> {
  if (!isSupabaseConfigured || !supabase) {
    return role ? MOCK_USERS.filter(u => u.role === role) : MOCK_USERS
  }
  let q = supabase.from('users').select('*').order('created_at', { ascending: false })
  if (role) q = q.eq('role', role)
  const { data, error } = await q
  if (error) {
    console.error(error)
    // テーブル未作成時はモックにフォールバック
    return role ? MOCK_USERS.filter(u => u.role === role) : MOCK_USERS
  }
  return data ?? []
}

export async function getUserByEmail(email: string): Promise<User | null> {
  if (!isSupabaseConfigured || !supabase) return MOCK_USERS.find(u => u.email === email) ?? null
  const { data, error } = await supabase.from('users').select('*').eq('email', email).single()
  if (error) { console.error(error); return null }
  return data
}

export async function getUserById(id: string): Promise<User | null> {
  if (!isSupabaseConfigured || !supabase) return MOCK_USERS.find(u => u.id === id) ?? null
  const { data, error } = await supabase.from('users').select('*').eq('id', id).single()
  if (error) { console.error(error); return null }
  return data
}

export async function createUser(input: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User | null> {
  if (!isSupabaseConfigured || !supabase) return null
  const { data, error } = await supabase.from('users').insert(input).select().single()
  if (error) { console.error(error); return null }
  return data
}

export async function updateUser(id: string, input: Partial<User>): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false
  const { error } = await supabase.from('users').update({ ...input, updated_at: new Date().toISOString() }).eq('id', id)
  if (error) { console.error(error); return false }
  return true
}

export async function getCreators(): Promise<CreatorProfile[]> {
  if (!isSupabaseConfigured || !supabase) return []
  const { data, error } = await supabase
    .from('creator_profiles')
    .select('*, user:users(*)')
    .order('created_at', { ascending: false })
  if (error) { console.error(error); return [] }
  return data ?? []
}

export async function getCreatorByUserId(userId: string): Promise<CreatorProfile | null> {
  if (!isSupabaseConfigured || !supabase) return null
  const { data, error } = await supabase
    .from('creator_profiles')
    .select('*, user:users(*)')
    .eq('user_id', userId)
    .single()
  if (error) { console.error(error); return null }
  return data
}

export async function upsertCreatorProfile(input: Partial<CreatorProfile> & { user_id: string }): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false
  const { error } = await supabase
    .from('creator_profiles')
    .upsert({ ...input, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
  if (error) { console.error(error); return false }
  return true
}

export async function getClientByUserId(userId: string): Promise<ClientProfile | null> {
  if (!isSupabaseConfigured || !supabase) return null
  const { data, error } = await supabase
    .from('client_profiles')
    .select('*, user:users(*)')
    .eq('user_id', userId)
    .single()
  if (error) { console.error(error); return null }
  return data
}

export async function upsertClientProfile(input: Partial<ClientProfile> & { user_id: string }): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false
  const { error } = await supabase
    .from('client_profiles')
    .upsert({ ...input }, { onConflict: 'user_id' })
  if (error) { console.error(error); return false }
  return true
}

export async function getClients(): Promise<ClientProfile[]> {
  if (!isSupabaseConfigured || !supabase) return []
  const { data, error } = await supabase
    .from('client_profiles')
    .select('*, user:users(*)')
    .order('created_at', { ascending: false })
  if (error) { console.error(error); return [] }
  return data ?? []
}
