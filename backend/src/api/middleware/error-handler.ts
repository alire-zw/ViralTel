import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify'
import { env } from '../../config/env.js'
import { log } from '../../lib/logger.js'

export function errorHandler(
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply,
): void {
  const statusCode = error.statusCode ?? 500

  log.error('HTTP', `${request.method} ${request.url} failed`, {
    status: statusCode,
    error: error.message,
    ip: request.ip,
  })

  const message =
    env.NODE_ENV === 'production' && statusCode >= 500
      ? 'Internal server error'
      : error.message

  reply.code(statusCode).send({
    error: error.name || 'Error',
    message,
    ...(env.NODE_ENV !== 'production' && error.validation ? { validation: error.validation } : {}),
  })
}
