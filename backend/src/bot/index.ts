import { Bot } from 'grammy'
import { env } from '../config/env.js'
import { log } from '../lib/logger.js'
import { handleChannelPost, handleMyChatMember } from './handlers/channel-post.js'
import { handleStartCommand } from './handlers/start.js'
import { handleUsersShared } from './handlers/users-shared.js'
import { registerBotLogging } from './middleware/logging.js'

export function createBot(): Bot {
  const bot = new Bot(env.TELEGRAM_BOT_TOKEN)

  registerBotLogging(bot)

  bot.command('start', handleStartCommand)
  bot.on('message:users_shared', handleUsersShared)
  bot.on('channel_post', handleChannelPost)
  bot.on('my_chat_member', handleMyChatMember)

  bot.catch(({ error, ctx }) => {
    const message = error instanceof Error ? error.message : 'Unknown bot error'
    log.error('BOT', message, {
      updateId: ctx.update.update_id,
      userId: ctx.from?.id,
      username: ctx.from?.username ? `@${ctx.from.username}` : undefined,
    })
  })

  return bot
}
