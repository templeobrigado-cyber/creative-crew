import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { Briefcase, Users, CheckCircle, Clock } from 'lucide-react'
import { getProjectsByClientId, STATUS_LABELS, STATUS_COLORS } from '../../../../lib/services/projects'
import type { Project } from '../../../../lib/services/projects'

type Props = { user: { id: string; name: string } }

export function ClientDashboardPage({ user }: Props) {
  const navigate = useNavigate()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getProjectsByClientId(user.id)
      .then(setProjects)
      .finally(() => setLoading(false))
  }, [user.id])

  const activeProjects = projects.filter(p => ['open', 'screening', 'contracted'].includes(p.status))
  const totalApplications = projects.reduce((sum, p) => sum + p.application_count, 0)
  const completedProjects = projects.filter(p => p.status === 'completed').length

  if (loading) return <div className="p-8 text-sm text-gray-400">読み込み中…</div>

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">こんにちは、{user.name}さん</h1>
        <p className="text-sm text-gray-500 mt-1">依頼中の案件状況をご確認ください</p>
      </div>

      {/* KPIカード */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { icon: Briefcase,   label: '進行中の案件', value: activeProjects.length,   color: 'text-indigo-600' },
          { icon: Users,       label: '総応募数',      value: totalApplications,       color: 'text-blue-600' },
          { icon: CheckCircle, label: '完了案件',       value: completedProjects,       color: 'text-green-600' },
        ].map(card => (
          <div key={card.label} className="bg-white rounded-xl border border-gray-200 p-5">
            <card.icon className={`w-5 h-5 ${card.color} mb-2`} />
            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            <p className="text-xs text-gray-500 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* 進行中の案件 */}
      <div className="bg-white rounded-xl border border-gray-200 mb-6">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900 text-sm">進行中の案件</h2>
          <button
            onClick={() => navigate('/client/projects')}
            className="text-xs text-indigo-600 hover:underline"
          >
            すべて見る
          </button>
        </div>
        {activeProjects.length === 0 ? (
          <div className="px-6 py-10 text-center">
            <p className="text-sm text-gray-400 mb-3">進行中の案件はありません</p>
            <button
              onClick={() => navigate('/client/projects')}
              className="text-xs px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              案件を作成する
            </button>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {activeProjects.map(p => (
              <li
                key={p.id}
                className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => navigate(`/client/projects/${p.id}`)}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{p.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    応募 {p.application_count}名
                    {p.deadline && ` · 納期 ${new Date(p.deadline).toLocaleDateString('ja-JP')}`}
                  </p>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${STATUS_COLORS[p.status]}`}>
                  {STATUS_LABELS[p.status]}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 全案件一覧（コンパクト） */}
      {projects.length > activeProjects.length && (
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900 text-sm">過去の案件</h2>
          </div>
          <ul className="divide-y divide-gray-100">
            {projects.filter(p => !['open', 'screening', 'contracted'].includes(p.status)).map(p => (
              <li
                key={p.id}
                className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => navigate(`/client/projects/${p.id}`)}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700 truncate">{p.title}</p>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${STATUS_COLORS[p.status]}`}>
                  {STATUS_LABELS[p.status]}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
