import vine from '@vinejs/vine'

export const loginValidator = vine.compile(
  vine.object({
    // Required device information
    deviceId: vine.string().trim().minLength(1).maxLength(255),
    deviceName: vine.string().trim().minLength(1).maxLength(255),
    
    // Optional but recommended device details
    deviceModel: vine.string().trim().maxLength(255).optional(),
    osVersion: vine.string().trim().maxLength(100).optional(),
    appVersion: vine.string().trim().maxLength(50).optional(),
    
    // Optional FCM token for push notifications
    fcmToken: vine.string().trim().minLength(10).maxLength(500).optional(),
  })
)