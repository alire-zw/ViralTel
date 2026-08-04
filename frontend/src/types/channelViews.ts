import type { ReactionPostPreview } from '../lib/reaction'
import { CHANNEL_VIEW_SERVICE } from '../data/channelViews'

export type ChannelViewsPaymentMethod = 'wallet' | 'zibal'

export type ChannelViewsConfirmState = {
  post: ReactionPostPreview
  quantity: number
  rate: number
  serviceId: number
  toman: number
}

export type ChannelViewsPageRestoreState = {
  post?: ReactionPostPreview
  quantity?: string
}

/** Power-Tel rate is per 1000 units */
export function calcChannelViewsToman(
  quantity: number,
  rate: number = CHANNEL_VIEW_SERVICE.rate,
): number {
  if (!Number.isFinite(quantity) || quantity <= 0) return 0
  if (!Number.isFinite(rate) || rate <= 0) return 0
  return Math.ceil((quantity / 1000) * rate)
}
