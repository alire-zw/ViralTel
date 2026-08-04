import type { FastifyInstance, FastifyReply } from 'fastify'
import { log } from '../../lib/logger.js'
import { telegramAuthMiddleware } from '../middleware/telegram-auth.js'
import { requireUserMiddleware } from '../middleware/require-user.js'
import { getOrderByOrderId } from '../../orders/order.service.js'
import { serializeOrder } from '../../orders/order.serializer.js'

function handleRouteError(error: unknown, reply: FastifyReply): void {
  log.error('ORDERS', error instanceof Error ? error.message : 'Unknown route error')
  reply.code(500).send({ error: 'InternalServerError', message: 'Unexpected server error' })
}

export async function orderRoutes(app: FastifyInstance): Promise<void> {
  const authChain = [telegramAuthMiddleware, requireUserMiddleware]

  app.get('/:orderId', { preHandler: authChain }, async (request, reply) => {
    try {
      const params = request.params as { orderId: string }
      const order = await getOrderByOrderId(params.orderId, request.dbUser!.id)

      if (!order) {
        reply.code(404).send({ error: 'NotFound', message: 'Order not found' })
        return
      }

      reply.send({ order: serializeOrder(order) })
    } catch (error) {
      handleRouteError(error, reply)
    }
  })
}
