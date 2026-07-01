import { useEffect, useState } from 'react'
import { Search, X, Send, CheckCircle } from 'lucide-react'
import { getProjects, createApplication, getApplicationsByCreatorId, STATUS_LABELS, STATUS_COLORS } from '../../../../lib/services/projects'
import type { Project } from '../../../../lib/services/projects'

type Props = { user: { id: string; name: string } }

type ApplyModal = {
  project: Project
}

export function CreatorProjectsPage({ user }: Props) {
  const [projects, setProjects] = useState<Project[]>([])
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [remoteOnly, setRemoteOnly] = useState(false)
  const [modal, setModal] = useState<ApplyModal | null>(null)

  // 応募フォーム state
  const [message, setMessage] = useState('')
  const [proposedRate, setProposedRate] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitDone, setSubmitDone] = useState(false)

  useEffect(() => {
    Promise.all([
      getProjects('open'),
      getApplicationsByCreatorId(user.id),
    ]).then(([ps, apps]) => {
      setProjects(ps)
      setAppliedIds(new Set(apps.map(a => a.project_id)))
    }).finally(() => setLoading(false))
  }, [user.id])

  const filtered = projects.filter(p => {
    const matchSearch = p.title.includes(search) || p.description.includes(search)
    const matchRemote = !remoteOnly || p.remote_ok
    return matchSearch && matchRemote
  })

  function openModal(project: Project) {
    setModal({ project })
    setMessage('')
    setProposedRate('')
    setSubmitDone(false)
  }

  function closeModal() {
    setModal(null)
    setSubmitDone(false)
  }

  async function handleApply() {
    if (!modal) return
    if (!message.trim()) return alert('応募メッセージを入力してください')
    setSubmitting(true)
    const ok = await createApplication({
      project_id: modal.project.id,
      creator_id: user.id,
      message: message.trim(),
      proposed_rate: proposedRate ? Number(proposedRate) : null,
    })
    setSubmitting(false)
    if (ok) {
      setAppliedIds(prev => new Set([...prev, modal.project.id]))
      setSubmitDone(true)
    } else {
      alert('応募に失敗しました。すでに応募済みの可能性があります。')
    }
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">案件を探す</h1>
        <p className="text-sm text-gray-500 mt-1">あなたのスキルにマッチする案件に応募しましょう</p>
      </div>

      {/* フィルター */}
      <div className="flex gap-3 mb-6 flex-wrap items-center">
        <div className="relative flex-1 min-w-56">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="案件名・キーワードで検索"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
          <input
            type="checkbox"
            checked={remoteOnly}
            onChange={e => setRemoteOnly(e.target.checked)}
            className="rounded text-indigo-600"
          />
          リモートのみ
        </label>
        <span className="text-xs text-gray-400">{filtered.length}件</span>
      </div>

      {/* 案件カード */}
      {loading ? (
        <p className="text-sm text-gray-400 py-10 text-center">読み込み中…</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-gray-400 py-10 text-center">該当する案件はありません</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map(p => {
            const applied = appliedIds.has(p.id)
            return (
              <div key={p.id} className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col gap-3 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="text-base font-semibold text-gray-900 leading-snug">{p.title}</h2>
                  {p.remote_ok && (
                    <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full shrink-0">リモート可</span>
                  )}
                </div>

                <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">{p.description}</p>

                {p.required_skills && p.required_skills.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {p.required_skills.slice(0, 4).map(s => (
                      <span key={s} className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">{s}</span>
                    ))}
                    {p.required_skills.length > 4 && (
                      <span className="text-xs text-gray-400">+{p.required_skills.length - 4}</span>
                    )}
                  </div>
                )}

                <div className="flex gap-4 text-xs text-gray-400 mt-auto">
                  {(p.budget_min || p.budget_max) && (
                    <span>
                      {p.budget_min ? `¥${p.budget_min.toLocaleString()}` : ''}
                      {p.budget_min && p.budget_max ? '〜' : ''}
                      {p.budget_max ? `¥${p.budget_max.toLocaleString()}` : ''}
                    </span>
                  )}
                  {p.deadline && <span>納期 {new Date(p.deadline).toLocaleDateString('ja-JP')}</span>}
                  <span>応募 {p.application_count}名</span>
                </div>

                <button
                  onClick={() => !applied && openModal(p)}
                  disabled={applied}
                  className={`w-full py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    applied
                      ? 'bg-gray-100 text-gray-400 cursor-default'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                >
                  {applied ? '応募済み' : 'この案件に応募する'}
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* 応募モーダル */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            {submitDone ? (
              <div className="p-10 text-center">
                <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-7 h-7 text-green-600" />
                </div>
                <h2 className="text-lg font-bold text-gray-900 mb-1">応募が完了しました！</h2>
                <p className="text-sm text-gray-500 mb-6">審査結果はマイページの「応募・紹介案件」でご確認いただけます。</p>
                <button
                  onClick={closeModal}
                  className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  閉じる
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between p-6 border-b border-gray-100">
                  <div>
                    <h2 className="font-bold text-gray-900">応募する</h2>
                    <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{modal.project.title}</p>
                  </div>
                  <button onClick={closeModal} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-6 space-y-4">
                  {/* 案件サマリ */}
                  <div className="bg-indigo-50 rounded-lg p-3 text-xs text-indigo-700 flex gap-4">
                    {(modal.project.budget_min || modal.project.budget_max) && (
                      <span>予算 {modal.project.budget_min ? `¥${modal.project.budget_min.toLocaleString()}` : ''}〜{modal.project.budget_max ? `¥${modal.project.budget_max.toLocaleString()}` : ''}</span>
                    )}
                    {modal.project.deadline && <span>納期 {new Date(modal.project.deadline).toLocaleDateString('ja-JP')}</span>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      応募メッセージ <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={4}
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      placeholder="このような実績があります。○○の部分が特に得意で…"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      希望報酬額（円）<span className="text-gray-400 font-normal text-xs ml-1">任意</span>
                    </label>
                    <input
                      type="number"
                      value={proposedRate}
                      onChange={e => setProposedRate(e.target.value)}
                      placeholder="150000"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    />
                  </div>
                </div>

                <div className="flex gap-3 px-6 pb-6">
                  <button
                    onClick={closeModal}
                    className="flex-1 py-2.5 border border-gray-200 text-gray-700 text-sm rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    キャンセル
                  </button>
                  <button
                    onClick={handleApply}
                    disabled={submitting}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    {submitting ? '送信中…' : '応募する'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
