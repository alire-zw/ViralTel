const APP_SCROLL_SELECTOR = '.app__scroll'
const APP_SCROLL_LOCK_CLASS = 'app--scroll-locked'

function getScrollElement() {
  return document.querySelector(APP_SCROLL_SELECTOR)
}

export function lockAppScroll() {
  getScrollElement()?.classList.add(APP_SCROLL_LOCK_CLASS)
}

export function unlockAppScroll() {
  getScrollElement()?.classList.remove(APP_SCROLL_LOCK_CLASS)
}
