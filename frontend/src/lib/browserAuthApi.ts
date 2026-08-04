import { apiFetch } from './api'
import type { UserMeResponse } from '../types/user'

export type BrowserAuthStatus = {
  enabled: boolean
  otpLength: number
}

export type BrowserOtpSendResult = {
  phone: string
  expiresInSeconds: number
  resendAvailableInSeconds: number
  alreadySent: boolean
}

export type BrowserOtpVerifyResult = {
  token: string
  expiresAt: string
  expiresInSeconds: number
  user: UserMeResponse['user']
}

export function fetchBrowserAuthStatus() {
  return apiFetch<BrowserAuthStatus>('/api/auth/browser/status')
}

export function sendBrowserLoginOtp(phone: string) {
  return apiFetch<BrowserOtpSendResult>('/api/auth/browser/otp/send', {
    method: 'POST',
    body: JSON.stringify({ phone }),
  })
}

export function verifyBrowserLoginOtp(phone: string, code: string) {
  return apiFetch<BrowserOtpVerifyResult>('/api/auth/browser/otp/verify', {
    method: 'POST',
    body: JSON.stringify({ phone, code }),
  })
}
