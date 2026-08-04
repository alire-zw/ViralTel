import type { StarsRecipient } from '../lib/stars'

export type PremiumMonths = 3 | 6 | 12

export type PremiumPaymentMethod = 'wallet' | 'zibal'

export interface PremiumPriceQuote {
  months: PremiumMonths
  ton: number
  gram: number
  toman: number
}

export interface PremiumConfirmState {
  recipient: StarsRecipient
  months: PremiumMonths
  ton: number
  gram: number
  toman: number
}

export interface PremiumPageRestoreState {
  recipient?: StarsRecipient
  months?: PremiumMonths
}

export const PREMIUM_PLAN_LABELS: Record<PremiumMonths, string> = {
  3: '۳ ماهه',
  6: '۶ ماهه',
  12: '۱۲ ماهه',
}

export const PREMIUM_MONTHS: PremiumMonths[] = [3, 6, 12]
