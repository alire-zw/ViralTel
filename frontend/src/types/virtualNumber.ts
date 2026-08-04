export type VirtualNumberQuality = 'premium' | 'standard' | 'economy'

export type VirtualNumberCountry = {
  countryId: string
  country: string
  flagCode: string
  range: number
  price: number
  toman: number
  quality: VirtualNumberQuality
}

export type VirtualNumberCountryGroup = {
  quality: VirtualNumberQuality
  label: string
  items: VirtualNumberCountry[]
}

export const VIRTUAL_NUMBER_QUALITY_LABELS: Record<VirtualNumberQuality, string> = {
  premium: 'ویژه',
  standard: 'استاندارد',
  economy: 'اقتصادی',
}

export const VIRTUAL_NUMBER_QUALITY_NOTES: Record<VirtualNumberQuality, string> = {
  economy:
    'شماره‌های اقتصادی برای استفاده موقت و کم‌هزینه مناسب هستند؛ با این حال احتمال محدودیت، بن شدن یا وجود سابقه ریپورت در آن‌ها بیشتر است. توصیه می‌شود از این دسته‌بندی برای ایجاد یا نگهداری حساب اصلی استفاده نشود.',
  standard:
    'شماره‌های استاندارد از کیفیت قابل قبولی برخوردارند و برای استفاده روزمره مناسب‌اند. با این حال، برای حساب‌های مهم و اصلی پیشنهاد می‌شود از دسته‌بندی ویژه استفاده شود.',
  premium:
    'شماره‌های ویژه از کیفیت مرغوب‌تری برخوردارند و احتمال بروز مشکل، محدودیت یا ریپورت در آن‌ها بسیار کمتر است. این دسته‌بندی برای ایجاد و نگهداری حساب اصلی توصیه می‌شود.',
}

export type VirtualNumberPaymentMethod = 'wallet' | 'zibal'

export type VirtualNumberConfirmState = {
  countryId: string
  country: string
  flagCode: string
  quality: VirtualNumberQuality
  toman: number
}

export type VirtualNumberPageRestoreState = {
  countryId?: string
  quality?: VirtualNumberQuality
}
