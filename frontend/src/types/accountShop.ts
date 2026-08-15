import type { AccountShopCategoryId, AccountShopCustomField, AccountShopProduct } from '../lib/chatgpt'

export type AccountShopProductsState = {
  categoryId: AccountShopCategoryId
}

export type AccountShopProductsRestoreState = {
  categoryId: AccountShopCategoryId
  productId?: string
  fieldValues?: Record<string, string>
}

export type AccountShopConfirmState = {
  categoryId: AccountShopCategoryId
  categoryLabel: string
  categoryImageSrc: string | null
  product: AccountShopProduct
  fieldValues: Record<string, string>
  toman: number
}

export type AccountShopPaymentMethod = 'wallet' | 'zibal'

export type { AccountShopCustomField }
