export function initTelegramViewport() {
  const tg = window.Telegram?.WebApp
  if (!tg) return

  tg.disableVerticalSwipes?.()
  tg.expand()
}
