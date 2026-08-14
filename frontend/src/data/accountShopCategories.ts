import type { AccountShopCategoryId } from '../lib/chatgpt'

export type AccountShopCategoryOption = {
  id: AccountShopCategoryId
  label: string
  shortDesc: string
  /** Animated sticker used on account product pages. */
  imageSrc: string | null
  /** Static frame for shop home / rails (no animation). */
  stillImageSrc: string | null
  gradient: string
}

export const ACCOUNT_SHOP_CATEGORY_OPTIONS: AccountShopCategoryOption[] = [
  {
    id: 'chatgpt',
    label: 'چت‌جی‌پی‌تی',
    shortDesc: 'اکانت پلاس آماده',
    imageSrc: '/account-shop/chatgpt-a.webp',
    stillImageSrc: '/account-shop/chatgpt-still.webp',
    gradient: 'linear-gradient(135deg, #19c39a 0%, #10a37f 50%, #0d8a6a 100%)',
  },
  {
    id: 'gemini',
    label: 'گوگل جمینای',
    shortDesc: 'جمینای پرو و گوگل AI',
    imageSrc: '/account-shop/google-a.webp',
    stillImageSrc: '/account-shop/google-still.webp',
    gradient: 'linear-gradient(135deg, #4fc3f7 0%, #4285f4 45%, #7b61ff 100%)',
  },
  {
    id: 'capcut',
    label: 'کپ‌کات پرو',
    shortDesc: 'اکانت ادیت ویدیو',
    imageSrc: '/account-shop/capcut-a.webp',
    stillImageSrc: '/account-shop/capcut-still.webp',
    gradient: 'linear-gradient(135deg, #5eead4 0%, #14b8a6 45%, #0f172a 100%)',
  },
  {
    id: 'canva',
    label: 'کانوا',
    shortDesc: 'پرو و EDU',
    imageSrc: '/account-shop/canva-a.webp',
    stillImageSrc: '/account-shop/canva-still.webp',
    gradient: 'linear-gradient(135deg, #00c4cc 0%, #7d2ae7 100%)',
  },
  {
    id: 'youtube',
    label: 'یوتیوب',
    shortDesc: 'پریمیوم و اسلات',
    imageSrc: '/account-shop/youtube-a.webp',
    stillImageSrc: '/account-shop/youtube-still.webp',
    gradient: 'linear-gradient(135deg, #ff4d4d 0%, #ff0000 50%, #cc0000 100%)',
  },
  {
    id: 'microsoft',
    label: 'مایکروسافت',
    shortDesc: 'آفیس و ۳۶۵',
    imageSrc: '/account-shop/microsoft-a.webp',
    stillImageSrc: '/account-shop/microsoft-still.webp',
    gradient: 'linear-gradient(135deg, #f25022 0%, #7fba00 35%, #00a4ef 70%, #ffb900 100%)',
  },
  {
    id: 'claude',
    label: 'کلاد AI',
    shortDesc: 'کلاد مکس',
    imageSrc: '/account-shop/claude-a.webp',
    stillImageSrc: '/account-shop/claude-still.webp',
    gradient: 'linear-gradient(135deg, #e8a87c 0%, #d97757 50%, #c15f3c 100%)',
  },
  {
    id: 'cursor',
    label: 'کرسر پرو',
    shortDesc: 'پرو و اولترا',
    imageSrc: '/account-shop/cursor-a.webp',
    stillImageSrc: '/account-shop/cursor-still.webp',
    gradient: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 50%, #1d4ed8 100%)',
  },
  {
    id: 'netflix',
    label: 'نتفلیکس',
    shortDesc: 'پریمیوم ۴K',
    imageSrc: '/account-shop/netflix-a.webp',
    stillImageSrc: '/account-shop/netflix-still.webp',
    gradient: 'linear-gradient(135deg, #f6121d 0%, #e50914 50%, #b20710 100%)',
  },
  {
    id: 'grok',
    label: 'گروک',
    shortDesc: 'سوپر گروک',
    imageSrc: '/account-shop/grok-a.webp',
    stillImageSrc: '/account-shop/grok-still.webp',
    gradient: 'linear-gradient(135deg, #a1a1aa 0%, #52525b 50%, #18181b 100%)',
  },
]
