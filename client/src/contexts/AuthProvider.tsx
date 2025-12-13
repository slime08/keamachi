// client/src/contexts/AuthProvider.tsx
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import api from '../api'
import { safeGetJSON, safeSetJSON } from '../utils/storage'

export type AuthUser = {
  id: number
  email: string
  name: string
  role: string
}

type AuthContextType = {
  user: AuthUser | null
  token: string | null
  loading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const TOKEN_KEY = 'token'
const USER_KEY = 'user'

const AuthContext = createContext<AuthContextType | null>(null)

function setApiAuthToken(token: string | null) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`
  } else {
    delete api.defaults.headers.common.Authorization
  }
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const isAuthenticated = !!user

  // 起動時に localStorage から復元
  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY)
    const storedUser = safeGetJSON<AuthUser | null>(USER_KEY, null)

    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(storedUser)
      setApiAuthToken(storedToken)
    } else {
      // 片方だけ残ってるケースを掃除
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
      setApiAuthToken(null)
      setToken(null)
      setUser(null)
    }

    setLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    setLoading(true)
    try {
      const res = await api.post('/auth/login', { email, password })

      const nextToken: string = res.data.token
      const nextUser: AuthUser = res.data.user

      // 永続化
      localStorage.setItem(TOKEN_KEY, nextToken)
      safeSetJSON(USER_KEY, nextUser)

      // 即時反映（ここがないと “200OKなのに未ログイン” になる）
      setToken(nextToken)
      setUser(nextUser)
      setApiAuthToken(nextToken)
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setToken(null)
    setUser(null)
    setApiAuthToken(null)
  }

  const value = useMemo(
    () => ({ user, token, loading, isAuthenticated, login, logout }),
    [user, token, loading, isAuthenticated]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within <AuthProvider>')
  }
  return ctx
}
