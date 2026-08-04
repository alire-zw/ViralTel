import { apiFetch } from './api'

/** Fire-and-forget product page view (deduped on server). */
export function trackProductView(productKey: string): void {
  void apiFetch<{ recorded: boolean }>('/api/analytics/product-view', {
    method: 'POST',
    body: JSON.stringify({ productKey }),
  }).catch(() => {
    // ignore analytics failures
  })
}
