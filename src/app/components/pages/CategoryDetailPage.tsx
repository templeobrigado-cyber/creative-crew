import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import { Settings } from 'lucide-react'
import { Header } from '../Header'
import { Footer } from '../Footer'
import { CategoryHeader } from '../CategoryHeader'
import { SubcategoryAccordion } from '../SubcategoryAccordion'
import { getCategoryBySlug, getSubcategories } from '../../../lib/services/categories'
import { getArticlesByCategory } from '../../../lib/services/articles'
import type { Category, Article } from '../../../lib/types'

interface SubcategoryWithArticles {
  category: Category
  articles: Article[]
}

export function CategoryDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const [category, setCategory] = useState<Category | null>(null)
  const [subcategoryData, setSubcategoryData] = useState<SubcategoryWithArticles[]>([])
  const [directArticles, setDirectArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) return
    setLoading(true)

    getCategoryBySlug(slug).then(async cat => {
      if (!cat) { navigate('/404', { replace: true }); return }
      setCategory(cat)

      const [subs, direct] = await Promise.all([
        getSubcategories(cat.id),
        getArticlesByCategory(cat.id),
      ])

      const subsWithArticles = await Promise.all(
        subs.map(async sub => ({
          category: sub,
          articles: await getArticlesByCategory(sub.id),
        }))
      )

      setSubcategoryData(subsWithArticles.filter(s => s.articles.length > 0))
      setDirectArticles(direct)
      setLoading(false)
    })
  }, [slug, navigate])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">読み込み中…</p>
      </div>
    )
  }

  if (!category) return null

  const breadcrumbs = [
    { label: 'ホーム', href: '/' },
    { label: category.name },
  ]

  const accordionItems = [
    ...subcategoryData.map(({ category: sub, articles }) => ({
      title: sub.name,
      articles: articles.map(a => ({ title: a.title, href: `/article/${a.slug}` })),
    })),
    ...(directArticles.length > 0
      ? [{ title: '記事一覧', articles: directArticles.map(a => ({ title: a.title, href: `/article/${a.slug}` })) }]
      : []),
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        variant="compact"
        onBack={() => navigate('/')}
        onSearch={q => navigate(`/search?q=${encodeURIComponent(q)}`)}
      />

      <main className="flex-1 bg-background">
        <CategoryHeader
          icon={Settings}
          name={category.name}
          breadcrumbs={breadcrumbs}
        />

        <div className="max-w-[1200px] mx-auto px-6 md:px-8 lg:px-12 py-12">
          {accordionItems.length === 0 ? (
            <p className="text-gray-600">この記事はまだありません。</p>
          ) : (
            <div className="space-y-2">
              {accordionItems.map((item, i) => (
                <SubcategoryAccordion key={i} title={item.title} articles={item.articles} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
