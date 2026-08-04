import { apiFetch } from './api'
import type {
  CreatePaymentResponse,
  PaymentOrderResponse,
  PaymentsListResponse,
  VerifyPaymentResponse,
} from '../types/payment'

export function createPaymentRequest(amount: number, description?: string) {
  return apiFetch<CreatePaymentResponse>('/api/payments/request', {
    method: 'POST',
    body: JSON.stringify({
      amount: String(amount),
      ...(description ? { description } : {}),
    }),
  })
}

export function fetchMyPayments(page = 1, limit = 20) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  })

  return apiFetch<PaymentsListResponse>(`/api/payments/me?${params.toString()}`)
}

export function fetchPaymentOrder(orderId: string) {
  return apiFetch<PaymentOrderResponse>(`/api/payments/order/${encodeURIComponent(orderId)}`)
}

export function verifyPayment(trackId: string) {
  return apiFetch<VerifyPaymentResponse>('/api/payments/verify', {
    method: 'POST',
    body: JSON.stringify({ trackId }),
  })
}

export function openPaymentUrl(url: string) {
  const tg = window.Telegram?.WebApp

  if (tg?.openLink) {
    tg.openLink(url)
    return
  }

  window.location.assign(url)
}
