import { useEffect, useState } from 'react'
import { Eye, Search, ThumbsUp, Users } from 'lucide-react'
import {
  getAnalyticsStats,
  getTopArticles,
  getTopKeywords,
  getCategoryStats,
} from '../../../../lib/services/analytics'
import type { AnalyticsStats, ArticleViewRank, KeywordRank, CategoryStat } from '../../../../lib/services/analytics'

export function AnalyticsPage() {
  const [stats, setStats] = useState<AnalyticsStats | null>(null)
  const [topArticles, setTopArticles] = useState<ArticleViewRank[]>([])
  const [topKeywords, setTopKeywords] = useState<KeywordRank[]>([])
  const [categoryStats, setCategoryStats] = useState<CategoryStat[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      getAnalyticsStats(),
      getTopArticles(8),
      getTopKeywords(10),
      getCategoryStats(),
    ]).then(([s, articles, keywords, cats]) => {
      setStats(s)
      setTopArticles(articles)
      setTopKeywords(keywords)
      setCategoryStats(cats)
      setLoading(false)
    })
  }, [])

  const kpis = stats ? [
    {
      label: '総閲覧数',
      value: stats.totalViews.toLocaleString(),
      sub: '全記事合計',
      icon: Eye,
      bg: 'bg-amber-100',
      color: 'text-amber-600',
    },
    {
      label: '総検索数',
      value: stats.totalSearches.toLocaleString(),
      sub: '検索ログ合計',
      icon: Search,
      bg: 'bg-blue-100',
      color: 'text-blue-600',
    },
    {
      label: '解決率',
      value: stats.helpfulRate !== null ? `${stats.helpfulRate}%` : '—',
      sub: 'フィードバック',
      icon: ThumbsUp,
      bg: 'bg-green-100',
      color: 'text-green-600',
    },
    {
      label: 'ユニーク検索者',
      value: stats.uniqueSessions.toLocaleString(),
      sub: 'セッション単位',
      icon: Users,
      bg: 'bg-purple-100',
      color: 'text-purple-600',
    },
  ] : []

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-medium text-gray-900 mb-6">分析</h1>
        <p className="text-sm text-gray-500">読み込み中…</p>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-medium text-gray-900 mb-1">分析</h1>
        <p className="text-sm text-gray-600">FAQサイトのアクセス状況と検索動向</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {kpis.map((kpi, i) => {
          const Icon = kpi.icon
          return (
            <div key={i} className="bg-white border border-gray-200 rounded-lg p-5">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${kpi.bg} mb-4`}>
                <Icon className={`w-5 h-5 ${kpi.color}`} />
              </div>
              <p className="text-xs text-gray-500 mb-1">{kpi.label}</p>
              <p className="text-2xl font-medium text-gray-900">{kpi.value}</p>
              <p className="text-xs text-gray-400 mt-1">{kpi.sub}</p>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Top Articles */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200">
            <h2 className="font-medium text-gray-900">閲覧数ランキング Top 8</h2>
          </div>
          {topArticles.length === 0 ? (
            <p className="px-5 py-8 text-sm text-gray-500 text-center">データがありません</p>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-2 text-xs font-medium text-gray-600">記事</th>
                  <th className="text-center px-4 py-2 text-xs font-medium text-gray-600">閲覧数</th>
                  <th className="text-center px-4 py-2 text-xs font-medium text-gray-600">解決率</th>
                </tr>
              </thead>
              <tbody>
                {topArticles.map((a, i) => {
                  const total = a.helpful_count + a.unhelpful_count
                  const rate = total > 0 ? Math.round(a.helpful_count / total * 100) : null
                  return (
                    <tr key={a.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-2.5">
                        <div className="flex items-start gap-2">
                          <span className="text-xs text-gray-400 font-medium mt-0.5 shrink-0">#{i + 1}</span>
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-gray-900 truncate">{a.title}</p>
                            {a.category_name && (
                              <p className="text-xs text-gray-400">{a.category_name}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-center text-sm font-medium text-gray-900">
                        {a.view_count.toLocaleString()}
                      </td>
                      <td className="px-4 py-2.5 text-center text-sm text-gray-600">
                        {rate !== null ? `${rate}%` : '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Top Keywords */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200">
            <h2 className="font-medium text-gray-900">検索キーワード Top 10</h2>
          </div>
          {topKeywords.length === 0 ? (
            <p className="px-5 py-8 text-sm text-gray-500 text-center">データがありません</p>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-2 text-xs font-medium text-gray-600">キーワード</th>
                  <th className="text-center px-4 py-2 text-xs font-medium text-gray-600">検索回数</th>
                  <th className="text-center px-4 py-2 text-xs font-medium text-gray-600">0件率</th>
                </tr>
              </thead>
              <tbody>
                {topKeywords.map((k, i) => {
                  const zeroRate = k.count > 0 ? Math.round(k.zero_hit_count / k.count * 100) : 0
                  return (
                    <tr key={k.query} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400 font-medium shrink-0">#{i + 1}</span>
                          <span className="text-xs font-medium text-gray-900">{k.query}</span>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-center text-sm font-medium text-gray-900">
                        {k.count.toLocaleString()}
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <span className={`text-xs font-medium ${zeroRate >= 50 ? 'text-red-600' : zeroRate > 0 ? 'text-amber-600' : 'text-gray-500'}`}>
                          {zeroRate}%
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Category Stats */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200">
          <h2 className="font-medium text-gray-900">カテゴリ別閲覧数</h2>
        </div>
        {categoryStats.length === 0 ? (
          <p className="px-5 py-8 text-sm text-gray-500 text-center">データがありません</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-600">カテゴリ</th>
                <th className="text-center px-5 py-3 text-xs font-medium text-gray-600">記事数</th>
                <th className="text-center px-5 py-3 text-xs font-medium text-gray-600">総閲覧数</th>
                <th className="text-center px-5 py-3 text-xs font-medium text-gray-600">記事あたり</th>
                <th className="px-5 py-3 text-xs font-medium text-gray-600">割合</th>
              </tr>
            </thead>
            <tbody>
              {categoryStats.map(cat => {
                const maxViews = categoryStats[0]?.total_views ?? 1
                const pct = Math.round(cat.total_views / maxViews * 100)
                return (
                  <tr key={cat.name} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-5 py-3 text-sm font-medium text-gray-900">{cat.name}</td>
                    <td className="px-5 py-3 text-center text-sm text-gray-600">{cat.article_count}</td>
                    <td className="px-5 py-3 text-center text-sm font-medium text-gray-900">
                      {cat.total_views.toLocaleString()}
                    </td>
                    <td className="px-5 py-3 text-center text-sm text-gray-600">
                      {cat.article_count > 0 ? Math.round(cat.total_views / cat.article_count).toLocaleString() : '—'}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-500 rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 w-8 text-right">{pct}%</span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
