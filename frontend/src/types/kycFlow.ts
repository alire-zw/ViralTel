import type { ChannelViewsConfirmState } from './channelViews'
import type { PremiumConfirmState } from './premium'
import type { ReactionConfirmState } from './reaction'
import type { StarsConfirmState, StarsPaymentMethod } from './stars'
import type { TelegramMembersConfirmState } from './telegramMembers'
import type { VirtualNumberConfirmState } from './virtualNumber'
import type { WalletChargeAmountState } from './wallet'

export type KycPaymentMethod = StarsPaymentMethod

export type KycProduct =
  | 'stars'
  | 'premium'
  | 'virtual-number'
  | 'reaction'
  | 'channel-views'
  | 'telegram-members'
  | 'wallet-charge'

export type KycProgressFields = {
  method: KycPaymentMethod
  phoneDigits?: string
  otpResendSeconds?: number
  phoneJustVerified?: boolean
  identityJustSaved?: boolean
  cardDigits?: string
}

export type WalletChargeKycState = WalletChargeAmountState & {
  /** Same as amount; required by shared KYC resume validation. */
  toman: number
}

export type KycResumeState = KycProgressFields &
  (
    | ({ product: 'stars' } & StarsConfirmState)
    | ({ product: 'premium' } & PremiumConfirmState)
    | ({ product: 'virtual-number' } & VirtualNumberConfirmState)
    | ({ product: 'reaction' } & ReactionConfirmState)
    | ({ product: 'channel-views' } & ChannelViewsConfirmState)
    | ({ product: 'telegram-members' } & TelegramMembersConfirmState)
    | ({ product: 'wallet-charge' } & WalletChargeKycState)
  )

export type KycConfirmState =
  | StarsConfirmState
  | PremiumConfirmState
  | VirtualNumberConfirmState
  | ReactionConfirmState
  | ChannelViewsConfirmState
  | TelegramMembersConfirmState
  | WalletChargeAmountState
