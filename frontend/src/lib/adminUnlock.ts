const ADMIN_STORAGE_KEY = 'ns:admin-nav-unlocked'
const CREDITS_STORAGE_KEY = 'ns:profile-credits-shown'
export const PROFILE_CREDITS_EVENT = 'ns:profile-credits-shown'

export function readAdminNavUnlocked(): boolean {
  try {
    return sessionStorage.getItem(ADMIN_STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

export function writeAdminNavUnlocked(unlocked: boolean): void {
  try {
    if (unlocked) {
      sessionStorage.setItem(ADMIN_STORAGE_KEY, '1')
      return
    }
    sessionStorage.removeItem(ADMIN_STORAGE_KEY)
  } catch {
    // ignore storage failures in restricted WebViews
  }
}

export function readProfileCreditsShown(): boolean {
  try {
    return sessionStorage.getItem(CREDITS_STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

export function writeProfileCreditsShown(shown: boolean): void {
  try {
    if (shown) {
      sessionStorage.setItem(CREDITS_STORAGE_KEY, '1')
    } else {
      sessionStorage.removeItem(CREDITS_STORAGE_KEY)
    }
  } catch {
    // ignore storage failures in restricted WebViews
  }

  window.dispatchEvent(new Event(PROFILE_CREDITS_EVENT))
}
