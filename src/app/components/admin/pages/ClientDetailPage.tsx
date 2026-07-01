import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router'
import { ArrowLeft, Building2, Save, Check } from 'lucide-react'
import { getUserById, getClientByUserId, upsertClientProfile, type ClientProfile, type User } from '../../../../lib/services/users'
import { getProjectsByClientId, type Project, STATUS_LABELS, STATUS_COLORS } from '../../../../lib/services/projects'

const INDUSTRIES = [
  'ゲーム・エンターテインメント','WEB制作・マーケティング','広告・PR','出版・メディア',
  'IT・テクノロジー','アパレル・ファッション','飲食・フード','小売・EC','教育','医療・ヘルスケア','その他',
]

export function ClientDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<ClientProfile | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const [companyName, setCompanyName] = useState('')
  const [industry, setIndustry] = useState('')
  const [companyUrl, setCompanyUrl] = useState('')
  const [bio, setBio] = useState('')

  useEffect(() => {
    if (!id) return
    Promise.all([
      getUserById(id),
      getClientByUserId(id),
      getProjectsByClientId(id),
    ]).then(([u, p, projs]) => {
      if (u) setUser(u)
      if (p) {
        setProfile(p)
        setCompanyName(p.company_name ?? '')
        setIndustry(p.industry ?? '')
        setCompanyUrl(p.company_url ?? '')
        setBio(p.bio ?? '')
      }
      setProjects(projs)
    }).finally(() => setLoading(false))
  }, [id])

  async function handleSave() {
    if (!id) return
    setSaving(true)
    await upsertClientProfile({
      user_id: id,
      company_name: companyName || null,
      industry: industry || null,
      company_url: companyUrl || null,
      bio: bio || null,
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  if (loading) return <div className="p-8 text-sm text-gray-400">読み込み中…</div>
  if (!user) return <div className="p-8 text-sm text-red-500">ユーザーが見つかりません</div>

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center gap-3">
        <Link to="/admin/clients" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 font-bold">
            {user.name[0]}
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{user.name}</h1>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* 左: プロフィール編集 */}
        <div className="col-span-2 space-y-5">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-indigo-600" /> 会社・事業情報
              </h2>
              <div className="flex items-center gap-3">
                {saved && (
                  <span className="flex items-center gap-1 text-sm text-green-600">
                    <Check className="w-4 h-4" /> 保存しました
                  </span>
                )}
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  {saving ? '保存中…' : '保存'}
                </button>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">会社名・屋号</label>
                <input value={companyName} onChange={e => setCompanyName(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">業種</label>
                  <select value={industry} onChange={e => setIndustry(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300">
                    <option value="">未設定</option>
                    {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">WebサイトURL</label>
                  <input type="url" value={companyUrl} onChange={e => setCompanyUrl(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">事業概要・備考</label>
                <textarea rows={3} value={bio} onChange={e => setBio(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
              </div>
            </div>
          </div>

          {/* 案件一覧 */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">依頼案件（{projects.length}件）</h2>
            {projects.length === 0 ? (
              <p className="text-sm text-gray-400 py-4 text-center">案件はまだありません</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {projects.map(p => (
                  <div key={p.id} className="py-3 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <Link to={`/admin/projects/${p.id}/edit`} className="text-sm font-medium text-indigo-700 hover:underline truncate block">
                        {p.title}
                      </Link>
                      <p className="text-xs text-gray-400 mt-0.5">
                        応募 {p.application_count}件 / 指名 {p.referred_count}件
                      </p>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${STATUS_COLORS[p.status]}`}>
                      {STATUS_LABELS[p.status]}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 右: アカウント情報 */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-900 mb-3 text-sm">アカウント情報</h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-xs text-gray-400">担当者名</dt>
                <dd className="text-sm font-medium text-gray-900 mt-0.5">{user.name}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">メールアドレス</dt>
                <dd className="text-sm text-gray-700 mt-0.5 break-all">{user.email}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">ステータス</dt>
                <dd className="mt-0.5">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${user.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {user.is_active ? 'アクティブ' : '無効'}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">登録日</dt>
                <dd className="text-sm text-gray-700 mt-0.5">
                  {new Date(user.created_at).toLocaleDateString('ja-JP')}
                </dd>
              </div>
              {profile?.company_name && (
                <div>
                  <dt className="text-xs text-gray-400">会社名</dt>
                  <dd className="text-sm text-gray-700 mt-0.5">{profile.company_name}</dd>
                </div>
              )}
              {profile?.industry && (
                <div>
                  <dt className="text-xs text-gray-400">業種</dt>
                  <dd className="text-sm text-gray-700 mt-0.5">{profile.industry}</dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>
    </div>
  )
}
