import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { Plus, Search, Filter } from 'lucide-react'
import { getProjects, STATUS_LABELS, STATUS_COLORS } from '../../../../lib/services/projects'
import type { Project, ProjectStatus } from '../../../../lib/services/projects'

const ALL_STATUSES: ProjectStatus[] = ['draft','open','screening','contracted','completed','closed']

export function ProjectListPage() {
  const navigate = useNavigate()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | ''>('')

  useEffect(() => {
    getProjects().then(data => setProjects(data)).finally(() => setLoading(false))
  }, [])

  const filtered = projects.filter(p => {
    const matchSearch = p.title.includes(search) || (p.client?.name ?? '').includes(search)
    const matchStatus = !statusFilter || p.status === statusFilter
    return matchSearch && matchStatus
  })

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">案件管理</h1>
          <p className="text-sm text-gray-500 mt-1">案件の作成・編集・ステータス管理</p>
        </div>
        <button
          onClick={() => navigate('/admin/projects/new')}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          新規案件
        </button>
      </div>

      {/* フィルター */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 flex gap-4 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="案件名・発注者で検索"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as ProjectStatus | '')}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          >
            <option value="">すべてのステータス</option>
            {ALL_STATUSES.map(s => (
              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
            ))}
          </select>
        </div>
      </div>

      {/* テーブル */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <p className="px-6 py-8 text-sm text-gray-400 text-center">読み込み中…</p>
        ) : filtered.length === 0 ? (
          <p className="px-6 py-8 text-sm text-gray-400 text-center">案件が見つかりません</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-6 py-3 text-left">案件名</th>
                <th className="px-6 py-3 text-left">発注者</th>
                <th className="px-6 py-3 text-left">予算</th>
                <th className="px-6 py-3 text-left">納期</th>
                <th className="px-6 py-3 text-left">ステータス</th>
                <th className="px-6 py-3 text-left">応募/紹介/採用</th>
                <th className="px-6 py-3 text-left">登録日</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(p => (
                <tr
                  key={p.id}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/admin/projects/${p.id}/edit`)}
                >
                  <td className="px-6 py-4 font-medium text-gray-900 max-w-xs truncate">{p.title}</td>
                  <td className="px-6 py-4 text-gray-500">{p.client?.name ?? '—'}</td>
                  <td className="px-6 py-4 text-gray-500">
                    {p.budget_min && p.budget_max
                      ? `¥${p.budget_min.toLocaleString()}〜¥${p.budget_max.toLocaleString()}`
                      : p.budget_max ? `¥${p.budget_max.toLocaleString()}` : '—'}
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {p.deadline ? new Date(p.deadline).toLocaleDateString('ja-JP') : '—'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[p.status]}`}>
                      {STATUS_LABELS[p.status]}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {p.application_count} / {p.referred_count} / {p.hired_count}
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-xs">
                    {new Date(p.created_at).toLocaleDateString('ja-JP')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
