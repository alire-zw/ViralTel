import { useCallback, useEffect, useState } from 'react'
import { applyAppTheme } from '../lib/telegramTheme'
import { initTelegramViewport } from '../lib/telegramViewport'
import { getStoredThemeMode, resolveThemeScheme } from '../lib/theme'

type ColorScheme = 'light' | 'dark'

interface TelegramUser {
  id: number
  firstName: string
  lastName?: string
  username?: string
  photoUrl?: string
}

interface TelegramState {
  isReady: boolean
  colorScheme: ColorScheme
  user: TelegramUser | null
  haptic: (style?: 'light' | 'medium' | 'heavy') => void
}

export function useTelegram(): TelegramState {
  const [isReady, setIsReady] = useState(false)
  const [colorScheme, setColorScheme] = useState<ColorScheme>('dark')
  const [user, setUser] = useState<TelegramUser | null>(null)

  useEffect(() => {
    const tg = window.Telegram?.WebApp

    const syncTheme = () => {
      const scheme = resolveThemeScheme(getStoredThemeMode())
      setColorScheme(scheme)
      applyAppTheme(scheme)
    }

    const handleTelegramThemeChange = () => {
      if (getStoredThemeMode() === 'auto') {
        syncTheme()
      }
    }

    if (tg) {
      tg.ready()
      initTelegramViewport()
      syncTheme()

      const tgUser = tg.initDataUnsafe.user
      if (tgUser) {
        setUser({
          id: tgUser.id,
          firstName: tgUser.first_name,
          lastName: tgUser.last_name,
          username: tgUser.username,
          photoUrl: tgUser.photo_url,
        })
      }

      tg.onEvent?.('themeChanged', handleTelegramThemeChange)
    } else {
      syncTheme()
    }

    setIsReady(true)

    return () => {
      tg?.offEvent?.('themeChanged', handleTelegramThemeChange)
    }
  }, [])

  const haptic = useCallback((style: 'light' | 'medium' | 'heavy' = 'light') => {
    window.Telegram?.WebApp?.HapticFeedback?.impactOccurred?.(style)
  }, [])

  return { isReady, colorScheme, user, haptic }
}
