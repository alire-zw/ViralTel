import { apiFetch } from './api'

const STORAGE_KEY = 'viraltel:shop-popular:v1'

export type ShopPopularItem = {
  productKey: string
  label: string
  count: number
}

export type ShopPopularPayload = {
  bestsellers: ShopPopularItem[]
  mostViewed: ShopPopularItem[]
  cachedAt: string
}

let memoryCache: ShopPopularPayload | null = null

function isValidPayload(value: unknown): value is ShopPopularPayload {
  if (!value || typeof value !== 'object') return false
  const payload = value as ShopPopularPayload
  return (
    Array.isArray(payload.bestsellers) &&
    Array.isArray(payload.mostViewed) &&
    typeof payload.cachedAt === 'string'
  )
}

export function readLocalShopPopular(): ShopPopularPayload | null {
  if (memoryCache) return memoryCache

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as unknown
    if (!isValidPayload(parsed)) return null
    memoryCache = parsed
    return parsed
  } catch {
    return null
  }
}

export function writeLocalShopPopular(payload: ShopPopularPayload): void {
  memoryCache = payload
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  } catch {
    // ignore quota / private mode failures
  }
}

export function clearLocalShopPopular(): void {
  memoryCache = null
  localStorage.removeItem(STORAGE_KEY)
}

export function fetchShopPopular() {
  return apiFetch<ShopPopularPayload>('/api/shop/popular')
}
