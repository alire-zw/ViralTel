import type { CSSProperties } from 'react'
import { getBannerByOrder } from '../data/shopBanners'
import { useTelegram } from '../hooks/useTelegram'
import '../styles/shop-rise.css'
import './ShopBanners.css'

interface ShopBannersProps {
  onBannerClick?: (categoryId?: string) => void
}

export function ShopBanners({ onBannerClick }: ShopBannersProps) {
  const { haptic } = useTelegram()

  const banner1 = getBannerByOrder(1)
  const banner2 = getBannerByOrder(2)
  const banner3 = getBannerByOrder(3)

  const handleClick = (categoryId?: string) => {
    haptic('light')
    onBannerClick?.(categoryId)
  }

  if (!banner1 && !banner2 && !banner3) {
    return null
  }

  return (
    <section className="shop-banners" aria-label="بنرها">
      <div className="shop-banners__row">
        {banner1 && (
          <button
            type="button"
            className="shop-banners__item shop-banners__item--main shop-rise"
            style={{ background: banner1.gradient, '--rise-index': 1 } as CSSProperties}
            onClick={() => handleClick(banner1.categoryId)}
          >
            {banner1.imageUrl ? (
              <img src={banner1.imageUrl} alt={banner1.title} className="shop-banners__image" />
            ) : (
              <span className="shop-banners__content shop-banners__content--main">
                <span className="shop-banners__title">{banner1.title}</span>
                {banner1.subtitle && (
                  <span className="shop-banners__subtitle">{banner1.subtitle}</span>
                )}
              </span>
            )}
          </button>
        )}

        <div className="shop-banners__side">
          {banner2 && (
            <button
              type="button"
              className="shop-banners__item shop-banners__item--small shop-rise"
              style={{ background: banner2.gradient, '--rise-index': 2 } as CSSProperties}
              onClick={() => handleClick(banner2.categoryId)}
            >
              {banner2.imageUrl ? (
                <img src={banner2.imageUrl} alt={banner2.title} className="shop-banners__image" />
              ) : (
                <span className="shop-banners__content">
                  <span className="shop-banners__title shop-banners__title--small">
                    {banner2.title}
                  </span>
                </span>
              )}
            </button>
          )}

          {banner3 && (
            <button
              type="button"
              className="shop-banners__item shop-banners__item--small shop-rise"
              style={{ background: banner3.gradient, '--rise-index': 3 } as CSSProperties}
              onClick={() => handleClick(banner3.categoryId)}
            >
              {banner3.imageUrl ? (
                <img src={banner3.imageUrl} alt={banner3.title} className="shop-banners__image" />
              ) : (
                <span className="shop-banners__content">
                  <span className="shop-banners__title shop-banners__title--small">
                    {banner3.title}
                  </span>
                </span>
              )}
            </button>
          )}
        </div>
      </div>
    </section>
  )
}
