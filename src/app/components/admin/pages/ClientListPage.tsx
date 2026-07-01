import { useEffect, useState } from 'react'
import { Search, Building2, Globe } from 'lucide-react'
import { Link } from 'react-router'
import { getClients, updateUser } from '../../../../lib/services/users'
import type { ClientProfile } from '../../../../lib/services/users'

export function ClientListPage() {
  const [clients, setClients] = useState<ClientProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'pending' | 'active'>('all')

  useEffect(() => {
    getClients().then(data => setClients(data)).finally(() => setLoading(false))
  }, [])

  async function toggleActive(e: React.MouseEvent, userId: string, current: boolean) {
    e.preventDefault()
    e.stopPropagation()
    await updateUser(userId, { is_active: !current })
    setClients(prev => prev.map(c => c.user_id === userId
      ? { ...c, user: c.user ? { ...c.user, is_active: !current } : c.user }
      : c
    ))
  }

  const filtered = clients.filter(c => {
    const name = c.user?.name ?? ''
    const company = c.company_name ?? ''
    const matchSearch = name.includes(search) || company.includes(search)
    const matchFilter = filter === 'all' ? true : filter === 'pending' ? !c.user?.is_active : c.user?.is_active
    return matchSearch && matchFilter
  })

  const pendingCount = clients.filter(c => !c.user?.is_active).length

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">発注者一覧</h1>
          <p className="text-sm text-gray-500 mt-1">登録発注者の管理</p>
        </div>
        {pendingCount > 0 && (
          <span className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-700 text-sm font-medium px-3 py-1.5 rounded-full">
            <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
            審査待ち {pendingCount}名
          </span>
        )}
      </div>

      <div className="flex gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="名前・会社名で検索"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {(['all', 'pending', 'active'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${filter === f ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              {f === 'all' ? 'すべて' : f === 'pending' ? '審査待ち' : '承認済み'}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <p className="px-6 py-8 text-sm text-gray-400 text-center">読み込み中…</p>
        ) : filtered.length === 0 ? (
          <p className="px-6 py-8 text-sm text-gray-400 text-center">発注者が見つかりません</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-6 py-3 text-left">名前</th>
                <th className="px-6 py-3 text-left">会社名</th>
                <th className="px-6 py-3 text-left">業種</th>
                <th className="px-6 py-3 text-left">WEBサイト</th>
                <th className="px-6 py-3 text-left">登録日</th>
                <th className="px-6 py-3 text-left">承認</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(c => {
                const isActive = c.user?.is_active ?? false
                return (
                  <tr key={c.id} className={`hover:bg-gray-50 transition-colors ${!isActive ? 'bg-amber-50/40' : ''}`}>
                    <td className="px-6 py-4">
                      <Link to={`/admin/clients/${c.user_id}`} className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium text-xs">
                            {(c.user?.name ?? '?')[0]}
                          </div>
                          {!isActive && (
                            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-amber-400 rounded-full border-2 border-white" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-indigo-700 hover:underline">{c.user?.name ?? '—'}</p>
                          <p className="text-xs text-gray-400">{c.user?.email ?? ''}</p>
                        </div>
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-gray-400" />
                        {c.company_name ?? '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{c.industry ?? '—'}</td>
                    <td className="px-6 py-4">
                      {c.company_url
                        ? <a href={c.company_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 text-xs">
                            <Globe className="w-3.5 h-3.5" /> サイトを見る
                          </a>
                        : <span className="text-gray-400">—</span>
                      }
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-xs">
                      {new Date(c.created_at).toLocaleDateString('ja-JP')}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={e => toggleActive(e, c.user_id, isActive)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${isActive ? 'bg-indigo-600' : 'bg-gray-300'}`}
                        title={isActive ? '承認済み（クリックで無効化）' : '審査待ち（クリックで承認）'}
                      >
                        <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform shadow ${isActive ? 'translate-x-4' : 'translate-x-0.5'}`} />
                      </button>
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
