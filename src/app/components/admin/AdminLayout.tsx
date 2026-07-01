import { Routes, Route, Navigate, useNavigate } from 'react-router'
import { useState, useEffect } from 'react'
import { AdminSidebar } from './AdminSidebar'
import { AdminTopbar } from './AdminTopbar'
import { DashboardPage } from './pages/DashboardPage'
import { ProjectListPage } from './pages/ProjectListPage'
import { ProjectEditorPage } from './pages/ProjectEditorPage'
import { CreatorListPage } from './pages/CreatorListPage'
import { CreatorDetailPage } from './pages/CreatorDetailPage'
import { ClientListPage } from './pages/ClientListPage'
import { ClientDetailPage } from './pages/ClientDetailPage'
import { ApplicationListPage } from './pages/ApplicationListPage'
import { CategoryManagementPage } from './pages/CategoryManagementPage'
import { UserManagementPage } from './pages/UserManagementPage'
import { SettingsPage } from './pages/SettingsPage'

function useAdminAuth() {
  const [isLoggedIn] = useState(
    () => sessionStorage.getItem('admin_logged_in') === 'true'
  )
  return { isLoggedIn }
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
            <Route path="dashboard"           element={<DashboardPage />} />
            <Route path="projects"            element={<ProjectListPage />} />
            <Route path="projects/new"        element={<ProjectEditorPage />} />
            <Route path="projects/:id/edit"   element={<ProjectEditorPage />} />
            <Route path="applications"        element={<ApplicationListPage />} />
            <Route path="creators"            element={<CreatorListPage />} />
            <Route path="creators/:id"        element={<CreatorDetailPage />} />
            <Route path="clients"             element={<ClientListPage />} />
            <Route path="clients/:id"         element={<ClientDetailPage />} />
            <Route path="categories"          element={<CategoryManagementPage />} />
            <Route path="users"               element={<UserManagementPage />} />
            <Route path="settings"            element={<SettingsPage />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}
