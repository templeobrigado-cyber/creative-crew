import { useEffect, useState } from 'react'
import { Check, Save } from 'lucide-react'
import { getCreatorByUserId, upsertCreatorProfile, updateUser } from '../../../../lib/services/users'
import type { CreatorProfile } from '../../../../lib/services/users'

const OCCUPATION_OPTIONS = [
  'イラストレーター', 'グラフィックデザイナー', 'WEBデザイナー', 'UI/UXデザイナー',
  '動画クリエイター', '映像編集者', '3DCGクリエイター', 'アニメーター',
  'ライター', 'カメラマン', 'アーティスト', '音楽制作者', 'VTuber関連クリエイター',
]

const PREFECTURES = [
  '北海道','青森県','岩手県','宮城県','秋田県','山形県','福島県',
  '茨城県','栃木県','群馬県','埼玉県','千葉県','東京都','神奈川県',
  '新潟県','富山県','石川県','福井県','山梨県','長野県','岐阜県',
  '静岡県','愛知県','三重県','滋賀県','京都府','大阪府','兵庫県',
  '奈良県','和歌山県','鳥取県','島根県','岡山県','広島県','山口県',
  '徳島県','香川県','愛媛県','高知県','福岡県','佐賀県','長崎県',
  '熊本県','大分県','宮崎県','鹿児島県','沖縄県',
]

type Props = { user: { id: string; name: string } }

export function CreatorProfilePage({ user }: Props) {
  const [profile, setProfile] = useState<CreatorProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const [name, setName] = useState(user.name)
  const [nickname, setNickname] = useState('')
  const [prefecture, setPrefecture] = useState('')
  const [occupation, setOccupation] = useState<string[]>([])
  const [skills, setSkills] = useState('')
  const [experienceYears, setExperienceYears] = useState('')
  const [skillLevel, setSkillLevel] = useState('')
  const [hourlyRateMin, setHourlyRateMin] = useState('')
  const [hourlyRateMax, setHourlyRateMax] = useState('')
  const [remoteOk, setRemoteOk] = useState(true)
  const [immediateOk, setImmediateOk] = useState(false)
  const [portfolioUrl, setPortfolioUrl] = useState('')
  const [bio, setBio] = useState('')

  useEffect(() => {
    getCreatorByUserId(user.id).then(p => {
      if (p) {
        setProfile(p)
        setNickname(p.nickname ?? '')
        setPrefecture(p.prefecture ?? '')
        setOccupation(p.occupation ?? [])
        setSkills((p.skills ?? []).join(', '))
        setExperienceYears(p.experience_years?.toString() ?? '')
        setSkillLevel(p.skill_level ?? '')
        setHourlyRateMin(p.hourly_rate_min?.toString() ?? '')
        setHourlyRateMax(p.hourly_rate_max?.toString() ?? '')
        setRemoteOk(p.remote_ok)
        setImmediateOk(p.immediate_ok)
        setPortfolioUrl(p.portfolio_url ?? '')
        setBio(p.bio ?? '')
      }
    }).finally(() => setLoading(false))
  }, [user.id])

  function toggleOccupation(o: string) {
    setOccupation(prev => prev.includes(o) ? prev.filter(x => x !== o) : [...prev, o])
  }

  async function handleSave() {
    setSaving(true)
    await Promise.all([
      upsertCreatorProfile({
        user_id: user.id,
        nickname: nickname || null,
        prefecture: prefecture || null,
        occupation: occupation.length > 0 ? occupation : null,
        skills: skills ? skills.split(',').map(s => s.trim()).filter(Boolean) : null,
        experience_years: experienceYears ? Number(experienceYears) : null,
        skill_level: skillLevel || null,
        hourly_rate_min: hourlyRateMin ? Number(hourlyRateMin) : null,
        hourly_rate_max: hourlyRateMax ? Number(hourlyRateMax) : null,
        remote_ok: remoteOk,
        immediate_ok: immediateOk,
        portfolio_url: portfolioUrl || null,
        bio: bio || null,
      }),
      name !== user.name ? updateUser(user.id, { name }) : Promise.resolve(true),
    ])
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  if (loading) return <div className="p-8 text-sm text-gray-400">読み込み中…</div>

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">プロフィール編集</h1>
          <p className="text-sm text-gray-500 mt-1">情報を充実させると案件紹介の機会が増えます</p>
        </div>
        <div className="flex items-center gap-2">
          {saved && (
            <span className="flex items-center gap-1 text-sm text-green-600">
              <Check className="w-4 h-4" /> 保存しました
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? '保存中…' : '保存'}
          </button>
        </div>
      </div>

      <div className="space-y-5">
        {/* 基本情報 */}
        <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-indigo-600 uppercase tracking-wide">基本情報</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">氏名</label>
              <input value={name} onChange={e => setName(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">ニックネーム</label>
              <input value={nickname} onChange={e => setNickname(e.target.value)} placeholder="クリエイター名"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">都道府県</label>
              <select value={prefecture} onChange={e => setPrefecture(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300">
                <option value="">選択</option>
                {PREFECTURES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={remoteOk} onChange={e => setRemoteOk(e.target.checked)} className="rounded text-indigo-600" />
              リモート可
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={immediateOk} onChange={e => setImmediateOk(e.target.checked)} className="rounded text-indigo-600" />
              即日対応可
            </label>
          </div>
        </section>

        {/* スキル */}
        <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-indigo-600 uppercase tracking-wide">スキル・職種</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">職種（複数選択可）</label>
            <div className="flex flex-wrap gap-2">
              {OCCUPATION_OPTIONS.map(o => (
                <button key={o} type="button" onClick={() => toggleOccupation(o)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    occupation.includes(o)
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-400'
                  }`}>
                  {o}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">使用ツール・スキル（カンマ区切り）</label>
            <input value={skills} onChange={e => setSkills(e.target.value)} placeholder="Photoshop, Illustrator"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">経験年数</label>
              <input type="number" min="0" value={experienceYears} onChange={e => setExperienceYears(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">スキルレベル</label>
              <select value={skillLevel} onChange={e => setSkillLevel(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300">
                <option value="">選択</option>
                <option value="beginner">初級</option>
                <option value="intermediate">中級</option>
                <option value="advanced">上級</option>
                <option value="expert">エキスパート</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">希望単価（最小）</label>
              <input type="number" value={hourlyRateMin} onChange={e => setHourlyRateMin(e.target.value)} placeholder="5000"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">希望単価（最大）</label>
              <input type="number" value={hourlyRateMax} onChange={e => setHourlyRateMax(e.target.value)} placeholder="10000"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
            </div>
          </div>
        </section>

        {/* ポートフォリオ・自己紹介 */}
        <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-indigo-600 uppercase tracking-wide">ポートフォリオ・自己紹介</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">ポートフォリオURL</label>
            <input type="url" value={portfolioUrl} onChange={e => setPortfolioUrl(e.target.value)} placeholder="https://your-portfolio.com"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">自己紹介</label>
            <textarea rows={4} value={bio} onChange={e => setBio(e.target.value)} placeholder="得意なことや実績など"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
          </div>
        </section>
      </div>
    </div>
  )
}
