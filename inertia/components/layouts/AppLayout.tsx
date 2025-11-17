// inertia/components/layouts/AppLayout.tsx - ENHANCED VERSION
import { motion, useScroll, useTransform } from 'motion/react'
import Header from '~/components/shared/Header'
import Footer from '~/components/shared/Footer'
import FlashMessage from '~/components/shared/FlashMessage'

interface AppLayoutProps {
  children: React.ReactNode
  showHeader?: boolean
  showFooter?: boolean
  containerClass?: string
  layout?: 'default' | 'auth' | 'full'
}

export default function AppLayout({
  children,
  showHeader = true,
  showFooter = true,
  containerClass = 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8',
  layout = 'default',
}: AppLayoutProps) {
  const { scrollYProgress } = useScroll()
  const backgroundColor = useTransform(
    scrollYProgress,
    [0, 0.1],
    ['rgb(250, 250, 250)', 'rgb(255, 255, 255)']
  )

  return (
    <motion.div 
      className="min-h-screen flex flex-col antialiased"
      style={{ backgroundColor }}
    >
      {showHeader && <Header />}
      <FlashMessage />

      <motion.main
        className="flex-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        {layout === 'full' ? (
          <div className="w-full">{children}</div>
        ) : (
          <div className={containerClass}>{children}</div>
        )}
      </motion.main>

      {showFooter && <Footer />}

      {/* Scroll to top button */}
      <ScrollToTop />
    </motion.div>
  )
}

// Scroll to Top Component
function ScrollToTop() {
  const { scrollYProgress } = useScroll()
  const opacity = useTransform(scrollYProgress, [0, 0.1], [0, 1])
  const scale = useTransform(scrollYProgress, [0, 0.1], [0.8, 1])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <motion.button
      className="fixed bottom-8 right-8 w-12 h-12 rounded-full bg-linear-to-br from-primary-500 to-primary-600 text-white shadow-xl flex items-center justify-center z-50 cursor-pointer"
      style={{ opacity, scale }}
      whileHover={{ scale: 1.1, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)' }}
      whileTap={{ scale: 0.9 }}
      onClick={scrollToTop}
      aria-label="Scroll to top"
    >
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 10l7-7m0 0l7 7m-7-7v18"
        />
      </svg>
    </motion.button>
  )
}