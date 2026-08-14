import type { UserMeResponse } from '../types/user'
import {
  clearBrowserSession,
  getBrowserSessionToken,
  isBrowserPublicMode,
} from './browserSession'

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? ''

function formatWaitFa(seconds: number): string {
  const wait = Math.max(1, Math.ceil(seconds))
  if (wait < 60) return `${wait} ثانیه`
  if (wait < 3600) return `${Math.ceil(wait / 60)} دقیقه`
  return `${Math.ceil(wait / 3600)} ساعت`
}

function localizeApiErrorMessage(
  status: number,
  message: string,
  retryAfterSeconds?: number,
): string {
  const lower = message.toLowerCase()
  const isRateLimit =
    status === 429 ||
    lower.includes('rate limit') ||
    lower.includes('too many requests') ||
    lower.includes('retry in')

  if (isRateLimit) {
    if (typeof retryAfterSeconds === 'number' && retryAfterSeconds > 0) {
      return `تعداد درخواست‌ها بیش از حد مجاز است. لطفاً ${formatWaitFa(retryAfterSeconds)} دیگر دوباره تلاش کنید.`
    }
    return 'تعداد درخواست‌ها بیش از حد مجاز است. لطفاً کمی بعد دوباره تلاش کنید.'
  }

  if (/^request failed \(\d+\)$/i.test(message)) {
    if (status === 401) return 'نشست شما منقضی شده است. دوباره وارد شوید.'
    if (status === 403) return 'دسترسی مجاز نیست.'
    if (status === 404) return 'مورد درخواستی یافت نشد.'
    if (status >= 500) return 'خطای داخلی سرور. لطفاً دوباره تلاش کنید.'
    return 'درخواست ناموفق بود. لطفاً دوباره تلاش کنید.'
  }

  if (lower === 'internal server error' || lower === 'something went wrong') {
    return 'خطای داخلی سرور. لطفاً دوباره تلاش کنید.'
  }

  return message
}

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

    const retryAfterHeader = response.headers.get('retry-after')
    if (retryAfterHeader) {
      const parsed = Number(retryAfterHeader)
      if (Number.isFinite(parsed) && parsed > 0) {
        retryAfterSeconds = Math.ceil(parsed)
      }
    }

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

    message = localizeApiErrorMessage(response.status, message, retryAfterSeconds)

    if (
      response.status === 401 &&
      browserToken &&
      (message.toLowerCase().includes('browser session') ||
        message.toLowerCase().includes('unauthorized') ||
        message.includes('منقضی'))
    ) {
      clearBrowserSession()
    }

    const error = new Error(message) as Error & { retryAfterSeconds?: number; status?: number }
    error.status = response.status
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
