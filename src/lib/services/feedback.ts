import { supabase, isSupabaseConfigured } from '../supabase'
import type { Feedback } from '../types'

export async function submitFeedback(
  articleId: string,
  isHelpful: boolean,
  comment?: string
): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) {
    // モック: コンソールに記録するだけ
    console.info('[mock] feedback submitted', { articleId, isHelpful, comment })
    return true
  }

  const sessionId = getOrCreateSessionId()
  const { error } = await supabase.from('feedback').insert({
    article_id: articleId,
    is_helpful: isHelpful,
    comment,
    session_id: sessionId,
  })

  if (error) { console.error(error); return false }
  return true
}

export async function getFeedbacks(): Promise<Feedback[]> {
  if (!isSupabaseConfigured || !supabase) return []

  const { data, error } = await supabase
    .from('feedback')
    .select('*, article:article_id(id, title, slug)')
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) { console.error(error); return [] }
  return data ?? []
}

function getOrCreateSessionId(): string {
  const key = 'faq_session_id'
  let id = sessionStorage.getItem(key)
  if (!id) {
    id = crypto.randomUUID()
    sessionStorage.setItem(key, id)
  }
  return id
}
