import { apiFetch } from './api'
import type {
  VirtualNumberCountryGroup,
  VirtualNumberQuality,
} from '../types/virtualNumber'

export function getVirtualNumberCountries() {
  return apiFetch<{ groups: VirtualNumberCountryGroup[]; cached: boolean }>(
    '/api/virtual-number/countries',
  )
}

export interface VirtualNumberPurchaseRequest {
  countryId: string
  country: string
  flagCode: string
  quality: VirtualNumberQuality
  toman: number
  noneReport?: boolean
  useWalletBalance?: boolean
}

export interface VirtualNumberWalletPurchaseResponse {
  orderId: string
  toman: number
  number: string | null
  country: string
  quality: string
}

export interface VirtualNumberGatewayPurchaseResponse {
  orderId: string
  paymentUrl?: string
  trackId?: string
  toman: number
  walletAmountToman?: number
  gatewayAmountToman?: number
}

export function purchaseVirtualNumberWithWallet(input: VirtualNumberPurchaseRequest) {
  return apiFetch<VirtualNumberWalletPurchaseResponse>('/api/virtual-number/purchase/wallet', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function purchaseVirtualNumberWithGateway(input: VirtualNumberPurchaseRequest) {
  return apiFetch<VirtualNumberGatewayPurchaseResponse>('/api/virtual-number/purchase/gateway', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export type VirtualNumberCodeStatus = 'ready' | 'pending' | 'not_received' | 'logged_out'

export type VirtualNumberCodeResponse = {
  status: VirtualNumberCodeStatus
  message: string
  orderId: string
  code: string | null
}

export function fetchVirtualNumberCode(orderId: string) {
  return apiFetch<VirtualNumberCodeResponse>(
    `/api/virtual-number/orders/${encodeURIComponent(orderId)}/code`,
    {
      method: 'POST',
      body: JSON.stringify({}),
    },
  )
}

export type VirtualNumberLogoutStatus = 'logged_out' | 'pending' | 'not_received' | 'failed'

export type VirtualNumberLogoutResponse = {
  status: VirtualNumberLogoutStatus
  message: string
  orderId: string
  loggedOutAt: string | null
}

export function logoutVirtualNumberAccount(orderId: string) {
  return apiFetch<VirtualNumberLogoutResponse>(
    `/api/virtual-number/orders/${encodeURIComponent(orderId)}/logout`,
    {
      method: 'POST',
      body: JSON.stringify({}),
    },
  )
}

export function virtualNumberLogoutNotifyType(
  status: VirtualNumberLogoutStatus,
): 'success' | 'info' | 'warning' | 'error' {
  switch (status) {
    case 'logged_out':
      return 'success'
    case 'pending':
      return 'info'
    case 'not_received':
      return 'warning'
    case 'failed':
      return 'error'
    default:
      return 'info'
  }
}

export function virtualNumberCodeNotifyType(
  status: VirtualNumberCodeStatus,
): 'success' | 'info' | 'warning' | 'error' {
  switch (status) {
    case 'ready':
      return 'success'
    case 'pending':
      return 'info'
    case 'not_received':
      return 'warning'
    case 'logged_out':
      return 'error'
    default:
      return 'info'
  }
}

export function virtualNumberCodeButtonLabel(
  status: VirtualNumberCodeStatus | null,
  busy: boolean,
  hasCode: boolean,
): string {
  if (busy) return 'در انتظار کد...'
  switch (status) {
    case 'pending':
      return 'در انتظار کد'
    case 'not_received':
      return 'کد دریافت نشده'
    case 'logged_out':
      return 'لوگ‌اوت'
    case 'ready':
      return 'دریافت مجدد کد'
    default:
      return hasCode ? 'دریافت مجدد کد' : 'دریافت کد'
  }
}

export function splitVirtualNumber(numberRaw: string, rangeRaw?: string | null) {
  const digits = numberRaw.replace(/\D/g, '')
  const range = (rangeRaw ?? '').replace(/\D/g, '')

  if (!digits) {
    return {
      display: numberRaw,
      withPrefix: numberRaw,
      withoutPrefix: numberRaw,
    }
  }

  if (range && digits.startsWith(range) && digits.length > range.length) {
    const local = digits.slice(range.length)
    return {
      display: `+${range} ${local}`,
      withPrefix: `+${range}${local}`,
      withoutPrefix: local,
    }
  }

  return {
    display: `+${digits}`,
    withPrefix: `+${digits}`,
    withoutPrefix: digits,
  }
}
