import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { Check } from 'lucide-react'
import { createUser } from '../../../lib/services/users'
import { supabase, isSupabaseConfigured } from '../../../lib/supabase'

const INDUSTRIES = [
  'ゲーム・エンターテインメント',
  'WEB制作・マーケティング',
  '広告・PR',
  '出版・メディア',
  'IT・テクノロジー',
  'アパレル・ファッション',
  '飲食・フード',
  '小売・EC',
  '教育',
  '医療・ヘルスケア',
  'その他',
]

export function ClientRegisterPage() {
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [industry, setIndustry] = useState('')
  const [companyUrl, setCompanyUrl] = useState('')
  const [bio, setBio] = useState('')
  const [agreed, setAgreed] = useState(false)

  function validate() {
    if (!name.trim()) return 'お名前を入力してください'
    if (!email.trim() || !email.includes('@')) return 'メールアドレスを正しく入力してください'
    if (!companyName.trim()) return '会社名・屋号を入力してください'
    if (!agreed) return '利用規約に同意してください'
    return null
  }

  async function handleSubmit() {
    const err = validate()
    if (err) return alert(err)

    setSubmitting(true)

    const user = await createUser({
      role: 'client',
      name: name.trim(),
      email: email.trim(),
      avatar_url: null,
      line_user_id: null,
      is_active: true,
    })

    if (!user) {
      setSubmitting(false)
      return alert('登録に失敗しました。このメールアドレスはすでに使用されている可能性があります。')
    }

    if (isSupabaseConfigured && supabase) {
      await supabase.from('client_profiles').insert({
        user_id: user.id,
        company_name: companyName.trim(),
        industry: industry || null,
        company_url: companyUrl || null,
        bio: bio || null,
      })
    }

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
          <p className="text-sm text-gray-500 mb-6">
            担当者より2営業日以内にご連絡いたします。<br />ご登録ありがとうございます。
          </p>
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
      <h1 className="text-2xl font-bold text-gray-900 mb-1">発注者登録</h1>
      <p className="text-sm text-gray-500 mb-8">クリエイターへの依頼を始めるには発注者登録が必要です</p>

      <div className="space-y-5">
        {/* 担当者情報 */}
        <div className="bg-gray-50 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">担当者情報</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              担当者名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="山田 花子"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
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
              placeholder="contact@company.com"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>
        </div>

        {/* 会社情報 */}
        <div className="bg-gray-50 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">会社・事業情報</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              会社名・屋号 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={companyName}
              onChange={e => setCompanyName(e.target.value)}
              placeholder="株式会社〇〇 / フリーランス"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">業種</label>
              <select
                value={industry}
                onChange={e => setIndustry(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
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
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">依頼したい仕事の概要（任意）</label>
            <textarea
              rows={3}
              value={bio}
              onChange={e => setBio(e.target.value)}
              placeholder="どのようなクリエイティブを求めているか、依頼の背景などを入力してください"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>
        </div>

        {/* 同意 */}
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={agreed}
            onChange={e => setAgreed(e.target.checked)}
            className="w-4 h-4 mt-0.5 rounded text-indigo-600"
          />
          <span className="text-sm text-gray-600">
            <Link to="/" className="text-indigo-600 hover:underline">利用規約</Link>および
            <Link to="/" className="text-indigo-600 hover:underline ml-0.5">プライバシーポリシー</Link>
            に同意します
          </span>
        </label>
      </div>

      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="w-full mt-8 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50"
      >
        {submitting ? '登録中…' : '登録する'}
      </button>

      <p className="text-center text-sm text-gray-400 mt-4">
        すでにアカウントをお持ちの方は
        <Link to="/admin/login" className="text-indigo-600 hover:underline ml-1">ログイン</Link>
      </p>
    </div>
  )
}
