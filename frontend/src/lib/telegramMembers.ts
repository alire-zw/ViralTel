import { apiFetch } from './api'
import type { TelegramMembersChannelPreview } from '../types/telegramMembers'

export function fetchTelegramMembersChannelPreview(link: string) {
  return apiFetch<TelegramMembersChannelPreview>('/api/telegram-members/channel-preview', {
    method: 'POST',
    body: JSON.stringify({ link }),
  })
}

export type TelegramMembersPurchaseRequest = {
  channel: {
    username: string
    link: string
    title: string
    photo?: string
    subscribers?: string
  }
  serviceId: number
  quantity: number
  rate: number
  toman: number
  useWalletBalance?: boolean
}

export type TelegramMembersWalletPurchaseResponse = {
  orderId: string
  toman: number
  quantity: number
}

export type TelegramMembersGatewayPurchaseResponse = {
  orderId: string
  paymentUrl?: string
  trackId?: string
  toman: number
  quantity: number
  walletAmountToman?: number
  gatewayAmountToman?: number
}

export function purchaseTelegramMembersWithWallet(input: TelegramMembersPurchaseRequest) {
  return apiFetch<TelegramMembersWalletPurchaseResponse>(
    '/api/telegram-members/purchase/wallet',
    {
      method: 'POST',
      body: JSON.stringify(input),
    },
  )
}

export function purchaseTelegramMembersWithGateway(input: TelegramMembersPurchaseRequest) {
  return apiFetch<TelegramMembersGatewayPurchaseResponse>(
    '/api/telegram-members/purchase/gateway',
    {
      method: 'POST',
      body: JSON.stringify(input),
    },
  )
}
