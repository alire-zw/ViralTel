import type { UserMeResponse } from '../types/user'
import {
  clearBrowserSession,
  getBrowserSessionToken,
  isBrowserPublicMode,
} from './browserSession'

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? ''

export function getTelegramInitData(): string | null {
  const initData = window.Telegram?.WebApp.initData
  return initData?.trim() ? initData : null
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const initData = getTelegramInitData()
  const browserToken = !initData && isBrowserPublicMode() ? getBrowserSessionToken() : null
  const headers = new Headers(init?.headers)

  if (initData) {
    headers.set('X-Telegram-Init-Data', initData)
  } else if (browserToken) {
    headers.set('Authorization', `Bearer ${browserToken}`)
  }

  if (init?.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
  })

  if (!response.ok) {
    let message = `Request failed (${response.status})`
    let retryAfterSeconds: number | undefined

    try {
      const payload = (await response.json()) as {
        message?: string
        error?: string
        retryAfterSeconds?: number
      }
      message = payload.message ?? payload.error ?? message
      if (typeof payload.retryAfterSeconds === 'number') {
        retryAfterSeconds = payload.retryAfterSeconds
      }
    } catch {
      // ignore parse errors
    }

    if (
      response.status === 401 &&
      browserToken &&
      (message.toLowerCase().includes('browser session') ||
        message.toLowerCase().includes('unauthorized'))
    ) {
      clearBrowserSession()
    }

    const error = new Error(message) as Error & { retryAfterSeconds?: number }
    if (retryAfterSeconds !== undefined) {
      error.retryAfterSeconds = retryAfterSeconds
    }
    throw error
  }

  return response.json() as Promise<T>
}

export function fetchCurrentUser() {
  return apiFetch<UserMeResponse>('/api/users/me')
}

export function updateCurrentUser(body: {
  realName?: string | null
  email?: string | null
}) {
  return apiFetch<UserMeResponse>('/api/users/me', {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
}

export function isTelegramWebApp(): boolean {
  return Boolean(window.Telegram?.WebApp.initData?.trim())
}

/** موجودی در دیتابیس به تومان ذخیره می‌شود. */
export function balanceToToman(balance: string | number | bigint): number {
  const value = typeof balance === 'bigint' ? Number(balance) : Number(balance)
  if (!Number.isFinite(value)) return 0
  return Math.floor(value)
}

export function formatUserDisplayName(user: {
  realName?: string | null
  firstName?: string | null
  lastName?: string | null
  username?: string | null
  phoneNumber?: string | null
}): string {
  if (user.realName?.trim()) return user.realName.trim()

  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ').trim()
  if (fullName && fullName !== 'کاربر') return fullName

  if (user.username?.trim()) return `@${user.username.trim()}`
  if (user.phoneNumber?.trim()) return user.phoneNumber.trim()

  return 'کاربر'
}
