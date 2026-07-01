import { useEffect, useState } from 'react'
import { Search, Filter } from 'lucide-react'
import { getApplications, updateApplicationStatus } from '../../../../lib/services/projects'
import type { Application } from '../../../../lib/services/projects'

type AppStatus = Application['application_status']

const STATUS_LABELS: Record<AppStatus, string> = {
  pending:   '審査待ち',
  reviewing: '審査中',
  offered:   'オファー済',
  accepted:  '採用',
  rejected:  '不採用',
  withdrawn: '辞退',
}
const STATUS_COLORS: Record<AppStatus, string> = {
  pending:   'bg-yellow-100 text-yellow-700',
  reviewing: 'bg-blue-100 text-blue-700',
  offered:   'bg-indigo-100 text-indigo-700',
  accepted:  'bg-green-100 text-green-700',
  rejected:  'bg-red-100 text-red-600',
  withdrawn: 'bg-gray-100 text-gray-500',
}
const ALL_STATUSES: AppStatus[] = ['pending','reviewing','offered','accepted','rejected','withdrawn']

export function ApplicationListPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<AppStatus | ''>('')

  useEffect(() => {
    getApplications().then(data => setApplications(data)).finally(() => setLoading(false))
  }, [])

  async function handleStatusChange(id: string, status: AppStatus) {
    await updateApplicationStatus(id, status)
    setApplications(prev => prev.map(a => a.id === id ? { ...a, application_status: status } : a))
  }

  const filtered = applications.filter(a => {
    const name = a.creator?.name ?? ''
    const title = a.project?.title ?? ''
    const matchSearch = name.includes(search) || title.includes(search)
    const matchStatus = !statusFilter || a.application_status === statusFilter
    return matchSearch && matchStatus
  })

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">応募管理</h1>
        <p className="text-sm text-gray-500 mt-1">案件への応募一覧・ステータス管理</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 flex gap-4 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="クリエイター名・案件名で検索"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as AppStatus | '')}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          >
            <option value="">すべてのステータス</option>
            {ALL_STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <p className="px-6 py-8 text-sm text-gray-400 text-center">読み込み中…</p>
        ) : filtered.length === 0 ? (
          <p className="px-6 py-8 text-sm text-gray-400 text-center">応募が見つかりません</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-6 py-3 text-left">クリエイター</th>
                <th className="px-6 py-3 text-left">案件名</th>
                <th className="px-6 py-3 text-left">希望単価</th>
                <th className="px-6 py-3 text-left">応募経路</th>
                <th className="px-6 py-3 text-left">応募日</th>
                <th className="px-6 py-3 text-left">ステータス</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(a => (
                <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">{a.creator?.name ?? '—'}</p>
                    <p className="text-xs text-gray-400">{a.creator?.email ?? ''}</p>
                  </td>
                  <td className="px-6 py-4 text-gray-600 max-w-xs truncate">{a.project?.title ?? '—'}</td>
                  <td className="px-6 py-4 text-gray-500">
                    {a.proposed_rate ? `¥${a.proposed_rate.toLocaleString()}` : '—'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${a.applied_via === 'line' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {a.applied_via === 'line' ? 'LINE' : 'WEB'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-xs">
                    {new Date(a.created_at).toLocaleDateString('ja-JP')}
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={a.application_status}
                      onChange={e => handleStatusChange(a.id, e.target.value as AppStatus)}
                      className={`text-xs px-2 py-1 rounded-full font-medium border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-300 ${STATUS_COLORS[a.application_status]}`}
                    >
                      {ALL_STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                    </select>
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
