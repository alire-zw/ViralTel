import { apiFetch } from './api'

export type ShopPricingRule = {
  productKey: string
  markupPercent: number
  fixedAddToman: number
}

const CACHE_TTL_MS = 60_000
let rulesCache: { at: number; byKey: Map<string, ShopPricingRule> } | null = null

export function roundDisplayTomanUp(toman: number): number {
  if (!Number.isFinite(toman) || toman <= 0) return 0
  const value = Math.ceil(toman)
  if (value >= 10_000) return Math.ceil(value / 1_000) * 1_000
  return Math.ceil(value / 100) * 100
}

export function applyPricingRule(
  baseToman: number,
  rule: ShopPricingRule | null | undefined,
): number {
  if (!Number.isFinite(baseToman) || baseToman <= 0) return 0
  if (!rule) return roundDisplayTomanUp(baseToman)
  const markup = Number.isFinite(rule.markupPercent) ? rule.markupPercent : 0
  const fixed = Number.isFinite(rule.fixedAddToman) ? Math.max(0, rule.fixedAddToman) : 0
  return roundDisplayTomanUp(baseToman * (1 + markup / 100) + fixed)
}

export async function fetchShopPricingRules(): Promise<Map<string, ShopPricingRule>> {
  const now = Date.now()
  if (rulesCache && now - rulesCache.at < CACHE_TTL_MS) {
    return rulesCache.byKey
  }

  const result = await apiFetch<{ items: ShopPricingRule[] }>('/api/shop/pricing')
  const byKey = new Map(result.items.map((item) => [item.productKey, item]))
  rulesCache = { at: now, byKey }
  return byKey
}

export async function getShopPricingRule(
  productKey: string,
): Promise<ShopPricingRule | null> {
  const map = await fetchShopPricingRules()
  return map.get(productKey) ?? null
}

export async function applyShopPricing(
  productKey: string,
  baseToman: number,
): Promise<number> {
  const rule = await getShopPricingRule(productKey)
  return applyPricingRule(baseToman, rule)
}

export function invalidateShopPricingCache(): void {
  rulesCache = null
}
