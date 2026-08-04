import type { TransferRecipient } from '../types/transfer'

const STORAGE_KEY = 'numberstar:transfer-recipients'
const MAX_RECENT_RECIPIENTS = 20

function readRecipients(): TransferRecipient[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as TransferRecipient[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeRecipients(recipients: TransferRecipient[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(recipients))
}

export function getRecentTransferRecipients(): TransferRecipient[] {
  return readRecipients()
}

export function saveRecentTransferRecipient(recipient: TransferRecipient): void {
  const normalized: TransferRecipient = {
    telegramId: recipient.telegramId,
    firstName: recipient.firstName,
    lastName: recipient.lastName,
    username: recipient.username,
    phoneNumber: recipient.phoneNumber,
  }

  const next = [
    normalized,
    ...readRecipients().filter((item) => item.telegramId !== normalized.telegramId),
  ].slice(0, MAX_RECENT_RECIPIENTS)

  writeRecipients(next)
}

export function formatTransferRecipientName(recipient: TransferRecipient): string {
  const fullName = [recipient.firstName, recipient.lastName].filter(Boolean).join(' ').trim()
  if (fullName) return fullName
  if (recipient.username) return recipient.username
  return 'کاربر'
}

export function formatTransferRecipientHandle(recipient: TransferRecipient): string | null {
  if (recipient.username) return `@${recipient.username}`
  if (recipient.phoneNumber) return recipient.phoneNumber
  return null
}

export function formatTransferRecipientTelegramId(telegramId: number): string {
  return String(telegramId)
}

export function getTransferRecipientInitials(recipient: TransferRecipient): string {
  const first = recipient.firstName?.trim().charAt(0)
  const last = recipient.lastName?.trim().charAt(0)
  if (first && last) return `${first}${last}`.toUpperCase()
  if (first) return first.toUpperCase()
  if (recipient.username) return recipient.username.charAt(0).toUpperCase()
  return '؟'
}

export function formatTransferRecipientMeta(recipient: TransferRecipient): string {
  const handle = formatTransferRecipientHandle(recipient)
  if (handle) return handle
  return `شناسه ${formatTransferRecipientTelegramId(recipient.telegramId)}`
}

export function filterTransferRecipients(
  recipients: TransferRecipient[],
  query: string,
): TransferRecipient[] {
  const normalizedQuery = query.trim().toLowerCase()
  if (!normalizedQuery) return recipients

  return recipients.filter((recipient) => {
    const haystack = [
      recipient.firstName,
      recipient.lastName,
      recipient.username,
      recipient.phoneNumber,
      String(recipient.telegramId),
      formatTransferRecipientName(recipient),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    return haystack.includes(normalizedQuery)
  })
}
