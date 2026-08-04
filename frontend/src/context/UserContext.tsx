import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { fetchCurrentUser } from '../lib/api'
import {
  clearBrowserSession,
  getBrowserSessionToken,
  isBrowserPublicMode,
} from '../lib/browserSession'
import type { AppUser } from '../types/user'

interface UserContextValue {
  user: AppUser | null
  isLoading: boolean
  error: string | null
  isAuthenticated: boolean
  refetch: (options?: { silent?: boolean }) => Promise<void>
  logout: () => void
}

const UserContext = createContext<UserContextValue | null>(null)

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadUser = useCallback(async (options?: { silent?: boolean }) => {
    const silent = options?.silent ?? false
    const initData = window.Telegram?.WebApp.initData?.trim()
    const browserToken = isBrowserPublicMode() ? getBrowserSessionToken() : null

    if (!initData && !browserToken) {
      setUser(null)
      setError(null)
      if (!silent) {
        setIsLoading(false)
      }
      return
    }

    if (!silent) {
      setIsLoading(true)
    }
    setError(null)

    try {
      const response = await fetchCurrentUser()
      setUser(response.user)
    } catch (err) {
      setUser(null)
      setError(err instanceof Error ? err.message : 'خطا در دریافت اطلاعات کاربر')
    } finally {
      if (!silent) {
        setIsLoading(false)
      }
    }
  }, [])

  const logout = useCallback(() => {
    clearBrowserSession()
    setUser(null)
    setError(null)
  }, [])

  useEffect(() => {
    void loadUser()
  }, [loadUser])

  const value = useMemo(
    () => ({
      user,
      isLoading,
      error,
      isAuthenticated: Boolean(user),
      refetch: loadUser,
      logout,
    }),
    [user, isLoading, error, loadUser, logout],
  )

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export function useUser(): UserContextValue {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUser must be used within UserProvider')
  }
  return context
}
