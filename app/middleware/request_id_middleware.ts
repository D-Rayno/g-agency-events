import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import { randomUUID } from 'node:crypto'

export default class RequestIdMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const requestId = ctx.request.header('X-Request-ID') || randomUUID()
    ctx.response.header('X-Request-ID', requestId)
    ctx.logger.info({ requestId, method: ctx.request.method(), url: ctx.request.url() })
    return next()
  }
}