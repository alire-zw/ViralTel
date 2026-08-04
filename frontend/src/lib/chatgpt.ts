import { apiFetch } from './api'

export type AccountShopCategoryId =
  | 'chatgpt'
  | 'gemini'
  | 'capcut'
  | 'canva'
  | 'youtube'
  | 'microsoft'
  | 'claude'
  | 'cursor'
  | 'netflix'
  | 'grok'

export type AccountShopProduct = {
  productId: string
  categoryId: AccountShopCategoryId
  categoryLabel: string
  name: string
  shortDesc: string
  priceUsd: number
  toman: number
  available: number | null
  inStock: boolean
  isSlot: boolean
  requiresCustomerEmail: boolean
  requiresSlotMonths: boolean
  slotDurations: number[]
  sortOrder: number
}

export type AccountShopCatalogResponse = {
  usdtIrtPrice: number
  categories: Array<{ id: AccountShopCategoryId; label: string }>
  products: AccountShopProduct[]
}

export function fetchAccountShopProducts() {
  return apiFetch<AccountShopCatalogResponse>('/api/chatgpt/products')
}
