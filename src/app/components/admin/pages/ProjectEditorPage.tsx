import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { ArrowLeft, Save, Trash2, UserPlus, X, Search, Bell, BellOff } from 'lucide-react'
import {
  getProjectById, createProject, updateProject, deleteProject,
  getProjectCategories, STATUS_LABELS,
  getProjectTargets, addProjectTarget, removeProjectTarget, notifyCreator,
} from '../../../../lib/services/projects'
import { getCreators } from '../../../../lib/services/users'
import { getUsers } from '../../../../lib/services/users'
import type { Project, ProjectStatus, ProjectCategory, ProjectTarget } from '../../../../lib/services/projects'
import type { User } from '../../../../lib/services/users'
import type { CreatorProfile } from '../../../../lib/services/users'

const ALL_STATUSES: ProjectStatus[] = ['draft','open','screening','contracted','completed','closed']

const OCCUPATION_OPTIONS = [
  'イラストレーター','グラフィックデザイナー','WEBデザイナー','UI/UXデザイナー',
  '動画クリエイター','映像編集者','3DCGクリエイター','アニメーター',
  'ライター','カメラマン','アーティスト','音楽制作者','VTuber関連クリエイター',
]

type FormData = {
  title: string
  client_id: string
  category_id: string
  description: string
  required_skills: string
  preferred_skills: string
  budget_min: string
  budget_max: string
  deadline: string
  headcount: string
  remote_ok: boolean
  work_conditions: string
  status: ProjectStatus
}

const EMPTY: FormData = {
  title: '', client_id: '', category_id: '', description: '',
  required_skills: '', preferred_skills: '',
  budget_min: '', budget_max: '', deadline: '', headcount: '1',
  remote_ok: true, work_conditions: '', status: 'draft',
}

export function ProjectEditorPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isNew = !id

  const [form, setForm] = useState<FormData>(EMPTY)
  const [categories, setCategories] = useState<ProjectCategory[]>([])
  const [clients, setClients] = useState<User[]>([])
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)

  // 指名クリエイター
  const [targets, setTargets] = useState<ProjectTarget[]>([])
  const [allCreators, setAllCreators] = useState<CreatorProfile[]>([])
  const [creatorSearch, setCreatorSearch] = useState('')
  const [showCreatorDropdown, setShowCreatorDropdown] = useState(false)
  const [addingCreator, setAddingCreator] = useState<string | null>(null)
  const [notifying, setNotifying] = useState<string | null>(null)
  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    Promise.all([
      getProjectCategories(),
      getUsers('client'),
      getCreators(),
    ]).then(([cats, cls, creators]) => {
      setCategories(cats)
      setClients(cls)
      setAllCreators(creators)
    })

    if (!isNew && id) {
      Promise.all([
        getProjectById(id),
        getProjectTargets(id),
      ]).then(([p, tgts]) => {
        if (p) {
          setForm({
            title: p.title,
            client_id: p.client_id,
            category_id: p.category_id ?? '',
            description: p.description,
            required_skills: (p.required_skills ?? []).join(', '),
            preferred_skills: (p.preferred_skills ?? []).join(', '),
            budget_min: p.budget_min?.toString() ?? '',
            budget_max: p.budget_max?.toString() ?? '',
            deadline: p.deadline ?? '',
            headcount: p.headcount.toString(),
            remote_ok: p.remote_ok,
            work_conditions: p.work_conditions ?? '',
            status: p.status,
          })
        }
        setTargets(tgts)
        setLoading(false)
      })
    }
  }, [id, isNew])

  async function handleAddCreator(creatorId: string) {
    if (!id) return
    setAddingCreator(creatorId)
    const ok = await addProjectTarget(id, creatorId)
    if (ok) {
      const updated = await getProjectTargets(id)
      setTargets(updated)
    }
    setAddingCreator(null)
    setCreatorSearch('')
    setShowCreatorDropdown(false)
  }

  async function handleRemoveCreator(creatorId: string) {
    if (!id) return
    const ok = await removeProjectTarget(id, creatorId)
    if (ok) setTargets(prev => prev.filter(t => t.creator_id !== creatorId))
  }

  async function handleNotify(t: typeof targets[0]) {
    if (!t.creator?.email || !t.creator?.name) return alert('クリエイターのメール情報が取得できません')
    setNotifying(t.id)
    const project = await getProjectById(id!)
    const ok = await notifyCreator(t.id, {
      to_email: t.creator.email,
      creator_name: t.creator.name,
      project_title: form.title,
      project_description: form.description,
      budget_min: project?.budget_min,
      budget_max: project?.budget_max,
      deadline: project?.deadline,
      required_skills: project?.required_skills,
    })
    setNotifying(null)
    if (ok) {
      setTargets(prev => prev.map(x => x.id === t.id ? { ...x, notify_status: 'sent' } : x))
      alert(`${t.creator.name} さんに通知メールを送信しました`)
    } else {
      alert('通知の送信に失敗しました。Edge Function のデプロイと RESEND_API_KEY をご確認ください。')
    }
  }

  const assignedIds = new Set(targets.map(t => t.creator_id))
  const filteredCreators = allCreators.filter(c => {
    if (assignedIds.has(c.user_id)) return false
    const name = c.user?.name ?? ''
    const nick = c.nickname ?? ''
    return name.includes(creatorSearch) || nick.includes(creatorSearch) || creatorSearch === ''
  })

  function set(key: keyof FormData, value: string | boolean) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  async function handleSave() {
    if (!form.title || !form.client_id) return alert('案件名と発注者は必須です')
    setSaving(true)
    const payload = {
      title: form.title,
      client_id: form.client_id,
      category_id: form.category_id || null,
      description: form.description,
      required_skills: form.required_skills ? form.required_skills.split(',').map(s => s.trim()).filter(Boolean) : null,
      preferred_skills: form.preferred_skills ? form.preferred_skills.split(',').map(s => s.trim()).filter(Boolean) : null,
      budget_min: form.budget_min ? Number(form.budget_min) : null,
      budget_max: form.budget_max ? Number(form.budget_max) : null,
      deadline: form.deadline || null,
      headcount: Number(form.headcount) || 1,
      remote_ok: form.remote_ok,
      work_conditions: form.work_conditions || null,
      attachment_url: null,
      status: form.status,
    }
    if (isNew) {
      const p = await createProject(payload)
      if (p) navigate(`/admin/projects/${p.id}/edit`)
    } else {
      await updateProject(id!, payload)
      navigate('/admin/projects')
    }
    setSaving(false)
  }

  async function handleDelete() {
    if (!confirm('この案件を削除しますか？')) return
    await deleteProject(id!)
    navigate('/admin/projects')
  }

  if (loading) return <div className="p-8 text-gray-500 text-sm">読み込み中…</div>

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-6 flex items-center gap-4">
        <button onClick={() => navigate('/admin/projects')} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </button>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{isNew ? '新規案件' : '案件編集'}</h1>
          <p className="text-sm text-gray-500 mt-0.5">案件の基本情報を入力してください</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* 基本情報 */}
        <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="font-medium text-gray-900 text-sm uppercase tracking-wide text-indigo-600">基本情報</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">案件名 <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={form.title}
              onChange={e => set('title', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              placeholder="例：キャラクターデザイン制作"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">発注者 <span className="text-red-500">*</span></label>
              <select
                value={form.client_id}
                onChange={e => set('client_id', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              >
                <option value="">選択してください</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">カテゴリ</label>
              <select
                value={form.category_id}
                onChange={e => set('category_id', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              >
                <option value="">選択してください</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">業務内容</label>
            <textarea
              rows={4}
              value={form.description}
              onChange={e => set('description', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              placeholder="業務の詳細、成果物、注意事項など"
            />
          </div>
        </section>

        {/* スキル・条件 */}
        <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="font-medium text-gray-900 text-sm uppercase tracking-wide text-indigo-600">スキル・条件</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">必須スキル（カンマ区切り）</label>
            <input
              type="text"
              value={form.required_skills}
              onChange={e => set('required_skills', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              placeholder="Photoshop, Illustrator, After Effects"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">歓迎スキル（カンマ区切り）</label>
            <input
              type="text"
              value={form.preferred_skills}
              onChange={e => set('preferred_skills', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              placeholder="Procreate, Figma"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">予算（最小）</label>
              <input
                type="number"
                value={form.budget_min}
                onChange={e => set('budget_min', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                placeholder="50000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">予算（最大）</label>
              <input
                type="number"
                value={form.budget_max}
                onChange={e => set('budget_max', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                placeholder="150000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">募集人数</label>
              <input
                type="number"
                value={form.headcount}
                onChange={e => set('headcount', e.target.value)}
                min="1"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">納期</label>
              <input
                type="date"
                value={form.deadline}
                onChange={e => set('deadline', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.remote_ok}
                  onChange={e => set('remote_ok', e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-indigo-600"
                />
                <span className="text-sm font-medium text-gray-700">リモート可</span>
              </label>
            </div>
          </div>
        </section>

        {/* 管理情報 */}
        <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="font-medium text-gray-900 text-sm uppercase tracking-wide text-indigo-600">管理情報</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ステータス</label>
            <select
              value={form.status}
              onChange={e => set('status', e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            >
              {ALL_STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
            </select>
          </div>
        </section>

        {/* 指名クリエイター（既存案件のみ） */}
        {!isNew && (
          <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-medium text-gray-900 text-sm uppercase tracking-wide text-indigo-600">指名クリエイター</h2>
              <span className="text-xs text-gray-400">{targets.length}名指名中</span>
            </div>

            {/* 追加済みリスト */}
            {targets.length > 0 && (
              <ul className="space-y-2">
                {targets.map(t => (
                  <li key={t.id} className="flex items-center gap-3 p-3 rounded-lg bg-indigo-50 border border-indigo-100">
                    <div className="w-8 h-8 rounded-full bg-indigo-200 flex items-center justify-center text-indigo-700 text-xs font-bold shrink-0">
                      {(t.creator?.name ?? '?')[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{t.creator?.name ?? '—'}</p>
                      <p className="text-xs text-gray-500 truncate">
                        {(t.creator?.creator_profiles?.[0]?.occupation ?? []).slice(0, 2).join(' / ') || t.creator?.email}
                      </p>
                    </div>
                    <button
                      onClick={() => t.notify_status !== 'sent' && handleNotify(t)}
                      disabled={notifying === t.id || t.notify_status === 'sent'}
                      title={t.notify_status === 'sent' ? '通知済み' : 'メール通知を送る'}
                      className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border transition-colors shrink-0 ${
                        t.notify_status === 'sent'
                          ? 'bg-green-100 text-green-700 border-green-200 cursor-default'
                          : t.notify_status === 'failed'
                          ? 'bg-red-100 text-red-600 border-red-200 hover:bg-red-200'
                          : 'bg-white text-indigo-600 border-indigo-200 hover:bg-indigo-50'
                      } disabled:opacity-50`}
                    >
                      {t.notify_status === 'sent'
                        ? <><BellOff className="w-3 h-3" /> 通知済</>
                        : notifying === t.id
                        ? '送信中…'
                        : <><Bell className="w-3 h-3" /> 通知する</>}
                    </button>
                    <button
                      onClick={() => handleRemoveCreator(t.creator_id)}
                      className="p-1 rounded hover:bg-indigo-200 text-indigo-400 hover:text-indigo-700 transition-colors shrink-0"
                      title="指名を解除"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {/* クリエイター検索・追加 */}
            <div className="relative" ref={searchRef}>
              <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-indigo-300">
                <Search className="w-4 h-4 text-gray-400 shrink-0" />
                <input
                  type="text"
                  placeholder="クリエイター名で検索して追加…"
                  value={creatorSearch}
                  onChange={e => { setCreatorSearch(e.target.value); setShowCreatorDropdown(true) }}
                  onFocus={() => setShowCreatorDropdown(true)}
                  onBlur={() => setTimeout(() => setShowCreatorDropdown(false), 150)}
                  className="flex-1 text-sm focus:outline-none"
                />
                <UserPlus className="w-4 h-4 text-gray-400 shrink-0" />
              </div>

              {showCreatorDropdown && filteredCreators.length > 0 && (
                <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-52 overflow-y-auto">
                  {filteredCreators.slice(0, 10).map(c => (
                    <li key={c.user_id}>
                      <button
                        onMouseDown={() => handleAddCreator(c.user_id)}
                        disabled={addingCreator === c.user_id}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-indigo-50 text-left transition-colors disabled:opacity-50"
                      >
                        <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-bold shrink-0">
                          {(c.user?.name ?? '?')[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900 truncate">{c.user?.name ?? '—'}</p>
                          <p className="text-xs text-gray-400 truncate">
                            {(c.occupation ?? []).slice(0, 2).join(' / ') || c.user?.email}
                          </p>
                        </div>
                        {addingCreator === c.user_id && (
                          <span className="text-xs text-indigo-500 shrink-0">追加中…</span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {showCreatorDropdown && creatorSearch !== '' && filteredCreators.length === 0 && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg px-4 py-3 text-sm text-gray-400">
                  該当するクリエイターが見つかりません
                </div>
              )}
            </div>
          </section>
        )}
      </div>

      {/* アクション */}
      <div className="mt-6 flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? '保存中…' : '保存'}
        </button>
        <button
          onClick={() => navigate('/admin/projects')}
          className="px-6 py-2.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
        >
          キャンセル
        </button>
        {!isNew && (
          <button
            onClick={handleDelete}
            className="ml-auto flex items-center gap-2 px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm"
          >
            <Trash2 className="w-4 h-4" />
            削除
          </button>
        )}
      </div>
    </div>
  )
}
