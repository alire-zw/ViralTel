import { useEffect, useMemo, useState } from 'react'
import {
  applyPricingRule,
  getShopPricingRule,
  type ShopPricingRule,
} from '../lib/productPricing'

/** `undefined` while loading; `null` when no active rule. */
export function useShopPricingRule(
  productKey: string,
): ShopPricingRule | null | undefined {
  const [rule, setRule] = useState<ShopPricingRule | null | undefined>(undefined)

  useEffect(() => {
    let cancelled = false
    setRule(undefined)
    void getShopPricingRule(productKey)
      .then((next) => {
        if (!cancelled) setRule(next)
      })
      .catch(() => {
        if (!cancelled) setRule(null)
      })
    return () => {
      cancelled = true
    }
  }, [productKey])

  return rule
}

/** Applies markup + fixed + display rounding once the shop rule is known. */
export function usePricedToman(
  productKey: string,
  baseToman: number,
): { toman: number; ready: boolean } {
  const rule = useShopPricingRule(productKey)
  const ready = rule !== undefined
  const toman = useMemo(() => {
    if (!Number.isFinite(baseToman) || baseToman <= 0) return 0
    if (!ready) return 0
    return applyPricingRule(baseToman, rule)
  }, [baseToman, ready, rule])
  return { toman, ready }
}
