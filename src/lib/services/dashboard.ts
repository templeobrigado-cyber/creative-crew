import { supabase, isSupabaseConfigured } from '../supabase'

export interface DashboardStats {
  totalArticles: number
  publishedArticles: number
  totalViews: number
  helpfulRate: number | null
}

export async function getDashboardStats(): Promise<DashboardStats> {
  if (!isSupabaseConfigured || !supabase) {
    return { totalArticles: 0, publishedArticles: 0, totalViews: 0, helpfulRate: null }
  }

  const [articlesRes, feedbackRes] = await Promise.all([
    supabase.from('article').select('status, view_count'),
    supabase.from('feedback').select('is_helpful'),
  ])

  const articles = articlesRes.data ?? []
  const feedbacks = feedbackRes.data ?? []

  const totalArticles = articles.length
  const publishedArticles = articles.filter(a => a.status === 'published').length
  const totalViews = articles.reduce((sum, a) => sum + (a.view_count ?? 0), 0)

  const helpfulCount = feedbacks.filter(f => f.is_helpful).length
  const helpfulRate = feedbacks.length > 0
    ? Math.round((helpfulCount / feedbacks.length) * 100)
    : null

  return { totalArticles, publishedArticles, totalViews, helpfulRate }
}
