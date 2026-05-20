import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router'
import { FileText, Search } from 'lucide-react'
import { Header } from '../Header'
import { Footer } from '../Footer'
import { Breadcrumbs } from '../Breadcrumbs'
import { searchArticles } from '../../../lib/services/articles'
import { recordSearchQuery } from '../../../lib/services/search'
import type { Article } from '../../../lib/types'

export function SearchResultPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const query = searchParams.get('q') ?? ''
  const [results, setResults] = useState<Article[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!query) return
    setLoading(true)
    searchArticles(query).then(data => {
      setResults(data)
      recordSearchQuery(query, data.length)
      setLoading(false)
    })
  }, [query])

  const breadcrumbs = [
    { label: 'ホーム', href: '/' },
    { label: `「${query}」の検索結果` },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        variant="compact"
        onBack={() => navigate('/')}
        onSearch={q => navigate(`/search?q=${encodeURIComponent(q)}`)}
        initialQuery={query}
      />

      <main className="flex-1 bg-background">
        <div className="max-w-[1200px] mx-auto px-6 md:px-8 lg:px-12 py-12">
          <Breadcrumbs items={breadcrumbs} />

          <div className="mt-8">
            <h1 className="mb-2 text-gray-900">
              {query ? `「${query}」の検索結果` : '検索結果'}
            </h1>
            {!loading && (
              <p className="text-gray-600 mb-8">
                {results.length > 0 ? `${results.length}件見つかりました` : '該当する記事が見つかりませんでした'}
              </p>
            )}

            {loading ? (
              <p className="text-gray-600">検索中…</p>
            ) : results.length === 0 && query ? (
              <div className="text-center py-16">
                <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">「{query}」に一致する記事が見つかりません。</p>
                <p className="text-sm text-gray-500">別のキーワードで検索してみてください。</p>
              </div>
            ) : (
              <ul className="space-y-4">
                {results.map(article => (
                  <li key={article.id}>
                    <Link
                      to={`/article/${article.slug}`}
                      className="block bg-white border border-gray-200 rounded-lg p-5 hover:border-amber-400 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <FileText className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                        <div>
                          <h3 className="text-gray-900 font-medium mb-1">{article.title}</h3>
                          <p className="text-sm text-gray-600 line-clamp-2">{article.lead}</p>
                          {article.category && (
                            <span className="inline-block mt-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                              {article.category.name}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
