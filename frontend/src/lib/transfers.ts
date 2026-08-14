import { apiFetch, getTelegramInitData } from './api'
import type { ContactPickerSession, TransferRecipient, TransferResult } from '../types/transfer'

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? ''

export function searchTransferRecipients(query: string) {
  const params = new URLSearchParams({ q: query.trim() })
  return apiFetch<{ users: TransferRecipient[] }>(
    `/api/transfers/recipients/search?${params.toString()}`,
  ).then((response) => response.users)
}

export function createContactPickerSession() {
  return apiFetch<ContactPickerSession>('/api/transfers/contact-picker', {
    method: 'POST',
  })
}

async function contactPickerFetch<T>(
  path: string,
): Promise<{ ok: true; data: T } | { ok: false; status: number }> {
  const initData = getTelegramInitData()
  const headers = new Headers()

  if (initData) {
    headers.set('X-Telegram-Init-Data', initData)
  }

  const response = await fetch(`${API_BASE}${path}`, { headers })

  if (!response.ok) {
    return { ok: false, status: response.status }
  }

  return { ok: true, data: (await response.json()) as T }
}

export async function fetchContactPickerResult(
  requestId: number,
): Promise<{ users: TransferRecipient[] } | null> {
  const result = await contactPickerFetch<{ users: TransferRecipient[] }>(
    `/api/transfers/contact-picker/${encodeURIComponent(String(requestId))}`,
  )

  if (!result.ok) {
    if (result.status === 404) return null
    if (result.status === 429) {
      throw new Error('تعداد درخواست‌ها بیش از حد مجاز است. لطفاً کمی بعد دوباره تلاش کنید.')
    }
    throw new Error('درخواست ناموفق بود. لطفاً دوباره تلاش کنید.')
  }

  return result.data
}

export function executeTransfer(recipientTelegramId: number, amount: number) {
  return apiFetch<{ transfer: TransferResult }>('/api/transfers/execute', {
    method: 'POST',
    body: JSON.stringify({ recipientTelegramId, amount }),
  }).then((response) => response.transfer)
}

export function fetchTransferOrder(transferId: string) {
  return apiFetch<{ transfer: Omit<TransferResult, 'balanceAfter'> }>(
    `/api/transfers/order/${encodeURIComponent(transferId)}`,
  ).then((response) => response.transfer)
}
