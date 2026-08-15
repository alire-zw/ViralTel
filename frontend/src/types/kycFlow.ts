import type { ChannelViewsConfirmState } from './channelViews'
import type { AccountShopCategoryId } from '../lib/chatgpt'
import type { AccountShopProduct } from '../lib/chatgpt'
import type { PremiumConfirmState } from './premium'
import type { ReactionConfirmState } from './reaction'
import type { StarsConfirmState, StarsPaymentMethod } from './stars'
import type { TelegramMembersConfirmState } from './telegramMembers'
import type { VirtualNumberConfirmState } from './virtualNumber'
import type { WalletChargeAmountState } from './wallet'
import type { AccountShopConfirmState } from './accountShop'

export type KycPaymentMethod = StarsPaymentMethod

export type KycProduct =
  | 'stars'
  | 'premium'
  | 'virtual-number'
  | 'reaction'
  | 'channel-views'
  | 'telegram-members'
  | 'account-shop'
  | 'wallet-charge'

export type AccountShopKycState = {
  categoryId: AccountShopCategoryId
  categoryLabel: string
  categoryImageSrc: string | null
  plan: AccountShopProduct
  fieldValues: Record<string, string>
  toman: number
}

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
    | ({ product: 'account-shop' } & AccountShopKycState)
    | ({ product: 'wallet-charge' } & WalletChargeKycState)
  )

export type KycConfirmState =
  | StarsConfirmState
  | PremiumConfirmState
  | VirtualNumberConfirmState
  | ReactionConfirmState
  | ChannelViewsConfirmState
  | TelegramMembersConfirmState
  | AccountShopConfirmState
  | WalletChargeAmountState
