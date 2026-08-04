import type { CryptoPayment } from '../types/cryptoPayment'
import type { Payment } from '../types/payment'
import type { WalletTransaction } from '../types/wallet'

function formatPaymentDate(value: string): string {
  return new Date(value).toLocaleString('fa-IR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export { formatPaymentDate }

export function paymentToWalletTransaction(payment: Payment): WalletTransaction {
  const amountToman = Number.parseInt(payment.amountToman, 10) || 0
  const date = formatPaymentDate(payment.createdAt)

  if (payment.status === 'verified') {
    return {
      id: `zibal-${payment.orderId}`,
      type: 'deposit',
      title: 'شارژ حساب',
      amount: amountToman,
      date,
      status: 'success',
      paymentMethod: 'zibal',
      orderId: payment.orderId,
      createdAt: payment.createdAt,
      verifiedAt: payment.verifiedAt,
      refNumber: payment.refNumber,
      trackId: payment.trackId,
      cardNumber: payment.cardNumber,
    }
  }

  if (payment.status === 'failed') {
    return {
      id: `zibal-${payment.orderId}`,
      type: 'deposit',
      title: 'شارژ ناموفق',
      amount: amountToman,
      date,
      status: 'failed',
      paymentMethod: 'zibal',
      orderId: payment.orderId,
      createdAt: payment.createdAt,
      expiresAt: payment.expiresAt,
      trackId: payment.trackId,
    }
  }

  return {
    id: `zibal-${payment.orderId}`,
    type: 'deposit',
    title: 'شارژ در انتظار',
    amount: amountToman,
    date,
    status: 'pending',
    paymentMethod: 'zibal',
    orderId: payment.orderId,
    createdAt: payment.createdAt,
    expiresAt: payment.expiresAt,
    trackId: payment.trackId,
  }
}

export function cryptoPaymentToWalletTransaction(payment: CryptoPayment): WalletTransaction {
  const amountToman = Number.parseInt(payment.amountToman, 10) || 0
  const date = formatPaymentDate(payment.createdAt)

  if (payment.status === 'completed' || payment.status === 'swept') {
    return {
      id: `tron-${payment.orderId}`,
      type: 'deposit',
      title: 'شارژ با ترون',
      amount: amountToman,
      date,
      status: 'success',
      paymentMethod: 'tron',
      orderId: payment.orderId,
      createdAt: payment.createdAt,
      verifiedAt: payment.verifiedAt,
      amountTrx: payment.amountTrx,
      incomingTxHash: payment.incomingTxHash,
    }
  }

  if (payment.status === 'expired') {
    return {
      id: `tron-${payment.orderId}`,
      type: 'deposit',
      title: 'شارژ ترون ناموفق',
      amount: amountToman,
      date,
      status: 'failed',
      paymentMethod: 'tron',
      orderId: payment.orderId,
      createdAt: payment.createdAt,
      expiresAt: payment.expiresAt,
      amountTrx: payment.amountTrx,
    }
  }

  return {
    id: `tron-${payment.orderId}`,
    type: 'deposit',
    title: 'شارژ ترون در انتظار',
    amount: amountToman,
    date,
    status: 'pending',
    paymentMethod: 'tron',
    orderId: payment.orderId,
    createdAt: payment.createdAt,
    expiresAt: payment.expiresAt,
    amountTrx: payment.amountTrx,
  }
}

export function paymentsToWalletTransactions(payments: Payment[]): WalletTransaction[] {
  return payments.map(paymentToWalletTransaction)
}

export function cryptoPaymentsToWalletTransactions(
  payments: CryptoPayment[],
): WalletTransaction[] {
  return payments.map(cryptoPaymentToWalletTransaction)
}

export function mergeWalletTransactions(
  payments: Payment[],
  cryptoPayments: CryptoPayment[],
): WalletTransaction[] {
  return [...paymentsToWalletTransactions(payments), ...cryptoPaymentsToWalletTransactions(cryptoPayments)]
    .sort(
      (a, b) =>
        new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime(),
    )
}
