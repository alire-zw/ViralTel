import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { shopCategories } from '../../data/shopCategories'
import { useAdminAccess } from '../../hooks/useAdminAccess'
import { useTelegram } from '../../hooks/useTelegram'
import { fetchAdminOverview, type AdminOverview } from '../../lib/adminApi'
import { balanceToToman } from '../../lib/api'
import { formatFaDateLong, formatFaNumber } from './adminLabels'
import { AdminSalesChart } from './AdminSalesChart'
import { AdminScreen } from './AdminScreen'

function productLabel(productKey: string): string {
  return shopCategories.find((item) => item.id === productKey)?.label ?? productKey
}

export function AdminAnalyticsPage() {
  const navigate = useNavigate()
  const { haptic } = useTelegram()
  const { ready, allowed } = useAdminAccess()
  const [overview, setOverview] = useState<AdminOverview | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [range, setRange] = useState<'weekly' | 'monthly'>('weekly')

  const handleBack = useCallback(() => navigate('/admin', { replace: true }), [navigate])

  useEffect(() => {
    if (!ready || !allowed) return
    let cancelled = false
    void fetchAdminOverview()
      .then((data) => {
        if (!cancelled) setOverview(data)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'خطا در دریافت آمار')
      })
    return () => {
      cancelled = true
    }
  }, [allowed, ready])

  const chartPoints = useMemo(
    () => (range === 'weekly' ? overview?.charts.weekly ?? [] : overview?.charts.monthly ?? []),
    [overview, range],
  )
  const chartTotal = chartPoints.reduce((sum, point) => sum + (Number(point.amountToman) || 0), 0)
  const topViews = overview?.productViews.totals.slice(0, 6) ?? []
  const maxView = Math.max(...topViews.map((row) => Number(row.viewCount) || 0), 1)

  if (!ready || !allowed) return null

  return (
    <AdminScreen
      title="آمار و بازدید"
      eyebrow="تحلیل"
      onBack={handleBack}
      meta={
        overview ? (
          <div className="admin-hub__live">
            <span className="admin-hub__live-dot" />
            <span>{formatFaNumber(overview.online.onlineCount)} آنلاین</span>
          </div>
        ) : undefined
      }
    >
      {error && <p className="admin__error">{error}</p>}

      <div className="admin-kpi-grid">
        <div className="admin-kpi-card admin-kpi-card--teal">
          <span className="admin-kpi-card__label">فروش امروز</span>
          <strong className="admin-kpi-card__value">
            {formatFaNumber(balanceToToman(overview?.today.completedAmountToman ?? 0))}
          </strong>
          <span className="admin-kpi-card__hint">تومان</span>
        </div>
        <div className="admin-kpi-card">
          <span className="admin-kpi-card__label">سفارش امروز</span>
          <strong className="admin-kpi-card__value">
            {formatFaNumber(overview?.today.ordersCount ?? 0)}
          </strong>
          <span className="admin-kpi-card__hint">
            موفق {formatFaNumber(overview?.today.completedCount ?? 0)}
          </span>
        </div>
        <div className="admin-kpi-card">
          <span className="admin-kpi-card__label">کاربران</span>
          <strong className="admin-kpi-card__value">
            {formatFaNumber(overview?.users.total ?? 0)}
          </strong>
          <span className="admin-kpi-card__hint">
            جدید {formatFaNumber(overview?.users.newToday ?? 0)}
          </span>
        </div>
        <div className="admin-kpi-card">
          <span className="admin-kpi-card__label">اوج آنلاین</span>
          <strong className="admin-kpi-card__value">
            {formatFaNumber(overview?.online.peakOnline ?? 0)}
          </strong>
          <span className="admin-kpi-card__hint">
            کل سفارش {formatFaNumber(overview?.totals.orders ?? 0)}
          </span>
        </div>
      </div>

      <section className="admin-hub__panel">
        <div className="admin-hub__panel-head">
          <div>
            <h2 className="admin-hub__panel-title">عملکرد فروش</h2>
            <p className="admin-hub__panel-sub">
              جمع {range === 'weekly' ? '۷ روز' : '۳۰ روز'}{' '}
              {formatFaNumber(balanceToToman(chartTotal))} تومان
            </p>
          </div>
          <div className="admin-hub__segment">
            <button
              type="button"
              className={`admin-hub__segment-btn${range === 'weekly' ? ' is-active' : ''}`}
              onClick={() => {
                haptic('light')
                setRange('weekly')
              }}
            >
              ۷ روز
            </button>
            <button
              type="button"
              className={`admin-hub__segment-btn${range === 'monthly' ? ' is-active' : ''}`}
              onClick={() => {
                haptic('light')
                setRange('monthly')
              }}
            >
              ۳۰ روز
            </button>
          </div>
        </div>
        {!overview ? (
          <p className="admin__muted" style={{ margin: 0 }}>
            در حال بارگذاری…
          </p>
        ) : chartPoints.length === 0 ? (
          <p className="admin__muted" style={{ margin: 0 }}>
            هنوز فروشی ثبت نشده
          </p>
        ) : (
          <AdminSalesChart points={chartPoints} onSelect={() => haptic('light')} />
        )}
      </section>

      <h5 className="admin__menu-title">بازدید محصولات</h5>
      {!overview ? (
        <p className="admin__muted">در حال بارگذاری…</p>
      ) : topViews.length === 0 ? (
        <p className="admin__muted">بازدییدی ثبت نشده</p>
      ) : (
        <div className="admin-view-list">
          {topViews.map((row, index) => {
            const width = Math.max(8, Math.round((Number(row.viewCount) / maxView) * 100))
            return (
              <div key={row.productKey} className="admin-view-row">
                <div className="admin-view-row__head">
                  <span className="admin-view-row__rank">{formatFaNumber(index + 1)}</span>
                  <span className="admin-view-row__label">{productLabel(row.productKey)}</span>
                  <span className="admin-view-row__count">
                    {formatFaNumber(row.viewCount)}
                  </span>
                </div>
                <div className="admin-view-row__track">
                  <div className="admin-view-row__fill" style={{ width: `${width}%` }} />
                </div>
              </div>
            )
          })}
        </div>
      )}

      <h5 className="admin__menu-title">بازدید روزانه اخیر</h5>
      {!overview || overview.productViews.daily.length === 0 ? (
        <p className="admin__muted">داده‌ای نیست</p>
      ) : (
        <ul className="admin__list">
          {overview.productViews.daily.slice(0, 12).map((row) => (
            <li key={`${row.productKey}-${row.day}`}>
              <div className="admin__row" style={{ cursor: 'default' }}>
                <div className="admin__row-top">
                  <span className="admin__row-title">{productLabel(row.productKey)}</span>
                  <span className="admin__badge">{formatFaNumber(row.viewCount)}</span>
                </div>
                <div className="admin__row-meta">
                  {formatFaDateLong(`${row.day}T12:00:00+03:30`)}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
      <div style={{ height: 16 }} />
    </AdminScreen>
  )
}
