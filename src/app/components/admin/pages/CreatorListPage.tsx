import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { Search, Star } from 'lucide-react'
import { getCreators, updateUser } from '../../../../lib/services/users'
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
  const [filter, setFilter] = useState<'all' | 'pending' | 'active'>('all')

  useEffect(() => {
    getCreators().then(data => setCreators(data)).finally(() => setLoading(false))
  }, [])

  async function toggleActive(e: React.MouseEvent, userId: string, current: boolean) {
    e.stopPropagation()
    await updateUser(userId, { is_active: !current })
    setCreators(prev => prev.map(c => c.user_id === userId
      ? { ...c, user: c.user ? { ...c.user, is_active: !current } : c.user }
      : c
    ))
  }

  const filtered = creators.filter(c => {
    const name = c.user?.name ?? ''
    const occupation = (c.occupation ?? []).join(' ')
    const skills = (c.skills ?? []).join(' ')
    const matchSearch = name.includes(search) || occupation.includes(search) || skills.includes(search)
    const matchFilter = filter === 'all' ? true : filter === 'pending' ? !c.user?.is_active : c.user?.is_active
    return matchSearch && matchFilter
  })

  const pendingCount = creators.filter(c => !c.user?.is_active).length

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">クリエイター一覧</h1>
          <p className="text-sm text-gray-500 mt-1">登録クリエイターのプロフィール管理</p>
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
            placeholder="名前・職種・スキルで検索"
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

      {loading ? (
        <p className="text-gray-400 text-sm text-center py-8">読み込み中…</p>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 px-6 py-12 text-center">
          <p className="text-gray-400 text-sm">クリエイターが見つかりません</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(c => {
            const isActive = c.user?.is_active ?? false
            return (
              <div
                key={c.id}
                className={`bg-white rounded-xl border p-5 hover:shadow-md cursor-pointer transition-shadow ${isActive ? 'border-gray-200' : 'border-amber-200 bg-amber-50/30'}`}
                onClick={() => navigate(`/admin/creators/${c.user_id}`)}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold text-sm shrink-0">
                      {(c.user?.name ?? c.nickname ?? '?')[0]}
                    </div>
                    {!isActive && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full border-2 border-white" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900 truncate">{c.user?.name ?? '—'}</p>
                    {c.nickname && <p className="text-xs text-gray-400">{c.nickname}</p>}
                  </div>
                  {c.skill_level && (
                    <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${SKILL_COLORS[c.skill_level] ?? ''}`}>
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

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                      <span>{c.avg_rating > 0 ? c.avg_rating.toFixed(1) : '—'}</span>
                    </div>
                    <span>実績 {c.completed_count}件</span>
                  </div>
                  {/* アクティブトグル */}
                  <button
                    onClick={e => toggleActive(e, c.user_id, isActive)}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${isActive ? 'bg-indigo-600' : 'bg-gray-300'}`}
                    title={isActive ? '承認済み（クリックで無効化）' : '審査待ち（クリックで承認）'}
                  >
                    <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform shadow ${isActive ? 'translate-x-4' : 'translate-x-0.5'}`} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
