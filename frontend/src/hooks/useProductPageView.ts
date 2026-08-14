import { useEffect } from 'react'
import { trackProductView } from '../lib/analytics'

/** Record a shop product page open once per mount. */
export function useProductPageView(productKey: string): void {
  useEffect(() => {
    const key = productKey.trim()
    if (!key) return
    trackProductView(key)
  }, [productKey])
}
