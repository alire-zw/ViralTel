export const MAX_AMOUNT_DIGITS = 12
export const CHARGE_MIN_TOMAN = 5_000
export const CHARGE_MAX_TOMAN = 5_000_000

export function formatAmountFa(digits: string): string {
  if (!digits) return '۰'
  const value = Number.parseInt(digits, 10)
  if (!Number.isFinite(value)) return '۰'
  return value.toLocaleString('fa-IR')
}

export function parseAmountDigits(digits: string): number {
  if (!digits) return 0
  const value = Number.parseInt(digits, 10)
  return Number.isFinite(value) && value > 0 ? value : 0
}

export function isChargeAmountValid(amount: number): boolean {
  return amount >= CHARGE_MIN_TOMAN && amount <= CHARGE_MAX_TOMAN
}

export function getChargeAmountError(amount: number, hasInput: boolean): string | null {
  if (!hasInput || amount <= 0) return null
  if (amount < CHARGE_MIN_TOMAN) {
    return `حداقل مبلغ پرداخت ${CHARGE_MIN_TOMAN.toLocaleString('fa-IR')} تومان است`
  }
  if (amount > CHARGE_MAX_TOMAN) {
    return `حداکثر مبلغ پرداخت ${CHARGE_MAX_TOMAN.toLocaleString('fa-IR')} تومان است`
  }
  return null
}

export function isTransferAmountValid(amount: number, balance?: number): boolean {
  if (amount <= 0) return false
  if (balance !== undefined && amount > balance) return false
  return true
}

export function getTransferAmountError(
  amount: number,
  hasInput: boolean,
  balance?: number,
): string | null {
  if (!hasInput || amount <= 0) return null
  if (balance !== undefined && amount > balance) {
    return 'موجودی کیف پول شما کافی نیست'
  }
  return null
}

export function appendAmountDigit(current: string, digit: string): string {
  if (!/^\d$/.test(digit) || current.length >= MAX_AMOUNT_DIGITS) {
    return current
  }

  if (current === '0') {
    return digit
  }

  return current + digit
}

export function removeLastAmountDigit(current: string): string {
  return current.slice(0, -1)
}

const PERSIAN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']

export function toPersianDigit(digit: string): string {
  const index = Number.parseInt(digit, 10)
  return Number.isFinite(index) ? (PERSIAN_DIGITS[index] ?? digit) : digit
}
