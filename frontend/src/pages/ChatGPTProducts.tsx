import { useCallback, useEffect, useMemo, useState, type CSSProperties } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { EmptyState } from '../components/EmptyState'
import { PageHeader } from '../components/PageHeader'
import { ACCOUNT_SHOP_CATEGORY_OPTIONS } from '../data/accountShopCategories'
import {
  accountShopConfirmRoute,
  accountShopProductKey,
  isAccountShopCategoryId,
} from '../data/accountShopProducts'
import { useProductPageView } from '../hooks/useProductPageView'
import { useTelegram } from '../hooks/useTelegram'
import { isTelegramWebApp } from '../lib/api'
import {
  fetchAccountShopProducts,
  type AccountShopProduct,
} from '../lib/chatgpt'
import { formatTomanPrice } from '../lib/formatStars'
import type {
  AccountShopConfirmState,
  AccountShopProductsRestoreState,
} from '../types/accountShop'
import '../styles/shop-rise.css'
import './ChatGPT.css'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function ChatGPTProductsPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { categoryId: categoryIdParam } = useParams<{ categoryId: string }>()
  const { haptic } = useTelegram()

  const categoryId =
    categoryIdParam && isAccountShopCategoryId(categoryIdParam) ? categoryIdParam : null
  const category =
    ACCOUNT_SHOP_CATEGORY_OPTIONS.find((item) => item.id === categoryId) ?? null

  useProductPageView(categoryId ? accountShopProductKey(categoryId) : '')

  const [products, setProducts] = useState<AccountShopProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null)
  const [customerEmail, setCustomerEmail] = useState('')
  const [slotMonths, setSlotMonths] = useState<number | null>(null)

  const handleBack = useCallback(() => {
    navigate('/chatgpt', { replace: true })
  }, [navigate])

  useEffect(() => {
    if (categoryId) return
    navigate('/chatgpt', { replace: true })
  }, [categoryId, navigate])

  useEffect(() => {
    if (!isTelegramWebApp()) return

    const backButton = window.Telegram?.WebApp.BackButton
    if (!backButton) return

    backButton.show()
    backButton.onClick(handleBack)

    return () => {
      backButton.hide()
      backButton.offClick(handleBack)
    }
  }, [handleBack])

  useEffect(() => {
    const restored = location.state as AccountShopProductsRestoreState | null
    if (!restored?.categoryId || restored.categoryId !== categoryId) return
    if (restored.productId) setSelectedProductId(restored.productId)
    if (typeof restored.customerEmail === 'string') {
      setCustomerEmail(restored.customerEmail)
    }
    if (restored.slotMonths != null && Number.isFinite(restored.slotMonths)) {
      setSlotMonths(restored.slotMonths)
    }
  }, [categoryId, location.key, location.state])

  useEffect(() => {
    if (!categoryId) return

    let cancelled = false
    setIsLoading(true)
    setLoadError(null)

    void fetchAccountShopProducts()
      .then((catalog) => {
        if (cancelled) return
        const filtered = catalog.products
          .filter((item) => item.categoryId === categoryId)
          .sort((a, b) => a.sortOrder - b.sortOrder)
        setProducts(filtered)
      })
      .catch((error: unknown) => {
        if (cancelled) return
        setProducts([])
        setLoadError(
          error instanceof Error ? error.message : 'دریافت محصولات با خطا مواجه شد',
        )
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [categoryId])

  const selectedProduct =
    products.find((item) => item.productId === selectedProductId) ?? null

  useEffect(() => {
    if (!selectedProduct) {
      setSlotMonths(null)
      return
    }

    if (!selectedProduct.requiresSlotMonths) {
      setSlotMonths(null)
      return
    }

    const durations = selectedProduct.slotDurations
    if (durations.length === 0) {
      setSlotMonths(null)
      return
    }

    setSlotMonths((prev) => (prev != null && durations.includes(prev) ? prev : durations[0]))
  }, [selectedProduct])

  const emailValid = useMemo(() => {
    if (!selectedProduct?.requiresCustomerEmail) return true
    return EMAIL_RE.test(customerEmail.trim())
  }, [customerEmail, selectedProduct])

  const slotValid = useMemo(() => {
    if (!selectedProduct?.requiresSlotMonths) return true
    if (selectedProduct.slotDurations.length === 0) return true
    return slotMonths != null && selectedProduct.slotDurations.includes(slotMonths)
  }, [selectedProduct, slotMonths])

  const canContinue = Boolean(
    selectedProduct &&
      selectedProduct.inStock &&
      emailValid &&
      slotValid &&
      selectedProduct.toman > 0,
  )

  const handleSelectProduct = (product: AccountShopProduct) => {
    if (!product.inStock) return
    haptic('light')
    setSelectedProductId(product.productId)
  }

  const handleContinue = () => {
    if (!canContinue || !selectedProduct || !category || !categoryId) return
    haptic('light')

    const state: AccountShopConfirmState = {
      categoryId,
      categoryLabel: category.label,
      categoryImageSrc: category.imageSrc,
      product: selectedProduct,
      customerEmail: selectedProduct.requiresCustomerEmail
        ? customerEmail.trim().toLowerCase()
        : null,
      slotMonths: selectedProduct.requiresSlotMonths ? slotMonths : null,
      toman: selectedProduct.toman,
    }

    navigate(accountShopConfirmRoute(categoryId), { state })
  }

  if (!categoryId || !category) {
    return null
  }

  return (
    <div className="account-shop">
      <div className="shop-rise" style={{ '--rise-index': 0 } as CSSProperties}>
        <PageHeader title={category.label} onBack={handleBack} />
      </div>

      <div className="account-shop__body">
        <section
          className="account-shop__hero account-shop__hero--compact shop-rise"
          style={{ '--rise-index': 1 } as CSSProperties}
          aria-label={category.label}
        >
          <div className="account-shop__category-badge" aria-hidden>
            {category.imageSrc ? (
              <img src={category.imageSrc} alt="" width={56} height={56} decoding="async" />
            ) : (
              <span>{category.label.charAt(0)}</span>
            )}
          </div>
          <p className="account-shop__desc">
            {category.shortDesc}. محصول موردنظر را انتخاب کنید.
            <span className="account-shop__desc-accent"> تحویل آنی پس از پرداخت.</span>
          </p>
        </section>

        <section
          className="account-shop__products shop-rise"
          style={{ '--rise-index': 2 } as CSSProperties}
          aria-label="محصولات"
        >
          <div className="account-shop__section-head">
            <h2 className="account-shop__section-title">محصولات</h2>
          </div>

          {isLoading ? (
            <div className="account-shop__products-list" aria-hidden>
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="account-shop__skeleton account-shop__skeleton--product"
                />
              ))}
            </div>
          ) : loadError ? (
            <EmptyState
              compact
              title={loadError}
              action={
                <button
                  type="button"
                  className="account-shop__retry"
                  onClick={() => {
                    setIsLoading(true)
                    setLoadError(null)
                    void fetchAccountShopProducts()
                      .then((catalog) => {
                        setProducts(
                          catalog.products
                            .filter((item) => item.categoryId === categoryId)
                            .sort((a, b) => a.sortOrder - b.sortOrder),
                        )
                      })
                      .catch((error: unknown) => {
                        setLoadError(
                          error instanceof Error
                            ? error.message
                            : 'دریافت محصولات با خطا مواجه شد',
                        )
                      })
                      .finally(() => setIsLoading(false))
                  }}
                >
                  تلاش مجدد
                </button>
              }
            />
          ) : products.length === 0 ? (
            <EmptyState compact title="محصولی برای این دسته موجود نیست" />
          ) : (
            <div className="account-shop__products-list" role="list">
              {products.map((product) => {
                const isSelected = selectedProductId === product.productId
                const unavailable = !product.inStock

                return (
                  <button
                    key={product.productId}
                    type="button"
                    role="listitem"
                    disabled={unavailable}
                    className={`account-shop__product${
                      isSelected ? ' account-shop__product--selected' : ''
                    }${unavailable ? ' account-shop__product--disabled' : ''}`}
                    onClick={() => handleSelectProduct(product)}
                  >
                    <span className="account-shop__product-start">
                      <span className="account-shop__product-copy">
                        <span className="account-shop__product-name">{product.name}</span>
                        <span className="account-shop__product-desc">
                          {unavailable
                            ? 'ناموجود'
                            : product.available != null
                              ? `${product.shortDesc} · ${product.available.toLocaleString('fa-IR')} موجود`
                              : product.shortDesc}
                        </span>
                      </span>
                    </span>
                    <span className="account-shop__product-price">
                      <span className="account-shop__product-price-value">
                        {formatTomanPrice(product.toman)}
                      </span>
                      <span className="account-shop__product-price-unit">تومان</span>
                    </span>
                  </button>
                )
              })}
            </div>
          )}
        </section>

        {selectedProduct?.requiresCustomerEmail ? (
          <section
            className="account-shop__extra shop-rise"
            style={{ '--rise-index': 3 } as CSSProperties}
            aria-label="ایمیل"
          >
            <div className="account-shop__section-head">
              <h2 className="account-shop__section-title">ایمیل اکانت</h2>
            </div>
            <div
              className={`account-shop__field${
                customerEmail && !emailValid ? ' account-shop__field--error' : ''
              }`}
            >
              <input
                type="email"
                className="account-shop__field-input"
                value={customerEmail}
                onChange={(event) => setCustomerEmail(event.target.value)}
                placeholder="example@gmail.com"
                dir="ltr"
                autoComplete="email"
                inputMode="email"
                aria-label="ایمیل اکانت"
              />
            </div>
            <p className="account-shop__field-hint">
              اسلات به این ایمیل اضافه می‌شود؛ ایمیل را دقیق وارد کنید.
            </p>
          </section>
        ) : null}

        {selectedProduct?.requiresSlotMonths && selectedProduct.slotDurations.length > 0 ? (
          <section
            className="account-shop__extra shop-rise"
            style={{ '--rise-index': 4 } as CSSProperties}
            aria-label="مدت اسلات"
          >
            <div className="account-shop__section-head">
              <h2 className="account-shop__section-title">مدت اسلات</h2>
            </div>
            <div className="account-shop__chips">
              {selectedProduct.slotDurations.map((months) => {
                const isSelected = slotMonths === months
                return (
                  <button
                    key={months}
                    type="button"
                    className={`account-shop__chip${
                      isSelected ? ' account-shop__chip--selected' : ''
                    }`}
                    onClick={() => {
                      haptic('light')
                      setSlotMonths(months)
                    }}
                  >
                    {months.toLocaleString('fa-IR')} ماه
                  </button>
                )
              })}
            </div>
          </section>
        ) : null}
      </div>

      <footer
        className="account-shop__footer shop-rise"
        style={{ '--rise-index': 5 } as CSSProperties}
      >
        <button
          type="button"
          className="account-shop__continue"
          disabled={!canContinue}
          onClick={handleContinue}
        >
          ادامه
        </button>
      </footer>
    </div>
  )
}
