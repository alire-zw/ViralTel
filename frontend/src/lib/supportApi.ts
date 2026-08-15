import { apiFetch } from './api'

export type SupportCategory = 'sales' | 'product' | 'kyc' | 'wallet' | 'other'
export type SupportTicketStatus = 'open' | 'answered' | 'closed'

export type SupportTicketMessage = {
  id: number
  senderRole: string
  body: string
  imageData: string | null
  createdAt: string
}

export type SupportTicketSummary = {
  id: number
  ticketCode: string
  category: SupportCategory
  categoryLabel: string
  orderId: string | null
  subject: string
  status: SupportTicketStatus
  createdAt: string
  updatedAt: string
  lastMessage: { senderRole: string; body: string; createdAt: string } | null
}

export type SupportTicketDetail = SupportTicketSummary & {
  order: {
    orderId: string
    status: string
    amountToman: string
    category: { slug: string; label: string }
  } | null
  messages: SupportTicketMessage[]
}

export type SupportOrderItem = {
  orderId: string
  status: string
  amountToman: string
  category: { slug: string; label: string }
  createdAt: string
}

export type SupportTicketsPayload = {
  version: string
  cachedAt: string
  items: SupportTicketSummary[]
}

export type SupportTicketsSyncPayload = SupportTicketsPayload & {
  changed: boolean
}

export type SupportTicketDetailPayload = {
  version: string
  cachedAt: string
  ticket: SupportTicketDetail
}

export type SupportTicketDetailSyncPayload = SupportTicketDetailPayload & {
  changed: boolean
}

export const SUPPORT_CATEGORIES: Array<{
  value: SupportCategory
  label: string
  hint: string
  suggestOrder: boolean
}> = [
  {
    value: 'sales',
    label: 'واحد فروش',
    hint: 'خرید، قیمت و مشاوره قبل از سفارش',
    suggestOrder: true,
  },
  {
    value: 'product',
    label: 'پشتیبانی محصول',
    hint: 'مشکل در تحویل یا کیفیت سرویس',
    suggestOrder: true,
  },
  {
    value: 'kyc',
    label: 'احراز هویت',
    hint: 'موبایل، کارت بانکی و مدارک',
    suggestOrder: false,
  },
  {
    value: 'wallet',
    label: 'کیف پول و پرداخت',
    hint: 'شارژ، انتقال و درگاه پرداخت',
    suggestOrder: true,
  },
  {
    value: 'other',
    label: 'سایر',
    hint: 'موضوعات عمومی',
    suggestOrder: false,
  },
]

const PERSIAN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']
const LIST_STORAGE_KEY = 'viraltel:support-tickets:v1'
const DETAIL_STORAGE_PREFIX = 'viraltel:support-ticket:v1:'
const CONTACT_STORAGE_KEY = 'viraltel:support-contact:v1'

export function toFaDigits(value: string | number): string {
  return String(value).replace(/\d/g, (digit) => PERSIAN_DIGITS[Number(digit)] ?? digit)
}

/** Header / list title: تیکت شناسه ۰۰۰۴۲ */
export function supportTicketTitle(ticketCode: string): string {
  const numeric = ticketCode.replace(/^T/i, '')
  return `تیکت شناسه ${toFaDigits(numeric)}`
}

export function readLocalSupportTickets(): SupportTicketsPayload | null {
  try {
    const raw = localStorage.getItem(LIST_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as SupportTicketsPayload
    if (!parsed?.version || !Array.isArray(parsed.items)) return null
    return parsed
  } catch {
    return null
  }
}

export function writeLocalSupportTickets(payload: SupportTicketsPayload): void {
  try {
    localStorage.setItem(LIST_STORAGE_KEY, JSON.stringify(payload))
  } catch {
    // quota / private mode — ignore
  }
}

export function readLocalSupportTicket(ticketCode: string): SupportTicketDetailPayload | null {
  try {
    const raw = localStorage.getItem(DETAIL_STORAGE_PREFIX + ticketCode)
    if (!raw) return null
    const parsed = JSON.parse(raw) as SupportTicketDetailPayload
    if (!parsed?.version || !parsed.ticket?.ticketCode) return null
    return parsed
  } catch {
    return null
  }
}

export function writeLocalSupportTicket(payload: SupportTicketDetailPayload): void {
  try {
    localStorage.setItem(
      DETAIL_STORAGE_PREFIX + payload.ticket.ticketCode,
      JSON.stringify(payload),
    )
  } catch {
    // large images may exceed quota — ignore
  }
}

export function readLocalSupportContact(): {
  telegramUsername: string | null
  telegramUrl: string | null
} | null {
  try {
    const raw = localStorage.getItem(CONTACT_STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as {
      telegramUsername: string | null
      telegramUrl: string | null
    }
  } catch {
    return null
  }
}

export function writeLocalSupportContact(payload: {
  telegramUsername: string | null
  telegramUrl: string | null
}): void {
  localStorage.setItem(CONTACT_STORAGE_KEY, JSON.stringify(payload))
}

export function fetchSupportTickets() {
  return apiFetch<SupportTicketsPayload>('/api/support/tickets')
}

export function syncSupportTickets(version?: string) {
  return apiFetch<SupportTicketsSyncPayload>('/api/support/tickets/sync', {
    method: 'POST',
    body: JSON.stringify(version ? { version } : {}),
  })
}

export function fetchSupportTicket(idOrCode: string) {
  return apiFetch<SupportTicketDetailPayload>(
    `/api/support/tickets/${encodeURIComponent(idOrCode)}`,
  )
}

export function syncSupportTicket(idOrCode: string, version?: string) {
  return apiFetch<SupportTicketDetailSyncPayload>(
    `/api/support/tickets/${encodeURIComponent(idOrCode)}/sync`,
    {
      method: 'POST',
      body: JSON.stringify(version ? { version } : {}),
    },
  )
}

export function createSupportTicket(body: {
  category: SupportCategory
  body?: string
  orderId?: string
  imageData?: string
}) {
  return apiFetch<SupportTicketDetailPayload>('/api/support/tickets', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function replySupportTicket(
  idOrCode: string,
  body: { body?: string; imageData?: string },
) {
  return apiFetch<SupportTicketDetailPayload>(
    `/api/support/tickets/${encodeURIComponent(idOrCode)}/messages`,
    {
      method: 'POST',
      body: JSON.stringify(body),
    },
  )
}

export function fetchSupportOrders() {
  return apiFetch<{ items: SupportOrderItem[] }>('/api/support/orders')
}

export function fetchSupportContact() {
  return apiFetch<{ telegramUsername: string | null; telegramUrl: string | null }>(
    '/api/support/contact',
  )
}

export function supportStatusLabel(status: SupportTicketStatus | string): string {
  switch (status) {
    case 'open':
      return 'باز'
    case 'answered':
      return 'پاسخ داده شد'
    case 'closed':
      return 'بسته'
    default:
      return status
  }
}

/** Compress image to JPEG data URL for ticket attachment. */
export async function compressSupportImage(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('فقط تصویر مجاز است')
  }
  if (file.size > 8 * 1024 * 1024) {
    throw new Error('حجم تصویر زیاد است')
  }

  const bitmap = await createImageBitmap(file)
  const maxSide = 1280
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height))
  const width = Math.max(1, Math.round(bitmap.width * scale))
  const height = Math.max(1, Math.round(bitmap.height * scale))
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('فشرده‌سازی ناموفق بود')
  ctx.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()

  let quality = 0.82
  let dataUrl = canvas.toDataURL('image/jpeg', quality)
  while (dataUrl.length > 700_000 && quality > 0.45) {
    quality -= 0.1
    dataUrl = canvas.toDataURL('image/jpeg', quality)
  }
  if (dataUrl.length > 850_000) {
    throw new Error('تصویر بعد از فشرده‌سازی هنوز بزرگ است')
  }
  return dataUrl
}
