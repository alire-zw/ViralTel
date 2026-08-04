import type { ComponentType } from 'react'
import StarsIcon from '../components/icons/stars-stroke-rounded'
import TelegramIcon from '../components/icons/TelegramIcon'
import PhoneIcon from '../components/icons/PhoneIcon'
import SocialMediaIcon from '../components/icons/SocialMediaIcon'
import ViewIcon from '../components/icons/ViewIcon'
import ShopIcon from '../components/icons/ShopIcon'
import ColleagueIcon from '../components/icons/ColleagueIcon'
import ChatGPTIcon from '../components/icons/ChatGPTIcon'

type IconProps = {
  width?: number | string
  height?: number | string
  color?: string
  className?: string
}

export type ShopCategory = {
  id: string
  label: string
  icon: ComponentType<IconProps>
  gradient: string
  iconColor?: string
  isActive: boolean
}

export const shopCategories: ShopCategory[] = [
  {
    id: 'telegram-stars',
    label: 'استارز تلگرام',
    icon: StarsIcon,
    gradient: 'linear-gradient(135deg, #ffe566 0%, #ffb800 45%, #ff9500 100%)',
    isActive: true,
  },
  {
    id: 'telegram-premium',
    label: 'تلگرام پریمیوم',
    icon: TelegramIcon,
    gradient: 'linear-gradient(135deg, #7b61ff 0%, #9d47ea 50%, #c471ed 100%)',
    isActive: true,
  },
  {
    id: 'virtual-number',
    label: 'شماره مجازی',
    icon: PhoneIcon,
    gradient: 'linear-gradient(135deg, #34d399 0%, #10b981 50%, #059669 100%)',
    isActive: true,
  },
  {
    id: 'reaction',
    label: 'ری‌اکشن',
    icon: SocialMediaIcon,
    gradient: 'linear-gradient(135deg, #fb7185 0%, #f43f5e 50%, #e11d48 100%)',
    isActive: true,
  },
  {
    id: 'channel-views',
    label: 'سین کانال',
    icon: ViewIcon,
    gradient: 'linear-gradient(135deg, #38bdf8 0%, #0ea5e9 50%, #0284c7 100%)',
    isActive: true,
  },
  {
    id: 'telegram-gifts',
    label: 'گیفت تلگرام',
    icon: ShopIcon,
    gradient: 'linear-gradient(135deg, #fb923c 0%, #f97316 50%, #ea580c 100%)',
    isActive: true,
  },
  {
    id: 'telegram-members',
    label: 'ممبر تلگرام',
    icon: ColleagueIcon,
    gradient: 'linear-gradient(135deg, #0088cc 0%, #229ed9 50%, #37aee2 100%)',
    isActive: true,
  },
  {
    id: 'chatgpt',
    label: 'خرید اکانت',
    icon: ChatGPTIcon,
    gradient: 'linear-gradient(135deg, #10a37f 0%, #1a7f64 100%)',
    isActive: true,
  },
]
