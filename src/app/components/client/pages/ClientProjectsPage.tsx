import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { Plus } from 'lucide-react'
import { getProjectsByClientId, STATUS_LABELS, STATUS_COLORS } from '../../../../lib/services/projects'
import type { Project, ProjectStatus } from '../../../../lib/services/projects'

type Props = { user: { id: string } }

export function ClientProjectsPage({ user }: Props) {
  const navigate = useNavigate()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getProjectsByClientId(user.id)
      .then(setProjects)
      .finally(() => setLoading(false))
  }, [user.id])

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">案件管理</h1>
          <p className="text-sm text-gray-500 mt-1">依頼中・過去の案件一覧</p>
        </div>
        <button
          onClick={() => navigate('/client/projects/new')}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          新規案件を依頼
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <p className="px-6 py-10 text-sm text-gray-400 text-center">読み込み中…</p>
        ) : projects.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="text-sm text-gray-400 mb-4">まだ案件がありません</p>
            <button
              onClick={() => navigate('/client/projects/new')}
              className="px-5 py-2.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
            >
              最初の案件を作成する
            </button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-6 py-3 text-left">案件名</th>
                <th className="px-6 py-3 text-left">予算</th>
                <th className="px-6 py-3 text-left">納期</th>
                <th className="px-6 py-3 text-left">応募</th>
                <th className="px-6 py-3 text-left">ステータス</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {projects.map(p => (
                <tr
                  key={p.id}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/client/projects/${p.id}`)}
                >
                  <td className="px-6 py-4 font-medium text-gray-900 max-w-xs truncate">{p.title}</td>
                  <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                    {p.budget_min && p.budget_max
                      ? `¥${p.budget_min.toLocaleString()}〜¥${p.budget_max.toLocaleString()}`
                      : '—'}
                  </td>
                  <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                    {p.deadline ? new Date(p.deadline).toLocaleDateString('ja-JP') : '—'}
                  </td>
                  <td className="px-6 py-4 text-gray-500">{p.application_count}名</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[p.status]}`}>
                      {STATUS_LABELS[p.status]}
                    </span>
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
