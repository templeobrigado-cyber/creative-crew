import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { Briefcase, Users, ClipboardList, UserCheck } from 'lucide-react'
import { getProjects } from '../../../../lib/services/projects'
import { getUsers } from '../../../../lib/services/users'

type Stats = {
  totalProjects: number
  openProjects: number
  totalCreators: number
  totalClients: number
  totalApplications: number
}

export function DashboardPage() {
  const navigate = useNavigate()
  const [stats, setStats] = useState<Stats | null>(null)
  const [recentProjects, setRecentProjects] = useState<Awaited<ReturnType<typeof getProjects>>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      getProjects(),
      getUsers('creator'),
      getUsers('client'),
    ]).then(([projects, creators, clients]) => {
      setStats({
        totalProjects: projects.length,
        openProjects: projects.filter(p => p.status === 'open').length,
        totalCreators: creators.length,
        totalClients: clients.length,
        totalApplications: projects.reduce((s, p) => s + p.application_count, 0),
      })
      setRecentProjects(projects.slice(0, 5))
    }).finally(() => setLoading(false))
  }, [])

  const kpis = stats ? [
    { label: '総案件数',      value: stats.totalProjects,      sub: `募集中 ${stats.openProjects}件`,  icon: Briefcase,       color: 'indigo' },
    { label: 'クリエイター', value: stats.totalCreators,      sub: '登録済み',                         icon: UserCheck,       color: 'green' },
    { label: '発注者',        value: stats.totalClients,       sub: '登録済み',                         icon: Users,           color: 'blue' },
    { label: '応募総数',      value: stats.totalApplications,  sub: '累計',                             icon: ClipboardList,   color: 'purple' },
  ] : []

  const colorMap: Record<string, { bg: string; icon: string }> = {
    indigo: { bg: 'bg-indigo-100', icon: 'text-indigo-600' },
    green:  { bg: 'bg-green-100',  icon: 'text-green-600' },
    blue:   { bg: 'bg-blue-100',   icon: 'text-blue-600' },
    purple: { bg: 'bg-purple-100', icon: 'text-purple-600' },
  }

  const STATUS_LABELS: Record<string, string> = {
    draft: '下書き', open: '募集中', screening: '選考中',
    contracted: '契約中', completed: '完了', closed: 'クローズ',
  }
  const STATUS_COLORS: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-600', open: 'bg-green-100 text-green-700',
    screening: 'bg-blue-100 text-blue-700', contracted: 'bg-purple-100 text-purple-700',
    completed: 'bg-teal-100 text-teal-700', closed: 'bg-red-100 text-red-600',
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">ダッシュボード</h1>
        <p className="text-sm text-gray-500 mt-1">CreativeCrew 管理概要</p>
      </div>

      {loading ? (
        <p className="text-gray-500 text-sm">読み込み中…</p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {kpis.map((kpi, i) => {
              const Icon = kpi.icon
              const c = colorMap[kpi.color]
              return (
                <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className={`w-11 h-11 rounded-lg flex items-center justify-center ${c.bg} mb-4`}>
                    <Icon className={`w-5 h-5 ${c.icon}`} />
                  </div>
                  <p className="text-sm text-gray-500 mb-1">{kpi.label}</p>
                  <p className="text-3xl font-semibold text-gray-900 mb-1">{kpi.value.toLocaleString()}</p>
                  <p className="text-xs text-gray-400">{kpi.sub}</p>
                </div>
              )
            })}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-medium text-gray-900">最新案件</h2>
              <button
                onClick={() => navigate('/admin/projects')}
                className="text-sm text-indigo-600 hover:text-indigo-700"
              >
                すべて見る →
              </button>
            </div>
            {recentProjects.length === 0 ? (
              <p className="px-6 py-8 text-sm text-gray-400 text-center">案件はまだありません</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                  <tr>
                    <th className="px-6 py-3 text-left">案件名</th>
                    <th className="px-6 py-3 text-left">発注者</th>
                    <th className="px-6 py-3 text-left">予算</th>
                    <th className="px-6 py-3 text-left">納期</th>
                    <th className="px-6 py-3 text-left">ステータス</th>
                    <th className="px-6 py-3 text-left">応募</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentProjects.map(p => (
                    <tr
                      key={p.id}
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => navigate(`/admin/projects/${p.id}/edit`)}
                    >
                      <td className="px-6 py-4 font-medium text-gray-900">{p.title}</td>
                      <td className="px-6 py-4 text-gray-500">{p.client?.name ?? '—'}</td>
                      <td className="px-6 py-4 text-gray-500">
                        {p.budget_max ? `¥${p.budget_max.toLocaleString()}` : '—'}
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {p.deadline ? new Date(p.deadline).toLocaleDateString('ja-JP') : '—'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[p.status]}`}>
                          {STATUS_LABELS[p.status]}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500">{p.application_count}件</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  )
}
