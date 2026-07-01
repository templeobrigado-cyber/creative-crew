import { useEffect, useState } from 'react'
import { Plus, Trash2, ExternalLink, Edit2, Check, X } from 'lucide-react'
import { getCreatorByUserId } from '../../../../lib/services/users'
import {
  getPortfolioWorks, createPortfolioWork, updatePortfolioWork, deletePortfolioWork,
  type PortfolioWork,
} from '../../../../lib/services/projects'

type Props = { user: { id: string; name: string } }

const EMPTY_FORM = { title: '', description: '', image_url: '', work_url: '' }

export function CreatorPortfolioPage({ user }: Props) {
  const [creatorProfileId, setCreatorProfileId] = useState<string | null>(null)
  const [works, setWorks] = useState<PortfolioWork[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [editForm, setEditForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getCreatorByUserId(user.id).then(async profile => {
      if (profile) {
        setCreatorProfileId(profile.id)
        const list = await getPortfolioWorks(profile.id)
        setWorks(list)
      }
    }).finally(() => setLoading(false))
  }, [user.id])

  async function handleAdd() {
    if (!creatorProfileId || !form.title.trim()) return
    setSaving(true)
    const next = await createPortfolioWork({
      creator_id: creatorProfileId,
      title: form.title,
      description: form.description || null,
      image_url: form.image_url || null,
      work_url: form.work_url || null,
      order: works.length,
    })
    if (next) setWorks(prev => [...prev, next])
    setForm(EMPTY_FORM)
    setAdding(false)
    setSaving(false)
  }

  function startEdit(w: PortfolioWork) {
    setEditingId(w.id)
    setEditForm({ title: w.title, description: w.description ?? '', image_url: w.image_url ?? '', work_url: w.work_url ?? '' })
  }

  async function handleSaveEdit(id: string) {
    setSaving(true)
    await updatePortfolioWork(id, {
      title: editForm.title,
      description: editForm.description || null,
      image_url: editForm.image_url || null,
      work_url: editForm.work_url || null,
    })
    setWorks(prev => prev.map(w => w.id === id ? { ...w, ...editForm, description: editForm.description || null, image_url: editForm.image_url || null, work_url: editForm.work_url || null } : w))
    setEditingId(null)
    setSaving(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('このポートフォリオ作品を削除しますか？')) return
    await deletePortfolioWork(id)
    setWorks(prev => prev.filter(w => w.id !== id))
  }

  if (loading) return <div className="p-8 text-sm text-gray-400">読み込み中…</div>
  if (!creatorProfileId) return (
    <div className="p-8 text-sm text-amber-700 bg-amber-50 rounded-xl m-8">
      プロフィールを先に作成してください。
    </div>
  )

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ポートフォリオ</h1>
          <p className="text-sm text-gray-500 mt-1">あなたの実績・作品を登録しましょう</p>
        </div>
        <button
          onClick={() => { setAdding(true); setEditingId(null) }}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4" /> 追加
        </button>
      </div>

      {adding && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-5 mb-5 space-y-3">
          <h3 className="text-sm font-semibold text-indigo-700">新しい作品を追加</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">タイトル *</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="キャラクターデザイン制作" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">作品URL</label>
              <input value={form.work_url} onChange={e => setForm(f => ({ ...f, work_url: e.target.value }))}
                placeholder="https://..." className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">画像URL</label>
            <input value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))}
              placeholder="https://..." className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">説明</label>
            <textarea rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="作品の概要・担当した役割など" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setAdding(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors">キャンセル</button>
            <button onClick={handleAdd} disabled={!form.title.trim() || saving}
              className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors">
              {saving ? '追加中…' : '追加'}
            </button>
          </div>
        </div>
      )}

      {works.length === 0 && !adding ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-sm">まだ作品が登録されていません</p>
          <p className="text-xs mt-1">「追加」ボタンで最初の作品を登録しましょう</p>
        </div>
      ) : (
        <div className="space-y-4">
          {works.map(w => (
            <div key={w.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              {editingId === w.id ? (
                <div className="p-5 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">タイトル *</label>
                      <input value={editForm.title} onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">作品URL</label>
                      <input value={editForm.work_url} onChange={e => setEditForm(f => ({ ...f, work_url: e.target.value }))}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">画像URL</label>
                    <input value={editForm.image_url} onChange={e => setEditForm(f => ({ ...f, image_url: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">説明</label>
                    <textarea rows={2} value={editForm.description} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => setEditingId(null)} className="p-1.5 text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
                    <button onClick={() => handleSaveEdit(w.id)} disabled={saving}
                      className="p-1.5 text-indigo-600 hover:text-indigo-800"><Check className="w-4 h-4" /></button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-4 p-4">
                  {w.image_url && (
                    <img src={w.image_url} alt={w.title} className="w-24 h-16 object-cover rounded-lg shrink-0 bg-gray-100" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-gray-900 text-sm truncate">{w.title}</h3>
                      <div className="flex items-center gap-1 shrink-0">
                        {w.work_url && (
                          <a href={w.work_url} target="_blank" rel="noreferrer" className="p-1.5 text-gray-400 hover:text-indigo-600 transition-colors">
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                        <button onClick={() => startEdit(w)} className="p-1.5 text-gray-400 hover:text-indigo-600 transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(w.id)} className="p-1.5 text-gray-400 hover:text-red-600 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    {w.description && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{w.description}</p>}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
