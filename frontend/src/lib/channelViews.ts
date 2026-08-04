import { apiFetch } from './api'
import type { ReactionPostPreview } from './reaction'

export type ChannelViewsPurchaseRequest = {
  post: {
    username: string
    messageId: number
    link: string
    title: string
    preview?: string
    photo?: string
  }
  serviceId: number
  quantity: number
  rate: number
  toman: number
  useWalletBalance?: boolean
}

export type ChannelViewsWalletPurchaseResponse = {
  orderId: string
  toman: number
  quantity: number
}

export type ChannelViewsGatewayPurchaseResponse = {
  orderId: string
  paymentUrl?: string
  trackId?: string
  toman: number
  quantity: number
  walletAmountToman?: number
  gatewayAmountToman?: number
}

export type { ReactionPostPreview }

export function purchaseChannelViewsWithWallet(input: ChannelViewsPurchaseRequest) {
  return apiFetch<ChannelViewsWalletPurchaseResponse>('/api/channel-views/purchase/wallet', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function purchaseChannelViewsWithGateway(input: ChannelViewsPurchaseRequest) {
  return apiFetch<ChannelViewsGatewayPurchaseResponse>('/api/channel-views/purchase/gateway', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export type AutoChannelViewChannel = {
  id: number
  chatId: string
  username: string
  title: string
  photoUrl: string | null
  isActive: boolean
  randomizeQuantity: boolean
  serviceId: number
  quantity: number
  rate: number
  createdAt: string
  updatedAt: string
}

export type AutoChannelViewsBotInfo = {
  username: string
  deepLink: string
}

export function fetchAutoChannelViewsBotInfo() {
  return apiFetch<AutoChannelViewsBotInfo>('/api/channel-views/auto/bot')
}

export function fetchAutoChannelViewChannels() {
  return apiFetch<{ channels: AutoChannelViewChannel[] }>('/api/channel-views/auto/channels')
}

export function registerAutoChannelViewChannel(link: string) {
  return apiFetch<{ channel: AutoChannelViewChannel }>('/api/channel-views/auto/channels', {
    method: 'POST',
    body: JSON.stringify({ link }),
  })
}

export function configureAutoChannelViewChannel(
  channelId: number,
  input: {
    serviceId: number
    quantity: number
    rate: number
    randomizeQuantity?: boolean
  },
) {
  return apiFetch<{ channel: AutoChannelViewChannel }>(
    `/api/channel-views/auto/channels/${channelId}`,
    {
      method: 'PUT',
      body: JSON.stringify(input),
    },
  )
}

export function deactivateAutoChannelViewChannel(channelId: number) {
  return apiFetch<{ channel: AutoChannelViewChannel }>(
    `/api/channel-views/auto/channels/${channelId}/deactivate`,
    { method: 'POST' },
  )
}

export function deleteAutoChannelViewChannel(channelId: number) {
  return apiFetch<{ ok: boolean }>(`/api/channel-views/auto/channels/${channelId}`, {
    method: 'DELETE',
  })
}
