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

export function fetchOrder(orderId: string) {
  return apiFetch<{ order: ShopOrder }>(`/api/orders/${encodeURIComponent(orderId)}`)
}
