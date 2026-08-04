import { env } from '../config/env.js'

type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR'

const levelWeight: Record<LogLevel, number> = {
  DEBUG: 10,
  INFO: 20,
  WARN: 30,
  ERROR: 40,
}

const minLevel: LogLevel = env.NODE_ENV === 'production' ? 'INFO' : 'DEBUG'

export type LogFields = Record<string, string | number | boolean | null | undefined>

function formatTime(): string {
  return new Date().toLocaleTimeString('en-GB', { hour12: false })
}

function formatFields(fields?: LogFields): string {
  if (!fields) {
    return ''
  }

  const parts = Object.entries(fields)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => `${key}=${value}`)

  return parts.length > 0 ? ` ${parts.join(' ')}` : ''
}

function shouldLog(level: LogLevel): boolean {
  return levelWeight[level] >= levelWeight[minLevel]
}

function write(level: LogLevel, scope: string, message: string, fields?: LogFields): void {
  if (!shouldLog(level)) {
    return
  }

  console.log(`${formatTime()} ${level} ${scope} ${message}${formatFields(fields)}`)
}

export const log = {
  debug: (scope: string, message: string, fields?: LogFields) => write('DEBUG', scope, message, fields),
  info: (scope: string, message: string, fields?: LogFields) => write('INFO', scope, message, fields),
  warn: (scope: string, message: string, fields?: LogFields) => write('WARN', scope, message, fields),
  error: (scope: string, message: string, fields?: LogFields) => write('ERROR', scope, message, fields),

  http(method: string, url: string, status: number, durationMs: number, fields?: LogFields): void {
    write('INFO', 'HTTP', `${method} ${url} ${status} ${durationMs}ms`, fields)
  },

  bot(message: string, fields?: LogFields): void {
    write('INFO', 'BOT', message, fields)
  },

  db(message: string, fields?: LogFields): void {
    write('INFO', 'DB', message, fields)
  },
}
