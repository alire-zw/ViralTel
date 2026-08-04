import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { ZodError, z } from 'zod'
import { log } from '../../lib/logger.js'
import { telegramAuthMiddleware } from '../middleware/telegram-auth.js'
import { requireUserMiddleware } from '../middleware/require-user.js'
import { requireMainAdminMiddleware } from '../middleware/require-role.js'
import {
  listAdminCryptoPaymentsQuerySchema,
  listAdminOrdersQuerySchema,
  listAdminPaymentsQuerySchema,
  listAdminTransfersQuerySchema,
} from '../../admin/admin.schema.js'
import {
  createClubRewardSchema,
  createDiscountSchema,
  createTicketSchema,
  listTicketsQuerySchema,
  replyTicketSchema,
  updateClubRewardSchema,
  updateDiscountSchema,
  upsertPricingSchema,
} from '../../admin/admin-commerce.schema.js'
import {
  getAdminOrderByOrderId,
  getAdminOverview,
  listAdminCryptoPayments,
  listAdminOrders,
  listAdminPayments,
  listAdminTransfers,
} from '../../admin/admin.service.js'
import {
  createClubReward,
  createDiscount,
  createSupportTicket,
  deleteClubReward,
  deleteDiscount,
  getSupportTicket,
  listClubRewards,
  listDiscounts,
  listProductPricing,
  listSupportTickets,
  replySupportTicket,
  updateClubReward,
  updateDiscount,
  upsertProductPricing,
} from '../../admin/admin-commerce.service.js'
import { getAdminPricingCatalog } from '../../admin/admin-pricing-catalog.service.js'
import {
  getSupportTelegramUsername,
  setSupportTelegramUsername,
} from '../../support/support-contact.service.js'

function parseQuery<T>(schema: { parse: (value: unknown) => T }, query: unknown): T {
  return schema.parse(query)
}

function handleRouteError(error: unknown, reply: FastifyReply, scope: string): void {
  if (error instanceof ZodError) {
    reply.code(400).send({
      error: 'ValidationError',
      message: 'Invalid request data',
      details: error.flatten(),
    })
    return
  }

  log.error(scope, error instanceof Error ? error.message : 'Unknown route error')
  reply.code(500).send({ error: 'InternalServerError', message: 'Unexpected server error' })
}

export async function adminRoutes(app: FastifyInstance): Promise<void> {
  const mainAdminChain = [
    telegramAuthMiddleware,
    requireUserMiddleware,
    requireMainAdminMiddleware,
  ]

  app.get('/overview', { preHandler: mainAdminChain }, async (_request, reply) => {
    try {
      reply.send(await getAdminOverview())
    } catch (error) {
      handleRouteError(error, reply, 'ADMIN')
    }
  })

  app.get('/orders', { preHandler: mainAdminChain }, async (request, reply) => {
    try {
      reply.send(await listAdminOrders(parseQuery(listAdminOrdersQuerySchema, request.query)))
    } catch (error) {
      handleRouteError(error, reply, 'ADMIN')
    }
  })

  app.get(
    '/orders/:orderId',
    { preHandler: mainAdminChain },
    async (request: FastifyRequest, reply) => {
      try {
        const orderId = (request.params as { orderId?: string }).orderId?.trim()
        if (!orderId) {
          reply.code(400).send({ error: 'BadRequest', message: 'Invalid order id' })
          return
        }
        const result = await getAdminOrderByOrderId(orderId)
        if (!result) {
          reply.code(404).send({ error: 'NotFound', message: 'Order not found' })
          return
        }
        reply.send(result)
      } catch (error) {
        handleRouteError(error, reply, 'ADMIN')
      }
    },
  )

  app.get('/payments', { preHandler: mainAdminChain }, async (request, reply) => {
    try {
      reply.send(await listAdminPayments(parseQuery(listAdminPaymentsQuerySchema, request.query)))
    } catch (error) {
      handleRouteError(error, reply, 'ADMIN')
    }
  })

  app.get('/crypto-payments', { preHandler: mainAdminChain }, async (request, reply) => {
    try {
      reply.send(
        await listAdminCryptoPayments(
          parseQuery(listAdminCryptoPaymentsQuerySchema, request.query),
        ),
      )
    } catch (error) {
      handleRouteError(error, reply, 'ADMIN')
    }
  })

  app.get('/transfers', { preHandler: mainAdminChain }, async (request, reply) => {
    try {
      reply.send(await listAdminTransfers(parseQuery(listAdminTransfersQuerySchema, request.query)))
    } catch (error) {
      handleRouteError(error, reply, 'ADMIN')
    }
  })

  app.get('/club-rewards', { preHandler: mainAdminChain }, async (_request, reply) => {
    try {
      reply.send(await listClubRewards())
    } catch (error) {
      handleRouteError(error, reply, 'ADMIN')
    }
  })

  app.post('/club-rewards', { preHandler: mainAdminChain }, async (request, reply) => {
    try {
      reply.code(201).send(await createClubReward(createClubRewardSchema.parse(request.body)))
    } catch (error) {
      handleRouteError(error, reply, 'ADMIN')
    }
  })

  app.patch('/club-rewards/:id', { preHandler: mainAdminChain }, async (request, reply) => {
    try {
      const id = Number((request.params as { id?: string }).id)
      if (!Number.isFinite(id)) {
        reply.code(400).send({ error: 'BadRequest', message: 'Invalid id' })
        return
      }
      reply.send(await updateClubReward(id, updateClubRewardSchema.parse(request.body)))
    } catch (error) {
      handleRouteError(error, reply, 'ADMIN')
    }
  })

  app.delete('/club-rewards/:id', { preHandler: mainAdminChain }, async (request, reply) => {
    try {
      const id = Number((request.params as { id?: string }).id)
      if (!Number.isFinite(id)) {
        reply.code(400).send({ error: 'BadRequest', message: 'Invalid id' })
        return
      }
      reply.send(await deleteClubReward(id))
    } catch (error) {
      handleRouteError(error, reply, 'ADMIN')
    }
  })

  app.get('/discounts', { preHandler: mainAdminChain }, async (_request, reply) => {
    try {
      reply.send(await listDiscounts())
    } catch (error) {
      handleRouteError(error, reply, 'ADMIN')
    }
  })

  app.post('/discounts', { preHandler: mainAdminChain }, async (request, reply) => {
    try {
      reply.code(201).send(await createDiscount(createDiscountSchema.parse(request.body)))
    } catch (error) {
      handleRouteError(error, reply, 'ADMIN')
    }
  })

  app.patch('/discounts/:id', { preHandler: mainAdminChain }, async (request, reply) => {
    try {
      const id = Number((request.params as { id?: string }).id)
      if (!Number.isFinite(id)) {
        reply.code(400).send({ error: 'BadRequest', message: 'Invalid id' })
        return
      }
      reply.send(await updateDiscount(id, updateDiscountSchema.parse(request.body)))
    } catch (error) {
      handleRouteError(error, reply, 'ADMIN')
    }
  })

  app.delete('/discounts/:id', { preHandler: mainAdminChain }, async (request, reply) => {
    try {
      const id = Number((request.params as { id?: string }).id)
      if (!Number.isFinite(id)) {
        reply.code(400).send({ error: 'BadRequest', message: 'Invalid id' })
        return
      }
      reply.send(await deleteDiscount(id))
    } catch (error) {
      handleRouteError(error, reply, 'ADMIN')
    }
  })

  app.get('/pricing', { preHandler: mainAdminChain }, async (_request, reply) => {
    try {
      reply.send(await listProductPricing())
    } catch (error) {
      handleRouteError(error, reply, 'ADMIN')
    }
  })

  app.put('/pricing', { preHandler: mainAdminChain }, async (request, reply) => {
    try {
      reply.send(await upsertProductPricing(upsertPricingSchema.parse(request.body)))
    } catch (error) {
      handleRouteError(error, reply, 'ADMIN')
    }
  })

  app.get('/pricing/:productKey/catalog', { preHandler: mainAdminChain }, async (request, reply) => {
    try {
      const { productKey } = request.params as { productKey: string }
      reply.send(await getAdminPricingCatalog(productKey))
    } catch (error) {
      handleRouteError(error, reply, 'ADMIN')
    }
  })

  app.get('/tickets', { preHandler: mainAdminChain }, async (request, reply) => {
    try {
      reply.send(await listSupportTickets(parseQuery(listTicketsQuerySchema, request.query)))
    } catch (error) {
      handleRouteError(error, reply, 'ADMIN')
    }
  })

  app.get('/tickets/:id', { preHandler: mainAdminChain }, async (request, reply) => {
    try {
      const id = Number((request.params as { id?: string }).id)
      if (!Number.isFinite(id)) {
        reply.code(400).send({ error: 'BadRequest', message: 'Invalid id' })
        return
      }
      const result = await getSupportTicket(id)
      if (!result) {
        reply.code(404).send({ error: 'NotFound', message: 'Ticket not found' })
        return
      }
      reply.send(result)
    } catch (error) {
      handleRouteError(error, reply, 'ADMIN')
    }
  })

  app.post('/tickets', { preHandler: mainAdminChain }, async (request, reply) => {
    try {
      reply.code(201).send(await createSupportTicket(createTicketSchema.parse(request.body)))
    } catch (error) {
      handleRouteError(error, reply, 'ADMIN')
    }
  })

  app.post('/tickets/:id/reply', { preHandler: mainAdminChain }, async (request, reply) => {
    try {
      const id = Number((request.params as { id?: string }).id)
      if (!Number.isFinite(id)) {
        reply.code(400).send({ error: 'BadRequest', message: 'Invalid id' })
        return
      }
      const result = await replySupportTicket(id, replyTicketSchema.parse(request.body))
      if (!result) {
        reply.code(404).send({ error: 'NotFound', message: 'Ticket not found' })
        return
      }
      reply.send(result)
    } catch (error) {
      handleRouteError(error, reply, 'ADMIN')
    }
  })

  app.get('/settings/support-contact', { preHandler: mainAdminChain }, async (_request, reply) => {
    try {
      const telegramUsername = await getSupportTelegramUsername()
      reply.send({ telegramUsername })
    } catch (error) {
      handleRouteError(error, reply, 'ADMIN')
    }
  })

  app.put('/settings/support-contact', { preHandler: mainAdminChain }, async (request, reply) => {
    try {
      const body = z
        .object({
          telegramUsername: z.string().trim().max(64),
        })
        .parse(request.body)

      if (!body.telegramUsername) {
        await setSupportTelegramUsername('')
        reply.send({ telegramUsername: null })
        return
      }

      const telegramUsername = await setSupportTelegramUsername(body.telegramUsername)
      if (!telegramUsername) {
        reply.code(400).send({
          error: 'ValidationError',
          message: 'آیدی تلگرام معتبر نیست (مثلاً SupportTeam)',
        })
        return
      }
      reply.send({ telegramUsername })
    } catch (error) {
      handleRouteError(error, reply, 'ADMIN')
    }
  })
}
