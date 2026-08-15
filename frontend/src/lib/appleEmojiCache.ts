import { appleEmojiPngUrl } from './appleEmoji'
import appleReactionImages from '../data/appleReactionEmojiImages.json'
import { REACTION_SINGLE_EMOJIS } from '../data/reactionEmojis'

const DB_NAME = 'viraltel-apple-emojis'
const STORE_NAME = 'emojis'
const DB_VERSION = 1
const MEMORY = new Map<string, string>()

function openEmojiDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME)
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error('emoji db open failed'))
  })
}

async function readEmojiBlob(key: string): Promise<Blob | null> {
  try {
    const db = await openEmojiDb()
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly')
      const request = tx.objectStore(STORE_NAME).get(key)
      request.onsuccess = () => {
        const value = request.result
        resolve(value instanceof Blob && value.size > 0 ? value : null)
      }
      request.onerror = () => reject(request.error ?? new Error('emoji read failed'))
    })
  } catch {
    return null
  }
}

async function writeEmojiBlob(key: string, blob: Blob): Promise<void> {
  if (blob.size <= 0) return
  try {
    const db = await openEmojiDb()
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      tx.objectStore(STORE_NAME).put(blob, key)
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error ?? new Error('emoji write failed'))
    })
  } catch {
    // Ignore persistence failures; remote URL still works.
  }
}

function rememberSrc(key: string, src: string): string {
  MEMORY.set(key, src)
  return src
}

function cacheKeyForEmoji(emoji: string): string | null {
  const remote = appleEmojiPngUrl(emoji)
  if (!remote) return null
  try {
    return new URL(remote).pathname
  } catch {
    return remote
  }
}

export function getCachedAppleEmojiSrcSync(emoji: string): string | null {
  if (!emoji) return null
  return MEMORY.get(emoji) ?? null
}

/**
 * Prefers a locally cached blob URL; otherwise returns the remote Apple CDN URL
 * and persists the blob in IndexedDB when fetch/CORS succeeds.
 */
export async function resolveAppleEmojiSrc(emoji: string): Promise<string> {
  const remote = appleEmojiPngUrl(emoji)
  if (!remote) throw new Error('unknown apple emoji')

  const cached = MEMORY.get(emoji)
  if (cached) return cached

  const key = cacheKeyForEmoji(emoji) ?? remote

  try {
    const blob = await readEmojiBlob(key)
    if (blob) {
      return rememberSrc(emoji, URL.createObjectURL(blob))
    }
  } catch {
    // Fall through.
  }

  try {
    const response = await fetch(remote, {
      mode: 'cors',
      cache: 'force-cache',
    })
    if (response.ok) {
      const remoteBlob = await response.blob()
      if (remoteBlob.size > 0) {
        void writeEmojiBlob(key, remoteBlob)
        return rememberSrc(emoji, URL.createObjectURL(remoteBlob))
      }
    }
  } catch {
    // CORS/network — <img> can still load the remote URL.
  }

  return remote
}

export function listReactionAppleEmojiUrls(): string[] {
  const images = appleReactionImages as Record<string, string>
  const base = 'https://cdn.jsdelivr.net/npm/emoji-datasource-apple@16.0.0/img/apple/64'
  return [...new Set(Object.values(images).map((file) => `${base}/${file}`))]
}

export async function warmAppleReactionEmojiCache(emojis?: string[]): Promise<void> {
  const list =
    emojis && emojis.length > 0
      ? emojis
      : REACTION_SINGLE_EMOJIS.map((item) => item.emoji)

  const unique = [...new Set(list.filter(Boolean))]
  if (unique.length === 0) return

  await Promise.all(
    unique.map(async (emoji) => {
      try {
        await resolveAppleEmojiSrc(emoji)
      } catch {
        // Ignore individual failures.
      }
    }),
  )
}
