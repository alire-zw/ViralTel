import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import { readAdminNavUnlocked } from '../lib/adminUnlock'

export function useAdminAccess(): {
  ready: boolean
  allowed: boolean
} {
  const navigate = useNavigate()
  const { user, isLoading } = useUser()
  const allowed = Boolean(user?.canAccessAdminPanel && readAdminNavUnlocked())

  useEffect(() => {
    if (isLoading) return
    if (!allowed) {
      navigate('/', { replace: true })
    }
  }, [allowed, isLoading, navigate])

  return {
    ready: !isLoading,
    allowed,
  }
}
