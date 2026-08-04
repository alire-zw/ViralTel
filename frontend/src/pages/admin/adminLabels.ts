export function formatFaNumber(value: number | string): string {
  const num = typeof value === 'string' ? Number(value) : value
  if (!Number.isFinite(num)) return '۰'
  return Math.floor(num).toLocaleString('fa-IR')
}

export function formatFaDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString('fa-IR', {
    timeZone: 'Asia/Tehran',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/** e.g. ۲۸ فروردین ۱۴۰۵ */
export function formatFaDateLong(iso: string | null | undefined): string {
  if (!iso) return '—'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('fa-IR', {
    timeZone: 'Asia/Tehran',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function formatFaDateTimeLong(iso: string | null | undefined): string {
  if (!iso) return '—'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '—'
  const day = formatFaDateLong(iso)
  const time = date.toLocaleTimeString('fa-IR', {
    timeZone: 'Asia/Tehran',
    hour: '2-digit',
    minute: '2-digit',
  })
  return `${day} · ساعت ${time}`
}

export function orderStatusLabel(status: string): string {
  switch (status) {
    case 'pending':
      return 'در انتظار'
    case 'processing':
      return 'در حال انجام'
    case 'completed':
      return 'موفق'
    case 'failed':
      return 'ناموفق'
    case 'cancelled':
      return 'لغو شده'
    default:
      return status
  }
}

export function orderStatusBadgeClass(status: string): string {
  if (status === 'completed') return 'admin__badge admin__badge--success'
  if (status === 'failed' || status === 'cancelled') {
    return 'admin__badge admin__badge--error'
  }
  if (status === 'pending' || status === 'processing') {
    return 'admin__badge admin__badge--warn'
  }
  return 'admin__badge'
}

export function paymentStatusLabel(status: string): string {
  switch (status) {
    case 'pending':
      return 'در انتظار پرداخت'
    case 'paid':
      return 'پرداخت‌شده'
    case 'verified':
      return 'تأیید شده'
    case 'failed':
      return 'ناموفق'
    default:
      return status
  }
}

export function cryptoStatusLabel(status: string): string {
  switch (status) {
    case 'pending':
      return 'در انتظار واریز'
    case 'completed':
      return 'تکمیل‌شده'
    case 'expired':
      return 'منقضی'
    case 'swept':
      return 'جمع‌آوری‌شده'
    default:
      return status
  }
}

export function paymentMethodLabel(method: string): string {
  switch (method) {
    case 'wallet':
      return 'کیف پول'
    case 'zibal':
      return 'درگاه زیبال'
    case 'tron':
      return 'ترون'
    default:
      return method
  }
}

export function roleLabel(role: string): string {
  switch (role) {
    case 'admin':
      return 'ادمین'
    case 'supervisor':
      return 'سوپروایزر'
    case 'user':
      return 'کاربر'
    default:
      return role
  }
}

export function displayUsername(user: {
  username?: string | null
  firstName?: string | null
  lastName?: string | null
  id?: number
}): string {
  if (user.username) return `@${user.username}`
  const name = [user.firstName, user.lastName].filter(Boolean).join(' ')
  if (name) return name
  if (user.id) return `کاربر ${formatFaNumber(user.id)}`
  return 'کاربر'
}

export function orderTitle(categoryLabel: string, amountToman: string | number): string {
  return `${categoryLabel} · ${formatFaNumber(amountToman)} تومان`
}

export function paymentTitle(orderId: string): string {
  const short = orderId.replace(/^NS-?/i, '').slice(-6)
  const numeric = Number(short.replace(/\D/g, ''))
  if (Number.isFinite(numeric) && numeric > 0) {
    return `پرداخت شماره ${formatFaNumber(numeric)}`
  }
  return `پرداخت ${orderId.slice(-8)}`
}

export function cryptoPaymentTitle(_orderId: string, amountTrx: string | number): string {
  return `ترون · ${formatFaNumber(amountTrx)} TRX`
}

export function transferTitle(amountToman: string | number): string {
  return `انتقال ${formatFaNumber(amountToman)} تومان`
}

export function ticketTitle(ticketCode: string, subject: string): string {
  return `تیکت ${ticketCode} · ${subject}`
}

export function ticketStatusLabel(status: string): string {
  switch (status) {
    case 'open':
      return 'باز'
    case 'answered':
      return 'پاسخ‌داده‌شده'
    case 'closed':
      return 'بسته‌شده'
    default:
      return status
  }
}

export function clubRewardTypeLabel(type: string): string {
  switch (type) {
    case 'percent_discount':
      return 'تخفیف درصدی'
    case 'fixed_discount':
      return 'تخفیف مبلغی'
    case 'free_item':
      return 'آیتم رایگان'
    case 'custom':
      return 'سفارشی'
    default:
      return type
  }
}

export function discountTypeLabel(type: string): string {
  return type === 'percent' ? 'درصدی' : 'مبلغ ثابت'
}
