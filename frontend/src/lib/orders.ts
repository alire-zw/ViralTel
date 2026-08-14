import { apiFetch } from './api'

export type OrderStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
export type OrderPaymentMethod = 'wallet' | 'zibal' | 'tron'

export interface ShopOrder {
  orderId: string
  status: OrderStatus
  paymentMethod: OrderPaymentMethod
  amountToman: string
  walletAmountToman: string
  gatewayAmountToman: string
  quantity: number | null
  recipientUsername: string | null
  recipientName: string | null
  recipientPhoto: string | null
  category: {
    slug: string
    label: string
  }
  virtualNumber: {
    number: string
    country: string
    range: string
    service: string
    quality: string
    providerOrderId: string
    price: string
    code: string | null
    loggedOutAt?: string | null
  } | null
  reactionOrder: {
    postLink: string
    postUsername: string
    postMessageId: number
    postTitle: string
    postPreview: string | null
    postPhoto: string | null
    items: Array<{
      serviceId: number
      emoji: string
      quantity: number
      rate: number
      toman: number
      providerOrderId?: string | null
    }>
  } | null
  channelViewOrder: {
    postLink: string
    postUsername: string
    postMessageId: number
    postTitle: string
    postPreview: string | null
    postPhoto: string | null
    serviceId: number
    quantity: number
    rate: number
    toman: number
    providerOrderId: string | null
  } | null
  telegramMemberOrder: {
    channelLink: string
    channelUsername: string
    channelTitle: string
    channelPhoto: string | null
    channelSubscribers: string | null
    serviceId: number
    quantity: number
    rate: number
    toman: number
    providerOrderId: string | null
  } | null
  createdAt: string
  fulfilledAt: string | null
  failedAt: string | null
}

export interface MyOrdersPayload {
  version: string
  cachedAt: string
  items: ShopOrder[]
}

export interface MyOrdersSyncPayload extends MyOrdersPayload {
  changed: boolean
}

const STORAGE_KEY = 'numberstar:my-orders:v1'

export function readLocalMyOrders(): MyOrdersPayload | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as MyOrdersPayload
    if (!parsed?.version || !Array.isArray(parsed.items)) return null
    return parsed
  } catch {
    return null
  }
}

export function writeLocalMyOrders(payload: MyOrdersPayload): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
}

export function fetchOrder(orderId: string) {
  return apiFetch<{ order: ShopOrder }>(`/api/orders/${encodeURIComponent(orderId)}`)
}

export function fetchMyOrders() {
  return apiFetch<MyOrdersPayload>('/api/orders/me')
}

export function syncMyOrders(version?: string) {
  return apiFetch<MyOrdersSyncPayload>('/api/orders/me/sync', {
    method: 'POST',
    body: JSON.stringify(version ? { version } : {}),
  })
}

export function isVirtualNumberOrder(order: ShopOrder): boolean {
  return order.category.slug === 'virtual-number' || Boolean(order.virtualNumber)
}

export function filterShopOrders(orders: ShopOrder[]): ShopOrder[] {
  return orders.filter((order) => !isVirtualNumberOrder(order))
}

export function filterVirtualNumberOrders(orders: ShopOrder[]): ShopOrder[] {
  return orders.filter(isVirtualNumberOrder)
}
