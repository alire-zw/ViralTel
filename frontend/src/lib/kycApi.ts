import { apiFetch } from './api'
import type { UserMeResponse } from '../types/user'

export type SendPhoneOtpResponse = {
  phone: string
  expiresInSeconds: number
  resendAvailableInSeconds: number
  alreadySent?: boolean
}

export type PhoneOtpStatusResponse = {
  hasPendingOtp: boolean
  resendAvailableInSeconds: number
}

export type SaveKycCardResponse = {
  card: {
    id: number
    cardNumber: string
    bankName: string | null
    bankSlug: string | null
    bankBin: string | null
    isPrimary: boolean
    isVerified: boolean
  }
}

export type KycMatchResponse = {
  matched: boolean
  cached: boolean
  user: UserMeResponse['user']
}

export function sendKycPhoneOtp(phone: string) {
  return apiFetch<SendPhoneOtpResponse>('/api/kyc/phone/send', {
    method: 'POST',
    body: JSON.stringify({ phone }),
  })
}

export function verifyKycPhoneOtp(phone: string, code: string) {
  return apiFetch<UserMeResponse>('/api/kyc/phone/verify', {
    method: 'POST',
    body: JSON.stringify({ phone, code }),
  })
}

export function completeKycIdentity(body: { nationalId: string; birthDate: string }) {
  return apiFetch<UserMeResponse>('/api/kyc/identity', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function saveKycCard(body: {
  cardNumber: string
  bankName?: string
  bankSlug?: string
  bankBin?: string
}) {
  return apiFetch<SaveKycCardResponse>('/api/kyc/card', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function acceptKycTerms() {
  return apiFetch<UserMeResponse>('/api/kyc/terms/accept', {
    method: 'POST',
    body: JSON.stringify({}),
  })
}

export function verifyKycShahkar() {
  return apiFetch<KycMatchResponse>('/api/kyc/verify/shahkar', {
    method: 'POST',
    body: JSON.stringify({}),
  })
}

export function verifyKycCardMatch(cardNumber?: string) {
  return apiFetch<KycMatchResponse>('/api/kyc/verify/card', {
    method: 'POST',
    body: JSON.stringify(cardNumber ? { cardNumber } : {}),
  })
}

export function fetchKycPhoneOtpStatus() {
  return apiFetch<PhoneOtpStatusResponse>('/api/kyc/phone/status')
}
