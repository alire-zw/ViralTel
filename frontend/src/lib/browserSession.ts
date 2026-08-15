const STORAGE_KEY = 'viraltel:browser-session:v1'

export type BrowserSession = {
  token: string
  expiresAt: string
}

export function isBrowserPublicMode(): boolean {
  return import.meta.env.VITE_BROWSER_PUBLIC_MODE === 'true'
}

export function getBrowserSession(): BrowserSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as BrowserSession
    if (!parsed?.token || !parsed?.expiresAt) return null
    if (Date.parse(parsed.expiresAt) <= Date.now()) {
      clearBrowserSession()
      return null
    }
    return parsed
  } catch {
    return null
  }
}

export function getBrowserSessionToken(): string | null {
  return getBrowserSession()?.token ?? null
}

export function setBrowserSession(session: BrowserSession): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
}

export function clearBrowserSession(): void {
  localStorage.removeItem(STORAGE_KEY)
}
