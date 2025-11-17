import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import TokenStoreService from '#services/token_store_service'

/**
 * Enhanced Admin API Middleware with Security Checks
 */
export default class AdminApiMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const authHeader = ctx.request.header('Authorization')

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return ctx.response.unauthorized({
        error: 'Non autorisé',
        message: "Token d'authentification manquant. Format attendu: 'Bearer <token>'",
        code: 'MISSING_TOKEN',
      })
    }

    const token = authHeader.replace('Bearer ', '')

    if (!token) {
      return ctx.response.unauthorized({
        error: 'Non autorisé',
        message: "Token d'authentification vide.",
        code: 'EMPTY_TOKEN',
      })
    }

    // Get client information for validation
    const ipAddress = ctx.request.ip()
    const userAgent = ctx.request.header('User-Agent') || 'unknown'

    // Validate token with security checks
    const isValid = await TokenStoreService.validateToken(token, ipAddress, userAgent)

    if (!isValid) {
      const tokenInfo = await TokenStoreService.getTokenInfo(token)

      if (tokenInfo) {
        // Token exists but failed validation (suspicious activity, IP change, etc.)
        return ctx.response.unauthorized({
          error: 'Activité suspecte détectée',
          message: 'Votre session a été révoquée pour des raisons de sécurité. Veuillez vous reconnecter.',
          code: 'SUSPICIOUS_ACTIVITY',
        })
      } else {
        // Token doesn't exist or is revoked
        return ctx.response.unauthorized({
          error: 'Token invalide',
          message: 'Le token fourni est invalide ou a été révoqué.',
          code: 'INVALID_TOKEN',
        })
      }
    }

    // Token is valid - attach token info to context for use in controllers
    const tokenInfo = await TokenStoreService.getTokenInfo(token)
    if (tokenInfo) {
      ctx.request.ctx = {
        ...ctx.request.ctx,
        adminDevice: {
          deviceId: tokenInfo.deviceId,
          deviceName: tokenInfo.deviceName,
          deviceModel: tokenInfo.deviceModel,
        },
      } as any
    }

    // Log access for monitoring
    ctx.logger.info('Admin API Access', {
      endpoint: ctx.request.url(),
      method: ctx.request.method(),
      deviceId: tokenInfo?.deviceId || 'unknown',
      ipAddress,
    })

    return next()
  }
}