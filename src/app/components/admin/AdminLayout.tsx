import { Routes, Route, Navigate, useNavigate } from 'react-router'
import { useState, useEffect } from 'react'
import { AdminSidebar } from './AdminSidebar'
import { AdminTopbar } from './AdminTopbar'
import { DashboardPage } from './pages/DashboardPage'
import { ArticleListPage } from './pages/ArticleListPage'
import { ArticleEditorPage } from './pages/ArticleEditorPage'
import { CategoryManagementPage } from './pages/CategoryManagementPage'
import { TagManagementPage } from './pages/TagManagementPage'
import { UserManagementPage } from './pages/UserManagementPage'
import { AnalyticsPage } from './pages/AnalyticsPage'
import { ZeroHitQueriesPage } from './pages/ZeroHitQueriesPage'
import { FeedbackPage } from './pages/FeedbackPage'
import { SettingsPage } from './pages/SettingsPage'

// セッションベースの簡易認証チェック
function useAdminAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    () => sessionStorage.getItem('admin_logged_in') === 'true'
  )
  return { isLoggedIn, setIsLoggedIn }
}

export function AdminLayout() {
  const { isLoggedIn } = useAdminAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isLoggedIn) navigate('/admin/login', { replace: true })
  }, [isLoggedIn, navigate])

  if (!isLoggedIn) return null

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminTopbar />
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="articles" element={<ArticleListPage />} />
            <Route path="articles/new" element={<ArticleEditorPage />} />
            <Route path="articles/:id/edit" element={<ArticleEditorPage />} />
            <Route path="categories" element={<CategoryManagementPage />} />
            <Route path="tags" element={<TagManagementPage />} />
            <Route path="zero-hits" element={<ZeroHitQueriesPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="feedback" element={<FeedbackPage />} />
            <Route path="users" element={<UserManagementPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}
