import { useEffect, useState } from 'react'
import { Search, Building2, Globe } from 'lucide-react'
import { Link } from 'react-router'
import { getClients } from '../../../../lib/services/users'
import type { ClientProfile } from '../../../../lib/services/users'

export function ClientListPage() {
  const [clients, setClients] = useState<ClientProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    getClients().then(data => setClients(data)).finally(() => setLoading(false))
  }, [])

  const filtered = clients.filter(c => {
    const name = c.user?.name ?? ''
    const company = c.company_name ?? ''
    return name.includes(search) || company.includes(search)
  })

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">発注者一覧</h1>
        <p className="text-sm text-gray-500 mt-1">登録発注者の管理</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="名前・会社名で検索"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
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
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(c => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors cursor-pointer">
                  <td className="px-6 py-4">
                    <Link to={`/admin/clients/${c.user_id}`} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium text-xs">
                        {(c.user?.name ?? '?')[0]}
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
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
