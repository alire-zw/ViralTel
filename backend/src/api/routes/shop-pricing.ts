import type { FastifyInstance } from 'fastify'
import { getProductPricingRule, loadActivePricingRules } from '../../pricing/product-pricing.apply.js'
import { telegramAuthMiddleware } from '../middleware/telegram-auth.js'
import { requireUserMiddleware } from '../middleware/require-user.js'

export async function shopPricingRoutes(app: FastifyInstance): Promise<void> {
  const authChain = [telegramAuthMiddleware, requireUserMiddleware]

  app.get('/pricing', { preHandler: authChain }, async (_request, reply) => {
    const rules = await loadActivePricingRules()
    reply.send({
      items: rules.map((rule) => ({
        productKey: rule.productKey,
        markupPercent: rule.markupPercent,
        fixedAddToman: rule.fixedAddToman,
      })),
    })
  })

  app.get('/pricing/:productKey', { preHandler: authChain }, async (request, reply) => {
    const { productKey } = request.params as { productKey: string }
    const rule = await getProductPricingRule(productKey)
    reply.send({
      productKey,
      markupPercent: rule?.markupPercent ?? 0,
      fixedAddToman: rule?.fixedAddToman ?? 0,
    })
  })
}
