import { resolveShopBannerImageUrl } from './shopBanners'

const DB_NAME = 'numberstar-shop-banners'
const STORE_NAME = 'images'
const DB_VERSION = 1
const MEMORY = new Map<string, string>()
const VISUALLY_READY = new Set<string>()

function openBannerDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME)
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error('banner db open failed'))
  })
}

async function readBannerBlob(key: string): Promise<Blob | null> {
  try {
    const db = await openBannerDb()
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly')
      const request = tx.objectStore(STORE_NAME).get(key)
      request.onsuccess = () => {
        const value = request.result
        resolve(value instanceof Blob && value.size > 0 ? value : null)
      }
      request.onerror = () => reject(request.error ?? new Error('banner read failed'))
    })
  } catch {
    return null
  }
}

async function writeBannerBlob(key: string, blob: Blob): Promise<void> {
  if (blob.size <= 0) return
  try {
    const db = await openBannerDb()
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      tx.objectStore(STORE_NAME).put(blob, key)
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error ?? new Error('banner write failed'))
    })
  } catch {
    // Ignore persistence failures.
  }
}

function rememberSrc(key: string, src: string): string {
  MEMORY.set(key, src)
  return src
}

export function markShopBannerVisuallyReady(url: string): void {
  const key = resolveShopBannerImageUrl(url)
  if (key) VISUALLY_READY.add(key)
}

export function isShopBannerVisuallyReady(url: string): boolean {
  const key = resolveShopBannerImageUrl(url)
  if (!key) return false
  return VISUALLY_READY.has(key)
}

export function getCachedShopBannerSrcSync(url: string): string | null {
  const key = resolveShopBannerImageUrl(url)
  if (!key) return null
  return MEMORY.get(key) ?? null
}

async function fetchBannerBlob(url: string): Promise<Blob | null> {
  const attempts = [
    { href: url, cache: 'force-cache' as RequestCache },
    { href: url, cache: 'default' as RequestCache },
    {
      href: `${url}${url.includes('?') ? '&' : '?'}v=${Date.now()}`,
      cache: 'reload' as RequestCache,
    },
  ]

  for (const attempt of attempts) {
    try {
      const response = await fetch(attempt.href, {
        method: 'GET',
        mode: 'cors',
        credentials: 'omit',
        cache: attempt.cache,
      })
      if (!response.ok) continue
      const blob = await response.blob()
      if (blob.size > 0 && blob.type.startsWith('image/')) return blob
      if (blob.size > 0) return blob
    } catch {
      // try next attempt
    }
  }

  return null
}

/**
 * Prefer cached blob URL; otherwise return remote URL immediately and cache in background.
 */
export async function resolveShopBannerSrc(url: string): Promise<string> {
  const remote = resolveShopBannerImageUrl(url)
  if (!remote) return ''

  const cached = MEMORY.get(remote)
  if (cached) return cached

  const stored = await readBannerBlob(remote)
  if (stored) {
    const objectUrl = URL.createObjectURL(stored)
    return rememberSrc(remote, objectUrl)
  }

  void fetchBannerBlob(remote).then((blob) => {
    if (!blob) return
    void writeBannerBlob(remote, blob)
    const current = MEMORY.get(remote)
    if (!current || current === remote) {
      rememberSrc(remote, URL.createObjectURL(blob))
    }
  })

  return rememberSrc(remote, remote)
}

export async function ensureShopBannerSrc(url: string): Promise<string> {
  const remote = resolveShopBannerImageUrl(url)
  if (!remote) return ''

  const existing = MEMORY.get(remote)
  if (existing?.startsWith('blob:')) return existing

  const stored = await readBannerBlob(remote)
  if (stored) {
    const objectUrl = URL.createObjectURL(stored)
    return rememberSrc(remote, objectUrl)
  }

  const blob = await fetchBannerBlob(remote)
  if (blob) {
    void writeBannerBlob(remote, blob)
    return rememberSrc(remote, URL.createObjectURL(blob))
  }

  return remote
}

export async function warmShopBannerImageCache(urls: string[]): Promise<void> {
  await Promise.all(
    urls.filter(Boolean).map(async (url) => {
      try {
        await ensureShopBannerSrc(url)
      } catch {
        // ignore
      }
    }),
  )
}
