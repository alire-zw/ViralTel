import type { AccountShopCategoryId, AccountShopProduct } from '../lib/chatgpt'

export type AccountShopProductsState = {
  categoryId: AccountShopCategoryId
}

export type AccountShopProductsRestoreState = {
  categoryId: AccountShopCategoryId
  productId?: string
  customerEmail?: string
  slotMonths?: number | null
}

export type AccountShopConfirmState = {
  categoryId: AccountShopCategoryId
  categoryLabel: string
  categoryImageSrc: string | null
  product: AccountShopProduct
  customerEmail: string | null
  slotMonths: number | null
  toman: number
}

export type AccountShopPaymentMethod = 'wallet' | 'zibal'
