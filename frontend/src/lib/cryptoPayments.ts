import { apiFetch } from './api'
import type {
  CreateCryptoPaymentResponse,
  CryptoPaymentOrderResponse,
  CryptoPaymentPrice,
  CryptoPaymentsListResponse,
} from '../types/cryptoPayment'

export function fetchCryptoPrice() {
  return apiFetch<CryptoPaymentPrice>('/api/payments/crypto/price')
}

export function createCryptoPaymentRequest(amount: number) {
  return apiFetch<CreateCryptoPaymentResponse>('/api/payments/crypto/request', {
    method: 'POST',
    body: JSON.stringify({ amount: String(amount) }),
  })
}

export function fetchMyCryptoPayments(page = 1, limit = 20) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  })

  return apiFetch<CryptoPaymentsListResponse>(`/api/payments/crypto/me?${params.toString()}`)
}

export function fetchCryptoPaymentOrder(orderId: string) {
  return apiFetch<CryptoPaymentOrderResponse>(
    `/api/payments/crypto/order/${encodeURIComponent(orderId)}`,
  )
}
