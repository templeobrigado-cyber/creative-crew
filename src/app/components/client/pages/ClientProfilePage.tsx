import { useEffect, useState } from 'react'
import { Save, Check } from 'lucide-react'
import { getClientByUserId, upsertClientProfile } from '../../../../lib/services/users'

const INDUSTRIES = [
  'ゲーム・エンターテインメント','WEB制作・マーケティング','広告・PR','出版・メディア',
  'IT・テクノロジー','アパレル・ファッション','飲食・フード','小売・EC','教育','医療・ヘルスケア','その他',
]

type Props = { user: { id: string; name: string } }

export function ClientProfilePage({ user }: Props) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const [companyName, setCompanyName] = useState('')
  const [industry, setIndustry] = useState('')
  const [companyUrl, setCompanyUrl] = useState('')
  const [bio, setBio] = useState('')

  useEffect(() => {
    getClientByUserId(user.id).then(p => {
      if (p) {
        setCompanyName(p.company_name ?? '')
        setIndustry(p.industry ?? '')
        setCompanyUrl(p.company_url ?? '')
        setBio(p.bio ?? '')
      }
    }).finally(() => setLoading(false))
  }, [user.id])

  async function handleSave() {
    setSaving(true)
    await upsertClientProfile({
      user_id: user.id,
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

  return (
    <div className="p-8 max-w-xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">会社・事業情報</h1>
          <p className="text-sm text-gray-500 mt-1">登録情報を最新の状態に保ちましょう</p>
        </div>
        <div className="flex items-center gap-3">
          {saved && (
            <span className="flex items-center gap-1 text-sm text-green-600">
              <Check className="w-4 h-4" /> 保存しました
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            <Save className="w-4 h-4" />
            {saving ? '保存中…' : '保存'}
          </button>
        </div>
      </div>

      <div className="space-y-5">
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-indigo-600 uppercase tracking-wide">担当者情報</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">担当者名</label>
            <input
              value={user.name}
              disabled
              className="w-full border border-gray-100 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-400"
            />
            <p className="text-xs text-gray-400 mt-1">名前の変更はサポートまでお問い合わせください</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-indigo-600 uppercase tracking-wide">会社・事業情報</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">会社名・屋号</label>
            <input
              value={companyName}
              onChange={e => setCompanyName(e.target.value)}
              placeholder="株式会社〇〇"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">業種</label>
              <select
                value={industry}
                onChange={e => setIndustry(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              >
                <option value="">選択してください</option>
                {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">WebサイトURL</label>
              <input
                type="url"
                value={companyUrl}
                onChange={e => setCompanyUrl(e.target.value)}
                placeholder="https://company.com"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">事業概要・備考</label>
            <textarea
              rows={4}
              value={bio}
              onChange={e => setBio(e.target.value)}
              placeholder="依頼したい仕事の種類や、よく依頼する業務の概要など"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
