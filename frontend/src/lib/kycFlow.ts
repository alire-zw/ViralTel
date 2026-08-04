import type {
  KycConfirmState,
  KycProduct,
  KycResumeState,
} from '../types/kycFlow'
import type { PremiumMonths } from '../types/premium'

const PREMIUM_MONTHS: PremiumMonths[] = [3, 6, 12]

export function getKycCatalogPath(product: KycProduct): string {
  switch (product) {
    case 'stars':
      return '/stars'
    case 'premium':
      return '/premium'
    case 'virtual-number':
      return '/virtual-number'
    case 'reaction':
      return '/reaction'
    case 'channel-views':
      return '/channel-views'
    case 'telegram-members':
      return '/telegram-members'
    case 'wallet-charge':
      return '/wallet/charge'
  }
}

export function getKycConfirmPath(product: KycProduct): string {
  if (product === 'wallet-charge') return '/wallet/charge/payment'
  return `${getKycCatalogPath(product)}/confirm`
}

export function isValidKycResumeState(state: unknown): state is KycResumeState {
  if (!state || typeof state !== 'object') return false
  const value = state as Record<string, unknown>

  if (value.method !== 'wallet' && value.method !== 'zibal') return false
  if (!Number.isFinite(value.toman) || (value.toman as number) <= 0) return false

  switch (value.product) {
    case 'stars': {
      const recipient = value.recipient as { username?: string } | null
      return Boolean(recipient?.username) && Number.isFinite(value.stars) && (value.stars as number) > 0
    }
    case 'premium': {
      const recipient = value.recipient as { username?: string } | null
      return (
        Boolean(recipient?.username) &&
        PREMIUM_MONTHS.includes(value.months as PremiumMonths)
      )
    }
    case 'virtual-number':
      return (
        typeof value.countryId === 'string' &&
        value.countryId.length > 0 &&
        (value.quality === 'premium' ||
          value.quality === 'standard' ||
          value.quality === 'economy')
      )
    case 'reaction': {
      const post = value.post as { link?: string } | null
      return Boolean(post?.link) && Array.isArray(value.reactions) && value.reactions.length > 0
    }
    case 'channel-views': {
      const post = value.post as { link?: string } | null
      return (
        Boolean(post?.link) &&
        Number.isFinite(value.quantity) &&
        (value.quantity as number) > 0 &&
        Number.isFinite(value.serviceId)
      )
    }
    case 'telegram-members': {
      const channel = value.channel as { username?: string } | null
      const service = value.service as { serviceId?: number } | null
      return (
        Boolean(channel?.username) &&
        Number.isFinite(service?.serviceId) &&
        Number.isFinite(value.quantity) &&
        (value.quantity as number) > 0
      )
    }
    case 'wallet-charge':
      return (
        value.method === 'zibal' &&
        Number.isFinite(value.amount) &&
        (value.amount as number) > 0
      )
    default:
      return false
  }
}

export function toKycConfirmState(state: KycResumeState): KycConfirmState {
  switch (state.product) {
    case 'stars':
      return {
        recipient: state.recipient,
        stars: state.stars,
        ton: state.ton,
        gram: state.gram,
        toman: state.toman,
      }
    case 'premium':
      return {
        recipient: state.recipient,
        months: state.months,
        ton: state.ton,
        gram: state.gram,
        toman: state.toman,
      }
    case 'virtual-number':
      return {
        countryId: state.countryId,
        country: state.country,
        flagCode: state.flagCode,
        quality: state.quality,
        toman: state.toman,
      }
    case 'reaction':
      return {
        post: state.post,
        reactions: state.reactions,
        toman: state.toman,
      }
    case 'channel-views':
      return {
        post: state.post,
        quantity: state.quantity,
        rate: state.rate,
        serviceId: state.serviceId,
        toman: state.toman,
      }
    case 'telegram-members':
      return {
        channel: state.channel,
        service: state.service,
        quantity: state.quantity,
        toman: state.toman,
      }
    case 'wallet-charge':
      return {
        amount: state.amount,
      }
  }
}

export function toKycEditRestoreState(state: KycResumeState): unknown {
  switch (state.product) {
    case 'stars':
      return {
        recipient: state.recipient,
        customAmount: String(state.stars),
      }
    case 'premium':
      return {
        recipient: state.recipient,
        months: state.months,
      }
    case 'virtual-number':
      return {
        countryId: state.countryId,
        quality: state.quality,
      }
    case 'reaction': {
      const selectedCounts: Record<number, number> = {}
      for (const item of state.reactions) {
        selectedCounts[item.serviceId] = item.quantity
      }
      return {
        post: state.post,
        selectedCounts,
      }
    }
    case 'channel-views':
      return {
        post: state.post,
        quantity: String(state.quantity),
      }
    case 'telegram-members':
      return {
        channel: state.channel,
        serviceId: state.service.serviceId,
        quantity: String(state.quantity),
      }
    case 'wallet-charge':
      return {
        amount: state.amount,
      }
  }
}
