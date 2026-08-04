import Fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import rateLimit from '@fastify/rate-limit'
import { env, corsOrigins } from '../config/env.js'
import { redis } from '../redis/client.js'
import { registerRoutes } from './routes/index.js'
import { errorHandler } from './middleware/error-handler.js'
import { registerRequestLogger } from './middleware/request-logger.js'

export async function buildApp() {
  const app = Fastify({
    logger: false,
    trustProxy: env.TRUST_PROXY ?? env.NODE_ENV === 'production',
    bodyLimit: 1_048_576,
    requestTimeout: 30_000,
  })

  app.setErrorHandler(errorHandler)
  registerRequestLogger(app)

  await app.register(helmet, {
    contentSecurityPolicy: env.NODE_ENV === 'production',
    crossOriginEmbedderPolicy: false,
    global: true,
  })

  await app.register(cors, {
    origin: (origin, callback) => {
      if (!origin || corsOrigins.includes(origin)) {
        callback(null, true)
        return
      }

      callback(new Error('Origin not allowed'), false)
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Telegram-Init-Data'],
  })

  await app.register(rateLimit, {
    global: true,
    max: env.RATE_LIMIT_MAX,
    timeWindow: env.RATE_LIMIT_WINDOW_MS,
    ban: 0,
    skipOnError: false,
    addHeaders: {
      'x-ratelimit-limit': true,
      'x-ratelimit-remaining': true,
      'x-ratelimit-reset': true,
      'retry-after': true,
    },
    redis: redis,
    nameSpace: 'numberstar:rl:',
    continueExceeding: false,
    enableDraftSpec: true,
  })

  await registerRoutes(app)

  return app
}
