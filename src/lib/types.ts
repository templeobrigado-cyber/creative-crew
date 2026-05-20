// ============================================================
// FAQ-CMS 共通型定義
// DB スキーマと 1:1 対応。公開サイト・管理画面・API で共有する。
// ============================================================

export type ArticleStatus = 'draft' | 'review' | 'published' | 'unpublished'
export type SectionType = 'overview' | 'analysis' | 'procedure' | 'troubleshoot' | 'note' | 'media'
export type MediaProvider = 'youtube' | 'vimeo' | 'image'
export type UserRole = 'admin' | 'editor' | 'viewer'

// ---- Category -----------------------------------------------

export interface Category {
  id: string
  slug: string
  name: string
  icon: string          // Lucide icon name (e.g. "Settings")
  parent_id: string | null
  order: number
  created_at: string
}

// ---- Tag ----------------------------------------------------

export interface Tag {
  id: string
  slug: string
  name: string
  color?: string
  icon?: string
}

// ---- Article ------------------------------------------------

export interface Article {
  id: string
  category_id: string
  slug: string
  title: string
  lead: string
  status: ArticleStatus
  published_at: string | null
  view_count: number
  helpful_count: number
  unhelpful_count: number
  created_at: string
  updated_at: string
  created_by: string
  // リレーション（join 済み）
  category?: Category
  tags?: Tag[]
  sections?: ArticleSection[]
}

// ---- ArticleSection -----------------------------------------

export interface ArticleSection {
  id: string
  article_id: string
  order: number
  type: SectionType
  title: string
  subtitle?: string
  body_md: string
  media_url?: string
  media_provider?: MediaProvider
}

// ---- Feedback -----------------------------------------------

export interface Feedback {
  id: string
  article_id: string
  is_helpful: boolean
  comment?: string
  session_id: string
  created_at: string
  // join
  article?: Pick<Article, 'id' | 'title' | 'slug'>
}

// ---- SearchQuery --------------------------------------------

export interface SearchQuery {
  id: string
  query: string
  result_count: number
  clicked_article_id: string | null
  session_id: string
  created_at: string
  // join
  clicked_article?: Pick<Article, 'id' | 'title'>
}

// ---- User (admin) -------------------------------------------

export interface AdminUser {
  id: string
  email: string
  display_name: string
  role: UserRole
  avatar_url?: string
  is_active: boolean
  created_at: string
}

// ---- Input types (for create / update) ----------------------

export type CreateArticleInput = Omit<
  Article,
  'id' | 'view_count' | 'helpful_count' | 'unhelpful_count' | 'created_at' | 'updated_at' | 'category' | 'tags' | 'sections'
>

export type UpdateArticleInput = Partial<CreateArticleInput>

export type CreateSectionInput = Omit<ArticleSection, 'id'>

export type CreateCategoryInput = Omit<Category, 'id' | 'created_at'>

export type UpdateCategoryInput = Partial<CreateCategoryInput>
