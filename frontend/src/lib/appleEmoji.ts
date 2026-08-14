import appleReactionImages from '../data/appleReactionEmojiImages.json'

const APPLE_EMOJI_CDN =
  'https://cdn.jsdelivr.net/npm/emoji-datasource-apple@16.0.0/img/apple/64'

const imageByEmoji = appleReactionImages as Record<string, string>

function withFe0fAfterBase(emoji: string): string {
  const cps = Array.from(emoji, (ch) => ch.codePointAt(0)!)
  if (cps.length === 0) return emoji
  if (cps[1] === 0xfe0f) return emoji
  return String.fromCodePoint(cps[0]!, 0xfe0f, ...cps.slice(1))
}

function stripFe0f(emoji: string): string {
  const cps = Array.from(emoji, (ch) => ch.codePointAt(0)!).filter((cp) => cp !== 0xfe0f)
  if (cps.length === 0) return emoji
  return String.fromCodePoint(...cps)
}

export function resolveAppleEmojiImage(emoji: string): string | null {
  if (!emoji) return null
  return (
    imageByEmoji[emoji] ??
    imageByEmoji[withFe0fAfterBase(emoji)] ??
    imageByEmoji[stripFe0f(emoji)] ??
    null
  )
}

/** Apple Color Emoji PNGs from emoji-datasource-apple@16.0.0 (Emoji 16 / latest public Apple set). */
export function appleEmojiPngUrl(emoji: string): string | null {
  const image = resolveAppleEmojiImage(emoji)
  if (!image) return null
  return `${APPLE_EMOJI_CDN}/${image}`
}
