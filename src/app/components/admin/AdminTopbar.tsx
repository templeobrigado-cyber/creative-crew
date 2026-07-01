import { User } from 'lucide-react'

export function AdminTopbar() {
  return (
    <header className="h-14 bg-indigo-600 text-white flex items-center justify-between px-6 shadow-md sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <h2 className="text-base font-medium">管理画面</h2>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 px-3 py-2">
          <div className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center">
            <User className="w-4 h-4" />
          </div>
          <p className="text-sm font-medium">管理者</p>
        </div>
      </div>
    </header>
  )
}
