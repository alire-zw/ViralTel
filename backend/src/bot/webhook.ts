import { webhookCallback, type Bot } from 'grammy'
import type { FastifyInstance } from 'fastify'
import { env, webhookUrl } from '../config/env.js'
import { setBotId, setBotUsername } from '../bot/profile.js'
import { log } from '../lib/logger.js'

export function registerBotWebhook(app: FastifyInstance, bot: Bot): void {
  const handler = webhookCallback(bot, 'fastify', {
    secretToken: env.TELEGRAM_BOT_SECRET,
  })

  app.post(env.WEBHOOK_PATH, {
    config: {
      rateLimit: false,
    },
    handler,
  })

  log.info('BOT', 'webhook route registered', { path: env.WEBHOOK_PATH })
}

export async function setupTelegramWebhook(bot: Bot): Promise<{ username: string }> {
  await bot.api.setWebhook(webhookUrl, {
    secret_token: env.TELEGRAM_BOT_SECRET,
    drop_pending_updates: false,
    allowed_updates: ['message', 'callback_query', 'channel_post', 'my_chat_member'],
  })

  const me = await bot.api.getMe()
  const webhookInfo = await bot.api.getWebhookInfo()

  if (me.username) {
    setBotUsername(me.username)
  }
  setBotId(me.id)

  log.info('BOT', 'webhook configured', {
    url: webhookInfo.url || webhookUrl,
    pending: webhookInfo.pending_update_count,
    lastError: webhookInfo.last_error_message ?? 'none',
  })

  return { username: me.username ?? 'unknown' }
}

export async function removeTelegramWebhook(bot: Bot): Promise<void> {
  await bot.api.deleteWebhook({ drop_pending_updates: false })
}
