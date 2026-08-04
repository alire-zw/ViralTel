import panBins from '../data/panBins.json'

export type DetectedBank = {
  bin: string
  slug: string
  nameEn: string
  nameFa: string
  iconSrc: string
  color1: string
  color2: string
}

type PanBinRow = {
  bin: string
  bankName: string
  bankCode: string
}

const BINS = panBins as PanBinRow[]

const BANK_NAMES_FA: Record<string, string> = {
  unknown: 'بانک نامشخص',
  mellat: 'بانک ملت',
  'export-development': 'بانک توسعه صادرات',
  'tosee-taavon': 'بانک توسعه تعاون',
  'melli-iran': 'بانک ملی ایران',
  mellal: 'موسسه اعتباری ملل',
  'mehr-iran': 'بانک مهر ایران',
  melli: 'بانک ملی',
  saderat: 'بانک صادرات',
  keshavarzi: 'بانک کشاورزی',
  maskan: 'بانک مسکن',
  'credit-istitute-for-development': 'موسسه اعتباری توسعه',
  parsian: 'بانک پارسیان',
  'industry-mine': 'بانک صنعت و معدن',
  ansar: 'بانک انصار',
  tejarat: 'بانک تجارت',
  'kar-afarin': 'بانک کارآفرین',
  'eghtesad-novin': 'بانک اقتصاد نوین',
  post: 'پست بانک',
  saman: 'بانک سامان',
  sarmayeh: 'بانک سرمایه',
  ghavamin: 'بانک قوامین',
  pasargad: 'بانک پاسارگاد',
  sina: 'بانک سینا',
  mehr: 'بانک مهر',
  hekmat: 'بانک حکمت ایرانیان',
  ayandeh: 'بانک آینده',
  'iri-central': 'بانک مرکزی',
  'middle-east': 'بانک خاورمیانه',
  refah: 'بانک رفاه',
  sepah: 'بانک سپه',
  central: 'بانک مرکزی',
  sep: 'سپ',
  resalat: 'بانک رسالت',
  shahr: 'بانک شهر',
  kowsar: 'موسسه کوثر',
  tourism: 'بانک گردشگری',
  'iran-zamin': 'بانک ایران‌زمین',
  dey: 'بانک دی',
}

const BANK_COLORS: Record<string, { color1: string; color2: string }> = {
  mellat: { color1: '#d32f2f', color2: '#b71c1c' },
  melli: { color1: '#1565c0', color2: '#0d47a1' },
  'melli-iran': { color1: '#1565c0', color2: '#0d47a1' },
  saderat: { color1: '#2e7d32', color2: '#1b5e20' },
  tejarat: { color1: '#00695c', color2: '#004d40' },
  parsian: { color1: '#6a1b9a', color2: '#4a148c' },
  pasargad: { color1: '#f9a825', color2: '#f57f17' },
  saman: { color1: '#00838f', color2: '#006064' },
  maskan: { color1: '#ef6c00', color2: '#e65100' },
  refah: { color1: '#3949ab', color2: '#283593' },
  sepah: { color1: '#455a64', color2: '#263238' },
  keshavarzi: { color1: '#558b2f', color2: '#33691e' },
  ayandeh: { color1: '#c62828', color2: '#870000' },
  shahr: { color1: '#0277bd', color2: '#01579b' },
  resalat: { color1: '#00897b', color2: '#00695c' },
  sina: { color1: '#5c6bc0', color2: '#3949ab' },
  'eghtesad-novin': { color1: '#7b1fa2', color2: '#4a148c' },
  'kar-afarin': { color1: '#ad1457', color2: '#880e4f' },
  dey: { color1: '#c2185b', color2: '#880e4f' },
  tourism: { color1: '#0288d1', color2: '#01579b' },
  'iran-zamin': { color1: '#43a047', color2: '#2e7d32' },
  post: { color1: '#e53935', color2: '#c62828' },
  sarmayeh: { color1: '#5d4037', color2: '#3e2723' },
  unknown: { color1: '#6366f1', color2: '#4338ca' },
}

const DEFAULT_COLORS = { color1: '#6366f1', color2: '#4338ca' }

function slugifyBankName(name: string): string {
  const slug = name
    .trim()
    .replace(/[^\w\s]/gi, '')
    .replace(/ /g, '-')
    .replace(/-{2,}/g, '-')
    .toLowerCase()
  return slug || 'unknown'
}

function colorsForSlug(slug: string) {
  return BANK_COLORS[slug] ?? DEFAULT_COLORS
}

export function getBankVisual(slug: string | null | undefined, cardNumber?: string) {
  const fromSlug = slug?.trim()
  if (fromSlug) {
    const colors = colorsForSlug(fromSlug)
    return {
      slug: fromSlug,
      nameFa: BANK_NAMES_FA[fromSlug] ?? fromSlug,
      iconSrc: `/banks/${fromSlug}.svg`,
      ...colors,
    }
  }

  if (cardNumber) {
    const detected = detectBankFromCardDigits(cardNumber)
    if (detected) {
      return {
        slug: detected.slug,
        nameFa: detected.nameFa,
        iconSrc: detected.iconSrc,
        color1: detected.color1,
        color2: detected.color2,
      }
    }
  }

  return {
    slug: 'unknown',
    nameFa: BANK_NAMES_FA.unknown,
    iconSrc: '/banks/unknown.svg',
    ...DEFAULT_COLORS,
  }
}

export function detectBankFromCardDigits(digits: string): DetectedBank | null {
  const clean = digits.replace(/\D/g, '')
  if (clean.length < 6) return null

  const bin = clean.slice(0, 6)
  const row = BINS.find((item) => item.bin === bin)
  if (!row || !row.bankName || row.bankName === 'Unknown') {
    const colors = colorsForSlug('unknown')
    return {
      bin,
      slug: 'unknown',
      nameEn: 'Unknown',
      nameFa: BANK_NAMES_FA.unknown,
      iconSrc: '/banks/unknown.svg',
      ...colors,
    }
  }

  const slug = slugifyBankName(row.bankName)
  const colors = colorsForSlug(slug)
  return {
    bin,
    slug,
    nameEn: row.bankName,
    nameFa: BANK_NAMES_FA[slug] ?? `بانک ${row.bankName}`,
    iconSrc: `/banks/${slug}.svg`,
    ...colors,
  }
}
