// config/inertia.ts - FIXED
import { defineConfig } from '@adonisjs/inertia'
import type { InferSharedProps } from '@adonisjs/inertia/types'
import env from '#start/env'

const inertiaConfig = defineConfig({
  /**
   * Path to the Edge view that will be used as the root view for Inertia responses
   */
  rootView: 'inertia_layout',


  /**
   * Data that should be shared with all rendered pages
   */
  sharedData: {
    // Share flash messages
    flash: (ctx) => ctx.session.flashMessages.all(),

    // Errors are automatically shared by Inertia
    errors: (ctx) => ctx.session.flashMessages.get('errors'),
    APP_URL: env.get('APP_URL') || '',
  },

  /**
   * Options for the server-side rendering
   */
  ssr: {
    enabled: true,
    entrypoint: 'inertia/app/ssr.tsx',
  },
})

export default inertiaConfig

declare module '@adonisjs/inertia/types' {
  export interface SharedProps extends InferSharedProps<typeof inertiaConfig> {
    auth?: {
      user?: {
        id: number
        firstName: string
        lastName: string
        email: string
        age: number
        province: string
        commune: string
        phoneNumber?: string
        avatarUrl?: string
        isEmailVerified: boolean
        isAdmin: boolean
      } | null
    }
    flash?: {
      success?: string
      error?: string
      warning?: string
      info?: string
    }
    errors?: Record<string, string>
  }
}
