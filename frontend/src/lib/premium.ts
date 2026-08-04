import { apiFetch } from './api'
import type { StarsRecipient } from './stars'
import type { PremiumMonths, PremiumPriceQuote } from '../types/premium'

export type { PremiumMonths, PremiumPriceQuote }

export interface PremiumPurchaseRequest {
  username: string
  months: PremiumMonths
  toman: number
  recipientName?: string
  recipientPhoto?: string
  useWalletBalance?: boolean
}

export interface PremiumWalletPurchaseResponse {
  orderId: string
  months: PremiumMonths
  toman: number
  username: string
}

export interface PremiumGatewayPurchaseResponse {
  orderId: string
  paymentUrl?: string
  trackId?: string
  toman: number
  walletAmountToman?: number
  gatewayAmountToman?: number
}

export interface PremiumCryptoPurchaseResponse {
  orderId: string
  cryptoOrderId: string
  toman: number
}

export function getPremiumPrices() {
  return apiFetch<{ items: PremiumPriceQuote[] }>('/api/premium/prices')
}

export function getPremiumPrice(months: PremiumMonths) {
  return apiFetch<PremiumPriceQuote>('/api/premium/price', {
    method: 'POST',
    body: JSON.stringify({ months }),
  })
}

export function searchPremiumRecipient(username: string, months: PremiumMonths) {
  return apiFetch<StarsRecipient>('/api/premium/recipient', {
    method: 'POST',
    body: JSON.stringify({ username, months }),
  })
}

export function purchasePremiumWithWallet(input: PremiumPurchaseRequest) {
  return apiFetch<PremiumWalletPurchaseResponse>('/api/premium/purchase/wallet', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function purchasePremiumWithGateway(input: PremiumPurchaseRequest) {
  return apiFetch<PremiumGatewayPurchaseResponse>('/api/premium/purchase/gateway', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function purchasePremiumWithCrypto(input: PremiumPurchaseRequest) {
  return apiFetch<PremiumCryptoPurchaseResponse>('/api/premium/purchase/crypto', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}
