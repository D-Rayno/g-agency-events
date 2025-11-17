// inertia/components/shared/Header.tsx - ENHANCED VERSION
import { useState, useRef, useEffect } from 'react'
import { Link, router, usePage } from '@inertiajs/react'
import {
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  QueueListIcon,
  UserPlusIcon,
  ArrowRightIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline'
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react'
import Button from '~/components/ui/Button'
import Avatar from '~/components/ui/Avatar'
import Logo from '~/components/ui/Logo'
import { useAuthStore } from '~/stores/auth'
import { useTheme } from '~/hooks/useTheme'

export default function Header() {
  const { props } = usePage()
  const { colors, getAnimation } = useTheme()

  // Scroll-based effects
  const { scrollY } = useScroll()
  const headerBackground = useTransform(
    scrollY,
    [0, 50],
    ['rgba(255, 255, 255, 0.8)', 'rgba(255, 255, 255, 0.95)']
  )
  const headerShadow = useTransform(
    scrollY,
    [0, 50],
    ['0 1px 2px 0 rgba(0, 0, 0, 0.05)', '0 10px 15px -3px rgba(0, 0, 0, 0.1)']
  )

  // Get auth state from store
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated())
  const user = useAuthStore((s) => s.user)
  const fullName = useAuthStore((s) => s.fullName())
  const avatarUrl = useAuthStore((s) => s.avatarUrl())

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  const isActive = (name: string): boolean => {
    return (props.component as any)?.startsWith(name) || false
  }

  // Navigation links
  const navLinks: { label: string; href: string; name: string; icon?: typeof SparklesIcon }[] =
    isAuthenticated
      ? [
          { label: 'Événements', href: '/events', name: 'events', icon: SparklesIcon },
          {
            label: 'Mes Inscriptions',
            href: '/registrations',
            name: 'registrations',
            icon: QueueListIcon,
          },
          { label: 'Profil', href: '/profile', name: 'profile', icon: UserCircleIcon },
        ]
      : [
          { label: 'Accueil', href: '/', name: 'home' },
          { label: 'Événements', href: '/events', name: 'events' },
        ]

  const handleLogout = () => {
    router.post(
      '/auth/logout',
      {},
      {
        onSuccess: () => {
          setUserMenuOpen(false)
        },
      }
    )
  }

  // Close user menu on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false)
      }
    }

    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [userMenuOpen])

  // Close mobile menu on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false)
        setUserMenuOpen(false)
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [])

  return (
    <motion.header
      className="sticky top-0 z-50 backdrop-blur-lg border-b"
      style={{
        backgroundColor: headerBackground,
        boxShadow: headerShadow,
        borderBottomColor: `${colors.neutral[200]}CC`,
      }}
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: getAnimation('normal') / 1000, delay: 0.1 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo - Using Logo Component */}
          <Logo
            variant="dark"
            size="md"
            showText={true}
            clickable={true}
            href={isAuthenticated ? '/events' : '/'}
            animate={true}
            width={40}
            height={40}
          />

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            {navLinks.map((link, index) => (
              <motion.div
                key={link.href}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.15 + index * 0.05,
                  duration: getAnimation('normal') / 1000,
                }}
              >
                <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
                  <Link
                    href={link.href}
                    className="relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 group cursor-pointer inline-flex items-center gap-2"
                    style={{
                      backgroundColor: isActive(link.name) ? colors.primary[50] : 'transparent',
                      color: isActive(link.name) ? colors.primary[700] : colors.neutral[700],
                    }}
                  >
                    {link.icon && (
                      <link.icon className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
                    )}
                    <span className="relative z-10">{link.label}</span>
                    {isActive(link.name) && (
                      <motion.div
                        className="absolute inset-0 rounded-xl"
                        style={{
                          background: `linear-gradient(90deg, ${colors.primary[500]}1A, ${colors.secondary[500]}1A)`,
                        }}
                        layoutId="activeTab"
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      />
                    )}
                    {/* Hover glow effect */}
                    <motion.div
                      className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                      style={{
                        background: `radial-gradient(circle at center, ${colors.primary[500]}15, transparent 70%)`,
                      }}
                    />
                  </Link>
                </motion.div>
              </motion.div>
            ))}
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {/* Authenticated User */}
            {isAuthenticated && user ? (
              <div className="hidden md:flex items-center gap-3" ref={userMenuRef}>
                <motion.button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl transition-all group cursor-pointer"
                  style={{
                    backgroundColor: userMenuOpen ? colors.neutral[50] : 'transparent',
                  }}
                  whileHover={{
                    backgroundColor: colors.neutral[50],
                    scale: 1.02,
                  }}
                  whileTap={{ scale: 0.98 }}
                  aria-label="Menu utilisateur"
                  aria-expanded={userMenuOpen}
                >
                  <Avatar name={fullName} src={avatarUrl || undefined} size="sm" />
                  <div className="hidden lg:block text-left">
                    <div
                      className="text-sm font-medium transition-colors"
                      style={{
                        color: userMenuOpen ? colors.primary[600] : colors.neutral[900],
                      }}
                    >
                      {user.firstName}
                    </div>
                    <div className="text-xs" style={{ color: colors.neutral[500] }}>
                      Mon compte
                    </div>
                  </div>
                  <motion.div
                    animate={{ rotate: userMenuOpen ? 180 : 0 }}
                    transition={{ duration: getAnimation('fast') / 1000 }}
                  >
                    <ChevronDownIcon
                      className="w-4 h-4"
                      style={{
                        color: userMenuOpen ? colors.primary[600] : colors.neutral[600],
                      }}
                    />
                  </motion.div>
                </motion.button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {userMenuOpen && (
                    <>
                      {/* Backdrop */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm"
                        style={{ top: '64px' }}
                        onClick={() => setUserMenuOpen(false)}
                      />

                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        transition={{ duration: getAnimation('fast') / 1000 }}
                        className="absolute right-0 top-16 w-64 bg-white rounded-2xl shadow-2xl border overflow-hidden"
                        style={{ borderColor: colors.neutral[200] }}
                      >
                        {/* User Info Header */}
                        <div
                          className="px-4 py-4 border-b"
                          style={{
                            borderColor: colors.neutral[100],
                            background: `linear-gradient(135deg, ${colors.primary[50]}, ${colors.secondary[50]})`,
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <Avatar name={fullName} src={avatarUrl || undefined} size="md" ring />
                            <div className="flex-1 min-w-0">
                              <p
                                className="text-sm font-semibold truncate"
                                style={{ color: colors.neutral[900] }}
                              >
                                {fullName}
                              </p>
                              <p
                                className="text-xs truncate"
                                style={{ color: colors.neutral[600] }}
                              >
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Menu Items */}
                        <div className="py-2">
                          <motion.div whileHover={{ x: 5 }}>
                            <Link
                              href="/profile"
                              className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm transition-colors cursor-pointer"
                              style={{ color: colors.neutral[700] }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = colors.primary[50]
                                e.currentTarget.style.color = colors.primary[700]
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent'
                                e.currentTarget.style.color = colors.neutral[700]
                              }}
                              onClick={() => setUserMenuOpen(false)}
                            >
                              <UserCircleIcon className="w-5 h-5" />
                              <span>Mon profil</span>
                            </Link>
                          </motion.div>

                          <motion.div whileHover={{ x: 5 }}>
                            <Link
                              href="/registrations"
                              className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm transition-colors cursor-pointer"
                              style={{ color: colors.neutral[700] }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = colors.primary[50]
                                e.currentTarget.style.color = colors.primary[700]
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent'
                                e.currentTarget.style.color = colors.neutral[700]
                              }}
                              onClick={() => setUserMenuOpen(false)}
                            >
                              <QueueListIcon className="w-5 h-5" />
                              <span>Mes inscriptions</span>
                            </Link>
                          </motion.div>
                        </div>

                        {/* Logout */}
                        <div className="border-t" style={{ borderColor: colors.neutral[100] }}>
                          <motion.div whileHover={{ x: 5 }}>
                            <button
                              onClick={handleLogout}
                              className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm transition-colors cursor-pointer"
                              style={{ color: colors.error[600] }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = colors.error[50]
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent'
                              }}
                            >
                              <ArrowRightOnRectangleIcon className="w-5 h-5" />
                              <span>Déconnexion</span>
                            </button>
                          </motion.div>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              // Guest User Buttons - Using Button component with href
              <motion.div
                className="flex items-center gap-2"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Button
                  href="/auth/login"
                  variant="ghost"
                  size="sm"
                  className="hidden sm:inline-flex cursor-pointer"
                  flipOnHover
                  flipDirection="bottom"
                  flipBackText="Bienvenue ! 👋"
                >
                  Connexion
                </Button>
                <Button
                  href="/auth/register"
                  variant="gradient"
                  size="sm"
                  iconLeft={UserPlusIcon}
                  flipOnHover
                  flipDirection="top"
                  flipBackText="Rejoignez-nous"
                  shadow="lg"
                  className="cursor-pointer"
                >
                  S'inscrire
                </Button>
              </motion.div>
            )}

            {/* Mobile Menu Button */}
            <motion.button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl transition-colors cursor-pointer"
              style={{
                backgroundColor: mobileMenuOpen ? colors.neutral[100] : 'transparent',
              }}
              whileHover={{
                backgroundColor: colors.neutral[100],
                scale: 1.05,
              }}
              whileTap={{ scale: 0.95 }}
              aria-label="Menu de navigation"
            >
              <AnimatePresence mode="wait">
                {mobileMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: getAnimation('fast') / 1000 }}
                  >
                    <XMarkIcon className="w-6 h-6" style={{ color: colors.neutral[700] }} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="open"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: getAnimation('fast') / 1000 }}
                  >
                    <Bars3Icon className="w-6 h-6" style={{ color: colors.neutral[700] }} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: getAnimation('normal') / 1000 }}
              className="md:hidden border-t py-4 space-y-2 bg-white/95 backdrop-blur-lg overflow-hidden"
              style={{ borderColor: colors.neutral[200] }}
            >
              {navLinks.map((link, index) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ x: 5 }}
                >
                  <Link
                    href={link.href}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer"
                    style={{
                      backgroundColor: isActive(link.name) ? colors.primary[50] : 'transparent',
                      color: isActive(link.name) ? colors.primary[700] : colors.neutral[700],
                    }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.icon && <link.icon className="w-5 h-5" />}
                    <span>{link.label}</span>
                  </Link>
                </motion.div>
              ))}

              {!isAuthenticated && (
                <motion.div
                  className="pt-2 border-t space-y-2 mt-4"
                  style={{ borderColor: colors.neutral[200] }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <Button
                    href="/auth/login"
                    variant="ghost"
                    size="md"
                    fullWidth
                    onClick={() => setMobileMenuOpen(false)}
                    flipOnHover
                    flipDirection="right"
                    flipBackText="Connectez-vous ✨"
                    className="cursor-pointer"
                  >
                    Connexion
                  </Button>
                  <Button
                    href="/auth/register"
                    variant="gradient"
                    size="md"
                    fullWidth
                    iconRight={ArrowRightIcon}
                    onClick={() => setMobileMenuOpen(false)}
                    flipOnHover
                    flipDirection="left"
                    flipBackText="Commencez ici 🎉"
                    shadow="lg"
                    className="cursor-pointer"
                  >
                    S'inscrire
                  </Button>
                </motion.div>
              )}

              {isAuthenticated && (
                <motion.div
                  className="pt-2 border-t mt-4"
                  style={{ borderColor: colors.neutral[200] }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <Button
                    variant="danger"
                    size="md"
                    fullWidth
                    iconLeft={ArrowRightOnRectangleIcon}
                    onClick={() => {
                      setMobileMenuOpen(false)
                      handleLogout()
                    }}
                    className="cursor-pointer"
                  >
                    Déconnexion
                  </Button>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  )
}