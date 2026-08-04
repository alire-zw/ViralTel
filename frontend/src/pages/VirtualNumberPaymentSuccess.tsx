import { useCallback, useEffect, useMemo, useState, type CSSProperties } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Notification } from '../components/Notification'
import { PageHeader } from '../components/PageHeader'
import CopyIcon from '../components/icons/CopyIcon'
import SuccessIcon from '../components/icons/SuccessIcon'
import { useTelegram } from '../hooks/useTelegram'
import { isTelegramWebApp } from '../lib/api'
import { getCountryFlagUrl } from '../lib/countryFlags'
import { fetchOrder } from '../lib/orders'
import type { ShopOrder } from '../lib/orders'
import { fetchVirtualNumberCode } from '../lib/virtualNumber'
import '../styles/shop-rise.css'
import './WalletPaymentResult.css'
import './VirtualNumberPaymentSuccess.css'

function formatToman(value: string | number): string {
  const amount = typeof value === 'string' ? Number.parseInt(value, 10) : value
  if (!Number.isFinite(amount)) return '۰'
  return amount.toLocaleString('fa-IR')
}

function splitVirtualNumber(numberRaw: string, rangeRaw?: string | null) {
  const digits = numberRaw.replace(/\D/g, '')
  const range = (rangeRaw ?? '').replace(/\D/g, '')

  if (!digits) {
    return {
      display: numberRaw,
      withPrefix: numberRaw,
      withoutPrefix: numberRaw,
    }
  }

  if (range && digits.startsWith(range) && digits.length > range.length) {
    const local = digits.slice(range.length)
    return {
      display: `+${range} ${local}`,
      withPrefix: `+${range}${local}`,
      withoutPrefix: local,
    }
  }

  return {
    display: `+${digits}`,
    withPrefix: `+${digits}`,
    withoutPrefix: digits,
  }
}

export function VirtualNumberPaymentSuccessPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const orderId = searchParams.get('orderId')
  const { haptic } = useTelegram()
  const [order, setOrder] = useState<ShopOrder | null>(null)
  const [isLoading, setIsLoading] = useState(Boolean(orderId))
  const [verificationCode, setVerificationCode] = useState<string | null>(null)
  const [isFetchingCode, setIsFetchingCode] = useState(false)
  const [notification, setNotification] = useState<{
    show: boolean
    message: string
    type: 'success' | 'error' | 'warning' | 'info'
  }>({
    show: false,
    message: '',
    type: 'success',
  })

  const handleBack = useCallback(() => {
    navigate('/', { replace: true })
  }, [navigate])

  useEffect(() => {
    haptic('medium')
  }, [haptic])

  useEffect(() => {
    let cancelled = false

    const loadOrder = async () => {
      if (!orderId) {
        setIsLoading(false)
        return
      }

      setIsLoading(true)

      try {
        const response = await fetchOrder(orderId)
        if (!cancelled) {
          setOrder(response.order)
          if (response.order.virtualNumber?.code) {
            setVerificationCode(response.order.virtualNumber.code)
          }
        }
      } catch {
        if (!cancelled) {
          setOrder(null)
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void loadOrder()

    return () => {
      cancelled = true
    }
  }, [orderId])

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

  const purchasedNumber = order?.virtualNumber?.number ?? null
  const range = order?.virtualNumber?.range ?? null
  const countryLabel = order?.recipientName?.trim() || null
  const flagCode = order?.recipientPhoto?.trim() || null

  const phoneParts = useMemo(() => {
    if (!purchasedNumber) return null
    return splitVirtualNumber(purchasedNumber, range)
  }, [purchasedNumber, range])

  const showNotification = (
    message: string,
    type: 'success' | 'error' | 'warning' | 'info' = 'success',
  ) => {
    setNotification({ show: true, message, type })
  }

  const hideNotification = () => {
    setNotification((prev) => ({ ...prev, show: false }))
  }

  const copyText = async (value: string, successMessage: string) => {
    try {
      await navigator.clipboard.writeText(value)
      haptic('light')
      showNotification(successMessage, 'success')
    } catch {
      showNotification('کپی انجام نشد', 'error')
    }
  }

  const handleFetchCode = async () => {
    if (!orderId || isFetchingCode) return

    if (verificationCode) {
      haptic('light')
      return
    }

    haptic('light')
    setIsFetchingCode(true)

    try {
      const response = await fetchVirtualNumberCode(orderId)

      if (response.status === 'ready') {
        setVerificationCode(response.code)
        setOrder((prev) =>
          prev?.virtualNumber
            ? {
                ...prev,
                virtualNumber: {
                  ...prev.virtualNumber,
                  code: response.code,
                },
              }
            : prev,
        )
        return
      }

      showNotification(response.message || 'کد هنوز آماده نیست', 'info')
    } catch (error) {
      showNotification(error instanceof Error ? error.message : 'خطا در دریافت کد', 'error')
    } finally {
      setIsFetchingCode(false)
    }
  }

  return (
    <div className="wallet-payment-result wallet-payment-result--success">
      <Notification
        show={notification.show}
        message={notification.message}
        type={notification.type}
        onClose={hideNotification}
      />

      <div className="shop-rise" style={{ '--rise-index': 0 } as CSSProperties}>
        <PageHeader title="خرید موفق" onBack={handleBack} />
      </div>

      <div className="wallet-payment-result__content">
        <section
          className="wallet-payment-result__hero shop-rise"
          style={{ '--rise-index': 1 } as CSSProperties}
        >
          <div className="wallet-payment-result__icon wallet-payment-result__icon--success">
            <SuccessIcon width={34} height={34} />
          </div>
          <h2 className="wallet-payment-result__title">خرید شماره مجازی با موفقیت انجام شد</h2>
          <p className="wallet-payment-result__subtitle">
            سفارش شما با موفقیت ثبت و پردازش شد.
          </p>
        </section>

        <section
          className="vn-success-number shop-rise"
          style={{ '--rise-index': 2 } as CSSProperties}
          aria-label="شماره خریداری‌شده"
        >
          <div className="vn-success-number__head">
            <span className="vn-success-number__title">شماره خریداری شده</span>
            <div className="vn-success-number__actions">
              <button
                type="button"
                className="vn-success-number__copy"
                disabled={!phoneParts}
                onClick={() => {
                  if (!phoneParts) return
                  void copyText(phoneParts.withoutPrefix, 'شماره بدون پیش‌شماره کپی شد')
                }}
              >
                <CopyIcon width={13} height={13} />
                بدون پیش‌شماره
              </button>
              <button
                type="button"
                className="vn-success-number__copy"
                disabled={!phoneParts}
                onClick={() => {
                  if (!phoneParts) return
                  void copyText(phoneParts.withPrefix, 'شماره با پیش‌شماره کپی شد')
                }}
              >
                <CopyIcon width={13} height={13} />
                با پیش‌شماره
              </button>
            </div>
          </div>

          <div className="vn-success-number__body">
            <div className="vn-success-number__phone-box" dir="ltr">
              {isLoading ? (
                <span className="wallet-payment-result__skeleton wallet-payment-result__skeleton--wide" />
              ) : (
                <span className="vn-success-number__value">{phoneParts?.display ?? '—'}</span>
              )}
            </div>

            <button
              type="button"
              className="vn-success-number__code-btn"
              disabled={!phoneParts || isFetchingCode}
              onClick={() => void handleFetchCode()}
            >
              {isFetchingCode ? 'در حال دریافت...' : verificationCode ? 'کد دریافت شد' : 'دریافت کد'}
            </button>
          </div>
        </section>

        {verificationCode ? (
          <section
            key={`code-${verificationCode}`}
            className="vn-success-number shop-rise"
            style={{ '--rise-index': 0 } as CSSProperties}
            aria-label="کد تأیید"
          >
            <div className="vn-success-number__head">
              <span className="vn-success-number__title">کد تأیید</span>
            </div>

            <div className="vn-success-number__body">
              <div className="vn-success-number__phone-box" dir="ltr">
                <span className="vn-success-number__value">{verificationCode}</span>
              </div>

              <button
                type="button"
                className="vn-success-number__code-btn"
                onClick={() => void copyText(verificationCode, 'کد تأیید کپی شد')}
              >
                کپی کد
              </button>
            </div>
          </section>
        ) : null}

        <section
          className="wallet-payment-result__card shop-rise"
          style={{ '--rise-index': verificationCode ? 4 : 3 } as CSSProperties}
          aria-label="جزئیات سفارش"
        >
          <div className="wallet-payment-result__row">
            <span className="wallet-payment-result__row-label">مبلغ پرداختی</span>
            {isLoading ? (
              <span className="wallet-payment-result__skeleton" />
            ) : (
              <span className="wallet-payment-result__row-value wallet-payment-result__row-value--amount">
                <span className="wallet-payment-result__row-unit">تومان</span>
                <span>{order ? formatToman(order.amountToman) : '—'}</span>
              </span>
            )}
          </div>
          {countryLabel ? (
            <div className="wallet-payment-result__row">
              <span className="wallet-payment-result__row-label">کشور</span>
              {isLoading ? (
                <span className="wallet-payment-result__skeleton" />
              ) : (
                <span className="vn-success-country">
                  {flagCode ? (
                    <img
                      src={getCountryFlagUrl(flagCode)}
                      alt=""
                      className="vn-success-country__flag"
                      width={24}
                      height={18}
                      decoding="async"
                    />
                  ) : null}
                  <span className="vn-success-country__name">{countryLabel}</span>
                </span>
              )}
            </div>
          ) : null}
          <div className="wallet-payment-result__row">
            <span className="wallet-payment-result__row-label">شماره سفارش</span>
            {isLoading ? (
              <span className="wallet-payment-result__skeleton" />
            ) : (
              <span className="wallet-payment-result__row-value">
                {order?.orderId ?? orderId ?? '—'}
              </span>
            )}
          </div>
        </section>
      </div>

      <footer
        className="wallet-payment-result__footer vn-success-footer shop-rise"
        style={{ '--rise-index': verificationCode ? 5 : 4 } as CSSProperties}
      >
        <button
          type="button"
          className="vn-success-footer__primary"
          onClick={() => {
            haptic('light')
            handleBack()
          }}
        >
          رفتن به فروشگاه
        </button>
        <button
          type="button"
          className="vn-success-footer__secondary"
          onClick={() => {
            haptic('light')
            navigate('/wallet', { replace: true })
          }}
        >
          بازگشت به کیف پول
        </button>
      </footer>
    </div>
  )
}
