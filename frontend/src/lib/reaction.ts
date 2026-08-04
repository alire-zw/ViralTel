import { apiFetch } from './api'

export type ReactionPostMediaType =
  | 'text'
  | 'photo'
  | 'video'
  | 'animation'
  | 'sticker'
  | 'audio'
  | 'voice'
  | 'document'
  | 'poll'
  | 'location'
  | 'contact'
  | 'unknown'

export type ReactionPostPreview = {
  username: string
  messageId: number
  link: string
  title: string
  text: string
  photo: string
  mediaType: ReactionPostMediaType
  preview: string
}

export type ReactionPurchaseRequest = {
  post: {
    username: string
    messageId: number
    link: string
    title: string
    preview?: string
    photo?: string
  }
  reactions: Array<{
    serviceId: number
    emoji: string
    quantity: number
    rate: number
  }>
  toman: number
  useWalletBalance?: boolean
}

export type ReactionWalletPurchaseResponse = {
  orderId: string
  toman: number
  quantity: number
}

export type ReactionGatewayPurchaseResponse = {
  orderId: string
  paymentUrl?: string
  trackId?: string
  toman: number
  quantity: number
  walletAmountToman?: number
  gatewayAmountToman?: number
}

export function fetchReactionPostPreview(link: string) {
  return apiFetch<ReactionPostPreview>('/api/reaction/post-preview', {
    method: 'POST',
    body: JSON.stringify({ link }),
  })
}

export function purchaseReactionWithWallet(input: ReactionPurchaseRequest) {
  return apiFetch<ReactionWalletPurchaseResponse>('/api/reaction/purchase/wallet', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function purchaseReactionWithGateway(input: ReactionPurchaseRequest) {
  return apiFetch<ReactionGatewayPurchaseResponse>('/api/reaction/purchase/gateway', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export type AutoReactionItem = {
  serviceId: number
  emoji: string
  quantity: number
  rate: number
}

export type AutoReactionChannel = {
  id: number
  chatId: string
  username: string
  title: string
  photoUrl: string | null
  isActive: boolean
  randomizeQuantity: boolean
  reactions: AutoReactionItem[]
  createdAt: string
  updatedAt: string
}

export type AutoReactionBotInfo = {
  username: string
  deepLink: string
}

export function fetchAutoReactionBotInfo() {
  return apiFetch<AutoReactionBotInfo>('/api/reaction/auto/bot')
}

export function fetchAutoReactionChannels() {
  return apiFetch<{ channels: AutoReactionChannel[] }>('/api/reaction/auto/channels')
}

export function registerAutoReactionChannel(link: string) {
  return apiFetch<{ channel: AutoReactionChannel }>('/api/reaction/auto/channels', {
    method: 'POST',
    body: JSON.stringify({ link }),
  })
}

export function configureAutoReactionChannel(
  channelId: number,
  reactions: AutoReactionItem[],
  randomizeQuantity = false,
) {
  return apiFetch<{ channel: AutoReactionChannel }>(
    `/api/reaction/auto/channels/${channelId}`,
    {
      method: 'PUT',
      body: JSON.stringify({ reactions, randomizeQuantity }),
    },
  )
}

export function deactivateAutoReactionChannel(channelId: number) {
  return apiFetch<{ channel: AutoReactionChannel }>(
    `/api/reaction/auto/channels/${channelId}/deactivate`,
    { method: 'POST' },
  )
}

export function deleteAutoReactionChannel(channelId: number) {
  return apiFetch<{ ok: boolean }>(`/api/reaction/auto/channels/${channelId}`, {
    method: 'DELETE',
  })
}
