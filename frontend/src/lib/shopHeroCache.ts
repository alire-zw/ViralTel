import { SHOP_HERO_CACHE_VERSION, shopHeroAssetUrls } from '../data/shopHeroAssets'

const CACHE_NAME = `numberstar-shop-heroes-${SHOP_HERO_CACHE_VERSION}`

export function registerAppAssetServiceWorker(): void {
  if (!('serviceWorker' in navigator)) return

  void navigator.serviceWorker.register('/sw.js').catch(() => {
    // Service worker is optional; Cache API warmup still helps.
  })
}

export async function warmShopHeroCache(): Promise<void> {
  if (!('caches' in window)) return

  try {
    const cache = await caches.open(CACHE_NAME)
    await Promise.all(
      shopHeroAssetUrls.map(async (url) => {
        const existing = await cache.match(url)
        if (existing) return

        const response = await fetch(url, { cache: 'force-cache' })
        if (response.ok) {
          await cache.put(url, response.clone())
        }
      }),
    )
  } catch {
    // Background warmup should never block the app.
  }
}

export function initAppAssetCache(): void {
  registerAppAssetServiceWorker()
  void warmShopHeroCache()
}

/** @deprecated Use initAppAssetCache */
export function initShopHeroCache(): void {
  initAppAssetCache()
}

