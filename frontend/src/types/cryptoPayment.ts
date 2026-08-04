export type CryptoPaymentStatus = 'pending' | 'completed' | 'expired' | 'swept'

export interface CryptoPayment {
  id: number
  userId: number
  orderId: string
  shopOrderId: string | null
  walletAddress: string
  amountToman: string
  amountTrx: string
  amountTrxSun: string
  trxIrtRate: string
  status: CryptoPaymentStatus
  incomingTxHash: string | null
  sweepTxHash: string | null
  receivedTrxSun: string | null
  expiresAt: string
  verifiedAt: string | null
  sweptAt: string | null
  createdAt: string
  updatedAt: string
}

export interface CryptoPaymentPrice {
  pair: string
  price: string
  network: string
}

export interface CreateCryptoPaymentResponse {
  payment: CryptoPayment
  expiresInMinutes: number
}

export interface CryptoPaymentOrderResponse {
  payment: CryptoPayment
}

export interface CryptoPaymentsListResponse {
  items: CryptoPayment[]
  total: number
  page: number
  limit: number
  totalPages: number
}
