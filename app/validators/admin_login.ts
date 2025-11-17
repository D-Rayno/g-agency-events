// app/validators/admin_login.ts
import vine from '@vinejs/vine'

export const loginValidator = vine.compile(
    vine.object({
        token: vine.string().trim().minLength(32),
        deviceId: vine.string().trim().minLength(1).maxLength(255).optional(),
        deviceName: vine.string().trim().minLength(1).maxLength(255).optional(),
        deviceInfo: vine.object({
            os: vine.string().optional(),
            version: vine.string().optional(),
            model: vine.string().optional(),
        }).optional(),
    })
)