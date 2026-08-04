import type { ReactionPostPreview } from '../lib/reaction'

export type ReactionPaymentMethod = 'wallet' | 'zibal'

export type ReactionSelectedItem = {
  serviceId: number
  emoji: string
  quantity: number
  min: number
  max: number
  rate: number
}

export type ReactionConfirmState = {
  post: ReactionPostPreview
  reactions: ReactionSelectedItem[]
  toman: number
}

export type ReactionPageRestoreState = {
  post?: ReactionPostPreview
  selectedCounts?: Record<number, number>
}

/** Power-Tel rate is per 1000 units */
export function calcReactionItemToman(quantity: number, rate: number): number {
  if (!Number.isFinite(quantity) || quantity <= 0) return 0
  if (!Number.isFinite(rate) || rate <= 0) return 0
  return Math.ceil((quantity / 1000) * rate)
}

export function calcReactionTotalToman(
  reactions: Array<{ quantity: number; rate: number }>,
): number {
  return reactions.reduce(
    (sum, item) => sum + calcReactionItemToman(item.quantity, item.rate),
    0,
  )
}
