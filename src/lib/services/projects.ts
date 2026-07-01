import { supabase, isSupabaseConfigured } from '../supabase'

export type ProjectStatus = 'draft' | 'open' | 'screening' | 'contracted' | 'completed' | 'closed'

export type Project = {
  id: string
  client_id: string
  admin_id: string | null
  category_id: string | null
  title: string
  description: string
  required_skills: string[] | null
  preferred_skills: string[] | null
  budget_min: number | null
  budget_max: number | null
  deadline: string | null
  headcount: number
  remote_ok: boolean
  work_conditions: string | null
  attachment_url: string | null
  status: ProjectStatus
  application_count: number
  referred_count: number
  hired_count: number
  created_at: string
  updated_at: string
  client?: { name: string; email: string }
  category?: { name: string; icon: string }
}

export type ProjectCategory = {
  id: string
  name: string
  icon: string
  order: number
}

export type Application = {
  id: string
  project_id: string
  creator_id: string
  message: string | null
  proposed_rate: number | null
  application_status: 'pending' | 'reviewing' | 'offered' | 'accepted' | 'rejected' | 'withdrawn'
  applied_via: 'web' | 'line'
  created_at: string
  updated_at: string
  creator?: { name: string; email: string }
  project?: { title: string }
}

const MOCK_PROJECTS: Project[] = [
  {
    id: 'p1', client_id: '2', admin_id: '1', category_id: null,
    title: 'キャラクターデザイン制作', description: 'ゲーム用のオリジナルキャラクターを5体デザインしていただきます。',
    required_skills: ['Photoshop', 'Illustrator'], preferred_skills: ['Procreate'],
    budget_min: 100000, budget_max: 200000, deadline: '2026-08-31',
    headcount: 1, remote_ok: true, work_conditions: null, attachment_url: null,
    status: 'open', application_count: 3, referred_count: 5, hired_count: 0,
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    client: { name: 'サンプル発注者', email: 'client@example.com' },
  },
  {
    id: 'p2', client_id: '2', admin_id: null, category_id: null,
    title: 'WEBサイトバナー制作', description: 'ECサイト用のキャンペーンバナーを10点作成。',
    required_skills: ['Photoshop'], preferred_skills: null,
    budget_min: 30000, budget_max: 50000, deadline: '2026-07-31',
    headcount: 1, remote_ok: true, work_conditions: null, attachment_url: null,
    status: 'draft', application_count: 0, referred_count: 0, hired_count: 0,
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    client: { name: 'サンプル発注者', email: 'client@example.com' },
  },
]

export async function getProjects(status?: ProjectStatus): Promise<Project[]> {
  if (!isSupabaseConfigured || !supabase) {
    return status ? MOCK_PROJECTS.filter(p => p.status === status) : MOCK_PROJECTS
  }
  let q = supabase
    .from('projects')
    .select('*, client:users!projects_client_id_fkey(name,email), category:project_categories(name,icon)')
    .order('created_at', { ascending: false })
  if (status) q = q.eq('status', status)
  const { data, error } = await q
  if (error) { console.error(error); return status ? MOCK_PROJECTS.filter(p => p.status === status) : MOCK_PROJECTS }
  return data ?? []
}

export async function getProjectById(id: string): Promise<Project | null> {
  if (!isSupabaseConfigured || !supabase) return MOCK_PROJECTS.find(p => p.id === id) ?? null
  const { data, error } = await supabase
    .from('projects')
    .select('*, client:users!projects_client_id_fkey(name,email), category:project_categories(name,icon)')
    .eq('id', id)
    .single()
  if (error) { console.error(error); return null }
  return data
}

export async function createProject(input: Omit<Project, 'id' | 'created_at' | 'updated_at' | 'application_count' | 'referred_count' | 'hired_count' | 'client' | 'category'>): Promise<Project | null> {
  if (!isSupabaseConfigured || !supabase) {
    const mock: Project = { ...input, id: crypto.randomUUID(), application_count: 0, referred_count: 0, hired_count: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
    MOCK_PROJECTS.unshift(mock)
    return mock
  }
  const { data, error } = await supabase.from('projects').insert(input).select().single()
  if (error) {
    console.error(error)
    const mock: Project = { ...input, id: crypto.randomUUID(), application_count: 0, referred_count: 0, hired_count: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
    MOCK_PROJECTS.unshift(mock)
    return mock
  }
  return data
}

export async function updateProject(id: string, input: Partial<Project>): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false
  const { client: _, category: __, ...rest } = input
  const { error } = await supabase.from('projects').update({ ...rest, updated_at: new Date().toISOString() }).eq('id', id)
  if (error) { console.error(error); return false }
  return true
}

export async function deleteProject(id: string): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false
  const { error } = await supabase.from('projects').delete().eq('id', id)
  if (error) { console.error(error); return false }
  return true
}

export async function getProjectCategories(): Promise<ProjectCategory[]> {
  if (!isSupabaseConfigured || !supabase) return []
  const { data, error } = await supabase.from('project_categories').select('*').order('order')
  if (error) { console.error(error); return [] }
  return data ?? []
}

export async function getApplications(projectId?: string): Promise<Application[]> {
  if (!isSupabaseConfigured || !supabase) return []
  let q = supabase
    .from('applications')
    .select('*, creator:users!applications_creator_id_fkey(name,email), project:projects(title)')
    .order('created_at', { ascending: false })
  if (projectId) q = q.eq('project_id', projectId)
  const { data, error } = await q
  if (error) { console.error(error); return [] }
  return data ?? []
}

export async function createApplication(input: {
  project_id: string
  creator_id: string
  message: string
  proposed_rate: number | null
}): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false
  const { error } = await supabase.from('applications').insert({
    ...input,
    application_status: 'pending',
    applied_via: 'web',
  })
  if (error) { console.error(error); return false }
  return true
}

export async function notifyCreator(
  targetId: string,
  payload: {
    to_email: string
    creator_name: string
    project_title: string
    project_description: string
    budget_min?: number | null
    budget_max?: number | null
    deadline?: string | null
    required_skills?: string[] | null
  }
): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false
  const { error: fnError } = await supabase.functions.invoke('notify-creator', {
    body: {
      to_email: payload.to_email,
      creator_name: payload.creator_name,
      project_title: payload.project_title,
      project_description: payload.project_description,
      budget_min: payload.budget_min ?? undefined,
      budget_max: payload.budget_max ?? undefined,
      deadline: payload.deadline ?? undefined,
      required_skills: payload.required_skills ?? undefined,
    },
  })
  if (fnError) { console.error(fnError); return false }
  const { error } = await supabase
    .from('project_targets')
    .update({ notify_status: 'sent', notified_at: new Date().toISOString() })
    .eq('id', targetId)
  if (error) { console.error(error); return false }
  return true
}

export async function getApplicationsByCreatorId(creatorId: string): Promise<Application[]> {
  if (!isSupabaseConfigured || !supabase) return []
  const { data, error } = await supabase
    .from('applications')
    .select('*, project:projects(title, budget_min, budget_max, deadline, status)')
    .eq('creator_id', creatorId)
    .order('created_at', { ascending: false })
  if (error) { console.error(error); return [] }
  return data ?? []
}

export async function getProjectsByClientId(clientId: string): Promise<Project[]> {
  if (!isSupabaseConfigured || !supabase) return []
  const { data, error } = await supabase
    .from('projects')
    .select('*, category:project_categories(name,icon)')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })
  if (error) { console.error(error); return [] }
  return data ?? []
}

export async function updateApplicationStatus(id: string, status: Application['application_status']): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false
  const { error } = await supabase.from('applications').update({ application_status: status, updated_at: new Date().toISOString() }).eq('id', id)
  if (error) { console.error(error); return false }
  return true
}

export type ProjectTarget = {
  id: string
  project_id: string
  creator_id: string
  notify_status: 'pending' | 'sent' | 'failed'
  notified_at: string | null
  created_at: string
  creator?: { name: string; email: string; creator_profiles: { nickname: string | null; occupation: string[] | null }[] }
}

export async function getProjectTargets(projectId: string): Promise<ProjectTarget[]> {
  if (!isSupabaseConfigured || !supabase) return []
  const { data, error } = await supabase
    .from('project_targets')
    .select('*, creator:users!project_targets_creator_id_fkey(name, email, creator_profiles(nickname, occupation))')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })
  if (error) { console.error(error); return [] }
  return data ?? []
}

export async function addProjectTarget(projectId: string, creatorId: string): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false
  const { error } = await supabase
    .from('project_targets')
    .insert({ project_id: projectId, creator_id: creatorId })
  if (error) { console.error(error); return false }
  return true
}

export async function removeProjectTarget(projectId: string, creatorId: string): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false
  const { error } = await supabase
    .from('project_targets')
    .delete()
    .eq('project_id', projectId)
    .eq('creator_id', creatorId)
  if (error) { console.error(error); return false }
  return true
}

// ポートフォリオ
export type PortfolioWork = {
  id: string
  creator_id: string
  title: string
  description: string | null
  image_url: string | null
  work_url: string | null
  order: number
  created_at: string
}

export async function getPortfolioWorks(creatorProfileId: string): Promise<PortfolioWork[]> {
  if (!isSupabaseConfigured || !supabase) return []
  const { data, error } = await supabase
    .from('portfolio_works')
    .select('*')
    .eq('creator_id', creatorProfileId)
    .order('order')
  if (error) { console.error(error); return [] }
  return data ?? []
}

export async function createPortfolioWork(input: Omit<PortfolioWork, 'id' | 'created_at'>): Promise<PortfolioWork | null> {
  if (!isSupabaseConfigured || !supabase) return null
  const { data, error } = await supabase.from('portfolio_works').insert(input).select().single()
  if (error) { console.error(error); return null }
  return data
}

export async function updatePortfolioWork(id: string, input: Partial<PortfolioWork>): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false
  const { error } = await supabase.from('portfolio_works').update(input).eq('id', id)
  if (error) { console.error(error); return false }
  return true
}

export async function deletePortfolioWork(id: string): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false
  const { error } = await supabase.from('portfolio_works').delete().eq('id', id)
  if (error) { console.error(error); return false }
  return true
}

// カテゴリ CRUD
export async function createProjectCategory(input: { name: string; icon: string; order: number }): Promise<ProjectCategory | null> {
  if (!isSupabaseConfigured || !supabase) return null
  const { data, error } = await supabase.from('project_categories').insert(input).select().single()
  if (error) { console.error(error); return null }
  return data
}

export async function updateProjectCategory(id: string, input: Partial<ProjectCategory>): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false
  const { error } = await supabase.from('project_categories').update(input).eq('id', id)
  if (error) { console.error(error); return false }
  return true
}

export async function deleteProjectCategory(id: string): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false
  const { error } = await supabase.from('project_categories').delete().eq('id', id)
  if (error) { console.error(error); return false }
  return true
}

export const STATUS_LABELS: Record<ProjectStatus, string> = {
  draft:      '下書き',
  open:       '募集中',
  screening:  '選考中',
  contracted: '契約中',
  completed:  '完了',
  closed:     'クローズ',
}

export const STATUS_COLORS: Record<ProjectStatus, string> = {
  draft:      'bg-gray-100 text-gray-600',
  open:       'bg-green-100 text-green-700',
  screening:  'bg-blue-100 text-blue-700',
  contracted: 'bg-purple-100 text-purple-700',
  completed:  'bg-teal-100 text-teal-700',
  closed:     'bg-red-100 text-red-600',
}
