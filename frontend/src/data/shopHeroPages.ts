import type { ShopHeroTheme } from '../components/ShopHeroPage'

export type ShopHeroPageConfig = {
  route: string
  title: string
  ariaLabel: string
  theme: ShopHeroTheme
  stillSrc: string
  animatedSrc: string
}

export const shopHeroPages = {
  'virtual-number': {
    route: '/virtual-number',
    title: 'شماره مجازی',
    ariaLabel: 'شماره مجازی',
    theme: 'virtual-number',
    stillSrc: '/shop-heroes/virtual-number/telephone-receiver-still.webp',
    animatedSrc: '/shop-heroes/virtual-number/telephone-receiver.webp',
  },
  'channel-views': {
    route: '/channel-views',
    title: 'سین کانال',
    ariaLabel: 'سین کانال',
    theme: 'channel-views',
    stillSrc: '/shop-heroes/channel-views/eyes-still.webp',
    animatedSrc: '/shop-heroes/channel-views/eyes.webp',
  },
  reaction: {
    route: '/reaction',
    title: 'ری‌اکشن',
    ariaLabel: 'ری‌اکشن',
    theme: 'reaction',
    stillSrc: '/shop-heroes/reaction/heart-on-fire-still.webp',
    animatedSrc: '/shop-heroes/reaction/heart-on-fire.webp',
  },
  'telegram-members': {
    route: '/telegram-members',
    title: 'ممبر تلگرام',
    ariaLabel: 'ممبر تلگرام',
    theme: 'telegram-members',
    stillSrc: '/shop-heroes/telegram-members/chart-increasing-still.webp',
    animatedSrc: '/shop-heroes/telegram-members/chart-increasing.webp',
  },
  chatgpt: {
    route: '/chatgpt',
    title: 'خرید اکانت',
    ariaLabel: 'خرید اکانت',
    theme: 'chatgpt',
    stillSrc: '/shop-heroes/chatgpt/robot-still.webp',
    animatedSrc: '/shop-heroes/chatgpt/robot.webp',
  },
} satisfies Record<string, ShopHeroPageConfig>

export const shopHeroRoutes = Object.fromEntries(
  Object.entries(shopHeroPages).map(([categoryId, config]) => [categoryId, config.route]),
) as Record<keyof typeof shopHeroPages, string>

export const shopHeroNavPaths = Object.values(shopHeroPages).map((config) => config.route)
