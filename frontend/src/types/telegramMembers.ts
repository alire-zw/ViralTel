import type { TelegramMemberService } from '../data/telegramMembers'
import { TELEGRAM_MEMBER_SERVICES } from '../data/telegramMembers'

export type TelegramMembersChannelPreview = {
  username: string
  link: string
  title: string
  photo: string
  subscribers: string
}

export type TelegramMembersConfirmState = {
  channel: TelegramMembersChannelPreview
  service: TelegramMemberService
  quantity: number
  toman: number
}

export type TelegramMembersPageRestoreState = {
  channel?: TelegramMembersChannelPreview
  serviceId?: number
  quantity?: string
}

/** Power-Tel rate is per 1000 units */
export function calcTelegramMembersToman(quantity: number, rate: number): number {
  if (!Number.isFinite(quantity) || quantity <= 0) return 0
  if (!Number.isFinite(rate) || rate <= 0) return 0
  return Math.ceil((quantity / 1000) * rate)
}

export function findTelegramMemberService(serviceId: number): TelegramMemberService | undefined {
  return TELEGRAM_MEMBER_SERVICES.find((item) => item.serviceId === serviceId)
}
