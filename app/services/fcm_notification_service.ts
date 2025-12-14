// app/services/fcm_notification_service.ts
import admin from 'firebase-admin'
import { Message, MulticastMessage } from 'firebase-admin/messaging'
import env from '#start/env'
import TokenStoreService from '#services/token_store_service'

/**
 * Firebase Cloud Messaging Service
 * 
 * Handles push notifications for the admin mobile app
 */
export default class FcmNotificationService {
  private static initialized = false

  /**
   * Initialize Firebase Admin SDK
   */
  private static async initialize() {
    if (this.initialized) return

    try {
    const serviceAccountPath = env.get('FIREBASE_SERVICE_ACCOUNT_PATH')
    
    // Read file properly
    const { readFile } = await import('node:fs/promises')
    const serviceAccountData = await readFile(serviceAccountPath, 'utf-8')
    const serviceAccount = JSON.parse(serviceAccountData)

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    })

    this.initialized = true
    console.log('✅ Firebase Admin SDK initialized successfully')
    } catch (error) {
      console.error('❌ Firebase Admin SDK initialization failed:', error)
      throw error
    }
  }

  /**
   * Send notification to a single device
   */
  static async sendToDevice(fcmToken: string, notification: {
    title: string
    body: string
    data?: Record<string, string>
    imageUrl?: string
    badge?: number
  }): Promise<boolean> {
    this.initialize()

    try {
      const message: Message = {
        token: fcmToken,
        notification: {
          title: notification.title,
          body: notification.body,
          imageUrl: notification.imageUrl,
        },
        data: notification.data,
        apns: {
          payload: {
            aps: {
              badge: notification.badge || 0,
              sound: 'default',
            },
          },
        },
        android: {
          priority: 'high',
          notification: {
            sound: 'default',
            channelId: 'default',
          },
        },
      }

      const response = await admin.messaging().send(message)
      console.log(`✅ Notification sent successfully: ${response}`)
      return true
    } catch (error) {
      console.error('❌ Failed to send notification:', error)
      return false
    }
  }

  /**
   * Send notification to multiple devices
   */
  static async sendToMultipleDevices(fcmTokens: string[], notification: {
    title: string
    body: string
    data?: Record<string, string>
    imageUrl?: string
    badge?: number
  }): Promise<{ successCount: number; failureCount: number }> {
    this.initialize()

    if (fcmTokens.length === 0) {
      return { successCount: 0, failureCount: 0 }
    }

    try {
      const message: MulticastMessage = {
        tokens: fcmTokens,
        notification: {
          title: notification.title,
          body: notification.body,
          imageUrl: notification.imageUrl,
        },
        data: notification.data,
        apns: {
          payload: {
            aps: {
              badge: notification.badge || 0,
              sound: 'default',
            },
          },
        },
        android: {
          priority: 'high',
          notification: {
            sound: 'default',
            channelId: 'default',
          },
        },
      }

      const response = await admin.messaging().sendEachForMulticast(message)
      
      console.log(`✅ Notifications sent: ${response.successCount} success, ${response.failureCount} failed`)
      
      // Handle failed tokens (they might be invalid or expired)
      if (response.failureCount > 0) {
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            console.warn(`Failed to send to token ${fcmTokens[idx]}: ${resp.error}`)
          }
        })
      }

      return {
        successCount: response.successCount,
        failureCount: response.failureCount,
      }
    } catch (error) {
      console.error('❌ Failed to send multicast notification:', error)
      return { successCount: 0, failureCount: fcmTokens.length }
    }
  }

  /**
   * Send notification to all active admin sessions
   */
  static async sendToAllAdmins(notification: {
    title: string
    body: string
    data?: Record<string, string>
    imageUrl?: string
  }) {
    const fcmTokens = await TokenStoreService.getAllActiveFcmTokens()
    
    if (fcmTokens.length === 0) {
      console.log('ℹ️ No active FCM tokens found')
      return { successCount: 0, failureCount: 0 }
    }

    return this.sendToMultipleDevices(fcmTokens, notification)
  }

  /**
   * Send notification to specific devices
   */
  static async sendToDevices(deviceIds: string[], notification: {
    title: string
    body: string
    data?: Record<string, string>
    imageUrl?: string
  }) {
    const fcmTokens = await TokenStoreService.getFcmTokensForDevices(deviceIds)
    
    if (fcmTokens.length === 0) {
      console.log('ℹ️ No FCM tokens found for specified devices')
      return { successCount: 0, failureCount: 0 }
    }

    return this.sendToMultipleDevices(fcmTokens, notification)
  }

  /**
   * Send event-related notifications
   */
  static async sendEventNotification(type: 'new_event' | 'event_update' | 'event_cancelled' | 'event_reminder', eventData: {
    eventId: number
    eventName: string
    eventDate?: string
    message?: string
  }) {
    let title = ''
    let body = ''
    let imageUrl: string | undefined

    switch (type) {
      case 'new_event':
        title = '🎉 Nouvel événement créé'
        body = `L'événement "${eventData.eventName}" a été créé avec succès`
        break
      
      case 'event_update':
        title = '📝 Événement mis à jour'
        body = `L'événement "${eventData.eventName}" a été modifié`
        break
      
      case 'event_cancelled':
        title = '❌ Événement annulé'
        body = `L'événement "${eventData.eventName}" a été annulé`
        break
      
      case 'event_reminder':
        title = '⏰ Rappel d\'événement'
        body = `L'événement "${eventData.eventName}" commence bientôt !`
        break
    }

    if (eventData.message) {
      body += `: ${eventData.message}`
    }

    return this.sendToAllAdmins({
      title,
      body,
      data: {
        type,
        eventId: String(eventData.eventId),
        eventName: eventData.eventName,
      },
      imageUrl,
    })
  }

  /**
   * Send registration notifications
   */
  static async sendRegistrationNotification(type: 'new_registration' | 'registration_cancelled', registrationData: {
    registrationId: number
    userName: string
    eventName: string
    eventId: number
  }) {
    let title = ''
    let body = ''

    switch (type) {
      case 'new_registration':
        title = '👤 Nouvelle inscription'
        body = `${registrationData.userName} s'est inscrit à "${registrationData.eventName}"`
        break
      
      case 'registration_cancelled':
        title = '🚫 Inscription annulée'
        body = `${registrationData.userName} a annulé son inscription à "${registrationData.eventName}"`
        break
    }

    return this.sendToAllAdmins({
      title,
      body,
      data: {
        type,
        registrationId: String(registrationData.registrationId),
        eventId: String(registrationData.eventId),
        eventName: registrationData.eventName,
      },
    })
  }

  /**
   * Send system notifications
   */
  static async sendSystemNotification(notification: {
    title: string
    body: string
    priority?: 'high' | 'normal'
    data?: Record<string, string>
  }) {
    return this.sendToAllAdmins({
      title: notification.title,
      body: notification.body,
      data: {
        type: 'system',
        priority: notification.priority || 'normal',
        ...notification.data,
      },
    })
  }

  /**
   * Send security alert notification
   */
  static async sendSecurityAlert(alert: {
    type: 'suspicious_activity' | 'multiple_failed_attempts' | 'new_device_login'
    deviceId?: string
    deviceName?: string
    details: string
  }) {
    const title = '🔒 Alerte de sécurité'
    const body = alert.details

    return this.sendToAllAdmins({
      title,
      body,
      data: {
        type: 'security_alert',
        alertType: alert.type,
        deviceId: alert.deviceId || 'unknown',
        timestamp: new Date().toISOString(),
      },
    })
  }

  /**
   * Subscribe device to topic
   */
  static async subscribeToTopic(fcmToken: string, topic: string): Promise<boolean> {
    this.initialize()

    try {
      await admin.messaging().subscribeToTopic([fcmToken], topic)
      console.log(`✅ Device subscribed to topic: ${topic}`)
      return true
    } catch (error) {
      console.error(`❌ Failed to subscribe to topic ${topic}:`, error)
      return false
    }
  }

  /**
   * Unsubscribe device from topic
   */
  static async unsubscribeFromTopic(fcmToken: string, topic: string): Promise<boolean> {
    this.initialize()

    try {
      await admin.messaging().unsubscribeFromTopic([fcmToken], topic)
      console.log(`✅ Device unsubscribed from topic: ${topic}`)
      return true
    } catch (error) {
      console.error(`❌ Failed to unsubscribe from topic ${topic}:`, error)
      return false
    }
  }

  /**
   * Send notification to a topic
   */
  static async sendToTopic(topic: string, notification: {
    title: string
    body: string
    data?: Record<string, string>
    imageUrl?: string
  }): Promise<boolean> {
    this.initialize()

    try {
      const message: Message = {
        topic,
        notification: {
          title: notification.title,
          body: notification.body,
          imageUrl: notification.imageUrl,
        },
        data: notification.data,
        apns: {
          payload: {
            aps: {
              sound: 'default',
            },
          },
        },
        android: {
          priority: 'high',
          notification: {
            sound: 'default',
            channelId: 'default',
          },
        },
      }

      const response = await admin.messaging().send(message)
      console.log(`✅ Notification sent to topic ${topic}: ${response}`)
      return true
    } catch (error) {
      console.error(`❌ Failed to send to topic ${topic}:`, error)
      return false
    }
  }
}