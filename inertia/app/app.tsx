/// <reference path="../../adonisrc.ts" />
/// <reference path="../../config/inertia.ts" />

import '../css/app.css'
import 'react-easy-crop/react-easy-crop.css'
import { createRoot } from 'react-dom/client'
import { createInertiaApp } from '@inertiajs/react'
import { router } from '@inertiajs/react'
import { useAuthStore } from '~/stores/auth'
import { useAppStore } from '~/stores/app'

const appName = import.meta.env.VITE_APP_NAME || 'EventHub'

createInertiaApp({
  progress: {
    color: '#0ea5e9',
    showSpinner: false,
  },

  title: (title) => `${title} - ${appName}`,

  resolve: (name) => {
    const pages = import.meta.glob('../pages/**/*.tsx', { eager: true })
    return pages[`../pages/${name}.tsx`]
  },

  setup({ el, App, props }) {
    const root = createRoot(el)

    // Initialize stores from page props ONCE
    const authStore = useAuthStore.getState()
    const appStore = useAppStore.getState()

    // Initialize auth from initial page props
    if (props.initialPage.props.auth?.user) {
      console.log('[App Init] Setting user:', props.initialPage.props.auth.user)
      authStore.initializeAuth(props.initialPage.props.auth.user)
    } else {
      console.log('[App Init] No user in props')
      authStore.clearUser()
    }

    // Initialize flash messages
    if (props.initialPage.props.flash) {
      appStore.setFlashMessages(props.initialPage.props.flash)
    }

    // Global router event handlers
    router.on('start', () => {
      appStore.setLoading(true)
    })

    router.on('finish', () => {
      appStore.setLoading(false)
    })

    router.on('success', (event) => {
      const page = event.detail.page
      const authStore = useAuthStore.getState()
      const appStore = useAppStore.getState()

      console.log('[Router Success] Page component:', page.component)
      console.log('[Router Success] Auth props:', page.props.auth)
      console.log('[Router Success] ', page.props)

      // Update auth state - properly check for user
      if (page.props.auth?.user) {
        console.log('[Router Success] Updating user:', page.props.auth.user)
        authStore.setUser(page.props.auth.user)
      } else if (!page.props.auth?.user && authStore.user) {
        // User logged out
        console.log('[Router Success] Clearing user (logged out)')
        authStore.clearUser()
      }

      // Update flash messages
      if (page.props.flash) {
        appStore.setFlashMessages(page.props.flash)
      }

      // Close mobile menu on navigation
      appStore.closeMobileMenu()

      // Scroll to top smoothly (but don't do it on initial load)
      if (page.url !== props.initialPage.url) {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    })

    router.on('error', (event) => {
      console.error('Navigation error:', event)

      const errorDetail = event.detail as any
      const status = errorDetail.status || errorDetail.response?.status
      const authStore = useAuthStore.getState()
      const appStore = useAppStore.getState()

      if (status === 401) {
        authStore.clearUser()
        router.visit('/auth/login')
      } else if (status === 403) {
        appStore.addFlashMessage('error', 'Vous n\'avez pas la permission d\'accéder à cette page.')
      } else if (status === 404) {
        router.visit('/404')
      } else if (status >= 500) {
        appStore.addFlashMessage('error', 'Une erreur serveur est survenue. Veuillez réessayer.')
      }
    })

    root.render(<App {...props} />)
  },
})