import { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router'
import {
  LayoutDashboard, Briefcase, Users, UserCheck,
  Building2, ClipboardList, Settings, LogOut, Tag
} from 'lucide-react'
import { getUsers } from '../../../lib/services/users'

type MenuItem = {
  path: string
  icon: React.ElementType
  label: string
  badgeKey?: 'creator' | 'client'
}

const menuItems: MenuItem[] = [
  { path: '/admin/dashboard',    icon: LayoutDashboard, label: 'ダッシュボード' },
  { path: '/admin/projects',     icon: Briefcase,       label: '案件管理' },
  { path: '/admin/applications', icon: ClipboardList,   label: '応募管理' },
  { path: '/admin/creators',     icon: UserCheck,       label: 'クリエイター', badgeKey: 'creator' },
  { path: '/admin/clients',      icon: Building2,       label: '発注者',       badgeKey: 'client' },
  { path: '/admin/categories',   icon: Tag,             label: 'カテゴリ管理' },
  { path: '/admin/users',        icon: Users,           label: 'ユーザー管理' },
  { path: '/admin/settings',     icon: Settings,        label: '設定' },
]

export function AdminSidebar() {
  const navigate = useNavigate()
  const [pendingCounts, setPendingCounts] = useState<Record<string, number>>({ creator: 0, client: 0 })

  useEffect(() => {
    Promise.all([
      getUsers('creator'),
      getUsers('client'),
    ]).then(([creators, clients]) => {
      setPendingCounts({
        creator: creators.filter(u => !u.is_active).length,
        client:  clients.filter(u => !u.is_active).length,
      })
    })
  }, [])

  function handleLogout() {
    sessionStorage.removeItem('admin_logged_in')
    navigate('/admin/login')
  }

  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col h-screen sticky top-0">
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-xl font-bold text-white">CreativeCrew</h1>
        <p className="text-xs text-gray-400 mt-1">管理画面</p>
      </div>

      <nav className="flex-1 py-4 overflow-y-auto">
        {menuItems.map(({ path, icon: Icon, label, badgeKey }) => {
          const badge = badgeKey ? pendingCounts[badgeKey] : 0
          return (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `w-full px-6 py-3 flex items-center gap-3 transition-all border-l-4 ${
                  isActive
                    ? 'bg-gray-800 border-indigo-400 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white border-transparent'
                }`
              }
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span className="text-sm font-medium flex-1">{label}</span>
              {badge > 0 && (
                <span className="bg-amber-400 text-gray-900 text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center">
                  {badge}
                </span>
              )}
            </NavLink>
          )
        })}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <button
          onClick={handleLogout}
          className="w-full px-4 py-2 flex items-center gap-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors text-sm"
        >
          <LogOut className="w-4 h-4" />
          ログアウト
        </button>
      </div>

      <div className="px-6 pb-4">
        <p className="text-xs text-gray-600">© 2026 CreativeCrew</p>
        <p className="text-xs text-gray-600">v0.1.0</p>
      </div>
    </aside>
  )
}
