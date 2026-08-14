export type AutoChannelsKind = 'channel-views' | 'reaction'

export type AutoChannelsCachePayload<T> = {
  channels: T[]
  botUsername: string
  botDeepLink: string
  cachedAt: string
}

const memoryCache = new Map<string, AutoChannelsCachePayload<unknown>>()

function storageKey(kind: AutoChannelsKind, userKey: string): string {
  return `numberstar:auto-channels:${kind}:v1:${userKey}`
}

function isValidPayload<T>(value: unknown): value is AutoChannelsCachePayload<T> {
  if (!value || typeof value !== 'object') return false
  const payload = value as AutoChannelsCachePayload<T>
  return (
    Array.isArray(payload.channels) &&
    typeof payload.botUsername === 'string' &&
    typeof payload.botDeepLink === 'string' &&
    typeof payload.cachedAt === 'string'
  )
}

export function readLocalAutoChannels<T>(
  kind: AutoChannelsKind,
  userKey: string,
): AutoChannelsCachePayload<T> | null {
  const key = storageKey(kind, userKey)
  const mem = memoryCache.get(key)
  if (mem && isValidPayload<T>(mem)) {
    return mem as AutoChannelsCachePayload<T>
  }

  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const parsed = JSON.parse(raw) as unknown
    if (!isValidPayload<T>(parsed)) return null
    memoryCache.set(key, parsed as AutoChannelsCachePayload<unknown>)
    return parsed
  } catch {
    return null
  }
}

export function writeLocalAutoChannels<T>(
  kind: AutoChannelsKind,
  userKey: string,
  payload: AutoChannelsCachePayload<T>,
): void {
  const key = storageKey(kind, userKey)
  memoryCache.set(key, payload as AutoChannelsCachePayload<unknown>)
  try {
    localStorage.setItem(key, JSON.stringify(payload))
  } catch {
    // ignore quota / private mode failures
  }
}
