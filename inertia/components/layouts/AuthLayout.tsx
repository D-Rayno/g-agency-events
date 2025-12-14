// inertia/components/layouts/AuthLayout.tsx - ENHANCED VERSION
import { usePage } from '@inertiajs/react'
import { motion } from 'motion/react'
import { useState } from 'react'
import Alert from '~/components/ui/Alert'
import Logo from '~/components/ui/Logo'
import { useTheme } from '~/hooks/useTheme'

interface FlashMessages {
  success?: string
  error?: string
  info?: string
  warning?: string
}

interface AuthLayoutProps {
  children: React.ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  const { props } = usePage()
  const { config, colors } = useTheme()
  const [dismissedFlash, setDismissedFlash] = useState<Set<string>>(new Set())

  const flash = props.flash as FlashMessages | undefined

  const visibleFlash = flash
    ? Object.entries(flash).filter(([key, value]) => value && !dismissedFlash.has(key))
    : []

  const dismissFlash = (type: string) => {
    setDismissedFlash((prev) => new Set([...prev, type]))
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-primary-50 via-white to-primary-100 flex flex-col relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Main gradient blobs */}
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl"
          style={{ background: `${colors.primary[200]}50` }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full blur-3xl"
          style={{ background: `${colors.secondary[200]}50` }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }}
        />

        {/* Floating animated circles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-32 h-32 rounded-full border-2 opacity-10"
            style={{
              borderColor: i % 2 === 0 ? colors.primary[300] : colors.secondary[300],
              left: `${10 + i * 15}%`,
              top: `${20 + (i % 3) * 25}%`,
            }}
            animate={{
              y: [0, -30, 0],
              scale: [1, 1.1, 1],
              opacity: [0.05, 0.15, 0.05],
            }}
            transition={{
              duration: 4 + i,
              repeat: Infinity,
              delay: i * 0.5,
            }}
          />
        ))}

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `linear-gradient(${colors.primary[400]} 1px, transparent 1px), linear-gradient(90deg, ${colors.primary[400]} 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      {/* Header with Logo */}
      <motion.header
        className="relative py-6 px-4 z-10"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="max-w-7xl mx-auto">
          <Logo
            variant="dark"
            size="md"
            showText={true}
            clickable={true}
            href="/"
            animate={false}
            width={40}
            height={40}
          />
        </div>
      </motion.header>

      {/* Flash Messages */}
      {visibleFlash.length > 0 && (
        <div className="relative px-4 pb-4 z-10">
          <div className="max-w-md mx-auto space-y-2">
            {visibleFlash.map(([type, message]) => (
              <Alert key={type} type={type as any} dismissible onDismiss={() => dismissFlash(type)}>
                {message}
              </Alert>
            ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="relative flex-1 flex items-center justify-center px-4 py-8 z-10">
        {children}
      </main>

      {/* Footer */}
      <motion.footer
        className="relative py-6 text-center text-sm text-neutral-600 z-10"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <p>
          &copy; {new Date().getFullYear()} {config.branding.logo.text}. Tous droits réservés.
        </p>
      </motion.footer>
    </div>
  )
}
