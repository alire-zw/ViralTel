import type { FastifyInstance } from 'fastify'
import type { Bot } from 'grammy'
import { env, webhookUrl } from './config/env.js'
import { prepareDatabase } from './db/setup.js'
import { log } from './lib/logger.js'

const state: {
  app: FastifyInstance | null
  bot: Bot | null
  shuttingDown: boolean
} = {
  app: null,
  bot: null,
  shuttingDown: false,
}

async function shutdown(signal?: string): Promise<void> {
  if (state.shuttingDown) {
    return
  }

  state.shuttingDown = true

  if (signal) {
    log.info('APP', `shutdown ${signal}`)
  }

  try {
    await state.app?.close()

    const { prisma } = await import('./db/client.js')
    const { disconnectRedis } = await import('./redis/client.js')
    const { stopTronWalletJob } = await import('./jobs/tron-wallet.job.js')
    const { stopVirtualNumberCountriesJob } = await import(
      './jobs/virtual-number-countries.job.js'
    )

    stopTronWalletJob()
    stopVirtualNumberCountriesJob()
    await prisma.$disconnect()
    await disconnectRedis()
  } catch (error) {
    log.error('APP', error instanceof Error ? error.message : 'Shutdown failed')
  } finally {
    process.exit(0)
  }
}

process.on('SIGTERM', () => {
  void shutdown('SIGTERM')
})

process.on('SIGINT', () => {
  void shutdown('SIGINT')
})

async function bootstrap(): Promise<void> {
  await prepareDatabase()

  const { prisma } = await import('./db/client.js')
  const { connectRedis } = await import('./redis/client.js')
  const { buildApp } = await import('./api/app.js')
  const { createBot } = await import('./bot/index.js')
  const { registerBotWebhook, setupTelegramWebhook } = await import('./bot/webhook.js')
  const { startTronWalletJob } = await import('./jobs/tron-wallet.job.js')
  const { startVirtualNumberCountriesJob } = await import(
    './jobs/virtual-number-countries.job.js'
  )
  const { refreshVirtualNumberCountryGroups } = await import(
    './virtual-number/virtual-number-countries.service.js'
  )

  await connectRedis()
  await prisma.$connect()

  const { seedShopCategories } = await import('./orders/shop-category.seed.js')
  await seedShopCategories()

  try {
    const groups = await refreshVirtualNumberCountryGroups(true)
    const itemCount = groups.reduce((sum, group) => sum + group.items.length, 0)
    log.info('APP', 'virtual number countries cache warmed', {
      groups: groups.length,
      countries: itemCount,
    })
  } catch (error) {
    log.error('APP', 'virtual number countries cache warm failed', {
      error: error instanceof Error ? error.message : 'unknown',
    })
  }

  state.bot = createBot()
  state.app = await buildApp()

  registerBotWebhook(state.app, state.bot)

  await state.app.listen({ host: env.HOST, port: env.PORT })

  const me = await setupTelegramWebhook(state.bot)

  log.info('APP', 'ready', {
    db: env.DB_NAME,
    port: env.PORT,
    bot: `@${me.username}`,
    webhook: webhookUrl,
    tronNetwork: env.TRON_NETWORK,
  })

  startTronWalletJob()
  startVirtualNumberCountriesJob()
}

bootstrap().catch((error) => {
  log.error('APP', error instanceof Error ? error.message : 'Failed to start application')
  process.exit(1)
})
