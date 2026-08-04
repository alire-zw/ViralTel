type ColorScheme = 'light' | 'dark'

/** Indigo-tinted chrome that matches site accent / admin hub glow */
const ADMIN_CHROME_DARK = '#0b0b16'
const ADMIN_CHROME_LIGHT = '#eef0ff'

function readAppBackground(): string {
  return getComputedStyle(document.documentElement).getPropertyValue('--bg').trim()
}

function updateMetaThemeColor(color: string) {
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', color)
}

function applyTelegramChrome(color: string) {
  const tg = window.Telegram?.WebApp
  if (!tg) return
  tg.setHeaderColor?.(color)
  tg.setBackgroundColor?.(color)
}

export function applyAppTheme(colorScheme: ColorScheme) {
  document.documentElement.dataset.theme = colorScheme
  // Re-apply route-aware chrome (admin uses accent-tinted header).
  syncTelegramChromeForPath(window.location.pathname)
}

/** Keep Telegram mini-app header in sync with current route atmosphere. */
export function syncTelegramChromeForPath(pathname: string) {
  const scheme = (document.documentElement.dataset.theme as ColorScheme | undefined) ?? 'dark'
  const isAdmin = pathname === '/admin' || pathname.startsWith('/admin/')

  if (isAdmin) {
    const chrome = scheme === 'light' ? ADMIN_CHROME_LIGHT : ADMIN_CHROME_DARK
    updateMetaThemeColor(chrome)
    applyTelegramChrome(chrome)
    return
  }

  const bg = readAppBackground()
  updateMetaThemeColor(bg)
  applyTelegramChrome(bg)
}

export function getPreferredColorScheme(): ColorScheme {
  const tgScheme = window.Telegram?.WebApp.colorScheme
  if (tgScheme === 'light' || tgScheme === 'dark') return tgScheme

  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}
