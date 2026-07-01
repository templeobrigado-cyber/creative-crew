import { useEffect, useState } from 'react'
import { Link, Navigate, Route, Routes, useNavigate, useLocation } from 'react-router'
import { LayoutDashboard, User, FileText, Briefcase, Image, LogOut } from 'lucide-react'
import { CreatorDashboardPage } from './pages/CreatorDashboardPage'
import { CreatorProfilePage } from './pages/CreatorProfilePage'
import { CreatorApplicationsPage } from './pages/CreatorApplicationsPage'
import { CreatorProjectsPage } from './pages/CreatorProjectsPage'
import { CreatorPortfolioPage } from './pages/CreatorPortfolioPage'

type CurrentUser = { id: string; role: string; name: string; email: string }

const NAV = [
  { to: '/creator/dashboard',    label: 'ダッシュボード', icon: LayoutDashboard },
  { to: '/creator/projects',     label: '案件を探す',     icon: Briefcase },
  { to: '/creator/applications', label: '応募・紹介案件',  icon: FileText },
  { to: '/creator/portfolio',    label: 'ポートフォリオ', icon: Image },
  { to: '/creator/profile',      label: 'プロフィール',   icon: User },
]

export function CreatorLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const [user, setUser] = useState<CurrentUser | null>(null)

  useEffect(() => {
    const raw = sessionStorage.getItem('current_user')
    if (!raw) { navigate('/login'); return }
    const u = JSON.parse(raw) as CurrentUser
    if (u.role !== 'creator') { navigate('/login'); return }
    setUser(u)
  }, [])

  function logout() {
    sessionStorage.removeItem('current_user')
    navigate('/login')
  }

  if (!user) return null

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* サイドバー */}
      <aside className="w-56 bg-white border-r border-gray-200 flex flex-col shrink-0">
        <div className="px-5 py-5 border-b border-gray-100">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
              <span className="text-white font-bold text-xs">CC</span>
            </div>
            <span className="font-semibold text-gray-900 text-sm">CreativeCrew</span>
          </Link>
        </div>

        <div className="px-3 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2.5 px-2 py-2">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm shrink-0">
              {user.name[0]}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
              <p className="text-xs text-gray-400">クリエイター</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-3 space-y-0.5">
          {NAV.map(item => {
            const active = location.pathname === item.to
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  active
                    ? 'bg-indigo-50 text-indigo-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="px-3 py-3 border-t border-gray-100">
          <button
            onClick={logout}
            className="flex items-center gap-2.5 px-3 py-2.5 w-full text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            ログアウト
          </button>
        </div>
      </aside>

      {/* メイン */}
      <div className="flex-1 overflow-auto">
        <Routes>
          <Route path="dashboard"    element={<CreatorDashboardPage user={user} />} />
          <Route path="projects"     element={<CreatorProjectsPage user={user} />} />
          <Route path="applications" element={<CreatorApplicationsPage user={user} />} />
          <Route path="portfolio"    element={<CreatorPortfolioPage user={user} />} />
          <Route path="profile"      element={<CreatorProfilePage user={user} />} />
          <Route index element={<Navigate to="dashboard" replace />} />
        </Routes>
      </div>
    </div>
  )
}
