import { useCallback, useEffect, useState } from 'react'
import { applyAppTheme } from '../lib/telegramTheme'
import {
  getStoredThemeMode,
  resolveThemeScheme,
  setStoredThemeMode,
  type ThemeMode,
} from '../lib/theme'

export function useTheme() {
  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => getStoredThemeMode())

  const applyTheme = useCallback((mode: ThemeMode) => {
    const scheme = resolveThemeScheme(mode)
    applyAppTheme(scheme)
  }, [])

  useEffect(() => {
    applyTheme(themeMode)

    if (themeMode !== 'auto') return

    const media = window.matchMedia('(prefers-color-scheme: light)')
    const handleChange = () => applyTheme('auto')
    media.addEventListener('change', handleChange)
    return () => media.removeEventListener('change', handleChange)
  }, [themeMode, applyTheme])

  const setTheme = useCallback((mode: ThemeMode) => {
    setStoredThemeMode(mode)
    setThemeModeState(mode)
    applyTheme(mode)
  }, [applyTheme])

  return { themeMode, setTheme }
}
