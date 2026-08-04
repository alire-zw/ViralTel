export function getTelegramPlatform(): string | undefined {
  return window.Telegram?.WebApp?.platform?.toLowerCase()
}

export function isAndroidTelegram(): boolean {
  const platform = getTelegramPlatform()
  return platform === 'android' || platform === 'android_x'
}

export function isIosTelegram(): boolean {
  const platform = getTelegramPlatform()
  return platform === 'ios' || platform === 'macos'
}
