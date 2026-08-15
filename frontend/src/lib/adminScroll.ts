const APP_SCROLL_SELECTOR = '.app__scroll'
const ADMIN_HUB_SCROLL_KEY = 'viraltel:admin-hub-scroll'

function getScrollElement(): HTMLElement | null {
  return document.querySelector(APP_SCROLL_SELECTOR)
}

export function peekAdminHubScroll(): number {
  const raw = sessionStorage.getItem(ADMIN_HUB_SCROLL_KEY)
  if (raw == null) return 0
  const top = Number(raw)
  return Number.isFinite(top) && top > 0 ? top : 0
}

/** Save hub scroll before navigating into an admin sub-page. */
export function saveAdminHubScroll(): void {
  const el = getScrollElement()
  if (!el) return
  sessionStorage.setItem(ADMIN_HUB_SCROLL_KEY, String(el.scrollTop))
}

/**
 * Restore hub scroll synchronously (for useLayoutEffect) so the browser
 * does not paint at scrollTop 0 first.
 */
export function restoreAdminHubScrollSync(): number {
  const top = peekAdminHubScroll()
  if (top <= 0) return 0
  const el = getScrollElement()
  if (el) el.scrollTop = top
  return top
}

/** Soft follow-up after layout settles (images/fonts). */
export function restoreAdminHubScroll(): void {
  const top = peekAdminHubScroll()
  if (top <= 0) return
  const apply = () => {
    const el = getScrollElement()
    if (el) el.scrollTop = top
  }
  apply()
  requestAnimationFrame(apply)
}
