export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'verified'

export interface Payment {
  id: number
  userId: number
  orderId: string
  amount: string
  amountToman: string
  description: string | null
  trackId: string | null
  refNumber: string | null
  status: PaymentStatus
  cardNumber: string | null
  resultCode: number | null
  verifiedAt: string | null
  expiresAt: string | null
  createdAt: string
  updatedAt: string
}

export interface CreatePaymentResponse {
  payment: Payment
  paymentUrl: string
  trackId: string
}

export interface PaymentsListResponse {
  items: Payment[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface PaymentOrderResponse {
  payment: Payment
  paymentUrl: string | null
}

export interface VerifyPaymentResponse {
  payment: Payment
  alreadyVerified: boolean
}
