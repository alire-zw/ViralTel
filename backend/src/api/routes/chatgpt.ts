import type { FastifyInstance, FastifyReply } from 'fastify'
import { log } from '../../lib/logger.js'
import { telegramAuthMiddleware } from '../middleware/telegram-auth.js'
import { requireUserMiddleware } from '../middleware/require-user.js'
import { SwapWalletApiError } from '../../crypto-payments/swapwallet.client.js'
import { CanbosoApiError, getAccountShopCatalog } from '../../chatgpt/account-shop.service.js'
function handleRouteError(error: unknown, reply: FastifyReply, scope: string): void {
  if (error instanceof CanbosoApiError) {
    reply.code(error.status >= 400 && error.status < 600 ? error.status : 502).send({
      error: 'CanbosoApiError',
      message: error.message,
    })
    return
  }

  if (error instanceof SwapWalletApiError) {
    reply.code(502).send({
      error: 'SwapWalletApiError',
      message: error.message,
    })
    return
  }

  log.error(scope, error instanceof Error ? error.message : 'Unknown route error')
  reply.code(500).send({ error: 'InternalServerError', message: 'Unexpected server error' })
}

export async function chatgptRoutes(app: FastifyInstance): Promise<void> {
  const authChain = [telegramAuthMiddleware, requireUserMiddleware]

  app.get('/products', { preHandler: authChain }, async (request, reply) => {
    try {
      const catalog = await getAccountShopCatalog()
      reply.send(catalog)
    } catch (error) {
      handleRouteError(error, reply, 'GET /chatgpt/products')
    }
  })
}
