import type { WalletTransaction } from '../types/wallet'

/** داده نمونه — بعداً از API جایگزین می‌شود. */
export const mockWalletTransactions: WalletTransaction[] = [
  {
    id: '1',
    type: 'deposit',
    title: 'شارژ حساب',
    amount: 500_000,
    date: '۱۴۰۴/۰۴/۱۲ · ۱۴:۳۰',
    status: 'success',
  },
  {
    id: '2',
    type: 'purchase',
    title: 'خرید استارز تلگرام',
    amount: -120_000,
    date: '۱۴۰۴/۰۴/۱۱ · ۰۹:۱۵',
    status: 'success',
  },
  {
    id: '3',
    type: 'transfer',
    title: 'انتقال موجودی',
    amount: -50_000,
    date: '۱۴۰۴/۰۴/۱۰ · ۱۸:۴۲',
    status: 'success',
  },
  {
    id: '4',
    type: 'deposit',
    title: 'شارژ حساب',
    amount: 1_000_000,
    date: '۱۴۰۴/۰۴/۰۸ · ۱۱:۰۵',
    status: 'success',
  },
  {
    id: '5',
    type: 'refund',
    title: 'بازگشت وجه',
    amount: 35_000,
    date: '۱۴۰۴/۰۴/۰۵ · ۱۶:۲۰',
    status: 'success',
  },
]
