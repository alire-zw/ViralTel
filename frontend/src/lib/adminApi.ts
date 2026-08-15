import { apiFetch, getTelegramInitData } from './api'
import { getBrowserSessionToken, isBrowserPublicMode } from './browserSession'
import type { AppUser, UserRole } from '../types/user'

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? ''

export type AdminUserSummary = {
  id: number
  telegramId: string
  username: string | null
  firstName: string | null
  lastName: string | null
}

export type AdminProfitBucket = {
  revenueToman: string
  costToman: string
  profitToman: string
  orderCount: number
  knownCostCount: number
  unknownCostCount: number
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
  tickets?: {
    openCount: number
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
  profit?: {
    today: AdminProfitBucket
    week: AdminProfitBucket
    month: AdminProfitBucket
    byCategory: Array<
      AdminProfitBucket & {
        categoryId: number
        slug: string
        label: string
      }
    >
    charts: {
      weekly: Array<{
        day: string
        revenueToman: string
        costToman: string
        profitToman: string
        count: number
      }>
      monthly: Array<{
        day: string
        revenueToman: string
        costToman: string
        profitToman: string
        count: number
      }>
    }
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
  category?: string
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

export type AdminSystemChannelSlot =
  | 'admin_report'
  | 'purchase_report'
  | 'notification'

export type AdminSystemChannel = {
  slotKey: AdminSystemChannelSlot
  label: string
  hint: string
  chatId: string
  username: string
  title: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type AdminSystemChannelSlotItem = {
  slotKey: AdminSystemChannelSlot
  label: string
  hint: string
  channel: AdminSystemChannel | null
}

export function fetchAdminSystemChannelsBot() {
  return apiFetch<{ username: string; deepLink: string }>('/api/admin/system-channels/bot')
}

export function fetchAdminSystemChannels() {
  return apiFetch<{ items: AdminSystemChannelSlotItem[] }>('/api/admin/system-channels')
}

export function registerAdminSystemChannel(slotKey: AdminSystemChannelSlot, link: string) {
  return apiFetch<{ channel: AdminSystemChannel }>(
    `/api/admin/system-channels/${encodeURIComponent(slotKey)}/register`,
    {
      method: 'POST',
      body: JSON.stringify({ link }),
    },
  )
}

export function deactivateAdminSystemChannel(slotKey: AdminSystemChannelSlot) {
  return setAdminSystemChannelActive(slotKey, false)
}

export function setAdminSystemChannelActive(slotKey: AdminSystemChannelSlot, isActive: boolean) {
  return apiFetch<{ channel: AdminSystemChannel }>(
    `/api/admin/system-channels/${encodeURIComponent(slotKey)}/active`,
    {
      method: 'POST',
      body: JSON.stringify({ isActive }),
    },
  )
}

export function deleteAdminSystemChannel(slotKey: AdminSystemChannelSlot) {
  return apiFetch<{ ok: boolean }>(
    `/api/admin/system-channels/${encodeURIComponent(slotKey)}`,
    { method: 'DELETE' },
  )
}

export type AdminShopBanner = {
  id: number
  title: string
  productKey: string
  mainImageUrl: string
  thumbImageUrl: string
  sortOrder: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export function fetchAdminShopBanners() {
  return apiFetch<{ items: AdminShopBanner[] }>('/api/admin/shop-banners')
}

export function createAdminShopBanner(
  body: {
    title: string
    productKey: string
    mainImage: string
    thumbImage: string
    sortOrder?: number
    isActive?: boolean
  },
  options?: {
    onUploadProgress?: (percent: number) => void
  },
) {
  if (!options?.onUploadProgress) {
    return apiFetch<{ banner: AdminShopBanner }>('/api/admin/shop-banners', {
      method: 'POST',
      body: JSON.stringify(body),
    })
  }

  return new Promise<{ banner: AdminShopBanner }>((resolve, reject) => {
    const initData = getTelegramInitData()
    const browserToken = !initData && isBrowserPublicMode() ? getBrowserSessionToken() : null
    const xhr = new XMLHttpRequest()
    const payload = JSON.stringify(body)

    xhr.open('POST', `${API_BASE}/api/admin/shop-banners`)
    xhr.setRequestHeader('Content-Type', 'application/json')
    if (initData) {
      xhr.setRequestHeader('X-Telegram-Init-Data', initData)
    } else if (browserToken) {
      xhr.setRequestHeader('Authorization', `Bearer ${browserToken}`)
    }

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) return
      const percent = Math.max(0, Math.min(100, Math.round((event.loaded / event.total) * 100)))
      options.onUploadProgress?.(percent)
    }

    xhr.onload = () => {
      let payloadJson: {
        banner?: AdminShopBanner
        message?: string
        error?: string
      } = {}
      try {
        payloadJson = JSON.parse(xhr.responseText) as typeof payloadJson
      } catch {
        // ignore
      }

      if (xhr.status >= 200 && xhr.status < 300 && payloadJson.banner) {
        resolve({ banner: payloadJson.banner })
        return
      }

      reject(new Error(payloadJson.message ?? payloadJson.error ?? `Request failed (${xhr.status})`))
    }

    xhr.onerror = () => reject(new Error('خطا در ارتباط با سرور'))
    xhr.onabort = () => reject(new Error('آپلود لغو شد'))
    xhr.send(payload)
  })
}

export function updateAdminShopBanner(
  id: number,
  body: Partial<{
    title: string
    productKey: string
    sortOrder: number
    isActive: boolean
  }>,
) {
  return apiFetch<{ banner: AdminShopBanner }>(`/api/admin/shop-banners/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
}

export function deleteAdminShopBanner(id: number) {
  return apiFetch<{ ok: boolean }>(`/api/admin/shop-banners/${id}`, { method: 'DELETE' })
}

export type AccountShopWarrantyType = 'none' | 'days' | 'full'
export type AccountShopPricingMode = 'fixed' | 'variable'
export type AccountShopNoticeKind = 'none' | 'info' | 'warning' | 'note'

export type AdminAccountShopCustomField = {
  id: string
  label: string
  placeholder: string
  required: boolean
}

export type AdminAccountShopPlan = {
  id: number
  categoryId: string
  name: string
  durationLabel: string
  warrantyType: AccountShopWarrantyType
  warrantyDays: number | null
  warrantyLabel: string
  roboticvnProductId: string
  roboticvnVariantId: string
  roboticvnVariantTitle: string
  pricingMode: AccountShopPricingMode
  fixedToman: number | null
  markupPercent: number
  customFields: AdminAccountShopCustomField[]
  noticeKind: AccountShopNoticeKind
  noticeText: string | null
  sortOrder: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type RoboticvnProductSummary = {
  id: string
  title: string
}

export type RoboticvnProductVariant = {
  id: string
  title: string
  prices: Record<string, number>
  in_stock: boolean
  available_quantity: number
}

export type RoboticvnProductDetail = {
  id: string
  title: string
  description: string | null
  thumbnail: string | null
  in_stock: boolean
  variants: RoboticvnProductVariant[]
}

export type AdminAccountShopPlanInput = {
  categoryId: string
  name: string
  durationLabel: string
  warrantyType: AccountShopWarrantyType
  warrantyDays?: number | null
  roboticvnProductId: string
  roboticvnVariantId: string
  roboticvnVariantTitle: string
  pricingMode: AccountShopPricingMode
  fixedToman?: number | null
  markupPercent?: number
  customFields?: AdminAccountShopCustomField[]
  noticeKind?: AccountShopNoticeKind
  noticeText?: string | null
  sortOrder?: number
  isActive?: boolean
}

export function fetchAdminAccountPlans(categoryId?: string) {
  const query = categoryId ? `?categoryId=${encodeURIComponent(categoryId)}` : ''
  return apiFetch<{ items: AdminAccountShopPlan[] }>(`/api/admin/account-plans${query}`)
}

export function fetchAdminAccountPlan(id: number) {
  return apiFetch<{ plan: AdminAccountShopPlan }>(`/api/admin/account-plans/${id}`)
}

export function createAdminAccountPlan(body: AdminAccountShopPlanInput) {
  return apiFetch<{ plan: AdminAccountShopPlan }>('/api/admin/account-plans', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function updateAdminAccountPlan(
  id: number,
  body: Partial<AdminAccountShopPlanInput>,
) {
  return apiFetch<{ plan: AdminAccountShopPlan }>(`/api/admin/account-plans/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
}

export function deleteAdminAccountPlan(id: number) {
  return apiFetch<{ ok: boolean }>(`/api/admin/account-plans/${id}`, { method: 'DELETE' })
}

export type AdminAccountOrderFulfillmentStatus = 'registered' | 'processing' | 'delivered'

export type AdminAccountOrderListItem = {
  orderId: string
  fulfillmentStatus: AdminAccountOrderFulfillmentStatus
  orderStatus: string
  paymentMethod: string
  amountToman: string
  walletAmountToman: string
  gatewayAmountToman: string
  planId: number
  planName: string
  accountCategoryId: string
  durationLabel: string
  warrantyLabel: string
  fieldValues: Record<string, string>
  customFields: Array<{ id: string; label: string }>
  filledFields: Array<{ id: string; label: string; value: string }>
  user: AdminUserSummary & {
    role?: string
    phoneNumber?: string | null
  }
  payment: {
    orderId: string
    trackId: string | null
    refNumber: string | null
    status: string
    cardNumber: string | null
  } | null
  createdAt: string
  updatedAt: string
  deliveryNote: string | null
  deliveredAt: string | null
  fulfilledAt: string | null
}

export type AdminAccountOrdersResponse = {
  items: AdminAccountOrderListItem[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export function fetchAdminAccountOrders(params: {
  page?: number
  limit?: number
  status?: AdminAccountOrderFulfillmentStatus
  search?: string
}) {
  const query = new URLSearchParams()
  if (params.page) query.set('page', String(params.page))
  if (params.limit) query.set('limit', String(params.limit))
  if (params.status) query.set('status', params.status)
  if (params.search?.trim()) query.set('search', params.search.trim())
  return apiFetch<AdminAccountOrdersResponse>(`/api/admin/account-orders?${query.toString()}`)
}

export function fetchAdminAccountOrder(orderId: string) {
  return apiFetch<{ order: AdminAccountOrderListItem }>(
    `/api/admin/account-orders/${encodeURIComponent(orderId)}`,
  )
}

export function updateAdminAccountOrderStatus(
  orderId: string,
  status: AdminAccountOrderFulfillmentStatus,
  options?: { deliveryNote?: string },
) {
  return apiFetch<{ order: AdminAccountOrderListItem }>(
    `/api/admin/account-orders/${encodeURIComponent(orderId)}/status`,
    {
      method: 'PATCH',
      body: JSON.stringify({
        status,
        ...(options?.deliveryNote !== undefined
          ? { deliveryNote: options.deliveryNote }
          : {}),
      }),
    },
  )
}

export function fetchAdminRoboticvnProducts(search?: string) {
  const params = new URLSearchParams()
  params.set('limit', '50')
  if (search?.trim()) params.set('search', search.trim())
  return apiFetch<{ data: RoboticvnProductSummary[]; meta: { count: number } }>(
    `/api/admin/roboticvn/products?${params.toString()}`,
  )
}

export function fetchAdminRoboticvnProduct(productId: string) {
  return apiFetch<{ data: RoboticvnProductDetail }>(
    `/api/admin/roboticvn/products/${encodeURIComponent(productId)}`,
  )
}
