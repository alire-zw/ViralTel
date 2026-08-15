import { apiFetch } from './api'
import type { WalletTransaction } from '../types/wallet'

export interface WalletTransactionsPayload {
  version: string
  cachedAt: string
  items: WalletTransaction[]
}

export interface WalletTransactionsSyncPayload extends WalletTransactionsPayload {
  changed: boolean
}

const STORAGE_KEY = 'viraltel:wallet-transactions:v3'

export function readLocalWalletTransactions(): WalletTransactionsPayload | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as WalletTransactionsPayload
    if (!parsed?.version || !Array.isArray(parsed.items)) return null
    return parsed
  } catch {
    return null
  }
}

export function writeLocalWalletTransactions(payload: WalletTransactionsPayload): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
}

export function fetchWalletTransactions() {
  return apiFetch<WalletTransactionsPayload>('/api/wallet/transactions')
}

export function syncWalletTransactions(version?: string) {
  return apiFetch<WalletTransactionsSyncPayload>('/api/wallet/transactions/sync', {
    method: 'POST',
    body: JSON.stringify(version ? { version } : {}),
  })
}
