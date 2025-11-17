// app/controllers/api/admin/auth_controller.ts
import type { HttpContext } from '@adonisjs/core/http'
import env from '#start/env'
import TokenStoreService from '#services/token_store_service'
import { loginValidator } from '#validators/admin_login'

export default class AuthController {
  /**
   * Authentification avec le token statique + informations de l'appareil
   * 
   * POST /api/admin/auth/login
   * Body: { 
   *   token: "votre_token_admin_statique",
   *   deviceId: "unique_device_identifier",
   *   deviceName: "iPhone 14 Pro",
   *   deviceInfo: { os: "iOS", version: "17.0" }
   * }
   */
  async login({ request, response }: HttpContext) {
    try {
      const data = await request.validateUsing(loginValidator)

      // Vérifier le token statique
      if (data.token !== env.get('ADMIN_API_TOKEN')) {
        return response.unauthorized({
          error: 'Token invalide',
          message: 'Le token fourni est incorrect.',
        })
      }

      // Récupérer les métadonnées de l'appareil
      const deviceId = data.deviceId || request.header('X-Device-Id')
      const deviceName = data.deviceName || 'Unknown Device'
      const userAgent = request.header('User-Agent')

      if (!deviceId) {
        return response.badRequest({
          error: 'Device ID manquant',
          message: 'Un identifiant unique de l\'appareil est requis pour la sécurité.',
        })
      }

      // Générer une nouvelle paire de tokens
      const tokenPair = await TokenStoreService.generateTokenPair(
        deviceId,
        deviceName,
        userAgent
      )

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
          deviceId,
          deviceName,
        },
      })
    } catch (error) {
      console.error('Login error:', error)
      return response.badRequest({
        error: 'Validation error',
        message: error.messages || 'Les données fournies sont invalides.',
      })
    }
  }

  /**
   * Rafraîchir un token expiré
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

    const newTokenPair = await TokenStoreService.refreshToken(refreshToken)

    if (!newTokenPair) {
      return response.unauthorized({
        error: 'Refresh token invalide',
        message: 'Le refresh token est invalide, expiré ou déjà utilisé. Veuillez vous reconnecter.',
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
   * Vérifier le statut d'authentification
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
        expiresAt: tokenInfo.expiresAt,
        deviceId: tokenInfo.deviceId,
        deviceName: tokenInfo.deviceName,
        createdAt: tokenInfo.createdAt,
        lastUsedAt: tokenInfo.lastUsedAt,
      },
    })
  }

  /**
   * Déconnexion (révocation du token actuel)
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
   * Déconnexion de tous les appareils
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
   * Déconnexion d'un appareil spécifique
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
   * Statistiques des tokens actifs
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
   * Liste toutes les sessions actives (appareils connectés)
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
}