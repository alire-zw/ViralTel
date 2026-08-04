import type { AccountShopCategoryId } from '../lib/chatgpt'

export type AccountShopCategoryOption = {
  id: AccountShopCategoryId
  label: string
  shortDesc: string
  imageSrc: string | null
}

export const ACCOUNT_SHOP_CATEGORY_OPTIONS: AccountShopCategoryOption[] = [
  {
    id: 'chatgpt',
    label: 'چت‌جی‌پی‌تی',
    shortDesc: 'اکانت پلاس آماده',
    imageSrc: '/account-shop/chatgpt-a.webp',
  },
  {
    id: 'gemini',
    label: 'گوگل جمینای',
    shortDesc: 'جمینای پرو و گوگل AI',
    imageSrc: '/account-shop/google-a.webp',
  },
  {
    id: 'capcut',
    label: 'کپ‌کات پرو',
    shortDesc: 'اکانت ادیت ویدیو',
    imageSrc: '/account-shop/capcut-a.webp',
  },
  {
    id: 'canva',
    label: 'کانوا',
    shortDesc: 'پرو و EDU',
    imageSrc: '/account-shop/canva-a.webp',
  },
  {
    id: 'youtube',
    label: 'یوتیوب',
    shortDesc: 'پریمیوم و اسلات',
    imageSrc: '/account-shop/youtube-a.webp',
  },
  {
    id: 'microsoft',
    label: 'مایکروسافت',
    shortDesc: 'آفیس و ۳۶۵',
    imageSrc: '/account-shop/microsoft-a.webp',
  },
  {
    id: 'claude',
    label: 'کلاد AI',
    shortDesc: 'کلاد مکس',
    imageSrc: '/account-shop/claude-a.webp',
  },
  {
    id: 'cursor',
    label: 'کرسر پرو',
    shortDesc: 'پرو و اولترا',
    imageSrc: '/account-shop/cursor-a.webp',
  },
  {
    id: 'netflix',
    label: 'نتفلیکس',
    shortDesc: 'پریمیوم ۴K',
    imageSrc: '/account-shop/netflix-a.webp',
  },
  {
    id: 'grok',
    label: 'گروک',
    shortDesc: 'سوپر گروک',
    imageSrc: '/account-shop/grok-a.webp',
  },
]
