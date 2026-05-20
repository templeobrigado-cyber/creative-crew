import { ShieldOff } from 'lucide-react'

export function AccessDenied() {
  return (
    <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <ShieldOff className="w-8 h-8 text-gray-400" />
      </div>
      <h2 className="text-lg font-medium text-gray-900 mb-2">アクセス権限がありません</h2>
      <p className="text-sm text-gray-500">このページを表示するには管理者権限が必要です。</p>
    </div>
  )
}
