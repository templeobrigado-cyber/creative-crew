import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { FileText, Star, CheckCircle, Clock } from 'lucide-react'
import { getApplicationsByCreatorId } from '../../../../lib/services/projects'
import { getCreatorByUserId } from '../../../../lib/services/users'
import type { Application } from '../../../../lib/services/projects'
import type { CreatorProfile } from '../../../../lib/services/users'

const APP_STATUS_LABELS: Record<string, string> = {
  pending: '審査中', reviewing: '検討中', offered: '内定', accepted: '採用', rejected: '見送り', withdrawn: '辞退',
}
const APP_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-600',
  reviewing: 'bg-blue-100 text-blue-700',
  offered: 'bg-yellow-100 text-yellow-700',
  accepted: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-600',
  withdrawn: 'bg-gray-100 text-gray-400',
}

type Props = { user: { id: string; name: string; email: string } }

export function CreatorDashboardPage({ user }: Props) {
  const navigate = useNavigate()
  const [profile, setProfile] = useState<CreatorProfile | null>(null)
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      getCreatorByUserId(user.id),
      getApplicationsByCreatorId(user.id),
    ]).then(([p, apps]) => {
      setProfile(p)
      setApplications(apps)
    }).finally(() => setLoading(false))
  }, [user.id])

  const activeApps = applications.filter(a => ['pending', 'reviewing', 'offered'].includes(a.application_status))
  const acceptedApps = applications.filter(a => a.application_status === 'accepted')

  if (loading) return <div className="p-8 text-sm text-gray-400">読み込み中…</div>

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">こんにちは、{user.name}さん</h1>
        <p className="text-sm text-gray-500 mt-1">あなたの案件状況をご確認ください</p>
      </div>

      {/* プロフィール完成度 */}
      {profile && !profile.occupation?.length && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <Clock className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-800">プロフィールが未完成です</p>
            <p className="text-xs text-amber-600 mt-0.5">職種やスキルを登録すると案件の紹介を受けられます</p>
            <button
              onClick={() => navigate('/creator/profile')}
              className="mt-2 text-xs text-amber-700 font-medium underline"
            >
              プロフィールを編集する →
            </button>
          </div>
        </div>
      )}

      {/* KPIカード */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { icon: FileText,    label: '応募・紹介中', value: activeApps.length,           color: 'text-indigo-600' },
          { icon: CheckCircle, label: '採用済み',      value: acceptedApps.length,         color: 'text-green-600' },
          { icon: Star,        label: '平均評価',       value: profile?.avg_rating > 0 ? profile.avg_rating.toFixed(1) : '—', color: 'text-yellow-500' },
        ].map(card => (
          <div key={card.label} className="bg-white rounded-xl border border-gray-200 p-5">
            <card.icon className={`w-5 h-5 ${card.color} mb-2`} />
            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            <p className="text-xs text-gray-500 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* 最近の応募 */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900 text-sm">最近の応募・紹介案件</h2>
          <button
            onClick={() => navigate('/creator/applications')}
            className="text-xs text-indigo-600 hover:underline"
          >
            すべて見る
          </button>
        </div>
        {applications.length === 0 ? (
          <p className="px-6 py-10 text-sm text-gray-400 text-center">まだ応募・紹介案件はありません</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {applications.slice(0, 5).map(app => (
              <li key={app.id} className="px-6 py-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {(app.project as any)?.title ?? '案件名不明'}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(app.created_at).toLocaleDateString('ja-JP')}
                    {app.proposed_rate && ` · ¥${app.proposed_rate.toLocaleString()}`}
                  </p>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${APP_STATUS_COLORS[app.application_status]}`}>
                  {APP_STATUS_LABELS[app.application_status]}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
