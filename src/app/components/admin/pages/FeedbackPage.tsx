import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { ThumbsUp, ThumbsDown, MessageSquare, Search, FileText } from 'lucide-react'
import { getFeedbacks } from '../../../../lib/services/feedback'
import type { Feedback } from '../../../../lib/types'

export function FeedbackPage() {
  const navigate = useNavigate()
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState<'all' | 'helpful' | 'unhelpful'>('all')
  const [commentFilter, setCommentFilter] = useState<'all' | 'with' | 'without'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    getFeedbacks().then(data => {
      setFeedbacks(data)
      setLoading(false)
    })
  }, [])

  const filtered = feedbacks.filter(f => {
    const matchType =
      typeFilter === 'all' ||
      (typeFilter === 'helpful' && f.is_helpful) ||
      (typeFilter === 'unhelpful' && !f.is_helpful)
    const matchComment =
      commentFilter === 'all' ||
      (commentFilter === 'with' && f.comment) ||
      (commentFilter === 'without' && !f.comment)
    const matchSearch =
      !searchQuery ||
      f.article?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.comment?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchType && matchComment && matchSearch
  })

  const total = feedbacks.length
  const helpful = feedbacks.filter(f => f.is_helpful).length
  const unhelpful = feedbacks.filter(f => !f.is_helpful).length
  const withComment = feedbacks.filter(f => f.comment).length
  const helpfulRate = total > 0 ? Math.round(helpful / total * 100) : null

  const selectStyle = {
    backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E\")",
    backgroundRepeat: 'no-repeat' as const,
    backgroundPosition: 'right 0.5rem center',
    backgroundSize: '1rem 1rem',
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-medium text-gray-900 mb-1">フィードバック</h1>
        <p className="text-sm text-gray-600">記事に対するユーザーからの評価とコメント</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-xs text-gray-500 mb-1">総件数</p>
          <p className="text-2xl font-medium text-gray-900">{total}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-1.5 mb-1">
            <ThumbsUp className="w-3.5 h-3.5 text-green-600" />
            <p className="text-xs text-gray-500">役に立った</p>
          </div>
          <p className="text-2xl font-medium text-green-800">{helpful}</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-1.5 mb-1">
            <ThumbsDown className="w-3.5 h-3.5 text-red-600" />
            <p className="text-xs text-gray-500">役に立たなかった</p>
          </div>
          <p className="text-2xl font-medium text-red-800">{unhelpful}</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-center gap-1.5 mb-1">
            <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
            <p className="text-xs text-gray-500">コメント付き</p>
          </div>
          <p className="text-2xl font-medium text-amber-800">{withComment}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-xs text-gray-500 mb-1">解決率</p>
          <p className={`text-2xl font-medium ${helpfulRate !== null && helpfulRate >= 80 ? 'text-green-700' : 'text-gray-900'}`}>
            {helpfulRate !== null ? `${helpfulRate}%` : '—'}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="記事名・コメントで検索…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-amber-400"
          />
        </div>
        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value as any)}
          className="pl-3 pr-8 py-2 border border-gray-200 rounded-lg text-sm bg-white appearance-none focus:outline-none focus:border-amber-400"
          style={selectStyle}
        >
          <option value="all">すべての評価</option>
          <option value="helpful">役に立った</option>
          <option value="unhelpful">役に立たなかった</option>
        </select>
        <select
          value={commentFilter}
          onChange={e => setCommentFilter(e.target.value as any)}
          className="pl-3 pr-8 py-2 border border-gray-200 rounded-lg text-sm bg-white appearance-none focus:outline-none focus:border-amber-400"
          style={selectStyle}
        >
          <option value="all">コメント：すべて</option>
          <option value="with">コメントあり</option>
          <option value="without">コメントなし</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <p className="text-sm text-gray-500">読み込み中…</p>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-600">記事</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-gray-600">評価</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-600">コメント</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-600">日時</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map(f => (
                <tr
                  key={f.id}
                  className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${f.comment ? 'bg-amber-50/30' : ''}`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-start gap-2">
                      <FileText className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
                      <span className="text-sm font-medium text-gray-900">
                        {f.article?.title ?? '（記事不明）'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {f.is_helpful ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs">
                        <ThumbsUp className="w-3 h-3" />役に立った
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs">
                        <ThumbsDown className="w-3 h-3" />役に立たなかった
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 max-w-xs">
                    {f.comment ? (
                      <div className="flex items-start gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                        <p className="text-sm text-gray-800 line-clamp-2">{f.comment}</p>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">コメントなし</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                    {new Date(f.created_at).toLocaleDateString('ja-JP')}
                  </td>
                  <td className="px-4 py-3">
                    {f.article?.slug && (
                      <button
                        onClick={() => navigate(`/admin/articles/${f.article_id}/edit`)}
                        className="px-3 py-1.5 border border-gray-200 rounded text-xs text-gray-600 hover:bg-gray-50 transition-colors whitespace-nowrap"
                      >
                        記事を編集
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-sm text-gray-500">
                    フィードバックがありません
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="px-4 py-3 bg-gray-50 text-xs text-gray-500">
            {filtered.length} 件を表示中（全 {total} 件）
          </div>
        </div>
      )}
    </div>
  )
}
