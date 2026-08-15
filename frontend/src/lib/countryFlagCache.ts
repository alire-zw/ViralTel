import { getCountryFlagUrl } from './countryFlags'

const DB_NAME = 'viraltel-country-flags'
const STORE_NAME = 'flags'
const MEMORY = new Map<string, string>()

function normalizeFlagCode(flagCode: string): string {
  return flagCode.trim().toLowerCase()
}

function openFlagDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME)
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error('flag db open failed'))
  })
}

async function readFlagBlob(code: string): Promise<Blob | null> {
  try {
    const db = await openFlagDb()
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly')
      const request = tx.objectStore(STORE_NAME).get(code)
      request.onsuccess = () => {
        const value = request.result
        resolve(value instanceof Blob && value.size > 0 ? value : null)
      }
      request.onerror = () => reject(request.error ?? new Error('flag read failed'))
    })
  } catch {
    return null
  }
}

async function writeFlagBlob(code: string, blob: Blob): Promise<void> {
  if (blob.size <= 0) return
  try {
    const db = await openFlagDb()
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      tx.objectStore(STORE_NAME).put(blob, code)
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error ?? new Error('flag write failed'))
    })
  } catch {
    // Ignore persistence failures; remote URL still works.
  }
}

function rememberSrc(code: string, src: string): string {
  MEMORY.set(code, src)
  return src
}

export function getCachedCountryFlagSrcSync(flagCode: string): string | null {
  const code = normalizeFlagCode(flagCode)
  if (!code) return null
  return MEMORY.get(code) ?? null
}

/**
 * Resolves a displayable flag src.
 * Prefers a locally cached blob URL when available; otherwise returns the remote URL
 * (which works in <img> even when fetch/CORS fails) and caches in the background when possible.
 */
export async function resolveCountryFlagSrc(flagCode: string): Promise<string> {
  const code = normalizeFlagCode(flagCode)
  if (!code) throw new Error('empty flag code')

  const remote = getCountryFlagUrl(code)
  const cached = MEMORY.get(code)
  if (cached) return cached

  try {
    const blob = await readFlagBlob(code)
    if (blob) {
      return rememberSrc(code, URL.createObjectURL(blob))
    }
  } catch {
    // Fall through to remote / fetch.
  }

  try {
    const response = await fetch(remote, {
      mode: 'cors',
      cache: 'force-cache',
    })
    if (response.ok) {
      const remoteBlob = await response.blob()
      if (remoteBlob.size > 0) {
        void writeFlagBlob(code, remoteBlob)
        return rememberSrc(code, URL.createObjectURL(remoteBlob))
      }
    }
  } catch {
    // CORS or network failure — img can still load the remote URL.
  }

  return remote
}

export async function warmCountryFlagCache(flagCodes: string[]): Promise<void> {
  const uniqueCodes = [
    ...new Set(flagCodes.map((code) => normalizeFlagCode(code)).filter(Boolean)),
  ]
  if (uniqueCodes.length === 0) return

  await Promise.all(
    uniqueCodes.map(async (code) => {
      try {
        await resolveCountryFlagSrc(code)
      } catch {
        // Ignore individual flag failures.
      }
    }),
  )
}
