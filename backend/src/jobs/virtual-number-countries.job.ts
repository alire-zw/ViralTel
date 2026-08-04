import { log } from '../lib/logger.js'
import { refreshVirtualNumberCountryGroups } from '../virtual-number/virtual-number-countries.service.js'

const REFRESH_INTERVAL_MS = 60 * 60 * 1000

let intervalHandle: ReturnType<typeof setInterval> | null = null
let isRunning = false

async function runCountriesRefreshJob(): Promise<void> {
  if (isRunning) {
    return
  }

  isRunning = true
  try {
    const groups = await refreshVirtualNumberCountryGroups(true)
    const itemCount = groups.reduce((sum, group) => sum + group.items.length, 0)
    log.info('CRON', 'virtual number countries refreshed', {
      groups: groups.length,
      countries: itemCount,
    })
  } catch (error) {
    log.error('CRON', 'virtual number countries refresh failed', {
      error: error instanceof Error ? error.message : 'unknown',
    })
  } finally {
    isRunning = false
  }
}

export function startVirtualNumberCountriesJob(): void {
  if (intervalHandle) {
    return
  }

  intervalHandle = setInterval(() => {
    void runCountriesRefreshJob()
  }, REFRESH_INTERVAL_MS)

  log.info('CRON', 'virtual number countries job started', {
    intervalMs: REFRESH_INTERVAL_MS,
  })
}

export function stopVirtualNumberCountriesJob(): void {
  if (intervalHandle) {
    clearInterval(intervalHandle)
    intervalHandle = null
  }
}
