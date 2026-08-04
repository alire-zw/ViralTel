import { env } from '../config/env.js'

export type CallinooCountryRaw = {
  country: string
  price: number
  range: number | string
  count: string
  emoji: string
}

export type CallinooApiResponse<T> = {
  status: boolean
  status_code: number
  message: string
  data: T
}

export class CallinooApiError extends Error {
  readonly status: number
  readonly details?: unknown

  constructor(message: string, status = 502, details?: unknown) {
    super(message)
    this.name = 'CallinooApiError'
    this.status = status
    this.details = details
  }
}

function buildAuthHeaders(): Record<string, string> {
  return {
    Authorization: `Bearer ${env.CALLINOO_API_TOKEN}`,
    Accept: 'application/json',
  }
}

async function parseCallinooResponse<T>(response: Response): Promise<T> {
  const payload = (await response.json().catch(() => null)) as CallinooApiResponse<T> | null

  if (!response.ok || !payload) {
    throw new CallinooApiError(
      payload?.message ?? `Callinoo request failed (${response.status})`,
      response.status || 502,
      payload,
    )
  }

  if (!payload.status) {
    throw new CallinooApiError(payload.message || 'Callinoo request failed', payload.status_code || 502, payload)
  }

  return payload.data
}

export async function fetchCallinooCountries(noneReport = true): Promise<CallinooCountryRaw[]> {
  const url = new URL('/telegram-numbers/numbers/', env.CALLINOO_API_URL)
  url.searchParams.set('none_report', noneReport ? 'true' : 'false')

  const response = await fetch(url, {
    method: 'GET',
    headers: buildAuthHeaders(),
  })

  const data = await parseCallinooResponse<CallinooCountryRaw[]>(response)
  return Array.isArray(data) ? data : []
}

export type CallinooPurchaseNumberRaw = {
  number: string
  order_id: number | string
  price: number
  countery?: string
  country?: string
  range: number | string
  service: string
  quality: string
}

export async function purchaseCallinooNumber(input: {
  countryId: string
  noneReport?: boolean
}): Promise<CallinooPurchaseNumberRaw> {
  const response = await fetch(new URL('/telegram-numbers/numbers/', env.CALLINOO_API_URL), {
    method: 'POST',
    headers: {
      ...buildAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      country_id: input.countryId,
      none_report: input.noneReport ?? true,
    }),
  })

  return parseCallinooResponse<CallinooPurchaseNumberRaw>(response)
}

export type CallinooVerificationCodeRaw = {
  order_id: number | string
  country?: string
  service_id?: number
  number?: string
  code: string
}

export type CallinooVerificationCodeResult =
  | { status: 'ready'; data: CallinooVerificationCodeRaw }
  | { status: 'pending'; message: string }

export async function fetchCallinooVerificationCode(
  providerOrderId: string,
): Promise<CallinooVerificationCodeResult> {
  const url = new URL('/telegram-numbers/number-services/', env.CALLINOO_API_URL)
  url.searchParams.set('order_id', String(providerOrderId))

  const response = await fetch(url, {
    method: 'GET',
    headers: buildAuthHeaders(),
  })

  const payload = (await response.json().catch(() => null)) as CallinooApiResponse<CallinooVerificationCodeRaw> | null

  if (response.status === 202) {
    return {
      status: 'pending',
      message: payload?.message || 'کد هنوز آماده نیست',
    }
  }

  if (!response.ok || !payload) {
    throw new CallinooApiError(
      payload?.message ?? `Callinoo request failed (${response.status})`,
      response.status || 502,
      payload,
    )
  }

  if (!payload.status || !payload.data?.code) {
    if (response.status === 200 && !payload.data?.code) {
      return {
        status: 'pending',
        message: payload.message || 'کد هنوز آماده نیست',
      }
    }

    throw new CallinooApiError(
      payload.message || 'Callinoo request failed',
      payload.status_code || response.status || 502,
      payload,
    )
  }

  return {
    status: 'ready',
    data: payload.data,
  }
}
