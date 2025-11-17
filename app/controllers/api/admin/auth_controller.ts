// app/controllers/api/admin/auth_controller.ts
import type { HttpContext } from '@adonisjs/core/http'
import TokenStoreService from '#services/token_store_service'
import { loginValidator } from '#validators/admin_login'

export default class AuthController {
  /**
   * Enhanced authentication with device fingerprinting and FCM token
   * 
   * POST /api/admin/auth/login
   * Body: { 
   *   deviceId: "unique_device_identifier",
   *   deviceName: "iPhone 14 Pro",
   *   deviceModel: "iPhone14,3",
   *   osVersion: "17.0",
   *   appVersion: "1.0.0",
   *   fcmToken: "firebase_cloud_messaging_token" (optional)
   * }
   */
  async login({ request, response }: HttpContext) {
    try {
      const data = await request.validateUsing(loginValidator)
      
      // Get client information
      const ipAddress = request.ip()
      const userAgent = request.header('User-Agent') || 'unknown'
      
      // Generate secure token pair
      const tokenPair = await TokenStoreService.generateTokenPair({
        deviceId: data.deviceId,
        deviceName: data.deviceName || 'Unknown Device',
        deviceModel: data.deviceModel,
        osVersion: data.osVersion,
        appVersion: data.appVersion,
        ipAddress,
        userAgent,
        fcmToken: data.fcmToken,
      })

      return response.ok({
        success: true,
        message: 'Authentification réussie',
        data: {
          accessToken: tokenPair.accessToken,
          refreshToken: tokenPair.refreshToken,
          expiresAt: tokenPair.expiresAt,
          expiresIn: tokenPair.expiresIn,
          refreshExpiresAt: tokenPair.refreshExpiresAt,
          tokenType: 'Bearer',
          device: {
            deviceId: data.deviceId,
            deviceName: data.deviceName,
            deviceModel: data.deviceModel,
          },
        },
      })
    } catch (error) {
      console.error('Login error:', error)
      
      if (error.message?.includes('Too many devices')) {
        return response.tooManyRequests({
          error: 'Limite atteinte',
          message: error.message,
        })
      }
      
      return response.badRequest({
        error: 'Validation error',
        message: error.messages || 'Les données fournies sont invalides.',
      })
    }
  }

  /**
   * Refresh an expired token
   * 
   * POST /api/admin/auth/refresh
   * Body: { refreshToken: "votre_refresh_token" }
   */
  async refresh({ request, response }: HttpContext) {
    const { refreshToken } = request.only(['refreshToken'])

    if (!refreshToken) {
      return response.badRequest({
        error: 'Refresh token manquant',
        message: 'Le refresh token est requis pour renouveler l\'accès.',
      })
    }

    const ipAddress = request.ip()
    const userAgent = request.header('User-Agent') || 'unknown'

    const newTokenPair = await TokenStoreService.refreshToken(
      refreshToken,
      ipAddress,
      userAgent
    )

    if (!newTokenPair) {
      return response.unauthorized({
        error: 'Refresh token invalide',
        message: 'Le refresh token est invalide, expiré ou révoqué. Veuillez vous reconnecter.',
        code: 'REFRESH_TOKEN_INVALID',
      })
    }

    return response.ok({
      success: true,
      message: 'Token rafraîchi avec succès',
      data: {
        accessToken: newTokenPair.accessToken,
        refreshToken: newTokenPair.refreshToken,
        expiresAt: newTokenPair.expiresAt,
        expiresIn: newTokenPair.expiresIn,
        refreshExpiresAt: newTokenPair.refreshExpiresAt,
        tokenType: 'Bearer',
      },
    })
  }

  /**
   * Update FCM token for push notifications
   * 
   * POST /api/admin/auth/update-fcm-token
   * Body: { fcmToken: "new_firebase_token" }
   */
  async updateFcmToken({ request, response }: HttpContext) {
    const token = request.header('Authorization')?.replace('Bearer ', '')
    const { fcmToken } = request.only(['fcmToken'])

    if (!token || !fcmToken) {
      return response.badRequest({
        error: 'Données manquantes',
        message: 'Le token et le FCM token sont requis.',
      })
    }

    const updated = await TokenStoreService.updateFcmToken(token, fcmToken)

    if (!updated) {
      return response.notFound({
        error: 'Token invalide',
        message: 'Le token fourni est invalide.',
      })
    }

    return response.ok({
      success: true,
      message: 'FCM token mis à jour avec succès',
    })
  }

  /**
   * Verify authentication status
   * 
   * GET /api/admin/auth/check
   */
  async check({ request, response }: HttpContext) {
    const token = request.header('Authorization')?.replace('Bearer ', '')

    if (!token) {
      return response.unauthorized({
        authenticated: false,
        message: 'Token manquant',
      })
    }

    const tokenInfo = await TokenStoreService.getTokenInfo(token)

    if (!tokenInfo) {
      return response.unauthorized({
        authenticated: false,
        message: 'Token invalide',
      })
    }

    return response.ok({
      authenticated: true,
      message: 'Token valide',
      data: {
        device: {
          deviceId: tokenInfo.deviceId,
          deviceName: tokenInfo.deviceName,
          deviceModel: tokenInfo.deviceModel,
          osVersion: tokenInfo.osVersion,
          appVersion: tokenInfo.appVersion,
        },
        session: {
          createdAt: tokenInfo.createdAt,
          expiresAt: tokenInfo.expiresAt,
          lastUsedAt: tokenInfo.lastUsedAt,
          loginCount: tokenInfo.loginCount,
        },
        security: {
          ipAddress: tokenInfo.lastIpAddress,
          failedAttempts: tokenInfo.failedAttempts,
        },
        hasFcmToken: !!tokenInfo.fcmToken,
      },
    })
  }

  /**
   * Logout (revoke current token)
   * 
   * POST /api/admin/auth/logout
   */
  async logout({ request, response }: HttpContext) {
    const token = request.header('Authorization')?.replace('Bearer ', '')

    if (token) {
      await TokenStoreService.revokeToken(token)
    }

    return response.ok({
      success: true,
      message: 'Déconnexion réussie',
    })
  }

  /**
   * Logout from all devices
   * 
   * POST /api/admin/auth/logout-all
   */
  async logoutAll({ response }: HttpContext) {
    await TokenStoreService.revokeAllTokens()

    return response.ok({
      success: true,
      message: 'Tous les appareils ont été déconnectés',
    })
  }

  /**
   * Logout specific device
   * 
   * POST /api/admin/auth/logout-device
   * Body: { deviceId: "device_id" }
   */
  async logoutDevice({ request, response }: HttpContext) {
    const { deviceId } = request.only(['deviceId'])

    if (!deviceId) {
      return response.badRequest({
        error: 'Device ID manquant',
        message: 'L\'identifiant de l\'appareil est requis.',
      })
    }

    await TokenStoreService.revokeDeviceTokens(deviceId)

    return response.ok({
      success: true,
      message: 'Appareil déconnecté avec succès',
    })
  }

  /**
   * Get token statistics
   * 
   * GET /api/admin/auth/stats
   */
  async stats({ response }: HttpContext) {
    const stats = await TokenStoreService.getStats()

    return response.ok({
      success: true,
      data: stats,
    })
  }

  /**
   * List all active sessions
   * 
   * GET /api/admin/auth/sessions
   */
  async sessions({ response }: HttpContext) {
    const sessions = await TokenStoreService.listActiveSessions()

    return response.ok({
      success: true,
      data: {
        count: sessions.length,
        sessions,
      },
    })
  }

  /**
   * Get security alerts
   * 
   * GET /api/admin/auth/security-alerts
   */
  async securityAlerts({ response }: HttpContext) {
    const alerts = await TokenStoreService.getSecurityAlerts()

    return response.ok({
      success: true,
      data: {
        count: alerts.length,
        alerts,
      },
    })
  }
}