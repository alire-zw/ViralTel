import { apiFetch } from './api'

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? ''
const STORAGE_KEY = 'numberstar:shop-banners:v1'

export type ShopBannerItem = {
  id: number
  title: string
  productKey: string
  mainImageUrl: string
  thumbImageUrl: string
  sortOrder: number
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}

export type ShopBannersPayload = {
  version: string
  cachedAt: string
  items: ShopBannerItem[]
}

export type ShopBannersSyncPayload = ShopBannersPayload & {
  changed: boolean
}

let memoryCache: ShopBannersPayload | null = null

export function resolveShopBannerImageUrl(url: string) {
  if (!url) return url
  if (/^https?:\/\//i.test(url) || url.startsWith('data:')) return url
  return `${API_BASE}${url}`
}

export function readLocalShopBanners(): ShopBannersPayload | null {
  if (memoryCache) return memoryCache

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as ShopBannersPayload
    if (!parsed?.version || !Array.isArray(parsed.items)) return null
    memoryCache = parsed
    return parsed
  } catch {
    return null
  }
}

export function writeLocalShopBanners(payload: ShopBannersPayload): void {
  memoryCache = payload
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  } catch {
    // ignore quota / private mode failures
  }
}

export function clearLocalShopBanners(): void {
  memoryCache = null
  localStorage.removeItem(STORAGE_KEY)
}

export function fetchShopBanners() {
  return apiFetch<ShopBannersPayload>('/api/shop/banners')
}

export function syncShopBanners(version?: string) {
  return apiFetch<ShopBannersSyncPayload>('/api/shop/banners/sync', {
    method: 'POST',
    body: JSON.stringify(version ? { version } : {}),
  })
}

export function preloadShopBannerImages(items: ShopBannerItem[]) {
  void import('./shopBannerImageCache').then(({ warmShopBannerImageCache }) => {
    const urls = items.flatMap((item) => [item.mainImageUrl, item.thumbImageUrl])
    void warmShopBannerImageCache(urls)
  })
}
