import { useEffect, useState, type CSSProperties } from 'react'
import ChatGPTIcon from './icons/ChatGPTIcon'
import { ACCOUNT_SHOP_CATEGORY_OPTIONS } from '../data/accountShopCategories'
import {
  parseAccountShopProductKey,
} from '../data/accountShopProducts'
import { shopCategories, type ShopCategory } from '../data/shopCategories'
import {
  fetchShopPopular,
  readLocalShopPopular,
  writeLocalShopPopular,
  type ShopPopularItem,
  type ShopPopularPayload,
} from '../lib/shopPopular'
import { useTelegram } from '../hooks/useTelegram'
import '../styles/shop-rise.css'
import './ShopPopularRails.css'

type ShopPopularRailsProps = {
  riseIndex: number
  onSelect: (productKey: string, isActive: boolean) => void
}

type ResolvedPopularItem = {
  productKey: string
  label: string
  isActive: boolean
  gradient: string
  iconColor?: string
  imageSrc: string | null
  Icon: ShopCategory['icon'] | null
}

function resolvePopularItem(productKey: string): ResolvedPopularItem | null {
  const accountId = parseAccountShopProductKey(productKey)
  if (accountId) {
    const account = ACCOUNT_SHOP_CATEGORY_OPTIONS.find((item) => item.id === accountId)
    if (!account) return null
    return {
      productKey,
      label: account.label,
      isActive: true,
      gradient: account.gradient,
      imageSrc: account.stillImageSrc ?? account.imageSrc,
      Icon: ChatGPTIcon,
    }
  }

  const category = shopCategories.find((item) => item.id === productKey)
  if (!category) return null
  return {
    productKey,
    label: category.label,
    isActive: category.isActive,
    gradient: category.gradient,
    iconColor: category.iconColor,
    imageSrc: null,
    Icon: category.icon,
  }
}

function faNumber(value: number): string {
  return value.toLocaleString('fa-IR')
}

function BestsellerRail({
  items,
  riseIndex,
  onSelect,
}: {
  items: ShopPopularItem[]
  riseIndex: number
  onSelect: (productKey: string, isActive: boolean) => void
}) {
  const { haptic } = useTelegram()
  const visible = items
    .map((item) => ({ item, resolved: resolvePopularItem(item.productKey) }))
    .filter((entry): entry is { item: ShopPopularItem; resolved: ResolvedPopularItem } =>
      Boolean(entry.resolved),
    )
    .slice(0, 8)

  if (visible.length === 0) {
    return null
  }

  return (
    <section
      className="shop-popular shop-rise"
      style={{ '--rise-index': riseIndex } as CSSProperties}
      aria-label="پرفروش‌ترین محصولات"
    >
      <div className="shop-popular__head">
        <h2 className="shop-popular__title">
          <span className="shop-popular__title-accent">پرفروش</span>‌ترین‌ها
        </h2>
        <span className="shop-popular__hint">بر اساس سفارش‌های موفق</span>
      </div>

      <div className="shop-popular__scroller" dir="rtl">
        {visible.map(({ item, resolved }, index) => {
          const Icon = resolved.Icon

          return (
            <button
              key={`best-${item.productKey}`}
              type="button"
              className={`shop-popular__card${resolved.isActive ? '' : ' shop-popular__card--disabled'}`}
              style={{ '--card-gradient': resolved.gradient } as CSSProperties}
              disabled={!resolved.isActive}
              onClick={() => {
                if (!resolved.isActive) return
                haptic('light')
                onSelect(item.productKey, resolved.isActive)
              }}
            >
              <span className="shop-popular__rank" aria-hidden="true">
                {faNumber(index + 1)}
              </span>

              <span
                className={`shop-popular__icon${resolved.imageSrc ? ' shop-popular__icon--account' : ''}`}
              >
                {resolved.imageSrc ? (
                  <img src={resolved.imageSrc} alt="" width={32} height={32} draggable={false} />
                ) : Icon ? (
                  <Icon width={18} height={18} color={resolved.iconColor ?? '#ffffff'} />
                ) : null}
              </span>

              <span className="shop-popular__label">{resolved.label}</span>
              <span className="shop-popular__metric">
                {item.count > 0 ? `${faNumber(item.count)} سفارش` : 'آماده سفارش'}
              </span>
            </button>
          )
        })}
      </div>
    </section>
  )
}

function PopularSkeleton({ riseIndex }: { riseIndex: number }) {
  return (
    <div
      className="shop-popular shop-rise"
      style={{ '--rise-index': riseIndex } as CSSProperties}
      aria-busy="true"
    >
      <div className="shop-popular__title-skel" />
      <div className="shop-popular__scroller">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={`best-skel-${index}`} className="shop-popular__card-skel" />
        ))}
      </div>
    </div>
  )
}

export function ShopPopularRails({ riseIndex, onSelect }: ShopPopularRailsProps) {
  const cached = readLocalShopPopular()
  const [payload, setPayload] = useState<ShopPopularPayload | null>(() => cached)

  useEffect(() => {
    let cancelled = false

    const apply = (data: ShopPopularPayload) => {
      writeLocalShopPopular(data)
      if (!cancelled) setPayload(data)
    }

    const local = readLocalShopPopular()
    if (local && !cancelled) {
      setPayload(local)
    }

    void fetchShopPopular()
      .then((data) => {
        if (cancelled) return
        apply(data)
      })
      .catch(() => {
        if (cancelled) return
        if (local) return

        const fallback = shopCategories
          .filter((item) => item.isActive)
          .slice(0, 6)
          .map((item) => ({
            productKey: item.id,
            label: item.label,
            count: 0,
          }))
        apply({
          bestsellers: fallback,
          mostViewed: fallback,
          cachedAt: new Date().toISOString(),
        })
      })

    return () => {
      cancelled = true
    }
  }, [])

  if (!payload) {
    return <PopularSkeleton riseIndex={riseIndex} />
  }

  return <BestsellerRail items={payload.bestsellers} riseIndex={riseIndex} onSelect={onSelect} />
}
