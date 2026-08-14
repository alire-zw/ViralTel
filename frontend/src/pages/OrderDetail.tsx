import { useCallback, useEffect, useMemo, useState, type CSSProperties, type ReactNode } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { EmptyState } from '../components/EmptyState'
import { Notification } from '../components/Notification'
import { PageHeader } from '../components/PageHeader'
import ContactIcon from '../components/icons/ContactIcon'
import CopyIcon from '../components/icons/CopyIcon'
import ShopIcon from '../components/icons/ShopIcon'
import { shopCategories } from '../data/shopCategories'
import { useTelegram } from '../hooks/useTelegram'
import { isTelegramWebApp } from '../lib/api'
import { fetchOrder, type ShopOrder } from '../lib/orders'
import {
  formatFaDateTimeLong,
  formatFaNumber,
  orderStatusLabel,
  paymentMethodLabel,
} from './admin/adminLabels'
import '../styles/shop-rise.css'
import './OrderDetail.css'

type DetailCell = {
  label: string
  value: ReactNode
  valueClassName?: string
  copyValue?: string
}

type DetailGroup = {
  cols: 1 | 2 | 3
  cells: DetailCell[]
}

function statusValueClass(status: ShopOrder['status']): string {
  if (status === 'completed') return 'order-detail__value--success'
  if (status === 'failed' || status === 'cancelled') return 'order-detail__value--failed'
  if (status === 'pending' || status === 'processing') return 'order-detail__value--pending'
  return ''
}

function quantitySummary(order: ShopOrder): string | null {
  const qty = order.quantity
  switch (order.category.slug) {
    case 'telegram-stars':
      return qty ? `${formatFaNumber(qty)} استارز` : null
    case 'telegram-premium':
      return qty ? `${formatFaNumber(qty)} ماه` : null
    case 'reaction':
      return qty ? `${formatFaNumber(qty)} ری‌اکشن` : null
    case 'channel-views':
      return `${formatFaNumber(order.channelViewOrder?.quantity ?? qty ?? 0)} سین`
    case 'telegram-members':
      return `${formatFaNumber(order.telegramMemberOrder?.quantity ?? qty ?? 0)} ممبر`
    case 'virtual-number':
      return order.recipientName?.trim() || order.virtualNumber?.country || null
    default:
      return null
  }
}

function paymentMethodText(order: ShopOrder): string {
  const wallet = Number(order.walletAmountToman)
  const gateway = Number(order.gatewayAmountToman)
  if (order.paymentMethod === 'zibal' && wallet > 0 && gateway > 0) {
    return 'کیف پول + درگاه بانکی'
  }
  return paymentMethodLabel(order.paymentMethod)
}

function tomanValue(amount: number): ReactNode {
  return (
    <>
      <span className="order-detail__unit">تومان</span>
      <span>{formatFaNumber(amount)}</span>
    </>
  )
}

function Cell({ cell, onCopy }: { cell: DetailCell; onCopy: (value: string) => void }) {
  return (
    <div className="order-detail__cell">
      <span className="order-detail__label">{cell.label}</span>
      <div className="order-detail__cell-value">
        <span
          className={`order-detail__value${cell.valueClassName ? ` ${cell.valueClassName}` : ''}`}
        >
          {cell.value}
        </span>
        {cell.copyValue ? (
          <button
            type="button"
            className="order-detail__copy"
            aria-label={`کپی ${cell.label}`}
            onClick={() => onCopy(cell.copyValue!)}
          >
            <CopyIcon width={13} height={13} />
          </button>
        ) : null}
      </div>
    </div>
  )
}

function DetailCard({
  title,
  groups,
  onCopy,
  riseIndex,
}: {
  title: string
  groups: DetailGroup[]
  onCopy: (value: string) => void
  riseIndex: number
}) {
  const hasContent = groups.some((group) => group.cells.length > 0)
  if (!hasContent) return null

  return (
    <>
      <h3
        className="order-detail__section-title shop-rise"
        style={{ '--rise-index': riseIndex } as CSSProperties}
      >
        {title}
      </h3>
      <div
        className="order-detail__card shop-rise"
        style={{ '--rise-index': riseIndex + 1 } as CSSProperties}
      >
        {groups.map((group, groupIndex) =>
          group.cells.length === 0 ? null : (
            <div
              key={`${title}-${groupIndex}`}
              className={`order-detail__grid order-detail__grid--${group.cols}`}
            >
              {group.cells.map((cell) => (
                <Cell key={cell.label} cell={cell} onCopy={onCopy} />
              ))}
            </div>
          ),
        )}
      </div>
    </>
  )
}

export function OrderDetailPage() {
  const navigate = useNavigate()
  const { orderId: rawOrderId } = useParams()
  const orderId = rawOrderId ? decodeURIComponent(rawOrderId) : ''
  const { haptic } = useTelegram()
  const [order, setOrder] = useState<ShopOrder | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notification, setNotification] = useState<{
    show: boolean
    message: string
    type: 'success' | 'error' | 'warning' | 'info'
  }>({ show: false, message: '', type: 'success' })

  const handleBack = useCallback(() => {
    navigate('/dashboard')
  }, [navigate])

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      if (!orderId) {
        setLoading(false)
        setError('شماره سفارش نامعتبر است')
        return
      }

      setLoading(true)
      setError(null)

      try {
        const response = await fetchOrder(orderId)
        if (!cancelled) setOrder(response.order)
      } catch (err) {
        if (!cancelled) {
          setOrder(null)
          setError(err instanceof Error ? err.message : 'خطا در دریافت سفارش')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
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

  const categoryMeta = useMemo(
    () => (order ? shopCategories.find((item) => item.id === order.category.slug) : null),
    [order],
  )
  const CategoryIcon = categoryMeta?.icon
  const summary = order ? quantitySummary(order) : null

  const copyValue = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value)
      haptic('light')
      setNotification({ show: true, message: 'کپی شد', type: 'success' })
    } catch {
      haptic('medium')
      setNotification({ show: true, message: 'کپی ناموفق بود', type: 'error' })
    }
  }

  const generalGroups: DetailGroup[] = order
    ? [
        {
          cols: 2,
          cells: [
            {
              label: 'مبلغ',
              value: tomanValue(Number(order.amountToman)),
              valueClassName: 'order-detail__value--amount',
            },
            {
              label: 'وضعیت',
              value: orderStatusLabel(order.status),
              valueClassName: statusValueClass(order.status),
            },
          ],
        },
        {
          cols: 2,
          cells: [
            {
              label: 'روش پرداخت',
              value: paymentMethodText(order),
            },
            {
              label: 'شماره سفارش',
              value: order.orderId,
              copyValue: order.orderId,
            },
          ],
        },
        {
          cols: 1,
          cells: order.fulfilledAt
            ? [{ label: 'تاریخ تکمیل', value: formatFaDateTimeLong(order.fulfilledAt) }]
            : [],
        },
        {
          cols: 2,
          cells:
            Number(order.walletAmountToman) > 0 && Number(order.gatewayAmountToman) > 0
              ? [
                  {
                    label: 'از کیف پول',
                    value: tomanValue(Number(order.walletAmountToman)),
                    valueClassName: 'order-detail__value--amount',
                  },
                  {
                    label: 'از درگاه',
                    value: tomanValue(Number(order.gatewayAmountToman)),
                    valueClassName: 'order-detail__value--amount',
                  },
                ]
              : [],
        },
      ]
    : []

  const recipientGroups: DetailGroup[] = (() => {
    if (!order) return []

    const cells: DetailCell[] = []
    if (order.recipientName) cells.push({ label: 'نام', value: order.recipientName })
    if (order.recipientUsername) {
      cells.push({
        label: 'یوزرنیم',
        value: `@${order.recipientUsername}`,
        copyValue: order.recipientUsername,
      })
    }
    if (
      summary &&
      (order.category.slug === 'telegram-stars' ||
        order.category.slug === 'telegram-premium' ||
        (!order.recipientName && !order.recipientUsername))
    ) {
      cells.push({ label: 'مقدار', value: summary })
    }

    if (cells.length === 0) return []
    if (cells.length === 1) return [{ cols: 1, cells }]
    if (cells.length === 3) return [{ cols: 3, cells }]
    return [{ cols: 2, cells }]
  })()

  const productGroups: DetailGroup[] = (() => {
    if (!order) return []

    if (order.virtualNumber) {
      return [
        {
          cols: 1,
          cells: [
            {
              label: 'شماره',
              value: order.virtualNumber.number,
              copyValue: order.virtualNumber.number,
            },
          ],
        },
        {
          cols: 3,
          cells: [
            { label: 'کشور', value: order.virtualNumber.country },
            { label: 'سرویس', value: order.virtualNumber.service },
            { label: 'کیفیت', value: order.virtualNumber.quality },
          ],
        },
        {
          cols: order.virtualNumber.code ? 2 : 1,
          cells: [
            { label: 'بازه', value: order.virtualNumber.range },
            ...(order.virtualNumber.code
              ? [
                  {
                    label: 'کد',
                    value: order.virtualNumber.code,
                    copyValue: order.virtualNumber.code,
                  },
                ]
              : []),
          ],
        },
      ]
    }

    if (order.reactionOrder) {
      const itemRows: DetailGroup[] = order.reactionOrder.items.map((item, index) => ({
        cols: 2 as const,
        cells: [
          {
            label: 'آیتم',
            value: item.emoji || `آیتم ${formatFaNumber(index + 1)}`,
          },
          {
            label: 'تعداد',
            value: formatFaNumber(item.quantity),
          },
        ],
      }))

      return [
        {
          cols: 1,
          cells: [{ label: 'پست', value: order.reactionOrder.postTitle || '—' }],
        },
        {
          cols: 1,
          cells: [
            {
              label: 'لینک',
              value: order.reactionOrder.postLink,
              copyValue: order.reactionOrder.postLink,
            },
          ],
        },
        ...itemRows,
      ]
    }

    if (order.channelViewOrder) {
      return [
        {
          cols: 2,
          cells: [
            {
              label: 'آیتم',
              value: order.channelViewOrder.postTitle || '—',
            },
            {
              label: 'تعداد',
              value: formatFaNumber(order.channelViewOrder.quantity),
            },
          ],
        },
        {
          cols: 1,
          cells: [
            {
              label: 'لینک',
              value: order.channelViewOrder.postLink,
              copyValue: order.channelViewOrder.postLink,
            },
          ],
        },
      ]
    }

    if (order.telegramMemberOrder) {
      return [
        {
          cols: 2,
          cells: [
            {
              label: 'آیتم',
              value: order.telegramMemberOrder.channelTitle || '—',
            },
            {
              label: 'تعداد',
              value: formatFaNumber(order.telegramMemberOrder.quantity),
            },
          ],
        },
        {
          cols: order.telegramMemberOrder.channelUsername ? 2 : 1,
          cells: [
            ...(order.telegramMemberOrder.channelUsername
              ? [
                  {
                    label: 'یوزرنیم',
                    value: `@${order.telegramMemberOrder.channelUsername}`,
                  },
                ]
              : []),
            {
              label: 'لینک',
              value: order.telegramMemberOrder.channelLink,
              copyValue: order.telegramMemberOrder.channelLink,
            },
          ],
        },
      ]
    }

    return []
  })()

  return (
    <div className="order-detail">
      <div className="shop-rise" style={{ '--rise-index': 0 } as CSSProperties}>
        <PageHeader title="جزئیات سفارش" onBack={handleBack} />
      </div>

      <div className="order-detail__content">
        {loading ? (
          <div className="order-detail__card shop-rise" style={{ '--rise-index': 1 } as CSSProperties}>
            <div className="order-detail__grid order-detail__grid--2">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="order-detail__cell">
                  <span className="order-detail__skeleton" style={{ width: '40%' }} />
                  <span className="order-detail__skeleton" style={{ width: '70%' }} />
                </div>
              ))}
            </div>
          </div>
        ) : error || !order ? (
          <EmptyState
            className="shop-rise"
            style={{ '--rise-index': 1 } as CSSProperties}
            title={error ?? 'سفارش پیدا نشد'}
          />
        ) : (
          <>
            <div
              className="order-detail__summary shop-rise"
              style={{ '--rise-index': 1 } as CSSProperties}
            >
              <div
                className="order-detail__summary-icon"
                style={{ background: categoryMeta?.gradient ?? 'var(--surface-elevated)' }}
              >
                {CategoryIcon ? (
                  <CategoryIcon width={20} height={20} color={categoryMeta?.iconColor ?? '#fff'} />
                ) : (
                  <ShopIcon width={20} height={20} color="#fff" />
                )}
              </div>
              <div className="order-detail__summary-text">
                <div className="order-detail__summary-title">{order.category.label}</div>
                {summary ? <div className="order-detail__summary-meta">{summary}</div> : null}
              </div>
              <span className={`order-detail__status ${statusValueClass(order.status)}`}>
                {orderStatusLabel(order.status)}
              </span>
            </div>

            <DetailCard title="اطلاعات سفارش" groups={generalGroups} onCopy={copyValue} riseIndex={2} />
            <DetailCard title="گیرنده" groups={recipientGroups} onCopy={copyValue} riseIndex={4} />
            <DetailCard title="جزئیات محصول" groups={productGroups} onCopy={copyValue} riseIndex={6} />

            <h3
              className="order-detail__section-title shop-rise"
              style={{ '--rise-index': 8 } as CSSProperties}
            >
              پشتیبانی
            </h3>
            <div
              className="order-detail__menu shop-rise"
              style={{ '--rise-index': 9 } as CSSProperties}
            >
              <button
                type="button"
                className="order-detail__menu-item order-detail__menu-item--accent"
                onClick={() => {
                  haptic('light')
                  navigate(
                    `/support/new?orderId=${encodeURIComponent(order.orderId)}&category=product`,
                  )
                }}
              >
                <span className="order-detail__menu-start">
                  <span className="order-detail__menu-icon">
                    <ContactIcon width={18} height={18} />
                  </span>
                  <span>ثبت تیکت درباره این سفارش</span>
                </span>
              </button>
            </div>
          </>
        )}
      </div>

      <Notification
        show={notification.show}
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification((prev) => ({ ...prev, show: false }))}
      />
    </div>
  )
}
