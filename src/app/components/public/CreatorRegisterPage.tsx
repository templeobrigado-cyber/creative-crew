import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { Check, ChevronRight } from 'lucide-react'
import { createUser, upsertCreatorProfile } from '../../../lib/services/users'
import { supabase, isSupabaseConfigured } from '../../../lib/supabase'

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

type Step = 1 | 2

export function CreatorRegisterPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>(1)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [createdUserId, setCreatedUserId] = useState<string | null>(null)

  // Step 1
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  // Step 2
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

  function toggleOccupation(o: string) {
    setOccupation(prev => prev.includes(o) ? prev.filter(x => x !== o) : [...prev, o])
  }

  function validateStep1() {
    if (!name.trim()) return 'お名前を入力してください'
    if (!email.trim() || !email.includes('@')) return 'メールアドレスを正しく入力してください'
    return null
  }

  async function handleStep1() {
    const err = validateStep1()
    if (err) return alert(err)

    setSubmitting(true)

    let newUserId: string | null = null
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('users').insert({
        role: 'creator',
        name: name.trim(),
        email: email.trim(),
        avatar_url: null,
        line_user_id: null,
        is_active: false,
      }).select('id').single()

      if (error) {
        setSubmitting(false)
        if (error.code === '23505') {
          return alert('このメールアドレスはすでに登録されています。ログインページからログインしてください。')
        }
        return alert(`登録に失敗しました。(${error.message})`)
      }
      newUserId = data?.id ?? null
    }

    setSubmitting(false)
    if (!newUserId) return alert('登録に失敗しました。しばらく時間をおいて再度お試しください。')
    setCreatedUserId(newUserId)
    setStep(2)
  }

  async function handleStep2() {
    if (!createdUserId) return
    if (occupation.length === 0) return alert('職種を1つ以上選択してください')

    setSubmitting(true)
    await upsertCreatorProfile({
      user_id: createdUserId,
      nickname: nickname || null,
      prefecture: prefecture || null,
      occupation,
      skills: skills ? skills.split(',').map(s => s.trim()).filter(Boolean) : null,
      experience_years: experienceYears ? Number(experienceYears) : null,
      skill_level: skillLevel || null,
      hourly_rate_min: hourlyRateMin ? Number(hourlyRateMin) : null,
      hourly_rate_max: hourlyRateMax ? Number(hourlyRateMax) : null,
      remote_ok: remoteOk,
      immediate_ok: immediateOk,
      portfolio_url: portfolioUrl || null,
      bio: bio || null,
    })
    setSubmitting(false)
    setDone(true)
  }

  if (done) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">登録が完了しました！</h2>
          <p className="text-sm text-gray-500 mb-6">プロフィールの審査後、案件の紹介を開始します。<br />ご登録ありがとうございます。</p>
          <Link
            to="/"
            className="inline-block px-6 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            トップに戻る
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto px-6 py-12">
      {/* ステップ表示 */}
      <div className="flex items-center gap-3 mb-8">
        <div className={`flex items-center gap-2 text-sm font-medium ${step === 1 ? 'text-indigo-600' : 'text-green-600'}`}>
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step === 1 ? 'bg-indigo-600 text-white' : 'bg-green-100 text-green-700'}`}>
            {step > 1 ? <Check className="w-4 h-4" /> : '1'}
          </div>
          アカウント情報
        </div>
        <ChevronRight className="w-4 h-4 text-gray-300" />
        <div className={`flex items-center gap-2 text-sm font-medium ${step === 2 ? 'text-indigo-600' : 'text-gray-400'}`}>
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step === 2 ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
            2
          </div>
          プロフィール
        </div>
      </div>

      {step === 1 && (
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">クリエイター登録</h1>
          <p className="text-sm text-gray-500 mb-8">まずはアカウント情報を入力してください</p>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                お名前 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="山田 太郎"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                メールアドレス <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="creator@example.com"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>
          </div>

          <button
            onClick={handleStep1}
            disabled={submitting}
            className="w-full mt-8 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {submitting ? '処理中…' : '次へ'}
          </button>

          <p className="text-center text-sm text-gray-400 mt-4">
            すでにアカウントをお持ちの方は
            <Link to="/admin/login" className="text-indigo-600 hover:underline ml-1">ログイン</Link>
          </p>
        </div>
      )}

      {step === 2 && (
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">プロフィール設定</h1>
          <p className="text-sm text-gray-500 mb-8">スキルや経歴を入力してください（後から変更可能）</p>

          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">ニックネーム</label>
                <input
                  type="text"
                  value={nickname}
                  onChange={e => setNickname(e.target.value)}
                  placeholder="クリエイター名"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">都道府県</label>
                <select
                  value={prefecture}
                  onChange={e => setPrefecture(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                >
                  <option value="">選択</option>
                  {PREFECTURES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                職種 <span className="text-red-500">*</span>
                <span className="text-gray-400 font-normal ml-1">（複数選択可）</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {OCCUPATION_OPTIONS.map(o => (
                  <button
                    key={o}
                    type="button"
                    onClick={() => toggleOccupation(o)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                      occupation.includes(o)
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-400'
                    }`}
                  >
                    {o}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">使用ツール・スキル（カンマ区切り）</label>
              <input
                type="text"
                value={skills}
                onChange={e => setSkills(e.target.value)}
                placeholder="Photoshop, Illustrator, Procreate"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">経験年数</label>
                <input
                  type="number" min="0"
                  value={experienceYears}
                  onChange={e => setExperienceYears(e.target.value)}
                  placeholder="5"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">スキルレベル</label>
                <select
                  value={skillLevel}
                  onChange={e => setSkillLevel(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                >
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
                <input
                  type="number"
                  value={hourlyRateMin}
                  onChange={e => setHourlyRateMin(e.target.value)}
                  placeholder="5000"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">希望単価（最大）</label>
                <input
                  type="number"
                  value={hourlyRateMax}
                  onChange={e => setHourlyRateMax(e.target.value)}
                  placeholder="10000"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">ポートフォリオURL</label>
              <input
                type="url"
                value={portfolioUrl}
                onChange={e => setPortfolioUrl(e.target.value)}
                placeholder="https://your-portfolio.com"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">自己紹介</label>
              <textarea
                rows={3}
                value={bio}
                onChange={e => setBio(e.target.value)}
                placeholder="得意なことや実績など、自己紹介を入力してください"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>

            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                <input type="checkbox" checked={remoteOk} onChange={e => setRemoteOk(e.target.checked)} className="w-4 h-4 rounded text-indigo-600" />
                リモート可
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                <input type="checkbox" checked={immediateOk} onChange={e => setImmediateOk(e.target.checked)} className="w-4 h-4 rounded text-indigo-600" />
                即日対応可
              </label>
            </div>
          </div>

          <div className="flex gap-3 mt-8">
            <button
              onClick={() => setStep(1)}
              className="px-6 py-3 border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors"
            >
              戻る
            </button>
            <button
              onClick={handleStep2}
              disabled={submitting}
              className="flex-1 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {submitting ? '登録中…' : '登録を完了する'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
