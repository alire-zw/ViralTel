import { toJalaali } from 'jalaali-js'

const JALALI_MONTHS = [
  'فروردین',
  'اردیبهشت',
  'خرداد',
  'تیر',
  'مرداد',
  'شهریور',
  'مهر',
  'آبان',
  'آذر',
  'دی',
  'بهمن',
  'اسفند',
] as const

function pad2(n: number): string {
  return String(n).padStart(2, '0')
}

/** Gregorian Y/M/D in Asia/Tehran for an instant. */
export function tehranGregorianParts(date: Date): { gy: number; gm: number; gd: number; hour: number; minute: number } {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Tehran',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(date)

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value ?? '0')

  return {
    gy: get('year'),
    gm: get('month'),
    gd: get('day'),
    hour: get('hour'),
    minute: get('minute'),
  }
}

/** Parse backend day key `YYYY-MM-DD` (Tehran calendar day) to Jalali. */
export function dayKeyToJalaali(dayKey: string): { jy: number; jm: number; jd: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dayKey.trim())
  if (!match) return null
  const gy = Number(match[1])
  const gm = Number(match[2])
  const gd = Number(match[3])
  if (!gy || !gm || !gd) return null
  return toJalaali(gy, gm, gd)
}

/** e.g. ۲۸ فروردین ۱۴۰۵ */
export function formatJalaliDateLong(isoOrDayKey: string | null | undefined): string {
  if (!isoOrDayKey) return '—'

  // Day key from charts / product-views
  if (/^\d{4}-\d{2}-\d{2}$/.test(isoOrDayKey.trim())) {
    const j = dayKeyToJalaali(isoOrDayKey)
    if (!j) return '—'
    return `${j.jd} ${JALALI_MONTHS[j.jm - 1]} ${j.jy}`
  }

  const date = new Date(isoOrDayKey)
  if (Number.isNaN(date.getTime())) return '—'
  const { gy, gm, gd } = tehranGregorianParts(date)
  const j = toJalaali(gy, gm, gd)
  return `${j.jd} ${JALALI_MONTHS[j.jm - 1]} ${j.jy}`
}

/** e.g. ۱۴۰۵/۰۱/۲۸ · ساعت ۱۴:۳۰ */
export function formatJalaliDateTime(iso: string | null | undefined): string {
  if (!iso) return '—'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '—'
  const { gy, gm, gd, hour, minute } = tehranGregorianParts(date)
  const j = toJalaali(gy, gm, gd)
  return `${j.jy}/${pad2(j.jm)}/${pad2(j.jd)} · ساعت ${pad2(hour)}:${pad2(minute)}`
}

/** Chart X-axis: Jalali day-of-month for a Gregorian day key. */
export function formatJalaliDayOfMonth(dayKey: string): number {
  const j = dayKeyToJalaali(dayKey)
  return j?.jd ?? 0
}
