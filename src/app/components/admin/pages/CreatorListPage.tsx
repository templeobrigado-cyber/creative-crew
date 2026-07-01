import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { Search, Star } from 'lucide-react'
import { getCreators } from '../../../../lib/services/users'
import type { CreatorProfile } from '../../../../lib/services/users'

const SKILL_LEVEL: Record<string, string> = {
  beginner: '初級', intermediate: '中級', advanced: '上級', expert: 'エキスパート',
}
const SKILL_COLORS: Record<string, string> = {
  beginner: 'bg-gray-100 text-gray-600',
  intermediate: 'bg-blue-100 text-blue-700',
  advanced: 'bg-indigo-100 text-indigo-700',
  expert: 'bg-purple-100 text-purple-700',
}

export function CreatorListPage() {
  const navigate = useNavigate()
  const [creators, setCreators] = useState<CreatorProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    getCreators().then(data => setCreators(data)).finally(() => setLoading(false))
  }, [])

  const filtered = creators.filter(c => {
    const name = c.user?.name ?? ''
    const occupation = (c.occupation ?? []).join(' ')
    const skills = (c.skills ?? []).join(' ')
    return name.includes(search) || occupation.includes(search) || skills.includes(search)
  })

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">クリエイター一覧</h1>
        <p className="text-sm text-gray-500 mt-1">登録クリエイターのプロフィール管理</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="名前・職種・スキルで検索"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>
      </div>

      {loading ? (
        <p className="text-gray-400 text-sm text-center py-8">読み込み中…</p>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 px-6 py-12 text-center">
          <p className="text-gray-400 text-sm">クリエイターが見つかりません</p>
          <p className="text-gray-300 text-xs mt-1">Supabase接続後にデータが表示されます</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(c => (
            <div
              key={c.id}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md cursor-pointer transition-shadow"
              onClick={() => navigate(`/admin/creators/${c.user_id}`)}
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold text-sm shrink-0">
                  {(c.user?.name ?? c.nickname ?? '?')[0]}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 truncate">{c.user?.name ?? '—'}</p>
                  {c.nickname && <p className="text-xs text-gray-400">{c.nickname}</p>}
                </div>
                {c.skill_level && (
                  <span className={`ml-auto shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${SKILL_COLORS[c.skill_level] ?? ''}`}>
                    {SKILL_LEVEL[c.skill_level] ?? c.skill_level}
                  </span>
                )}
              </div>

              {c.occupation && c.occupation.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {c.occupation.slice(0, 2).map(o => (
                    <span key={o} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{o}</span>
                  ))}
                  {c.occupation.length > 2 && (
                    <span className="text-xs text-gray-400">+{c.occupation.length - 2}</span>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                  <span>{c.avg_rating > 0 ? c.avg_rating.toFixed(1) : '—'}</span>
                </div>
                <span>実績 {c.completed_count}件</span>
                {c.remote_ok && <span className="text-green-600">リモート可</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
