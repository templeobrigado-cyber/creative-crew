import { supabase, isSupabaseConfigured } from '../supabase'
import { arrayToCSV, downloadCSV, parseCSV } from '../csv'

export type ImportResult = { success: number; errors: string[] }

// ---- タグ ----

export const TAG_COLUMNS = ['name', 'slug', 'color', 'icon']

export async function exportTagsCSV() {
  if (!isSupabaseConfigured || !supabase) return
  const { data } = await supabase.from('tag').select('name,slug,color,icon').order('name')
  downloadCSV(arrayToCSV(data ?? [], TAG_COLUMNS), 'tags.csv')
}

export function downloadTagTemplate() {
  const sample = [{ name: 'サンプルタグ', slug: 'sample-tag', color: '#3B82F6', icon: 'Tag' }]
  downloadCSV(arrayToCSV(sample, TAG_COLUMNS), 'tags_template.csv')
}

export async function importTagsCSV(file: File): Promise<ImportResult> {
  if (!isSupabaseConfigured || !supabase) return { success: 0, errors: ['Supabase未設定'] }
  const text = await file.text()
  const rows = parseCSV(text)
  const errors: string[] = []
  let success = 0
  for (const [i, row] of rows.entries()) {
    if (!row.name || !row.slug) { errors.push(`行${i + 2}: name/slug は必須`); continue }
    const { error } = await supabase.from('tag').upsert(
      { name: row.name, slug: row.slug, color: row.color || '#6B7280', icon: row.icon || 'Tag' },
      { onConflict: 'slug' }
    )
    if (error) errors.push(`行${i + 2}: ${error.message}`)
    else success++
  }
  return { success, errors }
}

// ---- カテゴリ ----

export const CATEGORY_COLUMNS = ['name', 'slug', 'parent_slug', 'icon', 'order']

export async function exportCategoriesCSV() {
  if (!isSupabaseConfigured || !supabase) return
  const { data } = await supabase.from('category').select('name,slug,parent_id,icon,order').order('order')
  // parent_idをslugに変換
  const { data: all } = await supabase.from('category').select('id,slug')
  const idToSlug = Object.fromEntries((all ?? []).map(c => [c.id, c.slug]))
  const rows = (data ?? []).map(c => ({ ...c, parent_slug: c.parent_id ? idToSlug[c.parent_id] ?? '' : '' }))
  downloadCSV(arrayToCSV(rows, CATEGORY_COLUMNS), 'categories.csv')
}

export function downloadCategoryTemplate() {
  const sample = [
    { name: '親カテゴリ', slug: 'parent-category', parent_slug: '', icon: 'FolderOpen', order: '1' },
    { name: '子カテゴリ', slug: 'child-category', parent_slug: 'parent-category', icon: 'FileText', order: '2' },
  ]
  downloadCSV(arrayToCSV(sample, CATEGORY_COLUMNS), 'categories_template.csv')
}

export async function importCategoriesCSV(file: File): Promise<ImportResult> {
  if (!isSupabaseConfigured || !supabase) return { success: 0, errors: ['Supabase未設定'] }
  const text = await file.text()
  const rows = parseCSV(text)
  const errors: string[] = []
  let success = 0

  // 1パス目: 全カテゴリをparent_idなしで登録
  for (const [i, row] of rows.entries()) {
    if (!row.name || !row.slug) { errors.push(`行${i + 2}: name/slug は必須`); continue }
    const { error } = await supabase.from('category').upsert(
      { name: row.name, slug: row.slug, icon: row.icon || 'FolderOpen', order: Number(row.order) || 0, parent_id: null },
      { onConflict: 'slug' }
    )
    if (error) errors.push(`行${i + 2}: ${error.message}`)
    else success++
  }

  // 2パス目: parent_slugがあるものを更新
  const { data: allCats } = await supabase.from('category').select('id,slug')
  const slugToId = Object.fromEntries((allCats ?? []).map(c => [c.slug, c.id]))
  for (const row of rows) {
    if (!row.parent_slug || !row.slug) continue
    const parentId = slugToId[row.parent_slug]
    const selfId = slugToId[row.slug]
    if (parentId && selfId) {
      await supabase.from('category').update({ parent_id: parentId }).eq('id', selfId)
    }
  }

  return { success, errors }
}

// ---- 記事 ----

export const ARTICLE_COLUMNS = ['title', 'slug', 'category_slug', 'status', 'lead', 'tags']

export async function exportArticlesCSV() {
  if (!isSupabaseConfigured || !supabase) return
  const { data } = await supabase
    .from('article')
    .select('title,slug,status,lead,category(slug),article_tag(tag(name))')
    .order('updated_at', { ascending: false })
  const rows = (data ?? []).map((a: any) => ({
    title: a.title,
    slug: a.slug,
    category_slug: a.category?.slug ?? '',
    status: a.status,
    lead: a.lead ?? '',
    tags: (a.article_tag ?? []).map((t: any) => t.tag?.name).filter(Boolean).join('|'),
  }))
  downloadCSV(arrayToCSV(rows, ARTICLE_COLUMNS), 'articles.csv')
}

export function downloadArticleTemplate() {
  const sample = [
    { title: '記事タイトル', slug: 'article-slug', category_slug: 'category-slug', status: 'draft', lead: 'リード文', tags: 'タグ1|タグ2' },
  ]
  downloadCSV(arrayToCSV(sample, ARTICLE_COLUMNS), 'articles_template.csv')
}

export async function importArticlesCSV(file: File): Promise<ImportResult> {
  if (!isSupabaseConfigured || !supabase) return { success: 0, errors: ['Supabase未設定'] }
  const text = await file.text()
  const rows = parseCSV(text)

  // カテゴリ・タグのslug→idマップ
  const { data: cats } = await supabase.from('category').select('id,slug')
  const { data: tags } = await supabase.from('tag').select('id,name')
  const catMap = Object.fromEntries((cats ?? []).map(c => [c.slug, c.id]))
  const tagMap = Object.fromEntries((tags ?? []).map(t => [t.name, t.id]))

  const errors: string[] = []
  let success = 0

  for (const [i, row] of rows.entries()) {
    if (!row.title || !row.slug) { errors.push(`行${i + 2}: title/slug は必須`); continue }
    const categoryId = catMap[row.category_slug] ?? null
    const status = ['draft', 'review', 'published', 'unpublished'].includes(row.status) ? row.status : 'draft'

    const { data: upserted, error } = await supabase
      .from('article')
      .upsert({ title: row.title, slug: row.slug, category_id: categoryId, status, lead: row.lead || null }, { onConflict: 'slug' })
      .select('id')
      .single()

    if (error) { errors.push(`行${i + 2}: ${error.message}`); continue }

    // タグの紐付け
    if (upserted && row.tags) {
      const tagNames = row.tags.split('|').map((t: string) => t.trim()).filter(Boolean)
      const tagIds = tagNames.map((n: string) => tagMap[n]).filter(Boolean)
      if (tagIds.length > 0) {
        await supabase.from('article_tag').delete().eq('article_id', upserted.id)
        await supabase.from('article_tag').insert(tagIds.map((tid: string) => ({ article_id: upserted.id, tag_id: tid })))
      }
    }
    success++
  }
  return { success, errors }
}
