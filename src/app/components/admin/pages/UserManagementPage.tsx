import { useEffect, useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { getUsers, createUser } from '../../../../lib/services/users'
import type { User, UserRole } from '../../../../lib/services/users'

const ROLE_LABELS: Record<UserRole, { label: string; color: string }> = {
  admin:   { label: '管理者',       color: 'bg-red-100 text-red-700' },
  client:  { label: '発注者',       color: 'bg-blue-100 text-blue-700' },
  creator: { label: 'クリエイター', color: 'bg-indigo-100 text-indigo-700' },
}

type NewUser = { name: string; email: string; role: UserRole }
const EMPTY_NEW: NewUser = { name: '', email: '', role: 'creator' }

export function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [newUser, setNewUser] = useState<NewUser>(EMPTY_NEW)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getUsers().then(data => setUsers(data)).finally(() => setLoading(false))
  }, [])

  const filtered = users.filter(u =>
    u.name.includes(search) || u.email.includes(search)
  )

  async function handleCreate() {
    if (!newUser.name || !newUser.email) return alert('名前とメールアドレスは必須です')
    setSaving(true)
    const created = await createUser({ ...newUser, avatar_url: null, line_user_id: null, is_active: true })
    if (created) {
      setUsers(prev => [created, ...prev])
      setNewUser(EMPTY_NEW)
      setShowForm(false)
    }
    setSaving(false)
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">ユーザー管理</h1>
          <p className="text-sm text-gray-500 mt-1">全ロールのユーザー一覧</p>
        </div>
        <button
          onClick={() => setShowForm(v => !v)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          ユーザー追加
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 space-y-4">
          <h2 className="font-medium text-gray-900">新規ユーザー</h2>
          <div className="grid grid-cols-3 gap-4">
            <input
              type="text" placeholder="氏名"
              value={newUser.name} onChange={e => setNewUser(p => ({ ...p, name: e.target.value }))}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
            <input
              type="email" placeholder="メールアドレス"
              value={newUser.email} onChange={e => setNewUser(p => ({ ...p, email: e.target.value }))}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
            <select
              value={newUser.role} onChange={e => setNewUser(p => ({ ...p, role: e.target.value as UserRole }))}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            >
              <option value="creator">クリエイター</option>
              <option value="client">発注者</option>
              <option value="admin">管理者</option>
            </select>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleCreate} disabled={saving}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50"
            >
              {saving ? '追加中…' : '追加'}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50"
            >
              キャンセル
            </button>
          </div>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text" placeholder="名前・メールで検索"
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <p className="px-6 py-8 text-sm text-gray-400 text-center">読み込み中…</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-6 py-3 text-left">名前</th>
                <th className="px-6 py-3 text-left">メール</th>
                <th className="px-6 py-3 text-left">ロール</th>
                <th className="px-6 py-3 text-left">ステータス</th>
                <th className="px-6 py-3 text-left">登録日</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(u => {
                const r = ROLE_LABELS[u.role]
                return (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{u.name}</td>
                    <td className="px-6 py-4 text-gray-500">{u.email}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${r.color}`}>{r.label}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${u.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {u.is_active ? '有効' : '無効'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-xs">
                      {new Date(u.created_at).toLocaleDateString('ja-JP')}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
