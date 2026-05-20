import { supabase, isSupabaseConfigured } from '../supabase'

export interface ArticleViewRank {
  id: string
  title: string
  category_name: string | null
  view_count: number
  helpful_count: number
  unhelpful_count: number
}

export interface KeywordRank {
  query: string
  count: number
  zero_hit_count: number
}

export interface CategoryStat {
  name: string
  article_count: number
  total_views: number
}

export interface AnalyticsStats {
  totalViews: number
  totalSearches: number
  helpfulRate: number | null
  uniqueSessions: number
}

export async function getAnalyticsStats(): Promise<AnalyticsStats> {
  if (!isSupabaseConfigured || !supabase) {
    return { totalViews: 0, totalSearches: 0, helpfulRate: null, uniqueSessions: 0 }
  }

  const [articlesRes, searchRes, feedbackRes] = await Promise.all([
    supabase.from('article').select('view_count'),
    supabase.from('search_query').select('session_id'),
    supabase.from('feedback').select('is_helpful'),
  ])

  const articles = articlesRes.data ?? []
  const searches = searchRes.data ?? []
  const feedbacks = feedbackRes.data ?? []

  const totalViews = articles.reduce((s, a) => s + (a.view_count ?? 0), 0)
  const totalSearches = searches.length
  const uniqueSessions = new Set(searches.map(s => s.session_id)).size
  const helpfulCount = feedbacks.filter(f => f.is_helpful).length
  const helpfulRate = feedbacks.length > 0
    ? Math.round(helpfulCount / feedbacks.length * 100)
    : null

  return { totalViews, totalSearches, helpfulRate, uniqueSessions }
}

export async function getTopArticles(limit = 8): Promise<ArticleViewRank[]> {
  if (!isSupabaseConfigured || !supabase) return []

  const { data, error } = await supabase
    .from('article')
    .select('id, title, view_count, helpful_count, unhelpful_count, category(name)')
    .order('view_count', { ascending: false })
    .limit(limit)

  if (error) { console.error(error); return [] }

  return (data ?? []).map((d: any) => ({
    id: d.id,
    title: d.title,
    category_name: d.category?.name ?? null,
    view_count: d.view_count ?? 0,
    helpful_count: d.helpful_count ?? 0,
    unhelpful_count: d.unhelpful_count ?? 0,
  }))
}

export async function getTopKeywords(limit = 10): Promise<KeywordRank[]> {
  if (!isSupabaseConfigured || !supabase) return []

  const { data, error } = await supabase
    .from('search_query')
    .select('query, result_count')
    .order('created_at', { ascending: false })
    .limit(limit * 20)

  if (error) { console.error(error); return [] }

  const map = new Map<string, { count: number; zero: number }>()
  for (const row of (data ?? [])) {
    const existing = map.get(row.query)
    if (!existing) {
      map.set(row.query, { count: 1, zero: row.result_count === 0 ? 1 : 0 })
    } else {
      existing.count++
      if (row.result_count === 0) existing.zero++
    }
  }

  return Array.from(map.entries())
    .map(([query, { count, zero }]) => ({ query, count, zero_hit_count: zero }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
}

export async function getCategoryStats(): Promise<CategoryStat[]> {
  if (!isSupabaseConfigured || !supabase) return []

  const { data, error } = await supabase
    .from('article')
    .select('view_count, category(name)')

  if (error) { console.error(error); return [] }

  const map = new Map<string, { count: number; views: number }>()
  for (const row of (data ?? []) as any[]) {
    const name = row.category?.name ?? '未分類'
    const existing = map.get(name)
    if (!existing) {
      map.set(name, { count: 1, views: row.view_count ?? 0 })
    } else {
      existing.count++
      existing.views += row.view_count ?? 0
    }
  }

  return Array.from(map.entries())
    .map(([name, { count, views }]) => ({ name, article_count: count, total_views: views }))
    .sort((a, b) => b.total_views - a.total_views)
}
