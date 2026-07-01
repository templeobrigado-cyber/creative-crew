import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { ArrowLeft, Star } from 'lucide-react'
import { getProjectById, getApplications, updateApplicationStatus, STATUS_LABELS, STATUS_COLORS } from '../../../../lib/services/projects'
import type { Project, Application } from '../../../../lib/services/projects'

const APP_STATUS_LABELS: Record<string, string> = {
  pending: '審査中', reviewing: '検討中', offered: '内定', accepted: '採用', rejected: '見送り', withdrawn: '辞退',
}
const APP_STATUS_COLORS: Record<string, string> = {
  pending:   'bg-gray-100 text-gray-600',
  reviewing: 'bg-blue-100 text-blue-700',
  offered:   'bg-yellow-100 text-yellow-700',
  accepted:  'bg-green-100 text-green-700',
  rejected:  'bg-red-100 text-red-600',
  withdrawn: 'bg-gray-100 text-gray-400',
}

type Props = { user: { id: string } }

export function ClientProjectDetailPage({ user }: Props) {
  const navigate = useNavigate()
  const { id } = useParams()
  const [project, setProject] = useState<Project | null>(null)
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    Promise.all([
      getProjectById(id),
      getApplications(id),
    ]).then(([p, apps]) => {
      if (!p || p.client_id !== user.id) { navigate('/client/projects'); return }
      setProject(p)
      setApplications(apps)
    }).finally(() => setLoading(false))
  }, [id])

  async function handleStatusChange(appId: string, status: Application['application_status']) {
    const ok = await updateApplicationStatus(appId, status)
    if (ok) setApplications(prev => prev.map(a => a.id === appId ? { ...a, application_status: status } : a))
  }

  if (loading) return <div className="p-8 text-sm text-gray-400">読み込み中…</div>
  if (!project) return null

  return (
    <div className="p-8 max-w-3xl">
      <button
        onClick={() => navigate('/client/projects')}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> 案件一覧に戻る
      </button>

      {/* 案件概要 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <h1 className="text-xl font-bold text-gray-900">{project.title}</h1>
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${STATUS_COLORS[project.status]}`}>
            {STATUS_LABELS[project.status]}
          </span>
        </div>
        <p className="text-sm text-gray-600 leading-relaxed mb-4">{project.description}</p>
        <div className="grid grid-cols-3 gap-4 text-sm">
          {project.budget_min && project.budget_max && (
            <div>
              <p className="text-xs text-gray-400 mb-0.5">予算</p>
              <p className="text-gray-700">¥{project.budget_min.toLocaleString()}〜¥{project.budget_max.toLocaleString()}</p>
            </div>
          )}
          {project.deadline && (
            <div>
              <p className="text-xs text-gray-400 mb-0.5">納期</p>
              <p className="text-gray-700">{new Date(project.deadline).toLocaleDateString('ja-JP')}</p>
            </div>
          )}
          <div>
            <p className="text-xs text-gray-400 mb-0.5">募集人数</p>
            <p className="text-gray-700">{project.headcount}名</p>
          </div>
        </div>
        {project.required_skills && project.required_skills.length > 0 && (
          <div className="mt-4">
            <p className="text-xs text-gray-400 mb-1.5">必須スキル</p>
            <div className="flex flex-wrap gap-1">
              {project.required_skills.map(s => (
                <span key={s} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{s}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 応募者一覧 */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900 text-sm">応募者 / 紹介クリエイター（{applications.length}名）</h2>
        </div>
        {applications.length === 0 ? (
          <p className="px-6 py-10 text-sm text-gray-400 text-center">まだ応募・紹介はありません</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {applications.map(app => (
              <li key={app.id} className="px-6 py-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm shrink-0">
                    {(app.creator?.name ?? '?')[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium text-gray-900">{app.creator?.name ?? '—'}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${APP_STATUS_COLORS[app.application_status]}`}>
                        {APP_STATUS_LABELS[app.application_status]}
                      </span>
                      <span className="text-xs text-gray-400">
                        {app.applied_via === 'line' ? 'LINE経由' : 'WEB応募'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mb-2">
                      {new Date(app.created_at).toLocaleDateString('ja-JP')}
                      {app.proposed_rate && ` · 希望単価 ¥${app.proposed_rate.toLocaleString()}`}
                    </p>
                    {app.message && (
                      <p className="text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2">{app.message}</p>
                    )}
                  </div>
                  <div className="shrink-0">
                    <select
                      value={app.application_status}
                      onChange={e => handleStatusChange(app.id, e.target.value as Application['application_status'])}
                      className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    >
                      <option value="pending">審査中</option>
                      <option value="reviewing">検討中</option>
                      <option value="offered">内定</option>
                      <option value="accepted">採用</option>
                      <option value="rejected">見送り</option>
                    </select>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
