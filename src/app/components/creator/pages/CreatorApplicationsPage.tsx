import { useEffect, useState } from 'react'
import { getApplicationsByCreatorId } from '../../../../lib/services/projects'
import type { Application } from '../../../../lib/services/projects'

const STATUS_LABELS: Record<string, string> = {
  pending: '審査中', reviewing: '検討中', offered: '内定', accepted: '採用', rejected: '見送り', withdrawn: '辞退',
}
const STATUS_COLORS: Record<string, string> = {
  pending:   'bg-gray-100 text-gray-600',
  reviewing: 'bg-blue-100 text-blue-700',
  offered:   'bg-yellow-100 text-yellow-700',
  accepted:  'bg-green-100 text-green-700',
  rejected:  'bg-red-100 text-red-600',
  withdrawn: 'bg-gray-100 text-gray-400',
}

type Props = { user: { id: string } }

export function CreatorApplicationsPage({ user }: Props) {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    getApplicationsByCreatorId(user.id)
      .then(setApplications)
      .finally(() => setLoading(false))
  }, [user.id])

  const filtered = filter === 'all'
    ? applications
    : applications.filter(a => a.application_status === filter)

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">応募・紹介案件</h1>
        <p className="text-sm text-gray-500 mt-1">応募した案件と管理者から紹介された案件の一覧</p>
      </div>

      {/* フィルター */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {[
          { value: 'all',       label: 'すべて' },
          { value: 'pending',   label: '審査中' },
          { value: 'reviewing', label: '検討中' },
          { value: 'offered',   label: '内定' },
          { value: 'accepted',  label: '採用' },
        ].map(f => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
              filter === f.value
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <p className="px-6 py-10 text-sm text-gray-400 text-center">読み込み中…</p>
        ) : filtered.length === 0 ? (
          <p className="px-6 py-10 text-sm text-gray-400 text-center">該当する案件はありません</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {filtered.map(app => {
              const project = app.project as any
              return (
                <li key={app.id} className="px-6 py-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {project?.title ?? '案件名不明'}
                        </p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${STATUS_COLORS[app.application_status]}`}>
                          {STATUS_LABELS[app.application_status]}
                        </span>
                      </div>
                      <div className="flex gap-4 text-xs text-gray-400 flex-wrap">
                        <span>応募日：{new Date(app.created_at).toLocaleDateString('ja-JP')}</span>
                        {app.proposed_rate && <span>希望単価：¥{app.proposed_rate.toLocaleString()}</span>}
                        {project?.deadline && <span>納期：{new Date(project.deadline).toLocaleDateString('ja-JP')}</span>}
                        <span className="capitalize">{app.applied_via === 'line' ? 'LINE経由' : 'WEB応募'}</span>
                      </div>
                      {app.message && (
                        <p className="mt-2 text-xs text-gray-500 line-clamp-2">{app.message}</p>
                      )}
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
