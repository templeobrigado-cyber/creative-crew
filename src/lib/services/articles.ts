import { supabase, isSupabaseConfigured } from '../supabase'
import type { Article, ArticleSection, CreateArticleInput, UpdateArticleInput, CreateSectionInput } from '../types'
import { MOCK_ARTICLES, MOCK_CATEGORIES } from './mock-data'

// ---- 公開サイト用（published のみ） ----------------------------

export async function getPublishedArticles(): Promise<Article[]> {
  if (!isSupabaseConfigured || !supabase) {
    return MOCK_ARTICLES.filter(a => a.status === 'published').map(withCategory)
  }

  const { data, error } = await supabase
    .from('article')
    .select('*, category(*), article_tag(tag(*)), article_section(*)')
    .eq('status', 'published')
    .order('published_at', { ascending: false })

  if (error) { console.error(error); return [] }
  return (data ?? []).map(normalizeArticle)
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  if (!isSupabaseConfigured || !supabase) {
    const found = MOCK_ARTICLES.find(a => a.slug === slug)
    return found ? withCategory(found) : null
  }

  const { data, error } = await supabase
    .from('article')
    .select('*, category(*), article_tag(tag(*)), article_section(*)')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (error) { console.error(error); return null }
  return normalizeArticle(data)
}

export async function getArticlesByCategory(categoryId: string): Promise<Article[]> {
  if (!isSupabaseConfigured || !supabase) {
    return MOCK_ARTICLES
      .filter(a => a.category_id === categoryId && a.status === 'published')
      .map(withCategory)
  }

  const { data, error } = await supabase
    .from('article')
    .select('*, category(*), article_tag(tag(*)), article_section(*)')
    .eq('category_id', categoryId)
    .eq('status', 'published')
    .order('published_at', { ascending: false })

  if (error) { console.error(error); return [] }
  return (data ?? []).map(normalizeArticle)
}

export async function searchArticles(query: string): Promise<Article[]> {
  if (!isSupabaseConfigured || !supabase) {
    const q = query.toLowerCase()
    return MOCK_ARTICLES
      .filter(a =>
        a.status === 'published' &&
        (a.title.toLowerCase().includes(q) || a.lead.toLowerCase().includes(q))
      )
      .map(withCategory)
  }

  const { data, error } = await supabase
    .from('article')
    .select('*, category(*), article_tag(tag(*)), article_section(*)')
    .eq('status', 'published')
    .or(`title.ilike.%${query}%,lead.ilike.%${query}%`)

  if (error) { console.error(error); return [] }
  return (data ?? []).map(normalizeArticle)
}

// ---- 管理画面用（全ステータス） --------------------------------

export async function getAllArticles(): Promise<Article[]> {
  if (!isSupabaseConfigured || !supabase) {
    return MOCK_ARTICLES.map(withCategory)
  }

  const { data, error } = await supabase
    .from('article')
    .select('*, category(*), article_tag(tag(*)), article_section(*)')
    .order('updated_at', { ascending: false })

  if (error) { console.error(error); return [] }
  return (data ?? []).map(normalizeArticle)
}

export async function getArticleById(id: string): Promise<Article | null> {
  if (!isSupabaseConfigured || !supabase) {
    const found = MOCK_ARTICLES.find(a => a.id === id)
    return found ? withCategory(found) : null
  }

  const { data, error } = await supabase
    .from('article')
    .select('*, category(*), article_tag(tag(*)), article_section(*)')
    .eq('id', id)
    .single()

  if (error) { console.error(error); return null }
  return normalizeArticle(data)
}

export async function createArticle(input: CreateArticleInput): Promise<Article | null> {
  if (!isSupabaseConfigured || !supabase) return null

  const { data, error } = await supabase
    .from('article')
    .insert(input)
    .select('id')
    .single()

  if (error) { console.error(error); return null }
  return getArticleById(data.id)
}

export async function updateArticle(id: string, input: UpdateArticleInput): Promise<Article | null> {
  if (!isSupabaseConfigured || !supabase) return null

  const { error } = await supabase
    .from('article')
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) { console.error(error); return null }
  return getArticleById(id)
}

export async function incrementViewCount(id: string): Promise<void> {
  if (!isSupabaseConfigured || !supabase) return
  await supabase.rpc('increment_view_count', { article_id: id })
}

export async function deleteArticle(id: string): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false

  const { error } = await supabase.from('article').delete().eq('id', id)
  if (error) { console.error(error); return false }
  return true
}

// ---- ArticleTag ---------------------------------------------

export async function syncArticleTags(articleId: string, tagIds: string[]): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false

  await supabase.from('article_tag').delete().eq('article_id', articleId)
  if (tagIds.length === 0) return true

  const { error } = await supabase.from('article_tag').insert(
    tagIds.map(tag_id => ({ article_id: articleId, tag_id }))
  )
  if (error) { console.error(error); return false }
  return true
}

// ---- ArticleSection ------------------------------------------

export async function upsertSections(articleId: string, sections: CreateSectionInput[]): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false

  await supabase.from('article_section').delete().eq('article_id', articleId)
  if (sections.length === 0) return true
  const { error } = await supabase.from('article_section').insert(sections)
  if (error) { console.error(error); return false }
  return true
}

// ---- ヘルパー ------------------------------------------------

function withCategory(article: Article): Article {
  return {
    ...article,
    category: MOCK_CATEGORIES.find(c => c.id === article.category_id),
    sections: article.sections ?? [],
  }
}

function normalizeArticle(raw: Record<string, unknown>): Article {
  const tags = Array.isArray(raw.article_tag)
    ? (raw.article_tag as Array<{ tag: unknown }>).map(at => at.tag)
    : []
  const sections: ArticleSection[] = Array.isArray(raw.article_section)
    ? (raw.article_section as ArticleSection[]).sort((a, b) => a.order - b.order)
    : []

  return {
    ...(raw as unknown as Article),
    tags,
    sections,
  }
}
