// app/services/image_service.ts
import sharp from 'sharp'
import { cuid } from '@adonisjs/core/helpers'
import app from '@adonisjs/core/services/app'
import { MultipartFile } from '@adonisjs/core/bodyparser'
import fs from 'node:fs/promises'

export default class ImageService {
  /**
   * Compress and convert image to WebP
   * @param file - Uploaded file
   * @param folder - Target folder (events, avatars)
   * @param maxWidth - Maximum width in pixels
   * @returns Path to saved file
   */
  static async processAndSave(
    file: MultipartFile,
    folder: 'events' | 'avatars',
    maxWidth: number = 1200
  ): Promise<string> {
    // ✅ Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    if (!file.type || !allowedTypes.includes(file.type)) {
      throw new Error(`Invalid file type. Allowed: ${allowedTypes.join(', ')}`)
    }

    // ✅ Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('File size must be less than 5MB')
    }

    const fileName = `${cuid()}.webp`
    const filePath = `uploads/${folder}/${fileName}`
    const fullPath = app.makePath(`public/${filePath}`)

    // ✅ Ensure directory exists
    const dir = app.makePath(`public/uploads/${folder}`)
    await fs.mkdir(dir, { recursive: true })

    const buffer = await fs.readFile(file.tmpPath!)

    // ✅ Add error handling
    try {
      await sharp(buffer)
        .resize(maxWidth, null, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({
          quality: 85,
          effort: 6,
        })
        .toFile(fullPath)

      return filePath
    } catch (error) {
      console.error('Image processing error:', error)
      throw new Error('Failed to process image')
    }
  }

  /**
   * Process avatar image (optimized for small sizes)
   */
  static async processAvatar(file: MultipartFile): Promise<string> {
    const fileName = `${cuid()}.webp`
    const filePath = `uploads/avatars/${fileName}`
    const fullPath = app.makePath(`public/${filePath}`)

    const buffer = await fs.readFile(file.tmpPath!)

    await sharp(buffer)
      .resize(400, 400, {
        fit: 'cover',
        position: 'center',
      })
      .webp({
        quality: 90,
        effort: 6,
      })
      .toFile(fullPath)

    return filePath
  }

  /**
   * Process event image (optimized for larger displays)
   */
  static async processEventImage(file: MultipartFile): Promise<string> {
    const fileName = `${cuid()}.webp`
    const filePath = `uploads/events/${fileName}`
    const fullPath = app.makePath(`public/${filePath}`)

    const buffer = await fs.readFile(file.tmpPath!)

    await sharp(buffer)
      .resize(1920, 1080, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({
        quality: 85,
        effort: 6,
      })
      .toFile(fullPath)

    return filePath
  }

  /**
   * Delete an image file
   */
  static async deleteImage(filePath: string): Promise<void> {
    const fullPath = app.makePath(`public/${filePath}`)
    try {
      await fs.unlink(fullPath)
    } catch (error) {
      console.error('Error deleting image:', error)
    }
  }
}
