import { apiFetch } from './api'
import type { AppUser, UserRole } from '../types/user'

export type AdminUserSummary = {
  id: number
  telegramId: string
  username: string | null
  firstName: string | null
  lastName: string | null
}

export type AdminOverview = {
  online: {
    onlineCount: number
    peakOnline: number
    persistedOnlineCount: number
    updatedAt: string | null
  }
  productViews: {
    totals: Array<{
      productKey: string
      viewCount: string
      updatedAt: string
    }>
    daily: Array<{
      productKey: string
      day: string
      viewCount: string
    }>
  }
  users: {
    total: number
    banned: number
    kycPending: number
    newToday: number
    newWeek: number
  }
  totals: {
    orders: number
    completedOrders: number
  }
  today: {
    ordersCount: number
    completedCount: number
    completedAmountToman: string
    failedCount: number
    pendingCount: number
    transfersCount: number
    dayStart: string
    salesByCategory: Array<{
      categoryId: number
      slug: string
      label: string
      count: number
      amountToman: string
    }>
  }
  bestSellers: Array<{
    categoryId: number
    slug: string
    label: string
    count: number
    amountToman: string
  }>
  latestOrders: Array<{
    orderId: string
    status: string
    paymentMethod: string
    amountToman: string
    category: { slug: string; label: string }
    user: AdminUserSummary
    createdAt: string
  }>
  charts: {
    weekly: Array<{ day: string; amountToman: string; count: number }>
    monthly: Array<{ day: string; amountToman: string; count: number }>
  }
}

export type AdminOrderListItem = {
  orderId: string
  status: string
  paymentMethod: string
  amountToman: string
  walletAmountToman: string
  gatewayAmountToman: string
  quantity: number | null
  recipientUsername: string | null
  category: { slug: string; label: string }
  user: AdminUserSummary
  createdAt: string
  fulfilledAt: string | null
  failedAt: string | null
}

export type AdminOrdersResponse = {
  items: AdminOrderListItem[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export type AdminOrderDetailResponse = {
  order: {
    orderId: string
    status: string
    paymentMethod: string
    amountToman: string
    walletAmountToman: string
    gatewayAmountToman: string
    quantity: number | null
    recipientUsername: string | null
    recipientName: string | null
    recipientPhoto: string | null
    category: { slug: string; label: string }
    virtualNumber: unknown
    reactionOrder: unknown
    channelViewOrder: unknown
    telegramMemberOrder: unknown
    createdAt: string
    fulfilledAt: string | null
    failedAt: string | null
  }
  user: AdminUserSummary & {
    role: UserRole
    isBanned: boolean
    isActive: boolean
  }
  payment: AdminPaymentListItem | null
  cryptoPayment: {
    orderId: string
    amountToman: string
    amountTrx: string
    status: string
    incomingTxHash: string | null
    verifiedAt: string | null
    expiresAt: string
    createdAt: string
  } | null
}

export type AdminPaymentListItem = {
  id: number
  userId: number
  orderId: string
  amount: string
  amountToman: string
  description: string | null
  trackId: string | null
  refNumber: string | null
  status: string
  cardNumber: string | null
  resultCode: number | null
  verifiedAt: string | null
  expiresAt: string | null
  createdAt: string
  updatedAt: string
  user?: AdminUserSummary
}

export type AdminPaymentsResponse = {
  items: AdminPaymentListItem[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export type AdminCryptoPaymentItem = {
  orderId: string
  amountToman: string
  amountTrx: string
  status: string
  incomingTxHash: string | null
  verifiedAt: string | null
  expiresAt: string
  createdAt: string
  user: AdminUserSummary
}

export type AdminTransferItem = {
  transferId: string
  amountToman: string
  createdAt: string
  sender: AdminUserSummary
  recipient: AdminUserSummary
}

export type AdminUsersResponse = {
  items: AppUser[]
  total: number
  page: number
  limit: number
  totalPages: number
}

function toQuery(params: Record<string, string | number | boolean | undefined>) {
  const query = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === '') continue
    query.set(key, String(value))
  }
  const qs = query.toString()
  return qs ? `?${qs}` : ''
}

export function fetchAdminOverview() {
  return apiFetch<AdminOverview>('/api/admin/overview')
}

export function fetchAdminOrders(params: {
  page?: number
  limit?: number
  status?: string
  categorySlug?: string
  search?: string
}) {
  return apiFetch<AdminOrdersResponse>(`/api/admin/orders${toQuery(params)}`)
}

export function fetchAdminOrder(orderId: string) {
  return apiFetch<AdminOrderDetailResponse>(
    `/api/admin/orders/${encodeURIComponent(orderId)}`,
  )
}

export function fetchAdminPayments(params: {
  page?: number
  limit?: number
  status?: string
  search?: string
}) {
  return apiFetch<AdminPaymentsResponse>(`/api/admin/payments${toQuery(params)}`)
}

export function fetchAdminCryptoPayments(params: {
  page?: number
  limit?: number
  status?: string
  search?: string
}) {
  return apiFetch<{
    items: AdminCryptoPaymentItem[]
    total: number
    page: number
    limit: number
    totalPages: number
  }>(`/api/admin/crypto-payments${toQuery(params)}`)
}

export function fetchAdminTransfers(params: {
  page?: number
  limit?: number
  search?: string
}) {
  return apiFetch<{
    items: AdminTransferItem[]
    total: number
    page: number
    limit: number
    totalPages: number
  }>(`/api/admin/transfers${toQuery(params)}`)
}

export function fetchAdminUsers(params: {
  page?: number
  limit?: number
  search?: string
  role?: UserRole
  isBanned?: boolean
  isActive?: boolean
  hasKyc?: boolean
}) {
  return apiFetch<AdminUsersResponse>(`/api/users${toQuery(params)}`)
}

export function fetchAdminUser(id: number) {
  return apiFetch<{ user: AppUser }>(`/api/users/${id}`)
}

export function updateAdminUser(
  id: number,
  body: {
    balance?: string | number
    role?: UserRole
    isBanned?: boolean
    isActive?: boolean
    kycVerified?: boolean
  },
) {
  return apiFetch<{ user: AppUser }>(`/api/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
}

export function inquiryAdminPayment(trackId: string | number) {
  return apiFetch<{
    payment: AdminPaymentListItem | null
    inquiry: unknown
  }>('/api/payments/inquiry', {
    method: 'POST',
    body: JSON.stringify({ trackId }),
  })
}

export function syncAllClubPoints() {
  return apiFetch<{ updated: number }>('/api/club/sync-all', {
    method: 'POST',
  })
}

export function fetchAdminHealth() {
  return apiFetch<{ status?: string; ok?: boolean }>('/api/health')
}

export function fetchAdminSupportContact() {
  return apiFetch<{ telegramUsername: string | null }>('/api/admin/settings/support-contact')
}

export function updateAdminSupportContact(telegramUsername: string) {
  return apiFetch<{ telegramUsername: string | null }>('/api/admin/settings/support-contact', {
    method: 'PUT',
    body: JSON.stringify({ telegramUsername }),
  })
}

export type AdminClubReward = {
  id: number
  title: string
  description: string
  pointsCost: number
  rewardType: 'percent_discount' | 'fixed_discount' | 'free_item' | 'custom'
  rewardValue: string
  stock: number | null
  isActive: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export type AdminDiscount = {
  id: number
  code: string
  title: string
  description: string | null
  discountType: 'percent' | 'fixed'
  discountValue: number
  maxUses: number | null
  usedCount: number
  minOrderToman: string | null
  productKey: string | null
  startsAt: string | null
  expiresAt: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type AdminPricingItem = {
  productKey: string
  label: string
  markupPercent: number
  fixedAddToman: string
  isActive: boolean
  note: string | null
  updatedAt: string | null
}

export type AdminTicketListItem = {
  id: number
  ticketCode: string
  category: 'sales' | 'product' | 'kyc' | 'wallet' | 'other'
  categoryLabel: string
  orderId: string | null
  subject: string
  status: 'open' | 'answered' | 'closed'
  createdAt: string
  updatedAt: string
  user: AdminUserSummary
  lastMessage: { senderRole: string; body: string; createdAt: string } | null
}

export function fetchAdminClubRewards() {
  return apiFetch<{ items: AdminClubReward[] }>('/api/admin/club-rewards')
}

export function createAdminClubReward(body: {
  title: string
  description: string
  pointsCost: number
  rewardType: AdminClubReward['rewardType']
  rewardValue: string
  stock?: number | null
  isActive?: boolean
}) {
  return apiFetch<{ reward: AdminClubReward }>('/api/admin/club-rewards', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function updateAdminClubReward(
  id: number,
  body: Partial<{
    title: string
    description: string
    pointsCost: number
    rewardType: AdminClubReward['rewardType']
    rewardValue: string
    stock: number | null
    isActive: boolean
  }>,
) {
  return apiFetch<{ reward: AdminClubReward }>(`/api/admin/club-rewards/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
}

export function deleteAdminClubReward(id: number) {
  return apiFetch<{ ok: boolean }>(`/api/admin/club-rewards/${id}`, { method: 'DELETE' })
}

export function fetchAdminDiscounts() {
  return apiFetch<{ items: AdminDiscount[] }>('/api/admin/discounts')
}

export function createAdminDiscount(body: {
  code: string
  title: string
  description?: string | null
  discountType: 'percent' | 'fixed'
  discountValue: number
  maxUses?: number | null
  isActive?: boolean
}) {
  return apiFetch<{ discount: AdminDiscount }>('/api/admin/discounts', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function updateAdminDiscount(
  id: number,
  body: Partial<{
    title: string
    description: string | null
    discountValue: number
    maxUses: number | null
    isActive: boolean
  }>,
) {
  return apiFetch<{ discount: AdminDiscount }>(`/api/admin/discounts/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
}

export function deleteAdminDiscount(id: number) {
  return apiFetch<{ ok: boolean }>(`/api/admin/discounts/${id}`, { method: 'DELETE' })
}

export function fetchAdminPricing() {
  return apiFetch<{ items: AdminPricingItem[] }>('/api/admin/pricing')
}

export type AdminPricingCatalogItem = {
  id: string
  label: string
  subtitle: string | null
  group: string | null
  baseToman: number
  finalToman: number
}

export type AdminPricingCatalog = {
  productKey: string
  label: string
  source: string
  note: string | null
  sampleHint: string | null
  items: AdminPricingCatalogItem[]
}

export function fetchAdminPricingCatalog(productKey: string) {
  return apiFetch<AdminPricingCatalog>(
    `/api/admin/pricing/${encodeURIComponent(productKey)}/catalog`,
  )
}

export function upsertAdminPricing(body: {
  productKey: string
  label: string
  markupPercent: number
  fixedAddToman: number
  isActive?: boolean
  note?: string | null
}) {
  return apiFetch<{ pricing: AdminPricingItem }>('/api/admin/pricing', {
    method: 'PUT',
    body: JSON.stringify(body),
  })
}

export function fetchAdminTickets(params: {
  page?: number
  limit?: number
  status?: string
  search?: string
}) {
  return apiFetch<{
    items: AdminTicketListItem[]
    total: number
    page: number
    limit: number
    totalPages: number
  }>(`/api/admin/tickets${toQuery(params)}`)
}

export function fetchAdminTicket(id: number) {
  return apiFetch<{
    ticket: AdminTicketListItem & {
      messages: Array<{
        id: number
        senderRole: string
        body: string
        imageData?: string | null
        createdAt: string
      }>
    }
  }>(`/api/admin/tickets/${id}`)
}

export function replyAdminTicket(
  id: number,
  body: { body: string; status?: 'open' | 'answered' | 'closed' },
) {
  return apiFetch<{ ticket: unknown }>(`/api/admin/tickets/${id}/reply`, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}
