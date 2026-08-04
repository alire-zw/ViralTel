import { getCountryFlagUrl } from './countryFlags'

export const COUNTRY_FLAG_CACHE_VERSION = 'v4'
export const COUNTRY_FLAG_CACHE_NAME = `numberstar-country-flags-${COUNTRY_FLAG_CACHE_VERSION}`

export async function warmCountryFlagCache(flagCodes: string[]): Promise<void> {
  if (!('caches' in window) || flagCodes.length === 0) return

  try {
    const cache = await caches.open(COUNTRY_FLAG_CACHE_NAME)
    const uniqueCodes = [...new Set(flagCodes.map((code) => code.toLowerCase()).filter(Boolean))]

    await Promise.all(
      uniqueCodes.map(async (code) => {
        const url = getCountryFlagUrl(code)
        const existing = await cache.match(url)
        if (existing) return

        try {
          const response = await fetch(url, {
            mode: 'cors',
            cache: 'force-cache',
          })
          if (response.ok) {
            await cache.put(url, response.clone())
          }
        } catch {
          // Ignore individual flag failures.
        }
      }),
    )
  } catch {
    // Background warmup should never block the app.
  }
}
