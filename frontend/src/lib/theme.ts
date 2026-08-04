export type ThemeMode = 'auto' | 'light' | 'dark'

const THEME_STORAGE_KEY = 'numberstar-theme'

export function getStoredThemeMode(): ThemeMode {
  const stored = localStorage.getItem(THEME_STORAGE_KEY)
  if (stored === 'light' || stored === 'dark' || stored === 'auto') {
    return stored
  }
  return 'auto'
}

export function setStoredThemeMode(mode: ThemeMode) {
  localStorage.setItem(THEME_STORAGE_KEY, mode)
}

export function resolveThemeScheme(mode: ThemeMode): 'light' | 'dark' {
  if (mode === 'auto') {
    const tgScheme = window.Telegram?.WebApp.colorScheme
    if (tgScheme === 'light' || tgScheme === 'dark') return tgScheme

    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
  }
  return mode
}
