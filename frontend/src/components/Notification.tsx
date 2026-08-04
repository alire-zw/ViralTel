import { useEffect } from 'react'
import './Notification.css'

interface NotificationProps {
  show: boolean
  message: string
  type?: 'success' | 'error' | 'warning' | 'info'
  onClose?: () => void
}

export function Notification({
  show,
  message,
  type = 'success',
  onClose,
}: NotificationProps) {
  useEffect(() => {
    if (!show || !onClose) return

    const timer = window.setTimeout(onClose, 3000)
    return () => window.clearTimeout(timer)
  }, [show, onClose])

  if (!show) return null

  return (
    <div className={`notification notification--${type}`} role="status">
      <div className="notification__content">
        <span className="notification__message">{message}</span>
        {onClose && (
          <button
            type="button"
            className="notification__close"
            onClick={onClose}
            aria-label="بستن"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}
