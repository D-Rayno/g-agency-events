// app/services/token_store_service.ts
import { DateTime } from 'luxon'
import { randomBytes } from 'node:crypto'
import app from '@adonisjs/core/services/app'
import { writeFile, readFile, mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'

/**
 * Interface pour stocker les informations du token
 */
interface TokenInfo {
  token: string
  refreshToken: string
  createdAt: string
  expiresAt: string
  deviceId?: string
  deviceName?: string
  userAgent?: string
  lastUsedAt: string
}

interface TokenStore {
  tokens: Record<string, TokenInfo>
  refreshIndex: Record<string, string>
}

/**
 * Service pour gérer les tokens admin avec stockage fichier persistant
 * Les tokens survivent aux redémarrages du serveur
 */
export default class TokenStoreService {
  private static storePath = app.makePath('storage/tokens/admin_tokens.json')
  private static store: TokenStore | null = null
  
  /**
   * Durée de validité d'un token en minutes (défaut: 7 jours)
   */
  private static readonly TOKEN_LIFETIME_MINUTES = 7 * 24 * 60 // 7 days

  /**
   * Durée de validité d'un refresh token en minutes (défaut: 30 jours)
   */
  private static readonly REFRESH_TOKEN_LIFETIME_MINUTES = 30 * 24 * 60 // 30 days

  /**
   * Initialise le store depuis le fichier
   */
  private static async initStore(): Promise<void> {
    if (this.store) return

    try {
      // Créer le dossier si nécessaire
      const dir = app.makePath('storage/tokens')
      if (!existsSync(dir)) {
        await mkdir(dir, { recursive: true })
      }

      // Charger le store existant
      if (existsSync(this.storePath)) {
        const data = await readFile(this.storePath, 'utf-8')
        this.store = JSON.parse(data)
        
        // Nettoyer les tokens expirés au démarrage
        await this.cleanupExpiredTokens()
      } else {
        this.store = { tokens: {}, refreshIndex: {} }
        await this.saveStore()
      }
    } catch (error) {
      console.error('[TokenStore] Erreur initialisation:', error)
      this.store = { tokens: {}, refreshIndex: {} }
    }
  }

  /**
   * Sauvegarde le store dans le fichier
   */
  private static async saveStore(): Promise<void> {
    try {
      await writeFile(this.storePath, JSON.stringify(this.store, null, 2), 'utf-8')
    } catch (error) {
      console.error('[TokenStore] Erreur sauvegarde:', error)
    }
  }

  /**
   * Génère une nouvelle paire de tokens (access token + refresh token)
   */
  static async generateTokenPair(deviceId?: string, deviceName?: string, userAgent?: string) {
    await this.initStore()

    // Générer un token d'accès aléatoire sécurisé
    const accessToken = randomBytes(48).toString('hex')
    const refreshToken = randomBytes(64).toString('hex')

    const now = DateTime.now()
    const expiresAt = now.plus({ minutes: this.TOKEN_LIFETIME_MINUTES })
    const refreshExpiresAt = now.plus({ minutes: this.REFRESH_TOKEN_LIFETIME_MINUTES })

    const tokenInfo: TokenInfo = {
      token: accessToken,
      refreshToken,
      createdAt: now.toISO()!,
      expiresAt: expiresAt.toISO()!,
      deviceId,
      deviceName,
      userAgent,
      lastUsedAt: now.toISO()!,
    }

    // Sauvegarder dans le store
    this.store!.tokens[accessToken] = tokenInfo
    this.store!.refreshIndex[refreshToken] = accessToken

    await this.saveStore()

    console.log(`[TokenStore] Nouveau token généré pour ${deviceName || deviceId || 'unknown'}`)

    return {
      accessToken,
      refreshToken,
      expiresAt: expiresAt.toISO(),
      expiresIn: this.TOKEN_LIFETIME_MINUTES * 60,
      refreshExpiresAt: refreshExpiresAt.toISO(),
    }
  }

  /**
   * Vérifie si un token est valide
   */
  static async isTokenValid(token: string): Promise<boolean> {
    await this.initStore()
    
    const tokenInfo = this.store!.tokens[token]
    if (!tokenInfo) return false

    const expiresAt = DateTime.fromISO(tokenInfo.expiresAt)
    if (DateTime.now() > expiresAt) {
      return false
    }

    // Mettre à jour lastUsedAt
    tokenInfo.lastUsedAt = DateTime.now().toISO()!
    await this.saveStore()

    return true
  }

  /**
   * Obtient les informations d'un token
   */
  static async getTokenInfo(token: string): Promise<TokenInfo | null> {
    await this.initStore()
    return this.store!.tokens[token] || null
  }

  /**
   * Rafraîchit un token expiré
   */
  static async refreshToken(refreshToken: string) {
    await this.initStore()

    const oldAccessToken = this.store!.refreshIndex[refreshToken]
    if (!oldAccessToken) {
      console.log('[TokenStore] Refresh token invalide')
      return null
    }

    const oldTokenInfo = this.store!.tokens[oldAccessToken]
    if (!oldTokenInfo) {
      console.log('[TokenStore] Token principal introuvable')
      return null
    }

    // Vérifier si le refresh token n'est pas expiré
    const refreshExpiresAt = DateTime.fromISO(oldTokenInfo.createdAt).plus({ 
      minutes: this.REFRESH_TOKEN_LIFETIME_MINUTES 
    })
    
    if (DateTime.now() > refreshExpiresAt) {
      console.log('[TokenStore] Refresh token expiré')
      await this.revokeToken(oldAccessToken)
      return null
    }

    // Révoquer l'ancien token
    await this.revokeToken(oldAccessToken)

    console.log('[TokenStore] Token rafraîchi avec succès')

    // Générer une nouvelle paire
    return this.generateTokenPair(
      oldTokenInfo.deviceId,
      oldTokenInfo.deviceName,
      oldTokenInfo.userAgent
    )
  }

  /**
   * Révoque un token
   */
  static async revokeToken(token: string): Promise<void> {
    await this.initStore()
    
    const tokenInfo = this.store!.tokens[token]
    if (tokenInfo) {
      delete this.store!.refreshIndex[tokenInfo.refreshToken]
      delete this.store!.tokens[token]
      await this.saveStore()
      console.log(`[TokenStore] Token révoqué: ${token.substring(0, 8)}...`)
    }
  }

  /**
   * Révoque tous les tokens
   */
  static async revokeAllTokens(): Promise<void> {
    await this.initStore()
    
    const count = Object.keys(this.store!.tokens).length
    this.store = { tokens: {}, refreshIndex: {} }
    await this.saveStore()
    
    console.log(`[TokenStore] ${count} token(s) révoqué(s)`)
  }

  /**
   * Révoque tous les tokens d'un appareil spécifique
   */
  static async revokeDeviceTokens(deviceId: string): Promise<void> {
    await this.initStore()
    
    let count = 0
    for (const [token, info] of Object.entries(this.store!.tokens)) {
      if (info.deviceId === deviceId) {
        delete this.store!.refreshIndex[info.refreshToken]
        delete this.store!.tokens[token]
        count++
      }
    }
    
    if (count > 0) {
      await this.saveStore()
      console.log(`[TokenStore] ${count} token(s) révoqué(s) pour l'appareil ${deviceId}`)
    }
  }

  /**
   * Nettoie les tokens expirés
   */
  static async cleanupExpiredTokens(): Promise<void> {
    await this.initStore()
    
    const now = DateTime.now()
    let cleanedCount = 0

    for (const [token, info] of Object.entries(this.store!.tokens)) {
      const expiresAt = DateTime.fromISO(info.expiresAt)
      const refreshExpiresAt = DateTime.fromISO(info.createdAt).plus({ 
        minutes: this.REFRESH_TOKEN_LIFETIME_MINUTES 
      })
      
      // Supprimer si même le refresh token est expiré
      if (now > refreshExpiresAt) {
        delete this.store!.refreshIndex[info.refreshToken]
        delete this.store!.tokens[token]
        cleanedCount++
      }
    }

    if (cleanedCount > 0) {
      await this.saveStore()
      console.log(`[TokenStore] ${cleanedCount} token(s) expiré(s) nettoyé(s)`)
    }
  }

  /**
   * Obtient des statistiques
   */
  static async getStats() {
    await this.initStore()
    
    const now = DateTime.now()
    let activeCount = 0
    let expiredCount = 0

    for (const info of Object.values(this.store!.tokens)) {
      const expiresAt = DateTime.fromISO(info.expiresAt)
      if (now <= expiresAt) {
        activeCount++
      } else {
        expiredCount++
      }
    }

    return {
      total: Object.keys(this.store!.tokens).length,
      active: activeCount,
      expired: expiredCount,
      tokenLifetimeMinutes: this.TOKEN_LIFETIME_MINUTES,
      refreshTokenLifetimeMinutes: this.REFRESH_TOKEN_LIFETIME_MINUTES,
    }
  }

  /**
   * Liste toutes les sessions actives
   */
  static async listActiveSessions() {
    await this.initStore()
    
    const sessions = []
    const now = DateTime.now()

    for (const [token, info] of Object.entries(this.store!.tokens)) {
      const expiresAt = DateTime.fromISO(info.expiresAt)
      const isExpired = now > expiresAt
      const lastUsedAt = DateTime.fromISO(info.lastUsedAt)

      sessions.push({
        tokenPreview: `${token.substring(0, 8)}...`,
        deviceId: info.deviceId || 'unknown',
        deviceName: info.deviceName || 'Unknown Device',
        userAgent: info.userAgent || 'unknown',
        createdAt: info.createdAt,
        expiresAt: info.expiresAt,
        lastUsedAt: info.lastUsedAt,
        isExpired,
        timeRemaining: isExpired ? 0 : expiresAt.diff(now, 'minutes').minutes,
        daysSinceLastUse: now.diff(lastUsedAt, 'days').days,
      })
    }

    // Trier par dernière utilisation
    return sessions.sort((a, b) => {
      return new Date(b.lastUsedAt).getTime() - new Date(a.lastUsedAt).getTime()
    })
  }
}

// Nettoyer les tokens expirés toutes les 6 heures
setInterval(
  () => {
    TokenStoreService.cleanupExpiredTokens()
  },
  6 * 60 * 60 * 1000
)