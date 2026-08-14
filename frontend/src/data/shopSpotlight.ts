import type { AccountShopCategoryId } from '../lib/chatgpt'
import { accountShopProductKey } from './accountShopProducts'

export type ShopSpotlightEntry = {
  /** Shop category id or account product key (`account-*`). */
  productKey: string
  badge: string
  description: string
}

function accountEntry(
  categoryId: AccountShopCategoryId,
  badge: string,
  description: string,
): ShopSpotlightEntry {
  return {
    productKey: accountShopProductKey(categoryId),
    badge,
    description,
  }
}

/**
 * Curated highlights for shop spotlight.
 * Weighted toward account products; a few non-account services remain.
 */
export const shopSpotlight: ShopSpotlightEntry[] = [
  accountEntry('chatgpt', 'پرفروش', 'چت‌جی‌پی‌تی پلاس آماده با تحویل آنی'),
  accountEntry('gemini', 'محبوب', 'جمینای پرو و گوگل AI با فعال‌سازی سریع'),
  accountEntry('claude', 'هوشمند', 'کلاد مکس برای گفت‌وگوی پیشرفته'),
  accountEntry('cursor', 'توسعه‌دهنده', 'کرسر پرو و اولترا برای کدنویسی با AI'),
  accountEntry('grok', 'جدید', 'سوپر گروک با دسترسی سریع'),
  accountEntry('youtube', 'سرگرمی', 'یوتیوب پریمیوم و اسلات اشتراکی'),
  accountEntry('netflix', 'ویژه', 'نتفلیکس پریمیوم با کیفیت ۴K'),
  accountEntry('capcut', 'ادیت', 'کپ‌کات پرو برای ساخت ویدیو حرفه‌ای'),
  accountEntry('canva', 'طراحی', 'کانوا پرو و EDU برای طراحی سریع'),
  accountEntry('microsoft', 'اداری', 'آفیس و مایکروسافت ۳۶۵ آماده'),
  {
    productKey: 'telegram-stars',
    badge: 'پرفروش',
    description: 'شارژ آنی استارز بدون نیاز به کارت خارجی',
  },
  {
    productKey: 'telegram-premium',
    badge: 'محبوب',
    description: 'اشتراک رسمی پریمیوم با فعال‌سازی سریع',
  },
  {
    productKey: 'virtual-number',
    badge: 'آنی',
    description: 'شماره اختصاصی برای ساخت اکانت تلگرام',
  },
]
