import { apiFetch } from './api'

export type StarsRecipient = {
  photo: string
  name: string
  username: string
}

export type StarsPrice = {
  quantity: number
  ton: number
  gram: number
  toman: number
}

export type StarsGiveawayPriceItem = {
  ton: number
  gram: number
  stars: number
  boosts: number
}

export type StarsTransactionMessage = {
  address: string
  amount: string
  payload: string | null
  stateInit?: string | null
}

export type StarsBuyResponse = {
  transaction: {
    validUntil: number
    messages: StarsTransactionMessage[]
  }
}

export function searchStarsRecipient(username: string) {
  return apiFetch<StarsRecipient>('/api/stars/recipient', {
    method: 'POST',
    body: JSON.stringify({ username }),
  })
}

export function getStarsPrice(quantity: number) {
  return apiFetch<StarsPrice>('/api/stars/price', {
    method: 'POST',
    body: JSON.stringify({ quantity }),
  })
}

export type StarsPaymentMethod = 'wallet' | 'zibal'

export interface StarsPurchaseRequest {
  username: string
  quantity: number
  toman: number
  recipientName?: string
  recipientPhoto?: string
  useWalletBalance?: boolean
}

export interface StarsWalletPurchaseResponse {
  orderId: string
  stars: number
  toman: number
  username: string
}

export interface StarsGatewayPurchaseResponse {
  orderId: string
  paymentUrl?: string
  trackId?: string
  toman: number
  walletAmountToman?: number
  gatewayAmountToman?: number
  stars?: number
  username?: string
}

export function purchaseStarsWithWallet(input: StarsPurchaseRequest) {
  return apiFetch<StarsWalletPurchaseResponse>('/api/stars/purchase/wallet', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function purchaseStarsWithGateway(input: StarsPurchaseRequest) {
  return apiFetch<StarsGatewayPurchaseResponse>('/api/stars/purchase/gateway', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function buyStars(input: {
  username: string
  quantity: number
  currency?: 'GRAM' | 'TON' | 'USDT'
}) {
  return apiFetch<StarsBuyResponse>('/api/stars/buy', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function getStarsGiveawayPrice() {
  return apiFetch<{ items: StarsGiveawayPriceItem[] }>('/api/stars/giveaway/price', {
    method: 'POST',
  })
}

export function searchStarsGiveawayRecipient(username: string) {
  return apiFetch<StarsRecipient>('/api/stars/giveaway/recipient', {
    method: 'POST',
    body: JSON.stringify({ username }),
  })
}

export function buyStarsGiveaway(input: {
  username: string
  quantity: number
  stars: number
}) {
  return apiFetch<StarsBuyResponse>('/api/stars/giveaway/buy', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}
