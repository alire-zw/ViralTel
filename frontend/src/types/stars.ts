import type { StarsRecipient } from '../lib/stars'
import type { KycResumeState } from './kycFlow'

export type StarsPaymentMethod = 'wallet' | 'zibal'

export interface StarsConfirmState {
  recipient: StarsRecipient
  stars: number
  ton: number
  gram: number
  toman: number
}

/** @deprecated Prefer KycResumeState with product: 'stars' */
export type StarsKycPhoneState = Extract<KycResumeState, { product: 'stars' }>

export interface StarsPageRestoreState {
  recipient?: StarsRecipient
  customAmount?: string
}
