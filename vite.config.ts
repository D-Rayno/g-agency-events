import { defineConfig } from 'vite'
import { getDirname } from '@adonisjs/core/helpers'
import inertia from '@adonisjs/inertia/client'
import react from '@vitejs/plugin-react'
import adonisjs from '@adonisjs/vite/client'
import tailwindcss from '@tailwindcss/vite'

const __dirname = getDirname(import.meta.url)

export default defineConfig({
  plugins: [
    inertia({ ssr: { enabled: true, entrypoint: 'inertia/app/ssr.tsx' } }),
    react(),
    adonisjs({ entrypoints: ['inertia/app/app.tsx'], reload: ['resources/views/**/*.edge'] }),
    tailwindcss(),
  ],

  ssr: {
    noExternal: ['react-easy-crop'],
  },

  /**
   * Define aliases for importing modules from
   * your frontend code
   */
  resolve: {
    alias: {
      '~/': `${__dirname}/inertia/`,
      '@/': `${__dirname}/inertia/`,
      '#ui': `${__dirname}/inertia/components/ui`,
      '#ui/*': `${__dirname}/inertia/components/ui/*`,
      '#shared': `${__dirname}/inertia/components/shared`,
      '#shared/*': `${__dirname}/inertia/components/shared/*`,
      '#layouts': `${__dirname}/inertia/components/layouts`,
      '#layouts/*': `${__dirname}/inertia/components/layouts/*`,
      '#hooks': `${__dirname}/inertia/hooks`,
      '#hooks/*': `${__dirname}/inertia/hooks/*`,
      '#services': `${__dirname}/inertia/services`,
      '#services/*': `${__dirname}/inertia/services/*`,
      '#stores': `${__dirname}/inertia/stores`,
      '#stores/*': `${__dirname}/inertia/stores/*`,
      '#lib': `${__dirname}/inertia/lib`,
      '#lib/*': `${__dirname}/inertia/lib/*`,
      '#types': `${__dirname}/inertia/types`,
      '#types/*': `${__dirname}/inertia/types/*`,
    },
  },
})
