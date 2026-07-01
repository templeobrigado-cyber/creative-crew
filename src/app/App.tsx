import { Routes, Route, Navigate } from 'react-router'
import { AdminLayout } from './components/admin/AdminLayout'
import { LoginPage } from './components/admin/pages/LoginPage'
import { NotFoundPage } from './components/pages/NotFoundPage'
import { PublicLayout } from './components/public/PublicLayout'
import { LandingPage } from './components/public/LandingPage'
import { UserLoginPage } from './components/public/UserLoginPage'
import { CreatorRegisterPage } from './components/public/CreatorRegisterPage'
import { ClientRegisterPage } from './components/public/ClientRegisterPage'
import { CreatorLayout } from './components/creator/CreatorLayout'
import { ClientLayout } from './components/client/ClientLayout'

export default function App() {
  return (
    <Routes>
      {/* 公開ページ */}
      <Route path="/" element={<PublicLayout><LandingPage /></PublicLayout>} />
      <Route path="/login" element={<PublicLayout><UserLoginPage /></PublicLayout>} />
      <Route path="/register/creator" element={<PublicLayout><CreatorRegisterPage /></PublicLayout>} />
      <Route path="/register/client" element={<PublicLayout><ClientRegisterPage /></PublicLayout>} />

      {/* クリエイターマイページ */}
      <Route path="/creator/*" element={<CreatorLayout />} />

      {/* 発注者マイページ */}
      <Route path="/client/*" element={<ClientLayout />} />

      {/* 管理画面 */}
      <Route path="/admin/login" element={<LoginPage />} />
      <Route path="/admin/*" element={<AdminLayout />} />

      <Route path="/404" element={<NotFoundPage type="404" />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  )
}
