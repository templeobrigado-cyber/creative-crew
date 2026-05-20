import { supabase, isSupabaseConfigured } from '../supabase'

export async function recordSearchQuery(
  query: string,
  resultCount: number,
  clickedArticleId?: string
): Promise<void> {
  if (!isSupabaseConfigured || !supabase) return

  const sessionId = getOrCreateSessionId()
  await supabase.from('search_query').insert({
    query,
    result_count: resultCount,
    clicked_article_id: clickedArticleId ?? null,
    session_id: sessionId,
  })
}

export async function getZeroHitQueries(limit = 50): Promise<Array<{
  query: string
  count: number
  last_searched_at: string
}>> {
  if (!isSupabaseConfigured || !supabase) return []

  const { data, error } = await supabase
    .from('search_query')
    .select('query, created_at')
    .eq('result_count', 0)
    .order('created_at', { ascending: false })
    .limit(limit * 10)

  if (error) { console.error(error); return [] }

  // クエリごとに集計
  const map = new Map<string, { count: number; last: string }>()
  for (const row of (data ?? [])) {
    const existing = map.get(row.query)
    if (!existing) {
      map.set(row.query, { count: 1, last: row.created_at })
    } else {
      existing.count++
      if (row.created_at > existing.last) existing.last = row.created_at
    }
  }

  return Array.from(map.entries())
    .map(([query, { count, last }]) => ({ query, count, last_searched_at: last }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
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
