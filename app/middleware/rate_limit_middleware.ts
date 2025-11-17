import { HttpContext } from '@adonisjs/core/http'
import { NextFn } from '@adonisjs/core/types/http'

/**
 * Simple rate limiting middleware (without Redis)
 */
export default class RateLimitMiddleware {
  private static requests = new Map<string, number[]>()
  
  // Configuration
  private static readonly WINDOW_MS = 60000 // 1 minute
  private static readonly MAX_REQUESTS = 100 // requests per window
  
  async handle(ctx: HttpContext, next: NextFn) {
    const identifier = ctx.request.ip() // Use IP as identifier
    const now = Date.now()
    
    // Get or initialize request history
    const requestHistory = RateLimitMiddleware.requests.get(identifier) || []
    
    // Filter out old requests outside the time window
    const recentRequests = requestHistory.filter(
      (timestamp) => now - timestamp < RateLimitMiddleware.WINDOW_MS
    )
    
    // Check if rate limit exceeded
    if (recentRequests.length >= RateLimitMiddleware.MAX_REQUESTS) {
      const oldestRequest = Math.min(...recentRequests)
      const retryAfter = Math.ceil(
        (oldestRequest + RateLimitMiddleware.WINDOW_MS - now) / 1000
      )
      
      ctx.response.header('Retry-After', String(retryAfter))
      
      return ctx.response.tooManyRequests({
        error: 'Trop de requêtes',
        message: `Limite de ${RateLimitMiddleware.MAX_REQUESTS} requêtes par minute dépassée. Veuillez réessayer dans ${retryAfter} secondes.`,
        retryAfter,
      })
    }
    
    // Add current request timestamp
    recentRequests.push(now)
    RateLimitMiddleware.requests.set(identifier, recentRequests)
    
    // Clean up old entries periodically
    if (Math.random() < 0.01) {
      // 1% chance to clean up
      this.cleanup()
    }
    
    return next()
  }
  
  /**
   * Clean up expired entries from memory
   */
  private cleanup() {
    const now = Date.now()
    
    for (const [identifier, timestamps] of RateLimitMiddleware.requests.entries()) {
      const recentTimestamps = timestamps.filter(
        (timestamp) => now - timestamp < RateLimitMiddleware.WINDOW_MS
      )
      
      if (recentTimestamps.length === 0) {
        RateLimitMiddleware.requests.delete(identifier)
      } else {
        RateLimitMiddleware.requests.set(identifier, recentTimestamps)
      }
    }
  }
}