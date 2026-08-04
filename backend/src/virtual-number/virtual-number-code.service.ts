import { prisma } from '../db/client.js'
import { fetchCallinooVerificationCode } from './callinoo.client.js'
import { VirtualNumberPurchaseError } from './virtual-number-purchase.fulfillment.js'

export type VirtualNumberCodeResponse =
  | {
      status: 'ready'
      code: string
      orderId: string
    }
  | {
      status: 'pending'
      message: string
      orderId: string
    }

export async function getVirtualNumberVerificationCode(
  userId: number,
  orderId: string,
): Promise<VirtualNumberCodeResponse> {
  const order = await prisma.order.findFirst({
    where: {
      orderId,
      userId,
    },
    include: {
      category: true,
      virtualNumber: true,
    },
  })

  if (!order || order.category.slug !== 'virtual-number' || !order.virtualNumber) {
    throw new VirtualNumberPurchaseError('سفارش یافت نشد', 'ORDER_NOT_FOUND')
  }

  if (order.virtualNumber.code) {
    return {
      status: 'ready',
      code: order.virtualNumber.code,
      orderId: order.orderId,
    }
  }

  const result = await fetchCallinooVerificationCode(order.virtualNumber.providerOrderId)

  if (result.status === 'pending') {
    return {
      status: 'pending',
      message: result.message || 'کد هنوز آماده نیست. کمی بعد دوباره تلاش کنید.',
      orderId: order.orderId,
    }
  }

  const code = String(result.data.code).trim()
  if (!code) {
    return {
      status: 'pending',
      message: 'کد هنوز آماده نیست. کمی بعد دوباره تلاش کنید.',
      orderId: order.orderId,
    }
  }

  await prisma.virtualNumber.update({
    where: { orderDbId: order.id },
    data: {
      code,
      codeReceivedAt: new Date(),
    },
  })

  return {
    status: 'ready',
    code,
    orderId: order.orderId,
  }
}
