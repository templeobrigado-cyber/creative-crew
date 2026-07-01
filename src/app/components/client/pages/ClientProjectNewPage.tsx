import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { ArrowLeft, Plus, X } from 'lucide-react'
import { createProject, getProjectCategories, type ProjectCategory } from '../../../../lib/services/projects'

type Props = { user: { id: string; name: string } }

export function ClientProjectNewPage({ user }: Props) {
  const navigate = useNavigate()
  const [categories, setCategories] = useState<ProjectCategory[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [skillInput, setSkillInput] = useState('')

  const [form, setForm] = useState({
    title: '',
    description: '',
    category_id: '',
    budget_min: '',
    budget_max: '',
    deadline: '',
    headcount: '1',
    remote_ok: true,
    work_conditions: '',
    required_skills: [] as string[],
    preferred_skills: [] as string[],
  })

  useEffect(() => {
    getProjectCategories().then(setCategories)
  }, [])

  function addSkill(type: 'required' | 'preferred') {
    const val = skillInput.trim()
    if (!val) return
    const key = type === 'required' ? 'required_skills' : 'preferred_skills'
    if (!form[key].includes(val)) {
      setForm(f => ({ ...f, [key]: [...f[key], val] }))
    }
    setSkillInput('')
  }

  function removeSkill(type: 'required' | 'preferred', skill: string) {
    const key = type === 'required' ? 'required_skills' : 'preferred_skills'
    setForm(f => ({ ...f, [key]: f[key].filter(s => s !== skill) }))
  }

  async function handleSubmit(status: 'draft' | 'open') {
    if (!form.title.trim() || !form.description.trim()) return
    setSubmitting(true)
    const result = await createProject({
      client_id: user.id,
      admin_id: null,
      category_id: form.category_id || null,
      title: form.title.trim(),
      description: form.description.trim(),
      required_skills: form.required_skills.length ? form.required_skills : null,
      preferred_skills: form.preferred_skills.length ? form.preferred_skills : null,
      budget_min: form.budget_min ? Number(form.budget_min) : null,
      budget_max: form.budget_max ? Number(form.budget_max) : null,
      deadline: form.deadline || null,
      headcount: Number(form.headcount) || 1,
      remote_ok: form.remote_ok,
      work_conditions: form.work_conditions || null,
      attachment_url: null,
      status,
    })
    setSubmitting(false)
    if (result) {
      navigate('/client/projects')
    } else {
      setError('案件の登録に失敗しました。内容を確認して再度お試しください。')
    }
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-6 flex items-center gap-3">
        <button onClick={() => navigate('/client/projects')} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">新規案件を登録</h1>
          <p className="text-sm text-gray-500 mt-0.5">必要事項を入力してください</p>
        </div>
      </div>

      <div className="space-y-5">
        {/* 基本情報 */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-indigo-600 uppercase tracking-wide">基本情報</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">案件タイトル <span className="text-red-500">*</span></label>
            <input
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="例：ゲームキャラクターのイラスト制作"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">カテゴリ</label>
            <select
              value={form.category_id}
              onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            >
              <option value="">カテゴリを選択（任意）</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">案件詳細 <span className="text-red-500">*</span></label>
            <textarea
              rows={5}
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="依頼内容・背景・成果物の詳細を記述してください"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>
        </div>

        {/* 条件 */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-indigo-600 uppercase tracking-wide">条件・予算</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">予算（下限）</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">¥</span>
                <input
                  type="number"
                  value={form.budget_min}
                  onChange={e => setForm(f => ({ ...f, budget_min: e.target.value }))}
                  placeholder="50000"
                  className="w-full border border-gray-200 rounded-lg pl-7 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">予算（上限）</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">¥</span>
                <input
                  type="number"
                  value={form.budget_max}
                  onChange={e => setForm(f => ({ ...f, budget_max: e.target.value }))}
                  placeholder="100000"
                  className="w-full border border-gray-200 rounded-lg pl-7 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">納期</label>
              <input
                type="date"
                value={form.deadline}
                onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">募集人数</label>
              <input
                type="number"
                min="1"
                value={form.headcount}
                onChange={e => setForm(f => ({ ...f, headcount: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="remote_ok"
              checked={form.remote_ok}
              onChange={e => setForm(f => ({ ...f, remote_ok: e.target.checked }))}
              className="w-4 h-4 text-indigo-600 rounded"
            />
            <label htmlFor="remote_ok" className="text-sm text-gray-700">リモート作業OK</label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">作業条件・備考</label>
            <textarea
              rows={2}
              value={form.work_conditions}
              onChange={e => setForm(f => ({ ...f, work_conditions: e.target.value }))}
              placeholder="稼働時間の目安、コミュニケーション方法など"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>
        </div>

        {/* スキル */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-indigo-600 uppercase tracking-wide">必要スキル</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">必須スキル</label>
            <div className="flex gap-2 mb-2">
              <input
                value={skillInput}
                onChange={e => setSkillInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill('required'))}
                placeholder="Photoshop、Illustrator など"
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
              <button onClick={() => addSkill('required')} className="px-3 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {form.required_skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {form.required_skills.map(s => (
                  <span key={s} className="flex items-center gap-1 bg-indigo-100 text-indigo-700 text-xs px-2.5 py-1 rounded-full">
                    {s}
                    <button onClick={() => removeSkill('required', s)}><X className="w-3 h-3" /></button>
                  </span>
                ))}
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">歓迎スキル（任意）</label>
            <div className="flex gap-2 mb-2">
              <input
                value={skillInput}
                onChange={e => setSkillInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill('preferred'))}
                placeholder="After Effects、3DCG など"
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
              <button onClick={() => addSkill('preferred')} className="px-3 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {form.preferred_skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {form.preferred_skills.map(s => (
                  <span key={s} className="flex items-center gap-1 bg-gray-100 text-gray-600 text-xs px-2.5 py-1 rounded-full">
                    {s}
                    <button onClick={() => removeSkill('preferred', s)}><X className="w-3 h-3" /></button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          {error}
        </div>
      )}

      {/* アクション */}
      <div className="mt-6 flex items-center justify-end gap-3">
        <button
          onClick={() => navigate('/client/projects')}
          className="px-5 py-2.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          キャンセル
        </button>
        <button
          onClick={() => handleSubmit('draft')}
          disabled={submitting || !form.title.trim()}
          className="px-5 py-2.5 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          下書き保存
        </button>
        <button
          onClick={() => handleSubmit('open')}
          disabled={submitting || !form.title.trim() || !form.description.trim()}
          className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {submitting ? '登録中…' : '募集を開始する'}
        </button>
      </div>
    </div>
  )
}
