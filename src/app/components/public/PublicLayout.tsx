import { useState } from 'react'
import { Link } from 'react-router'
import { Menu, X } from 'lucide-react'

export function PublicLayout({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2" onClick={() => setMenuOpen(false)}>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <span className="text-white font-bold text-xs sm:text-sm">CC</span>
            </div>
            <span className="font-semibold text-gray-900 text-base sm:text-lg">CreativeCrew</span>
          </Link>

          {/* PC ナビ */}
          <nav className="hidden sm:flex items-center gap-2">
            <Link to="/login" className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors">
              ログイン
            </Link>
            <Link to="/register/creator" className="px-4 py-2 text-sm text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors">
              クリエイター登録
            </Link>
            <Link to="/register/client" className="px-4 py-2 text-sm text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors">
              発注者登録
            </Link>
          </nav>

          {/* スマホ: ハンバーガー */}
          <button
            onClick={() => setMenuOpen(v => !v)}
            className="sm:hidden p-2 text-gray-600 hover:text-gray-900 transition-colors"
            aria-label="メニュー"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* スマホ ドロップダウンメニュー */}
        {menuOpen && (
          <div className="sm:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1">
            <Link
              to="/login"
              onClick={() => setMenuOpen(false)}
              className="block w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              ログイン
            </Link>
            <Link
              to="/register/creator"
              onClick={() => setMenuOpen(false)}
              className="block w-full px-4 py-3 text-sm text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors text-center"
            >
              クリエイターとして登録
            </Link>
            <Link
              to="/register/client"
              onClick={() => setMenuOpen(false)}
              className="block w-full px-4 py-3 text-sm text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors text-center"
            >
              発注者として登録
            </Link>
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-gray-100 bg-gray-50 py-6 sm:py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center gap-4 sm:justify-between text-sm text-gray-400">
          <span>© 2026 CreativeCrew</span>
          <div className="flex gap-4 sm:gap-6">
            <Link to="/" className="hover:text-gray-600 transition-colors">プライバシーポリシー</Link>
            <Link to="/" className="hover:text-gray-600 transition-colors">利用規約</Link>
            <Link to="/" className="hover:text-gray-600 transition-colors">お問い合わせ</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
