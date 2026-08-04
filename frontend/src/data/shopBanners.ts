export type ShopBanner = {
  id: number
  displayOrder: number
  title: string
  subtitle?: string
  gradient: string
  imageUrl?: string
  categoryId?: string
}

export const shopBanners: ShopBanner[] = [
  {
    id: 1,
    displayOrder: 1,
    title: 'خرید استارز تلگرام',
    subtitle: 'تحویل فوری و مطمئن',
    gradient: 'linear-gradient(135deg, #ffe566 0%, #ffb800 45%, #ff9500 100%)',
    categoryId: 'telegram-stars',
  },
  {
    id: 2,
    displayOrder: 2,
    title: 'تلگرام پریمیوم',
    gradient: 'linear-gradient(135deg, #7b61ff 0%, #9d47ea 50%, #c471ed 100%)',
    categoryId: 'telegram-premium',
  },
  {
    id: 3,
    displayOrder: 3,
    title: 'شماره مجازی',
    gradient: 'linear-gradient(135deg, #34d399 0%, #10b981 50%, #059669 100%)',
    categoryId: 'virtual-number',
  },
]

export function getBannerByOrder(order: number) {
  return shopBanners.find((banner) => banner.displayOrder === order)
}
