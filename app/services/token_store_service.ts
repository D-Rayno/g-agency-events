// app/services/secure_token_store_service.ts
import { DateTime } from 'luxon'
import { randomBytes, createHash, createCipheriv, createDecipheriv } from 'node:crypto'
import app from '@adonisjs/core/services/app'
import { writeFile, readFile, mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import env from '#start/env'

/**
 * Enhanced token information with security features
 */
interface SecureTokenInfo {
  // Hashed token for storage (never store plain tokens)
  hashedToken: string
  
  // Encrypted refresh token
  encryptedRefreshToken: string
  
  // Device information
  deviceId: string
  deviceName: string
  deviceModel?: string
  osVersion?: string
  appVersion?: string
  
  // FCM token for push notifications
  fcmToken?: string
  
  // Security tracking
  ipAddress: string
  userAgent: string
  deviceFingerprint: string // Unique device identifier
  
  // Timestamps
  createdAt: string
  expiresAt: string
  lastUsedAt: string
  lastIpAddress: string
  
  // Security flags
  isRevoked: boolean
  failedAttempts: number
  lastFailedAttempt?: string
  
  // Session metadata
  loginCount: number
  lastRefreshAt?: string
}

interface TokenStore {
  tokens: Record<string, SecureTokenInfo>
  revokedTokens: Set<string> // Blacklist
  deviceIndex: Record<string, string[]> // deviceId -> hashedTokens[]
  ipIndex: Record<string, string[]> // IP -> hashedTokens[]
}

/**
 * Secure Token Store Service
 * 
 * Features:
 * - Token hashing (SHA-256)
 * - Refresh token encryption (AES-256-GCM)
 * - Device fingerprinting
 * - IP address tracking
 * - Automatic token rotation
 * - Rate limiting per device
 * - Suspicious activity detection
 * - FCM token management
 * - Persistent storage without Redis
 */
export default class SecureTokenStoreService {
  private static storePath = app.makePath('storage/tokens/secure_tokens.json')
  private static store: TokenStore | null = null
  
  // Security configuration
  private static readonly TOKEN_LIFETIME_MINUTES = 7 * 24 * 60 // 7 days
  private static readonly REFRESH_TOKEN_LIFETIME_MINUTES = 30 * 24 * 60 // 30 days
  private static readonly MAX_FAILED_ATTEMPTS = 5
  private static readonly MAX_DEVICES_PER_IP = 10
  private static readonly ENCRYPTION_ALGORITHM = 'aes-256-gcm'
  
  // Encryption key from environment (must be 32 bytes)
  private static readonly ENCRYPTION_KEY = Buffer.from(
    env.get('TOKEN_ENCRYPTION_KEY') || createHash('sha256').update(env.get('APP_KEY')).digest()
  )

  /**
   * Initialize the token store from persistent storage
   */
  private static async initStore(): Promise<void> {
    if (this.store) return

    try {
      const dir = app.makePath('storage/tokens')
      if (!existsSync(dir)) {
        await mkdir(dir, { recursive: true })
      }

      if (existsSync(this.storePath)) {
        const data = await readFile(this.storePath, 'utf-8')
        const parsed = JSON.parse(data)
        this.store = {
          tokens: parsed.tokens || {},
          revokedTokens: new Set(parsed.revokedTokens || []),
          deviceIndex: parsed.deviceIndex || {},
          ipIndex: parsed.ipIndex || {},
        }
        
        await this.cleanupExpiredTokens()
      } else {
        this.store = {
          tokens: {},
          revokedTokens: new Set(),
          deviceIndex: {},
          ipIndex: {},
        }
        await this.saveStore()
      }
    } catch (error) {
      console.error('[SecureTokenStore] Initialization error:', error)
      this.store = {
        tokens: {},
        revokedTokens: new Set(),
        deviceIndex: {},
        ipIndex: {},
      }
    }
  }

  /**
   * Save the store to persistent storage
   */
  private static async saveStore(): Promise<void> {
    try {
      const data = JSON.stringify(
        {
          tokens: this.store!.tokens,
          revokedTokens: Array.from(this.store!.revokedTokens),
          deviceIndex: this.store!.deviceIndex,
          ipIndex: this.store!.ipIndex,
        },
        null,
        2
      )
      await writeFile(this.storePath, data, 'utf-8')
    } catch (error) {
      console.error('[SecureTokenStore] Save error:', error)
    }
  }

  /**
   * Hash a token using SHA-256
   */
  private static hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex')
  }

  /**
   * Encrypt sensitive data (refresh tokens)
   */
  private static encrypt(text: string): string {
    const iv = randomBytes(16)
    const cipher = createCipheriv(this.ENCRYPTION_ALGORITHM, this.ENCRYPTION_KEY, iv)
    
    let encrypted = cipher.update(text, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    
    const authTag = cipher.getAuthTag()
    
    // Return iv:authTag:encrypted
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`
  }

  /**
   * Decrypt sensitive data
   */
  private static decrypt(encrypted: string): string {
    const parts = encrypted.split(':')
    const iv = Buffer.from(parts[0], 'hex')
    const authTag = Buffer.from(parts[1], 'hex')
    const encryptedText = parts[2]
    
    const decipher = createDecipheriv(this.ENCRYPTION_ALGORITHM, this.ENCRYPTION_KEY, iv)
    decipher.setAuthTag(authTag)
    
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    
    return decrypted
  }

  /**
   * Generate a device fingerprint from device information
   */
  private static generateDeviceFingerprint(
    deviceId: string,
    deviceModel: string,
    osVersion: string,
    appVersion: string
  ): string {
    const data = `${deviceId}|${deviceModel}|${osVersion}|${appVersion}`
    return createHash('sha256').update(data).digest('hex')
  }

  /**
   * Check if IP has too many devices (potential abuse)
   */
  private static async checkIpAbuse(ipAddress: string): Promise<boolean> {
    await this.initStore()
    
    const devices = this.store!.ipIndex[ipAddress] || []
    return devices.length >= this.MAX_DEVICES_PER_IP
  }

  /**
   * Detect suspicious activity
   */
  private static detectSuspiciousActivity(
    tokenInfo: SecureTokenInfo,
    ipAddress: string,
    userAgent: string
  ): boolean {
    // Check if IP changed
    if (tokenInfo.lastIpAddress !== ipAddress) {
      console.warn(`[SecureTokenStore] IP change detected for device ${tokenInfo.deviceId}`)
      return true
    }
    
    // Check if user agent changed significantly
    if (tokenInfo.userAgent !== userAgent) {
      console.warn(`[SecureTokenStore] User agent change detected for device ${tokenInfo.deviceId}`)
      return true
    }
    
    // Check failed attempts
    if (tokenInfo.failedAttempts >= this.MAX_FAILED_ATTEMPTS) {
      console.warn(`[SecureTokenStore] Too many failed attempts for device ${tokenInfo.deviceId}`)
      return true
    }
    
    return false
  }

  /**
   * Generate a new token pair with enhanced security
   */
  static async generateTokenPair(params: {
    deviceId: string
    deviceName: string
    deviceModel?: string
    osVersion?: string
    appVersion?: string
    ipAddress: string
    userAgent: string
    fcmToken?: string
  }) {
    await this.initStore()

    // Check for IP abuse
    if (await this.checkIpAbuse(params.ipAddress)) {
      throw new Error('Too many devices from this IP address. Please contact support.')
    }

    // Generate tokens
    const accessToken = randomBytes(48).toString('hex')
    const refreshToken = randomBytes(64).toString('hex')

    // Hash and encrypt
    const hashedToken = this.hashToken(accessToken)
    const encryptedRefreshToken = this.encrypt(refreshToken)

    // Generate device fingerprint
    const deviceFingerprint = this.generateDeviceFingerprint(
      params.deviceId,
      params.deviceModel || 'unknown',
      params.osVersion || 'unknown',
      params.appVersion || 'unknown'
    )

    const now = DateTime.now()
    const expiresAt = now.plus({ minutes: this.TOKEN_LIFETIME_MINUTES })

    const tokenInfo: SecureTokenInfo = {
      hashedToken,
      encryptedRefreshToken,
      deviceId: params.deviceId,
      deviceName: params.deviceName,
      deviceModel: params.deviceModel,
      osVersion: params.osVersion,
      appVersion: params.appVersion,
      fcmToken: params.fcmToken,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      deviceFingerprint,
      createdAt: now.toISO()!,
      expiresAt: expiresAt.toISO()!,
      lastUsedAt: now.toISO()!,
      lastIpAddress: params.ipAddress,
      isRevoked: false,
      failedAttempts: 0,
      loginCount: 1,
    }

    // Store token
    this.store!.tokens[hashedToken] = tokenInfo

    // Update indexes
    if (!this.store!.deviceIndex[params.deviceId]) {
      this.store!.deviceIndex[params.deviceId] = []
    }
    this.store!.deviceIndex[params.deviceId].push(hashedToken)

    if (!this.store!.ipIndex[params.ipAddress]) {
      this.store!.ipIndex[params.ipAddress] = []
    }
    this.store!.ipIndex[params.ipAddress].push(hashedToken)

    await this.saveStore()

    console.log(`[SecureTokenStore] New token generated for device ${params.deviceId}`)

    return {
      accessToken,
      refreshToken,
      expiresAt: expiresAt.toISO(),
      expiresIn: this.TOKEN_LIFETIME_MINUTES * 60,
      refreshExpiresAt: now.plus({ minutes: this.REFRESH_TOKEN_LIFETIME_MINUTES }).toISO(),
    }
  }

  /**
   * Validate a token with security checks
   */
  static async validateToken(
    token: string,
    ipAddress: string,
    userAgent: string
  ): Promise<boolean> {
    await this.initStore()

    const hashedToken = this.hashToken(token)
    const tokenInfo = this.store!.tokens[hashedToken]

    if (!tokenInfo) {
      return false
    }

    // Check if revoked
    if (tokenInfo.isRevoked || this.store!.revokedTokens.has(hashedToken)) {
      return false
    }

    // Check expiration
    const expiresAt = DateTime.fromISO(tokenInfo.expiresAt)
    if (DateTime.now() > expiresAt) {
      return false
    }

    // Detect suspicious activity
    if (this.detectSuspiciousActivity(tokenInfo, ipAddress, userAgent)) {
      tokenInfo.failedAttempts++
      tokenInfo.lastFailedAttempt = DateTime.now().toISO()!
      
      if (tokenInfo.failedAttempts >= this.MAX_FAILED_ATTEMPTS) {
        tokenInfo.isRevoked = true
        this.store!.revokedTokens.add(hashedToken)
        await this.saveStore()
        return false
      }
      
      await this.saveStore()
      return false
    }

    // Update last used
    tokenInfo.lastUsedAt = DateTime.now().toISO()!
    tokenInfo.lastIpAddress = ipAddress
    tokenInfo.failedAttempts = 0 // Reset on successful validation
    await this.saveStore()

    return true
  }

  /**
   * Get token information
   */
  static async getTokenInfo(token: string): Promise<SecureTokenInfo | null> {
    await this.initStore()
    
    const hashedToken = this.hashToken(token)
    const tokenInfo = this.store!.tokens[hashedToken]
    
    if (!tokenInfo || tokenInfo.isRevoked) {
      return null
    }
    
    return tokenInfo
  }

  /**
   * Refresh an expired token
   */
  static async refreshToken(
    refreshToken: string,
    ipAddress: string,
    userAgent: string
  ) {
    await this.initStore()

    // Find token by refresh token
    let hashedToken: string | null = null
    let tokenInfo: SecureTokenInfo | null = null

    for (const [hash, info] of Object.entries(this.store!.tokens)) {
      try {
        const decryptedRefresh = this.decrypt(info.encryptedRefreshToken)
        if (decryptedRefresh === refreshToken) {
          hashedToken = hash
          tokenInfo = info
          break
        }
      } catch {
        continue
      }
    }

    if (!hashedToken || !tokenInfo) {
      console.log('[SecureTokenStore] Invalid refresh token')
      return null
    }

    // Check if refresh token expired
    const refreshExpiresAt = DateTime.fromISO(tokenInfo.createdAt).plus({
      minutes: this.REFRESH_TOKEN_LIFETIME_MINUTES,
    })

    if (DateTime.now() > refreshExpiresAt) {
      console.log('[SecureTokenStore] Refresh token expired')
      await this.revokeToken(hashedToken)
      return null
    }

    // Revoke old token
    await this.revokeToken(hashedToken)

    // Generate new token pair
    console.log('[SecureTokenStore] Token refreshed successfully')

    return this.generateTokenPair({
      deviceId: tokenInfo.deviceId,
      deviceName: tokenInfo.deviceName,
      deviceModel: tokenInfo.deviceModel,
      osVersion: tokenInfo.osVersion,
      appVersion: tokenInfo.appVersion,
      ipAddress,
      userAgent,
      fcmToken: tokenInfo.fcmToken,
    })
  }

  /**
   * Revoke a specific token
   */
  static async revokeToken(tokenOrHash: string): Promise<void> {
    await this.initStore()

    const hashedToken = tokenOrHash.length === 64 ? tokenOrHash : this.hashToken(tokenOrHash)
    const tokenInfo = this.store!.tokens[hashedToken]

    if (tokenInfo) {
      tokenInfo.isRevoked = true
      this.store!.revokedTokens.add(hashedToken)
      
      // Remove from indexes
      this.store!.deviceIndex[tokenInfo.deviceId] = 
        this.store!.deviceIndex[tokenInfo.deviceId]?.filter(t => t !== hashedToken) || []
      
      this.store!.ipIndex[tokenInfo.ipAddress] = 
        this.store!.ipIndex[tokenInfo.ipAddress]?.filter(t => t !== hashedToken) || []
      
      await this.saveStore()
      console.log(`[SecureTokenStore] Token revoked: ${hashedToken.substring(0, 8)}...`)
    }
  }

  /**
   * Revoke all tokens for a device
   */
  static async revokeDeviceTokens(deviceId: string): Promise<void> {
    await this.initStore()

    const hashedTokens = this.store!.deviceIndex[deviceId] || []
    let count = 0

    for (const hashedToken of hashedTokens) {
      await this.revokeToken(hashedToken)
      count++
    }

    console.log(`[SecureTokenStore] ${count} token(s) revoked for device ${deviceId}`)
  }

  /**
   * Revoke all tokens
   */
  static async revokeAllTokens(): Promise<void> {
    await this.initStore()

    const count = Object.keys(this.store!.tokens).length

    this.store = {
      tokens: {},
      revokedTokens: new Set(),
      deviceIndex: {},
      ipIndex: {},
    }

    await this.saveStore()
    console.log(`[SecureTokenStore] All tokens revoked (${count} total)`)
  }

  /**
   * Update FCM token for a device
   */
  static async updateFcmToken(token: string, fcmToken: string): Promise<boolean> {
    await this.initStore()

    const hashedToken = this.hashToken(token)
    const tokenInfo = this.store!.tokens[hashedToken]

    if (!tokenInfo) {
      return false
    }

    tokenInfo.fcmToken = fcmToken
    await this.saveStore()

    console.log(`[SecureTokenStore] FCM token updated for device ${tokenInfo.deviceId}`)
    return true
  }

  /**
   * Get all FCM tokens for active sessions
   */
  static async getAllActiveFcmTokens(): Promise<string[]> {
    await this.initStore()

    const fcmTokens: string[] = []
    const now = DateTime.now()

    for (const tokenInfo of Object.values(this.store!.tokens)) {
      if (
        !tokenInfo.isRevoked &&
        tokenInfo.fcmToken &&
        DateTime.fromISO(tokenInfo.expiresAt) > now
      ) {
        fcmTokens.push(tokenInfo.fcmToken)
      }
    }

    return fcmTokens
  }

  /**
   * Get FCM tokens for specific devices
   */
  static async getFcmTokensForDevices(deviceIds: string[]): Promise<string[]> {
    await this.initStore()

    const fcmTokens: string[] = []
    const now = DateTime.now()

    for (const deviceId of deviceIds) {
      const hashedTokens = this.store!.deviceIndex[deviceId] || []
      
      for (const hashedToken of hashedTokens) {
        const tokenInfo = this.store!.tokens[hashedToken]
        
        if (
          tokenInfo &&
          !tokenInfo.isRevoked &&
          tokenInfo.fcmToken &&
          DateTime.fromISO(tokenInfo.expiresAt) > now
        ) {
          fcmTokens.push(tokenInfo.fcmToken)
        }
      }
    }

    return fcmTokens
  }

  /**
   * Cleanup expired tokens
   */
  static async cleanupExpiredTokens(): Promise<void> {
    await this.initStore()

    const now = DateTime.now()
    let cleanedCount = 0

    for (const [hashedToken, info] of Object.entries(this.store!.tokens)) {
      const refreshExpiresAt = DateTime.fromISO(info.createdAt).plus({
        minutes: this.REFRESH_TOKEN_LIFETIME_MINUTES,
      })

      if (now > refreshExpiresAt) {
        delete this.store!.tokens[hashedToken]
        this.store!.revokedTokens.delete(hashedToken)
        
        // Clean indexes
        this.store!.deviceIndex[info.deviceId] = 
          this.store!.deviceIndex[info.deviceId]?.filter(t => t !== hashedToken) || []
        
        this.store!.ipIndex[info.ipAddress] = 
          this.store!.ipIndex[info.ipAddress]?.filter(t => t !== hashedToken) || []
        
        cleanedCount++
      }
    }

    if (cleanedCount > 0) {
      await this.saveStore()
      console.log(`[SecureTokenStore] ${cleanedCount} expired token(s) cleaned up`)
    }
  }

  /**
   * Get statistics
   */
  static async getStats() {
    await this.initStore()

    const now = DateTime.now()
    let activeCount = 0
    let expiredCount = 0
    let revokedCount = 0

    for (const info of Object.values(this.store!.tokens)) {
      const expiresAt = DateTime.fromISO(info.expiresAt)
      
      if (info.isRevoked) {
        revokedCount++
      } else if (now <= expiresAt) {
        activeCount++
      } else {
        expiredCount++
      }
    }

    return {
      total: Object.keys(this.store!.tokens).length,
      active: activeCount,
      expired: expiredCount,
      revoked: revokedCount,
      uniqueDevices: Object.keys(this.store!.deviceIndex).length,
      uniqueIps: Object.keys(this.store!.ipIndex).length,
      tokenLifetimeMinutes: this.TOKEN_LIFETIME_MINUTES,
      refreshTokenLifetimeMinutes: this.REFRESH_TOKEN_LIFETIME_MINUTES,
    }
  }

  /**
   * List all active sessions with details
   */
  static async listActiveSessions() {
    await this.initStore()

    const sessions = []
    const now = DateTime.now()

    for (const [hashedToken, info] of Object.entries(this.store!.tokens)) {
      const expiresAt = DateTime.fromISO(info.expiresAt)
      const isExpired = now > expiresAt
      const lastUsedAt = DateTime.fromISO(info.lastUsedAt)

      sessions.push({
        tokenPreview: `${hashedToken.substring(0, 8)}...`,
        deviceId: info.deviceId,
        deviceName: info.deviceName,
        deviceModel: info.deviceModel || 'unknown',
        osVersion: info.osVersion || 'unknown',
        appVersion: info.appVersion || 'unknown',
        ipAddress: info.ipAddress,
        userAgent: info.userAgent,
        createdAt: info.createdAt,
        expiresAt: info.expiresAt,
        lastUsedAt: info.lastUsedAt,
        isExpired,
        isRevoked: info.isRevoked,
        failedAttempts: info.failedAttempts,
        loginCount: info.loginCount,
        hasFcmToken: !!info.fcmToken,
        timeRemaining: isExpired ? 0 : expiresAt.diff(now, 'minutes').minutes,
        daysSinceLastUse: now.diff(lastUsedAt, 'days').days,
      })
    }

    return sessions.sort((a, b) => {
      return new Date(b.lastUsedAt).getTime() - new Date(a.lastUsedAt).getTime()
    })
  }

  /**
   * Get security alerts
   */
  static async getSecurityAlerts() {
    await this.initStore()

    const alerts = []

    for (const [, info] of Object.entries(this.store!.tokens)) {
      if (info.failedAttempts > 0) {
        alerts.push({
          type: 'failed_attempts',
          severity: info.failedAttempts >= 3 ? 'high' : 'medium',
          deviceId: info.deviceId,
          deviceName: info.deviceName,
          failedAttempts: info.failedAttempts,
          lastFailedAttempt: info.lastFailedAttempt,
        })
      }
    }

    // Check for suspicious IPs
    for (const [ip, tokens] of Object.entries(this.store!.ipIndex)) {
      if (tokens.length >= 5) {
        alerts.push({
          type: 'multiple_devices',
          severity: tokens.length >= 8 ? 'high' : 'medium',
          ipAddress: ip,
          deviceCount: tokens.length,
        })
      }
    }

    return alerts
  }
}

// Auto-cleanup every 6 hours
setInterval(() => {
  SecureTokenStoreService.cleanupExpiredTokens()
}, 6 * 60 * 60 * 1000)