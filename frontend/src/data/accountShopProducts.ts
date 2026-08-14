import type { AccountShopCategoryId } from '../lib/chatgpt'
import { ACCOUNT_SHOP_CATEGORY_OPTIONS } from './accountShopCategories'

export const ACCOUNT_SHOP_PRODUCT_KEY_PREFIX = 'account-' as const

export function accountShopProductKey(categoryId: AccountShopCategoryId): string {
  return `${ACCOUNT_SHOP_PRODUCT_KEY_PREFIX}${categoryId}`
}

export function accountShopRoute(categoryId: AccountShopCategoryId): string {
  return `/chatgpt/${categoryId}`
}

export function accountShopConfirmRoute(categoryId: AccountShopCategoryId): string {
  return `/chatgpt/${categoryId}/confirm`
}

export function isAccountShopCategoryId(value: string): value is AccountShopCategoryId {
  return ACCOUNT_SHOP_CATEGORY_OPTIONS.some((item) => item.id === value)
}

export function parseAccountShopProductKey(productKey: string): AccountShopCategoryId | null {
  const normalized = productKey.trim().toLowerCase()
  if (!normalized.startsWith(ACCOUNT_SHOP_PRODUCT_KEY_PREFIX)) return null
  const categoryId = normalized.slice(ACCOUNT_SHOP_PRODUCT_KEY_PREFIX.length)
  return isAccountShopCategoryId(categoryId) ? categoryId : null
}

export function accountShopProductLabel(productKey: string): string | null {
  const categoryId = parseAccountShopProductKey(productKey)
  if (!categoryId) return null
  return ACCOUNT_SHOP_CATEGORY_OPTIONS.find((item) => item.id === categoryId)?.label ?? null
}

export const ACCOUNT_SHOP_PRODUCT_OPTIONS = ACCOUNT_SHOP_CATEGORY_OPTIONS.map((item) => ({
  productKey: accountShopProductKey(item.id),
  categoryId: item.id,
  label: item.label,
  shortDesc: item.shortDesc,
  imageSrc: item.imageSrc,
  route: accountShopRoute(item.id),
}))
