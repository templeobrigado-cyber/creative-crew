import { createContext, useContext, useState, useEffect } from 'react'
import type { UserRole } from './types'

interface AuthUser {
  email: string
  displayName: string
  role: UserRole
}

interface AuthContextValue {
  user: AuthUser | null
  login: (email: string, role: UserRole, displayName: string) => void
  logout: () => void
  can: (action: Action) => boolean
}

export type Action =
  | 'article.delete'
  | 'category.manage'
  | 'tag.manage'
  | 'user.manage'
  | 'settings.manage'
  | 'article.edit'

const PERMISSIONS: Record<UserRole, Action[]> = {
  admin: [
    'article.edit',
    'article.delete',
    'category.manage',
    'tag.manage',
    'user.manage',
    'settings.manage',
  ],
  editor: [
    'article.edit',
  ],
  viewer: [],
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  login: () => {},
  logout: () => {},
  can: () => false,
})

const SESSION_KEY = 'admin_auth_user'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const stored = sessionStorage.getItem(SESSION_KEY)
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })

  const login = (email: string, role: UserRole, displayName: string) => {
    const u = { email, role, displayName }
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(u))
    sessionStorage.setItem('admin_logged_in', 'true')
    setUser(u)
  }

  const logout = () => {
    sessionStorage.removeItem(SESSION_KEY)
    sessionStorage.removeItem('admin_logged_in')
    setUser(null)
  }

  const can = (action: Action): boolean => {
    if (!user) return false
    return PERMISSIONS[user.role].includes(action)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, can }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
