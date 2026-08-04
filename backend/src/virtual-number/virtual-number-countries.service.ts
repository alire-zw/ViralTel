import type { CallinooCountryRaw } from './callinoo.client.js'
import { fetchCallinooCountries } from './callinoo.client.js'
import {
  applyPricingRule,
  getProductPricingRule,
  roundDisplayTomanUp,
} from '../pricing/product-pricing.apply.js'
import {
  flagEmojiToAlpha2,
  stripCountryEmojis,
} from './virtual-number-country.utils.js'
import {
  readCachedVirtualNumberCountries,
  writeCachedVirtualNumberCountries,
} from './virtual-number-countries.cache.js'
import type {
  VirtualNumberCountry,
  VirtualNumberCountryGroup,
  VirtualNumberQuality,
} from './virtual-number-countries.types.js'
import {
  VIRTUAL_NUMBER_QUALITY_LABELS,
  VIRTUAL_NUMBER_QUALITY_ORDER,
} from './virtual-number-countries.types.js'

const PREMIUM_PRICE_THRESHOLD = 400_000
const STANDARD_PRICE_THRESHOLD = 150_000

function parseRange(value: number | string): number {
  const parsed = typeof value === 'number' ? value : Number.parseInt(String(value), 10)
  return Number.isFinite(parsed) ? parsed : 0
}

function isAvailable(count: string): boolean {
  return count.includes('✅') || count.includes('موجود')
}

function resolveQuality(price: number): VirtualNumberQuality {
  if (price >= PREMIUM_PRICE_THRESHOLD) {
    return 'premium'
  }

  if (price >= STANDARD_PRICE_THRESHOLD) {
    return 'standard'
  }

  return 'economy'
}

function sortCountries(items: VirtualNumberCountry[]): VirtualNumberCountry[] {
  return [...items].sort((left, right) => {
    if (left.price !== right.price) {
      return left.price - right.price
    }

    return left.country.localeCompare(right.country, 'fa')
  })
}

function mapCountry(item: CallinooCountryRaw): VirtualNumberCountry | null {
  if (!isAvailable(item.count)) {
    return null
  }

  const range = parseRange(item.range)
  if (range <= 0) {
    return null
  }

  const price = Number(item.price)
  if (!Number.isFinite(price) || price <= 0) {
    return null
  }

  const flagCode = flagEmojiToAlpha2(item.emoji || item.country)
  if (!flagCode) {
    return null
  }

  const country = stripCountryEmojis(item.country)
  if (!country) {
    return null
  }

  return {
    countryId: String(range),
    country,
    flagCode,
    range,
    price,
    toman: roundDisplayTomanUp(price),
    quality: resolveQuality(price),
  }
}

function buildGroups(countries: VirtualNumberCountry[]): VirtualNumberCountryGroup[] {
  const grouped = new Map<VirtualNumberQuality, VirtualNumberCountry[]>()

  for (const quality of VIRTUAL_NUMBER_QUALITY_ORDER) {
    grouped.set(quality, [])
  }

  for (const country of countries) {
    grouped.get(country.quality)?.push(country)
  }

  return VIRTUAL_NUMBER_QUALITY_ORDER.map((quality) => ({
    quality,
    label: VIRTUAL_NUMBER_QUALITY_LABELS[quality],
    items: sortCountries(grouped.get(quality) ?? []),
  })).filter((group) => group.items.length > 0)
}

export async function refreshVirtualNumberCountryGroups(
  noneReport = true,
): Promise<VirtualNumberCountryGroup[]> {
  const rawCountries = await fetchCallinooCountries(noneReport)
  const countries = rawCountries
    .map(mapCountry)
    .filter((item): item is VirtualNumberCountry => item !== null)

  const groups = buildGroups(countries)
  await writeCachedVirtualNumberCountries(noneReport, groups)
  return withVirtualNumberPricing(groups)
}

async function withVirtualNumberPricing(
  groups: VirtualNumberCountryGroup[],
): Promise<VirtualNumberCountryGroup[]> {
  const rule = await getProductPricingRule('virtual-number')
  return groups.map((group) => ({
    ...group,
    items: group.items.map((item) => ({
      ...item,
      toman: applyPricingRule(item.price, rule),
    })),
  }))
}

export async function getVirtualNumberCountryGroups(
  noneReport = true,
): Promise<{ groups: VirtualNumberCountryGroup[]; cached: boolean }> {
  const groups = await readCachedVirtualNumberCountries(noneReport)
  if (groups) {
    return { groups: await withVirtualNumberPricing(groups), cached: true }
  }

  return { groups: [], cached: false }
}
