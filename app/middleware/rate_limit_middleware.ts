import { HttpContext } from '@adonisjs/core/http'
import { NextFn } from '@adonisjs/core/types/http'

/**
 * Simple rate limiting middleware (without Redis)
 */
export default class RateLimitMiddleware {
  private static requests = new Map<string, number[]>()

  // ✅ IMPROVED - Per-route limits
  private readonly LIMITS: Record<string, { window: number; max: number }> = {
    '/api/admin/auth/login': { window: 300000, max: 5 }, // 5 per 5min
    '/api/admin/auth/refresh': { window: 60000, max: 10 }, // 10 per min
    '/api/admin/exports': { window: 60000, max: 3 }, // 3 exports per min
    default: { window: 60000, max: 100 },
  }

  async handle(ctx: HttpContext, next: NextFn) {
    const identifier = `${ctx.request.ip()}-${ctx.request.url()}`
    const route = ctx.request.url()

    // Find matching limit
    let limit = this.LIMITS.default
    for (const [pattern, config] of Object.entries(this.LIMITS)) {
      if (pattern !== 'default' && route.includes(pattern)) {
        limit = config
        break
      }
    }

    const now = Date.now()
    const requestHistory = RateLimitMiddleware.requests.get(identifier) || []
    const recentRequests = requestHistory.filter(
      (timestamp) => now - timestamp < limit.window
    )

    if (recentRequests.length >= limit.max) {
      const oldestRequest = Math.min(...recentRequests)
      const retryAfter = Math.ceil((oldestRequest + limit.window - now) / 1000)

      ctx.response.header('Retry-After', String(retryAfter))
      ctx.response.header('X-RateLimit-Limit', String(limit.max))
      ctx.response.header('X-RateLimit-Remaining', '0')

      return ctx.response.tooManyRequests({
        error: 'Rate limit exceeded',
        message: `Maximum ${limit.max} requests per ${limit.window / 1000}s. Retry after ${retryAfter}s.`,
        retryAfter,
      })
    }

    recentRequests.push(now)
    RateLimitMiddleware.requests.set(identifier, recentRequests)

    ctx.response.header('X-RateLimit-Limit', String(limit.max))
    ctx.response.header('X-RateLimit-Remaining', String(limit.max - recentRequests.length))

    return next()
  }
}