import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { getUserByEmail } from '../../../lib/services/users'

export function UserLoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return setError('メールアドレスを入力してください')
    setLoading(true)
    setError('')

    const user = await getUserByEmail(email.trim())
    setLoading(false)

    if (!user) return setError('このメールアドレスは登録されていません')
    if (!user.is_active) return setError('アカウントは現在審査中です。担当者より承認後にご利用いただけます。')

    if (user.role === 'admin') {
      return setError('管理者は管理者ログインページをご利用ください')
    }

    sessionStorage.setItem('current_user', JSON.stringify({ id: user.id, role: user.role, name: user.name, email: user.email }))

    if (user.role === 'creator') navigate('/creator/dashboard')
    else navigate('/client/dashboard')
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold">CC</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">ログイン</h1>
          <p className="text-sm text-gray-500 mt-1">登録済みのメールアドレスを入力してください</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">メールアドレス</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              autoFocus
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>

          {error && <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'ログイン中…' : 'ログイン'}
          </button>
        </form>

        <div className="mt-6 space-y-2 text-center text-sm text-gray-500">
          <p>アカウントをお持ちでない方</p>
          <div className="flex gap-3 justify-center">
            <Link to="/register/creator" className="text-indigo-600 hover:underline">クリエイター登録</Link>
            <span className="text-gray-300">|</span>
            <Link to="/register/client" className="text-indigo-600 hover:underline">発注者登録</Link>
          </div>
        </div>

        <div className="mt-4 text-center">
          <Link to="/admin/login" className="text-xs text-gray-400 hover:text-gray-600">管理者の方はこちら</Link>
        </div>
      </div>
    </div>
  )
}
