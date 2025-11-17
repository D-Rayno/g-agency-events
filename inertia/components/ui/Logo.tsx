// inertia/components/ui/Logo.tsx
import { Link } from '@inertiajs/react'
import { motion, Variant } from 'motion/react'
import { useTheme } from '~/hooks/useTheme'
import { useMemo } from 'react'

interface LogoProps {
  /**
   * Logo variant to display
   * - 'default': Uses the base icon name from config
   * - 'dark': Adds '-dark' suffix (for light backgrounds)
   * - 'light': Adds '-light' suffix (for dark backgrounds)
   */
  variant?: 'default' | 'dark' | 'light'
  
  /**
   * Size of the logo
   */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  
  /**
   * Whether to show the text alongside the logo
   */
  showText?: boolean
  
  /**
   * Custom text to display (overrides config text)
   */
  text?: string
  
  /**
   * Whether the logo should be clickable and link to home
   */
  clickable?: boolean
  
  /**
   * Custom URL to link to (overrides config URL)
   */
  href?: string
  
  /**
   * Additional CSS classes
   */
  className?: string
  
  /**
   * Whether to animate the logo on hover
   */
  animate?: boolean
  
  /**
   * Custom width for the logo (overrides size)
   */
  width?: number | string
  
  /**
   * Custom height for the logo (overrides size)
   */
  height?: number | string
}

const Logo = ({
  variant = 'default',
  size = 'md',
  showText = true,
  text,
  clickable = true,
  href,
  className = '',
  animate = true,
  width,
  height,
}: LogoProps) => {
  const { logo } = useTheme()

  // Build the logo path based on variant
  const logoPath = useMemo(() => {
    const baseIcon = logo.icon
    let suffix = ''
    
    if (variant === 'dark') {
      suffix = '-dark'
    } else if (variant === 'light') {
      suffix = '-light'
    }
    
    return `/logo/${baseIcon}${suffix}.svg`
  }, [logo.icon, variant])

  // Size configurations
  const sizeConfig = {
    xs: {
      logo: width || height || 24,
      text: 'text-sm',
      gap: 'gap-1.5',
    },
    sm: {
      logo: width || height || 32,
      text: 'text-base',
      gap: 'gap-2',
    },
    md: {
      logo: width || height || 40,
      text: 'text-lg',
      gap: 'gap-2.5',
    },
    lg: {
      logo: width || height || 48,
      text: 'text-xl',
      gap: 'gap-3',
    },
    xl: {
      logo: width || height || 56,
      text: 'text-2xl',
      gap: 'gap-3.5',
    },
    '2xl': {
      logo: width || height || 64,
      text: 'text-3xl',
      gap: 'gap-4',
    },
  }

  const config = sizeConfig[size]
  const logoWidth = width || config.logo
  const logoHeight = height || config.logo
  const displayText = text || logo.text
  const linkUrl = href || logo.url

  // Animation variants - Fixed: variants should only contain animation properties
  const logoVariants = {
    initial: { 
      scale: 1, 
      rotate: 0 
    } as Variant,
    hover: {
      scale: 1.05,
      rotate: [0, -5, 5, 0],
    } as Variant,
    tap: { 
      scale: 0.95 
    } as Variant,
  }

  const textVariants = {
    initial: { 
      opacity: 1 
    } as Variant,
    hover: {
      opacity: 0.8,
    } as Variant,
  }

  // Logo content
  const logoContent = (
    <div className={`inline-flex items-center ${config.gap} ${className}`}>
      {/* Logo Image */}
      <motion.div
        variants={animate ? logoVariants : undefined}
        initial="initial"
        whileHover={animate && clickable ? 'hover' : undefined}
        whileTap={animate && clickable ? 'tap' : undefined}
        transition={{
          duration: 0.5,
          ease: 'easeInOut',
        }}
        className="shrink-0"
      >
        <img
          src={logoPath}
          alt={displayText}
          width={logoWidth}
          height={logoHeight}
          className="object-contain"
          style={{
            width: typeof logoWidth === 'number' ? `${logoWidth}px` : logoWidth,
            height: typeof logoHeight === 'number' ? `${logoHeight}px` : logoHeight,
          }}
        />
      </motion.div>

      {/* Logo Text */}
      {showText && (
        <motion.span
          variants={animate ? textVariants : undefined}
          transition={{ duration: 0.3 }}
          className={`font-bold ${config.text} whitespace-nowrap`}
        >
          {displayText}
        </motion.span>
      )}
    </div>
  )

  // Return as link or plain div
  if (clickable) {
    return (
      <Link
        href={linkUrl}
        className="inline-flex items-center focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-lg transition-all"
      >
        {logoContent}
      </Link>
    )
  }

  return <div className="inline-flex items-center">{logoContent}</div>
}

export default Logo

// Export type for external use
export type { LogoProps }