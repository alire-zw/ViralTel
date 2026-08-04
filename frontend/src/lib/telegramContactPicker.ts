import { createContactPickerSession, fetchContactPickerResult } from './transfers'
import type { ContactPickerSession, TransferRecipient } from '../types/transfer'

const POLL_INTERVAL_MS = 500
const POLL_TIMEOUT_MS = 90_000
const MIN_WEBAPP_VERSION = '9.6'

type ContactPickerWebApp = TelegramWebApp & {
  requestChat?: (reqId: string, callback?: (success: boolean) => void) => void
}

function getWebApp(): ContactPickerWebApp | undefined {
  return window.Telegram?.WebApp as ContactPickerWebApp | undefined
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

function isContactPickerVersionSupported(): boolean {
  const webApp = getWebApp()
  if (!webApp) return false

  if (typeof webApp.isVersionAtLeast === 'function') {
    return webApp.isVersionAtLeast(MIN_WEBAPP_VERSION)
  }

  return typeof webApp.requestChat === 'function'
}

function openPreparedContactPicker(preparedButtonId: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const webApp = getWebApp()

    if (!webApp?.requestChat) {
      resolve(false)
      return
    }

    if (
      typeof webApp.isVersionAtLeast === 'function' &&
      !webApp.isVersionAtLeast(MIN_WEBAPP_VERSION)
    ) {
      reject(
        new Error(
          'برای انتخاب مخاطب، تلگرام شما باید به‌روز باشد (حداقل نسخه ۹.۶ مینی‌اپ)',
        ),
      )
      return
    }

    let settled = false
    const finish = (success: boolean) => {
      if (settled) return
      settled = true
      resolve(success)
    }

    try {
      webApp.requestChat(preparedButtonId, finish)
    } catch (error) {
      if (error instanceof Error && error.message.includes('WebAppRequestChatOpened')) {
        reject(new Error('پنجره انتخاب مخاطب قبلاً باز است. لطفاً چند ثانیه صبر کنید'))
        return
      }

      if (error instanceof Error && error.message.includes('WebAppMethodUnsupported')) {
        reject(
          new Error(
            'نسخه تلگرام شما از انتخاب مخاطب پشتیبانی نمی‌کند. لطفاً تلگرام را به‌روزرسانی کنید',
          ),
        )
        return
      }

      finish(false)
    }
  })
}

async function waitForSharedUsers(requestId: number): Promise<TransferRecipient[]> {
  const startedAt = Date.now()

  while (Date.now() - startedAt < POLL_TIMEOUT_MS) {
    const response = await fetchContactPickerResult(requestId)
    if (response?.users.length) {
      return response.users
    }

    await sleep(POLL_INTERVAL_MS)
  }

  throw new Error('مهلت انتخاب مخاطب به پایان رسید')
}

export function getContactPickerSupportError(): string | null {
  if (!window.Telegram?.WebApp?.initData?.trim()) {
    return 'این قابلیت فقط داخل تلگرام در دسترس است'
  }

  if (!isContactPickerVersionSupported()) {
    return 'نسخه تلگرام شما از انتخاب مخاطب پشتیبانی نمی‌کند. لطفاً تلگرام را به‌روزرسانی کنید'
  }

  return null
}

export async function prefetchContactPickerSession(): Promise<ContactPickerSession> {
  return createContactPickerSession()
}

export async function pickTelegramContact(
  session: ContactPickerSession,
): Promise<TransferRecipient> {
  const supportError = getContactPickerSupportError()
  if (supportError) {
    throw new Error(supportError)
  }

  // iOS requires requestChat in the same user-gesture turn. Starting poll first
  // awaits fetch and breaks that gesture chain.
  const pickerPromise = openPreparedContactPicker(session.preparedButtonId)
  const pollTask = waitForSharedUsers(session.requestId)
  const pickerAccepted = await pickerPromise

  if (!pickerAccepted) {
    throw new Error('انتخاب مخاطب لغو شد')
  }

  const users = await pollTask
  const recipient = users[0]

  if (!recipient) {
    throw new Error('مخاطبی انتخاب نشد')
  }

  return recipient
}
