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

export type AccountShopCustomField = {
  id: string
  label: string
  placeholder: string
  required: boolean
}

export type AccountShopNoticeKind = 'none' | 'info' | 'warning' | 'note'

export type AccountShopProduct = {
  planId?: number
  productId: string
  categoryId: AccountShopCategoryId
  categoryLabel: string
  name: string
  shortDesc: string
  durationLabel?: string
  warrantyLabel?: string
  priceUsd: number | null
  toman: number
  available: number | null
  inStock: boolean
  pricingMode?: 'fixed' | 'variable'
  markupPercent?: number
  customFields?: AccountShopCustomField[]
  noticeKind?: AccountShopNoticeKind
  noticeText?: string | null
  sortOrder: number
  isSlot: boolean
  requiresCustomerEmail: boolean
  requiresSlotMonths: boolean
  slotDurations: number[]
}

export type AccountShopCatalogResponse = {
  usdtIrtPrice: number
  categories: Array<{ id: AccountShopCategoryId; label: string }>
  products: AccountShopProduct[]
}

export function fetchAccountShopProducts(categoryId?: AccountShopCategoryId) {
  const query = categoryId ? `?categoryId=${encodeURIComponent(categoryId)}` : ''
  return apiFetch<AccountShopCatalogResponse>(`/api/chatgpt/products${query}`)
}

export type AccountShopPurchaseRequest = {
  planId: number
  categoryId: AccountShopCategoryId
  toman: number
  fieldValues: Record<string, string>
  useWalletBalance?: boolean
}

export type AccountShopWalletPurchaseResponse = {
  orderId: string
  toman: number
}

export type AccountShopGatewayPurchaseResponse = {
  orderId: string
  paymentUrl?: string
  trackId?: string | number
  toman: number
  walletAmountToman?: number
  gatewayAmountToman?: number
}

export function purchaseAccountShopWithWallet(input: AccountShopPurchaseRequest) {
  return apiFetch<AccountShopWalletPurchaseResponse>('/api/chatgpt/purchase/wallet', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function purchaseAccountShopWithGateway(input: AccountShopPurchaseRequest) {
  return apiFetch<AccountShopGatewayPurchaseResponse>('/api/chatgpt/purchase/gateway', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}
