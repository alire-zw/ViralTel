import { useCallback, useEffect, useMemo, useState, type CSSProperties } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  ConfirmPaymentMethods,
  getConfirmPayableToman,
  getDefaultConfirmPaymentMethod,
} from '../components/ConfirmPaymentMethods'
import { Notification } from '../components/Notification'
import { PageHeader } from '../components/PageHeader'
import { useUser } from '../context/UserContext'
import { accountShopRoute } from '../data/accountShopProducts'
import { useTelegram } from '../hooks/useTelegram'
import { balanceToToman, isTelegramWebApp } from '../lib/api'
import type {
  AccountShopConfirmState,
  AccountShopPaymentMethod,
  AccountShopProductsRestoreState,
} from '../types/accountShop'
import '../styles/shop-rise.css'
import './ChatGPTConfirm.css'

function isValidConfirmState(state: AccountShopConfirmState | null): state is AccountShopConfirmState {
  if (!state?.product?.productId) return false
  if (!state.categoryId || !state.categoryLabel) return false
  if (!Number.isFinite(state.toman) || state.toman <= 0) return false
  if (state.product.requiresCustomerEmail && !state.customerEmail) return false
  if (
    state.product.requiresSlotMonths &&
    state.product.slotDurations.length > 0 &&
    (state.slotMonths == null || !state.product.slotDurations.includes(state.slotMonths))
  ) {
    return false
  }
  return true
}

export function ChatGPTConfirmPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useUser()
  const { haptic } = useTelegram()
  const confirmState = location.state as AccountShopConfirmState | null
  const balance = user ? balanceToToman(user.balance) : 0

  const [method, setMethod] = useState<AccountShopPaymentMethod>(() =>
    getDefaultConfirmPaymentMethod(
      balance,
      isValidConfirmState(confirmState) ? confirmState.toman : 0,
    ),
  )
  const [useWalletBalance, setUseWalletBalance] = useState(false)
  const [notification, setNotification] = useState<{
    show: boolean
    message: string
    type: 'success' | 'error' | 'warning' | 'info'
  }>({
    show: false,
    message: '',
    type: 'info',
  })

  useEffect(() => {
    if (!isValidConfirmState(confirmState)) return
    if (balance < confirmState.toman) {
      setMethod('zibal')
      setUseWalletBalance(false)
    }
  }, [balance, confirmState])

  const handleBack = useCallback(() => {
    if (!isValidConfirmState(confirmState)) {
      navigate('/chatgpt', { replace: true })
      return
    }

    const restore: AccountShopProductsRestoreState = {
      categoryId: confirmState.categoryId,
      productId: confirmState.product.productId,
      customerEmail: confirmState.customerEmail ?? undefined,
      slotMonths: confirmState.slotMonths,
    }

    navigate(accountShopRoute(confirmState.categoryId), { replace: true, state: restore })
  }, [confirmState, navigate])

  useEffect(() => {
    if (isValidConfirmState(confirmState)) return
    navigate('/chatgpt', { replace: true })
  }, [confirmState, navigate])

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

  const walletInsufficient = useMemo(() => {
    if (!isValidConfirmState(confirmState)) return false
    return balance < confirmState.toman
  }, [balance, confirmState])

  if (!isValidConfirmState(confirmState)) {
    return null
  }

  const { product, categoryLabel, categoryImageSrc, customerEmail, slotMonths, toman } =
    confirmState
  const payableToman = getConfirmPayableToman(method, toman, balance, useWalletBalance)

  const handleContinue = () => {
    if (method === 'wallet' && walletInsufficient) {
      setNotification({
        show: true,
        message: 'موجودی کیف پول کافی نیست',
        type: 'warning',
      })
      return
    }

    haptic('light')
    setNotification({
      show: true,
      message: 'پرداخت خرید اکانت به‌زودی فعال می‌شود',
      type: 'info',
    })
  }

  return (
    <div className="account-shop-confirm">
      <Notification
        show={notification.show}
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification((prev) => ({ ...prev, show: false }))}
      />

      <div className="shop-rise" style={{ '--rise-index': 0 } as CSSProperties}>
        <PageHeader title="تأیید خرید اکانت" onBack={handleBack} />
      </div>

      <div className="account-shop-confirm__content">
        <h2
          className="account-shop-confirm__section-title shop-rise"
          style={{ '--rise-index': 1 } as CSSProperties}
        >
          محصول
        </h2>

        <div
          className="account-shop-confirm__product shop-rise"
          style={{ '--rise-index': 2 } as CSSProperties}
          aria-label="محصول انتخاب‌شده"
        >
          <span className="account-shop-confirm__product-thumb" aria-hidden>
            {categoryImageSrc ? (
              <img src={categoryImageSrc} alt="" width={36} height={36} />
            ) : (
              <span>{categoryLabel.charAt(0)}</span>
            )}
          </span>
          <div className="account-shop-confirm__product-meta">
            <span className="account-shop-confirm__product-name">{product.name}</span>
            <span className="account-shop-confirm__product-sub">
              {categoryLabel}
              {slotMonths != null ? ` · ${slotMonths.toLocaleString('fa-IR')} ماه` : ''}
              {customerEmail ? ` · ${customerEmail}` : ''}
            </span>
          </div>
        </div>

        <section
          className="account-shop-confirm__summary shop-rise"
          style={{ '--rise-index': 3 } as CSSProperties}
          aria-label="مبلغ قابل پرداخت"
        >
          <span className="account-shop-confirm__summary-label">مبلغ قابل پرداخت</span>
          <div className="account-shop-confirm__summary-value-row">
            <span className="account-shop-confirm__summary-unit">تومان</span>
            <span className="account-shop-confirm__summary-value">
              {payableToman.toLocaleString('fa-IR')}
            </span>
          </div>
          <p className="account-shop-confirm__summary-note">{product.shortDesc}</p>
        </section>

        <h2
          className="account-shop-confirm__section-title shop-rise"
          style={{ '--rise-index': 4 } as CSSProperties}
        >
          روش پرداخت
        </h2>

        <div className="shop-rise" style={{ '--rise-index': 5 } as CSSProperties}>
          <ConfirmPaymentMethods
            method={method}
            onMethodChange={(next) => {
              setMethod(next)
              if (next !== 'zibal') setUseWalletBalance(false)
            }}
            balance={balance}
            toman={toman}
            useWalletBalance={useWalletBalance}
            onUseWalletBalanceChange={setUseWalletBalance}
            walletInsufficient={walletInsufficient}
            onHaptic={() => haptic('light')}
            accent="#10a37f"
          />
        </div>
      </div>

      <footer
        className="account-shop-confirm__footer shop-rise"
        style={{ '--rise-index': 6 } as CSSProperties}
      >
        <button
          type="button"
          className="account-shop-confirm__continue"
          disabled={method === 'wallet' && walletInsufficient}
          onClick={handleContinue}
        >
          ادامه
        </button>
      </footer>
    </div>
  )
}
