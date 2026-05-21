import { useRef, useState } from 'react'
import {
  Download, Upload, FileText, FolderOpen, Tags, AlertCircle, CheckCircle2
} from 'lucide-react'
import {
  exportTagsCSV, downloadTagTemplate, importTagsCSV,
  exportCategoriesCSV, downloadCategoryTemplate, importCategoriesCSV,
  exportArticlesCSV, downloadArticleTemplate, importArticlesCSV,
  type ImportResult,
} from '../../../../lib/services/csv-import'

type SectionKey = 'tags' | 'categories' | 'articles'

interface SectionState {
  importing: boolean
  result: ImportResult | null
}

const SECTIONS: {
  key: SectionKey
  label: string
  icon: React.ElementType
  columns: string[]
  onExport: () => void
  onTemplate: () => void
  onImport: (file: File) => Promise<ImportResult>
}[] = [
  {
    key: 'tags',
    label: 'タグ',
    icon: Tags,
    columns: ['name', 'slug', 'color', 'icon'],
    onExport: exportTagsCSV,
    onTemplate: downloadTagTemplate,
    onImport: importTagsCSV,
  },
  {
    key: 'categories',
    label: 'カテゴリ',
    icon: FolderOpen,
    columns: ['name', 'slug', 'parent_slug', 'icon', 'order'],
    onExport: exportCategoriesCSV,
    onTemplate: downloadCategoryTemplate,
    onImport: importCategoriesCSV,
  },
  {
    key: 'articles',
    label: '記事',
    icon: FileText,
    columns: ['title', 'slug', 'category_slug', 'status', 'lead', 'tags'],
    onExport: exportArticlesCSV,
    onTemplate: downloadArticleTemplate,
    onImport: importArticlesCSV,
  },
]

export function CsvPage() {
  const [states, setStates] = useState<Record<SectionKey, SectionState>>({
    tags:       { importing: false, result: null },
    categories: { importing: false, result: null },
    articles:   { importing: false, result: null },
  })

  const fileRefs = {
    tags:       useRef<HTMLInputElement>(null),
    categories: useRef<HTMLInputElement>(null),
    articles:   useRef<HTMLInputElement>(null),
  }

  const handleImport = async (key: SectionKey, file: File, onImport: (f: File) => Promise<ImportResult>) => {
    setStates(prev => ({ ...prev, [key]: { importing: true, result: null } }))
    const result = await onImport(file)
    setStates(prev => ({ ...prev, [key]: { importing: false, result } }))
    // Reset file input
    const ref = fileRefs[key]
    if (ref.current) ref.current.value = ''
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-medium text-gray-900">CSVアップロード</h1>
        <p className="text-sm text-gray-600 mt-1">タグ・カテゴリ・記事データをCSVで一括インポート／エクスポートできます</p>
      </div>

      <div className="space-y-6">
        {SECTIONS.map(({ key, label, icon: Icon, columns, onExport, onTemplate, onImport }) => {
          const { importing, result } = states[key]
          return (
            <div key={key} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-3">
                <Icon className="w-5 h-5 text-amber-600" />
                <h2 className="text-base font-medium text-gray-900">{label}</h2>
              </div>

              <div className="px-6 py-5 space-y-4">
                {/* Column info */}
                <div>
                  <p className="text-xs text-gray-500 mb-1">カラム</p>
                  <div className="flex flex-wrap gap-1">
                    {columns.map(col => (
                      <span key={col} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-mono">{col}</span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-3">
                  {/* Export */}
                  <button
                    onClick={onExport}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Download className="w-4 h-4 text-gray-500" />
                    エクスポート
                  </button>

                  {/* Template */}
                  <button
                    onClick={onTemplate}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Download className="w-4 h-4 text-gray-500" />
                    テンプレートDL
                  </button>

                  {/* Import */}
                  <button
                    onClick={() => fileRefs[key].current?.click()}
                    disabled={importing}
                    className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-gray-900 rounded-lg text-sm hover:bg-amber-700 transition-colors disabled:opacity-50"
                  >
                    <Upload className="w-4 h-4" />
                    {importing ? 'インポート中…' : 'CSVをインポート'}
                  </button>

                  <input
                    ref={fileRefs[key]}
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={e => {
                      const file = e.target.files?.[0]
                      if (file) handleImport(key, file, onImport)
                    }}
                  />
                </div>

                {/* Result */}
                {result && (
                  <div className="rounded-lg overflow-hidden border border-gray-200">
                    {result.success > 0 && (
                      <div className="flex items-center gap-2 px-4 py-3 bg-green-50 text-green-700 text-sm">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        {result.success} 件インポート完了
                      </div>
                    )}
                    {result.errors.length > 0 && (
                      <div className="px-4 py-3 bg-red-50">
                        <div className="flex items-center gap-2 text-red-700 text-sm mb-2">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          {result.errors.length} 件エラー
                        </div>
                        <ul className="space-y-1">
                          {result.errors.map((err, i) => (
                            <li key={i} className="text-xs text-red-600">{err}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {result.success === 0 && result.errors.length === 0 && (
                      <div className="px-4 py-3 text-sm text-gray-500">インポートするデータがありませんでした</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Notes */}
      <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-gray-700 space-y-1">
        <p className="font-medium text-gray-900">注意事項</p>
        <p>• 既存データはslugをキーとして上書き（upsert）されます</p>
        <p>• 記事のタグは <code className="bg-white px-1 rounded text-xs">|</code> 区切りでタグ名を指定してください（例: <code className="bg-white px-1 rounded text-xs">タグ1|タグ2</code>）</p>
        <p>• CSVはUTF-8（BOM付き）で保存するとExcelで文字化けしません</p>
        <p>• インポート前にテンプレートをダウンロードしてフォーマットを確認してください</p>
      </div>
    </div>
  )
}
