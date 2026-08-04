import { apiFetch } from './api'

export type BankCardRecord = {
  id: number
  cardNumber: string
  bankName: string | null
  bankSlug: string | null
  bankBin: string | null
  isPrimary: boolean
  isVerified: boolean
  matchedAt: string | null
  createdAt: string
  updatedAt: string
}

export function listBankCards() {
  return apiFetch<{ cards: BankCardRecord[] }>('/api/cards')
}

export function addBankCard(input: {
  cardNumber: string
  bankName?: string
  bankSlug?: string
  bankBin?: string
}) {
  return apiFetch<{ card: BankCardRecord }>('/api/cards', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}
