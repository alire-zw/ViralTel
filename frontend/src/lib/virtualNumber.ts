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

export type VirtualNumberCodeResponse =
  | {
      status: 'ready'
      code: string
      orderId: string
    }
  | {
      status: 'pending'
      message: string
      orderId: string
    }

export function fetchVirtualNumberCode(orderId: string) {
  return apiFetch<VirtualNumberCodeResponse>(
    `/api/virtual-number/orders/${encodeURIComponent(orderId)}/code`,
    { method: 'POST' },
  )
}
