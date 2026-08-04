import { toPersianDigit } from './amount'

export const IR_MOBILE_LENGTH = 11
export const OTP_CODE_LENGTH = 5

export function appendPhoneDigit(current: string, digit: string): string {
  if (!/^\d$/.test(digit) || current.length >= IR_MOBILE_LENGTH) {
    return current
  }

  return current + digit
}

export function removeLastPhoneDigit(current: string): string {
  return current.slice(0, -1)
}

export function formatPhoneFa(digits: string): string {
  if (!digits) return '۰۹'
  return digits.split('').map(toPersianDigit).join('')
}

export function isValidIrMobile(digits: string): boolean {
  return /^09\d{9}$/.test(digits)
}

export function getPhoneInputError(digits: string): string | null {
  if (!digits || digits.length < IR_MOBILE_LENGTH) return null
  if (!isValidIrMobile(digits)) {
    return 'شماره موبایل باید ۱۱ رقم و با ۰۹ شروع شود'
  }
  return null
}

export function appendOtpDigit(current: string, digit: string): string {
  if (!/^\d$/.test(digit) || current.length >= OTP_CODE_LENGTH) {
    return current
  }
  return current + digit
}

export function removeLastOtpDigit(current: string): string {
  return current.slice(0, -1)
}

export function formatOtpDisplay(digits: string): string {
  if (!digits) return '–––––'
  return digits.split('').map(toPersianDigit).join('')
}

export function maskPhoneFa(phone: string): string {
  if (!isValidIrMobile(phone)) return formatPhoneFa(phone)
  const masked = `${phone.slice(0, 4)}***${phone.slice(7)}`
  return masked.split('').map((ch) => (/^\d$/.test(ch) ? toPersianDigit(ch) : ch)).join('')
}

export function formatCountdownFa(totalSeconds: number): string {
  const seconds = Math.max(0, Math.floor(totalSeconds))
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  const raw = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  return raw
    .split('')
    .map((ch) => (/^\d$/.test(ch) ? toPersianDigit(ch) : ch))
    .join('')
}
