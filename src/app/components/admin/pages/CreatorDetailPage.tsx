import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { ArrowLeft, ExternalLink, Star, Mail, MapPin, Pencil, X, Save, Check } from 'lucide-react'
import { getCreatorByUserId, upsertCreatorProfile, updateUser } from '../../../../lib/services/users'
import type { CreatorProfile } from '../../../../lib/services/users'

const SKILL_LEVEL_LABELS: Record<string, string> = {
  beginner: '初級', intermediate: '中級', advanced: '上級', expert: 'エキスパート',
}

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

type FormData = {
  name: string
  nickname: string
  prefecture: string
  occupation: string[]
  skills: string
  experience_years: string
  skill_level: string
  hourly_rate_min: string
  hourly_rate_max: string
  remote_ok: boolean
  immediate_ok: boolean
  portfolio_url: string
  bio: string
}

function toForm(c: CreatorProfile): FormData {
  return {
    name: c.user?.name ?? '',
    nickname: c.nickname ?? '',
    prefecture: c.prefecture ?? '',
    occupation: c.occupation ?? [],
    skills: (c.skills ?? []).join(', '),
    experience_years: c.experience_years?.toString() ?? '',
    skill_level: c.skill_level ?? '',
    hourly_rate_min: c.hourly_rate_min?.toString() ?? '',
    hourly_rate_max: c.hourly_rate_max?.toString() ?? '',
    remote_ok: c.remote_ok,
    immediate_ok: c.immediate_ok,
    portfolio_url: c.portfolio_url ?? '',
    bio: c.bio ?? '',
  }
}

export function CreatorDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [creator, setCreator] = useState<CreatorProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<FormData | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (id) getCreatorByUserId(id).then(c => { setCreator(c); setLoading(false) })
  }, [id])

  function startEdit() {
    if (creator) { setForm(toForm(creator)); setEditing(true) }
  }

  function cancelEdit() {
    setEditing(false); setForm(null)
  }

  function setField<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm(prev => prev ? { ...prev, [key]: value } : prev)
  }

  function toggleOccupation(o: string) {
    if (!form) return
    const next = form.occupation.includes(o)
      ? form.occupation.filter(x => x !== o)
      : [...form.occupation, o]
    setField('occupation', next)
  }

  async function handleSave() {
    if (!creator || !form || !id) return
    setSaving(true)
    const [profileOk, userOk] = await Promise.all([
      upsertCreatorProfile({
        user_id: id,
        nickname: form.nickname || null,
        prefecture: form.prefecture || null,
        occupation: form.occupation.length > 0 ? form.occupation : null,
        skills: form.skills ? form.skills.split(',').map(s => s.trim()).filter(Boolean) : null,
        experience_years: form.experience_years ? Number(form.experience_years) : null,
        skill_level: form.skill_level || null,
        hourly_rate_min: form.hourly_rate_min ? Number(form.hourly_rate_min) : null,
        hourly_rate_max: form.hourly_rate_max ? Number(form.hourly_rate_max) : null,
        remote_ok: form.remote_ok,
        immediate_ok: form.immediate_ok,
        portfolio_url: form.portfolio_url || null,
        bio: form.bio || null,
      }),
      form.name !== creator.user?.name
        ? updateUser(id, { name: form.name })
        : Promise.resolve(true),
    ])
    if (profileOk && userOk) {
      const updated = await getCreatorByUserId(id)
      setCreator(updated)
      setEditing(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
    setSaving(false)
  }

  if (loading) return <div className="p-8 text-gray-500 text-sm">読み込み中…</div>
  if (!creator) return (
    <div className="p-8">
      <button onClick={() => navigate('/admin/creators')} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft className="w-4 h-4" /> 一覧に戻る
      </button>
      <p className="text-gray-400 text-sm">クリエイターが見つかりません</p>
    </div>
  )

  return (
    <div className="p-8 max-w-2xl">
      {/* ヘッダー行 */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => navigate('/admin/creators')} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft className="w-4 h-4" /> 一覧に戻る
        </button>
        <div className="flex items-center gap-2">
          {saved && (
            <span className="flex items-center gap-1 text-sm text-green-600">
              <Check className="w-4 h-4" /> 保存しました
            </span>
          )}
          {editing ? (
            <>
              <button
                onClick={cancelEdit}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50"
              >
                <X className="w-4 h-4" /> キャンセル
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50"
              >
                <Save className="w-4 h-4" /> {saving ? '保存中…' : '保存'}
              </button>
            </>
          ) : (
            <button
              onClick={startEdit}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700"
            >
              <Pencil className="w-4 h-4" /> 編集
            </button>
          )}
        </div>
      </div>

      {/* 基本情報 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xl shrink-0">
            {(creator.user?.name ?? '?')[0]}
          </div>
          <div className="flex-1 min-w-0">
            {editing && form ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">氏名</label>
                    <input
                      value={form.name}
                      onChange={e => setField('name', e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">ニックネーム</label>
                    <input
                      value={form.nickname}
                      onChange={e => setField('nickname', e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">都道府県</label>
                  <select
                    value={form.prefecture}
                    onChange={e => setField('prefecture', e.target.value)}
                    className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  >
                    <option value="">選択してください</option>
                    {PREFECTURES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer text-sm">
                    <input type="checkbox" checked={form.remote_ok} onChange={e => setField('remote_ok', e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-indigo-600" />
                    リモート可
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-sm">
                    <input type="checkbox" checked={form.immediate_ok} onChange={e => setField('immediate_ok', e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-indigo-600" />
                    即日対応可
                  </label>
                </div>
              </div>
            ) : (
              <>
                <h1 className="text-xl font-semibold text-gray-900">{creator.user?.name ?? '—'}</h1>
                {creator.nickname && <p className="text-sm text-gray-500">{creator.nickname}</p>}
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 flex-wrap">
                  {creator.user?.email && <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" />{creator.user.email}</span>}
                  {creator.prefecture && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{creator.prefecture}</span>}
                </div>
                <div className="flex items-center gap-3 mt-2 text-sm flex-wrap">
                  <span className="flex items-center gap-1"><Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />{creator.avg_rating > 0 ? creator.avg_rating.toFixed(1) : '—'}</span>
                  <span className="text-gray-500">実績 {creator.completed_count}件</span>
                  {creator.remote_ok && <span className="text-green-600 text-xs bg-green-50 px-2 py-0.5 rounded-full">リモート可</span>}
                  {creator.immediate_ok && <span className="text-blue-600 text-xs bg-blue-50 px-2 py-0.5 rounded-full">即日対応可</span>}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* スキル・職種 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
        <h2 className="font-medium text-gray-900 mb-4 text-sm text-indigo-600 uppercase tracking-wide">スキル・職種</h2>

        {editing && form ? (
          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-500 mb-2 block">職種（複数選択可）</label>
              <div className="flex flex-wrap gap-2">
                {OCCUPATION_OPTIONS.map(o => (
                  <button
                    key={o}
                    onClick={() => toggleOccupation(o)}
                    className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                      form.occupation.includes(o)
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
              <label className="text-xs text-gray-500 mb-1 block">使用ツール・スキル（カンマ区切り）</label>
              <input
                value={form.skills}
                onChange={e => setField('skills', e.target.value)}
                placeholder="Photoshop, Illustrator, Procreate"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">経験年数</label>
                <input
                  type="number" min="0"
                  value={form.experience_years}
                  onChange={e => setField('experience_years', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">スキルレベル</label>
                <select
                  value={form.skill_level}
                  onChange={e => setField('skill_level', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                >
                  <option value="">選択</option>
                  <option value="beginner">初級</option>
                  <option value="intermediate">中級</option>
                  <option value="advanced">上級</option>
                  <option value="expert">エキスパート</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">希望単価（最小）</label>
                <input
                  type="number"
                  value={form.hourly_rate_min}
                  onChange={e => setField('hourly_rate_min', e.target.value)}
                  placeholder="5000"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">希望単価（最大）</label>
                <input
                  type="number"
                  value={form.hourly_rate_max}
                  onChange={e => setField('hourly_rate_max', e.target.value)}
                  placeholder="10000"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </div>
            </div>
          </div>
        ) : (
          <>
            {creator.occupation && creator.occupation.length > 0 && (
              <div className="mb-3">
                <p className="text-xs text-gray-400 mb-1">職種</p>
                <div className="flex flex-wrap gap-1">
                  {creator.occupation.map(o => <span key={o} className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">{o}</span>)}
                </div>
              </div>
            )}
            {creator.skills && creator.skills.length > 0 && (
              <div className="mb-3">
                <p className="text-xs text-gray-400 mb-1">使用ツール・スキル</p>
                <div className="flex flex-wrap gap-1">
                  {creator.skills.map(s => <span key={s} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{s}</span>)}
                </div>
              </div>
            )}
            <div className="grid grid-cols-3 gap-4 text-sm text-gray-600 mt-2">
              {creator.experience_years != null && (
                <div><p className="text-xs text-gray-400">経験年数</p>{creator.experience_years}年</div>
              )}
              {creator.skill_level && (
                <div><p className="text-xs text-gray-400">スキルレベル</p>{SKILL_LEVEL_LABELS[creator.skill_level] ?? creator.skill_level}</div>
              )}
              {(creator.hourly_rate_min || creator.hourly_rate_max) && (
                <div>
                  <p className="text-xs text-gray-400">希望単価</p>
                  {creator.hourly_rate_min ? `¥${creator.hourly_rate_min.toLocaleString()}` : ''}
                  {creator.hourly_rate_min && creator.hourly_rate_max ? '〜' : ''}
                  {creator.hourly_rate_max ? `¥${creator.hourly_rate_max.toLocaleString()}` : ''}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* ポートフォリオ */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
        <h2 className="font-medium text-gray-900 mb-3 text-sm text-indigo-600 uppercase tracking-wide">ポートフォリオ</h2>
        {editing && form ? (
          <input
            type="url"
            value={form.portfolio_url}
            onChange={e => setField('portfolio_url', e.target.value)}
            placeholder="https://portfolio.example.com"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        ) : creator.portfolio_url ? (
          <a href={creator.portfolio_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800">
            <ExternalLink className="w-4 h-4" />{creator.portfolio_url}
          </a>
        ) : (
          <p className="text-sm text-gray-400">未登録</p>
        )}
      </div>

      {/* 自己紹介 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-medium text-gray-900 mb-3 text-sm text-indigo-600 uppercase tracking-wide">自己紹介</h2>
        {editing && form ? (
          <textarea
            rows={4}
            value={form.bio}
            onChange={e => setField('bio', e.target.value)}
            placeholder="クリエイターの自己紹介・得意なことなど"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        ) : creator.bio ? (
          <p className="text-sm text-gray-600 whitespace-pre-wrap">{creator.bio}</p>
        ) : (
          <p className="text-sm text-gray-400">未登録</p>
        )}
      </div>
    </div>
  )
}
