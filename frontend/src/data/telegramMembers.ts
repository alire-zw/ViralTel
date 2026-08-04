/** Power-Tel channel member services (ممبر کانال تلگرام) */
export type TelegramMemberService = {
  serviceId: number
  name: string
  shortDesc: string
  rate: number
  min: number
  max: number
}

export const TELEGRAM_MEMBER_SERVICES: TelegramMemberService[] = [
  {
    serviceId: 155,
    name: 'ممبر فیک ۱ ماه ضمانت',
    shortDesc: 'گارانتی حدود ۳۰ روز · سرعت بالا',
    rate: 70_000,
    min: 200,
    max: 60_000,
  },
  {
    serviceId: 154,
    name: 'ممبر فیک ۳ ماه ضمانت',
    shortDesc: '۹۰ روز بدون ریزش · میکس',
    rate: 100_000,
    min: 200,
    max: 60_000,
  },
  {
    serviceId: 153,
    name: 'ممبر اجباری هیدن',
    shortDesc: 'ایرانی واقعی · کانال زیر ۱۰۰ هزار',
    rate: 130_000,
    min: 1_000,
    max: 50_000,
  },
  {
    serviceId: 156,
    name: 'ممبر فعال ویو‌دار ۱ ماهه',
    shortDesc: 'ایرانی · نمودار ویو فالوور',
    rate: 350_000,
    min: 100,
    max: 4_500,
  },
  {
    serviceId: 157,
    name: 'ممبر فعال ویو‌دار ۲ ماهه',
    shortDesc: 'ایرانی · ۶۰ روز گارانتی',
    rate: 600_000,
    min: 100,
    max: 4_500,
  },
  {
    serviceId: 158,
    name: 'ممبر فعال ویو‌دار ۳ ماهه',
    shortDesc: 'ایرانی · ۹۰ روز گارانتی',
    rate: 800_000,
    min: 100,
    max: 4_500,
  },
  {
    serviceId: 161,
    name: 'تمدید ممبر ویو‌دار ۱ ماه',
    shortDesc: 'تمدید ماندگاری ممبر فعال',
    rate: 350_000,
    min: 100,
    max: 4_500,
  },
  {
    serviceId: 162,
    name: 'ممبر آپلودر واقعی',
    shortDesc: 'عضویت اجباری از طریق ربات',
    rate: 350_000,
    min: 1_000,
    max: 5_000,
  },
]
