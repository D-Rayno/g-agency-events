// inertia/components/ui/Button.tsx
import { Link } from '@inertiajs/react'
import { motion, type Transition, type Variant } from 'motion/react'
import { useTheme } from '~/hooks/useTheme'
import { useState } from 'react'
import type { InertiaLinkProps } from '@inertiajs/react'

type FlipDirection = 'top' | 'bottom' | 'left' | 'right'

interface BaseButtonProps {
  variant?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info' | 'neutral' | 'ghost' | 'outline' | 'gradient' | 'danger'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  rounded?: 'sm' | 'md' | 'lg' | 'full'
  fullWidth?: boolean
  disabled?: boolean
  loading?: boolean
  iconLeft?: React.ComponentType<{ className?: string }>
  iconRight?: React.ComponentType<{ className?: string }>
  children: React.ReactNode
  className?: string
  bgColor?: string // Custom background color (e.g., 'primary.500', '#ff0000')
  textColor?: string // Custom text color (optional, auto-calculated if not provided)
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  pulse?: boolean
  
  // Flip animation props
  flipOnHover?: boolean
  flipDirection?: FlipDirection
  flipBackText?: string
}

type ButtonAsButton = BaseButtonProps & {
  as?: 'button'
  href?: never
  type?: 'button' | 'submit' | 'reset'
  onClick?: () => void
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseButtonProps | 'type' | 'onClick'>

type ButtonAsLink = BaseButtonProps & {
  as?: 'link'
  href: string
  type?: never
  onClick?: () => void
} & Omit<InertiaLinkProps, keyof BaseButtonProps | 'href'>

type ButtonProps = ButtonAsButton | ButtonAsLink

// Utility to calculate relative luminance
function getLuminance(hex: string): number {
  const rgb = hex.replace('#', '').match(/.{2}/g)?.map(x => parseInt(x, 16)) || [0, 0, 0]
  const [r, g, b] = rgb.map(val => {
    const v = val / 255
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

// Calculate contrast ratio between two colors
function getContrastRatio(color1: string, color2: string): number {
  const lum1 = getLuminance(color1)
  const lum2 = getLuminance(color2)
  const lighter = Math.max(lum1, lum2)
  const darker = Math.min(lum1, lum2)
  return (lighter + 0.05) / (darker + 0.05)
}

// Get best contrasting text color
function getContrastingTextColor(bgColor: string): string {
  const whiteContrast = getContrastRatio(bgColor, '#ffffff')
  const blackContrast = getContrastRatio(bgColor, '#000000')
  return whiteContrast > blackContrast ? '#ffffff' : '#000000'
}

const baseClasses =
  'inline-flex cursor-pointer items-center justify-center font-semibold transition-colors focus:outline-none focus:ring-4 disabled:opacity-50 disabled:cursor-not-allowed relative'

export default function Button(props: ButtonProps) {
  const { getAnimation, getColor, colors } = useTheme()
  const [isHovered, setIsHovered] = useState(false)
  
  const {
    variant = 'primary',
    size = 'md',
    rounded = 'lg',
    fullWidth = false,
    disabled = false,
    loading = false,
    iconLeft: IconLeft,
    iconRight: IconRight,
    children,
    className = '',
    bgColor,
    textColor,
    shadow = 'md',
    pulse = false,
    flipOnHover = false,
    flipDirection = 'top',
    flipBackText,
    as,
    href,
    type = 'button',
    onClick,
    ...restProps
  } = props

  const isDisabled = disabled || loading
  const isLink = href !== undefined

  // Get theme colors dynamically
  const getVariantColors = () => {
    const colorMap = {
      primary: colors.primary,
      secondary: colors.secondary,
      success: colors.success,
      error: colors.error,
      warning: colors.warning,
      info: colors.info,
      neutral: colors.neutral,
    }
    return (
      colorMap[
        variant === 'danger'
          ? 'error'
          : variant === 'gradient'
            ? 'primary'
            : (variant as keyof typeof colorMap)
      ] || colors.primary
    )
  }

  const variantColors = getVariantColors()

  // Get background and text colors for custom colors
  const getCustomColors = () => {
    if (bgColor) {
      const bg = bgColor.includes('.') ? getColor(bgColor) : bgColor
      const text = textColor 
        ? (textColor.includes('.') ? getColor(textColor) : textColor)
        : getContrastingTextColor(bg)
      return { bg, text }
    }
    return null
  }

  const customColors = getCustomColors()

  // Build variant styles with theme colors
  const getVariantStyle = (isBack = false) => {
    if (customColors) {
      return {
        background: customColors.bg,
        color: customColors.text,
      }
    }

    if (isBack) {
      // Back side - more vibrant
      const backStyles = {
        primary: {
          background: `linear-gradient(to bottom right, ${variantColors[400]}, ${variantColors[600]})`,
          color: '#ffffff',
        },
        secondary: {
          background: `linear-gradient(to bottom right, ${colors.secondary[400]}, ${colors.secondary[600]})`,
          color: '#ffffff',
        },
        outline: {
          background: `linear-gradient(to bottom right, ${variantColors[500]}, ${variantColors[700]})`,
          color: '#ffffff',
        },
        ghost: {
          background: `linear-gradient(to bottom right, ${colors.neutral[600]}, ${colors.neutral[800]})`,
          color: '#ffffff',
        },
        danger: {
          background: `linear-gradient(to bottom right, ${colors.error[400]}, ${colors.error[600]})`,
          color: '#ffffff',
        },
        error: {
          background: `linear-gradient(to bottom right, ${colors.error[400]}, ${colors.error[600]})`,
          color: '#ffffff',
        },
        success: {
          background: `linear-gradient(to bottom right, ${colors.success[400]}, ${colors.success[600]})`,
          color: '#ffffff',
        },
        warning: {
          background: `linear-gradient(to bottom right, ${colors.warning[400]}, ${colors.warning[600]})`,
          color: '#ffffff',
        },
        info: {
          background: `linear-gradient(to bottom right, ${colors.info[400]}, ${colors.info[600]})`,
          color: '#ffffff',
        },
        neutral: {
          background: `linear-gradient(to bottom right, ${colors.neutral[400]}, ${colors.neutral[600]})`,
          color: '#ffffff',
        },
        gradient: {
          background: `linear-gradient(to right, ${colors.secondary[500]}, ${colors.primary[500]}, ${colors.secondary[500]})`,
          color: '#ffffff',
        },
      }
      return backStyles[variant]
    }

    // Front side
    const frontStyles = {
      primary: {
        background: `linear-gradient(to bottom right, ${variantColors[500]}, ${variantColors[600]}, ${variantColors[700]})`,
        color: '#ffffff',
      },
      secondary: {
        background: `linear-gradient(to bottom right, ${colors.secondary[500]}, ${colors.secondary[600]}, ${colors.secondary[700]})`,
        color: '#ffffff',
      },
      outline: {
        background: 'transparent',
        color: colors.neutral[800],
        border: `2px solid ${colors.neutral[800]}`,
      },
      ghost: {
        background: 'transparent',
        color: colors.neutral[300],
      },
      danger: {
        background: `linear-gradient(to bottom right, ${colors.error[500]}, ${colors.error[600]}, ${colors.error[700]})`,
        color: '#ffffff',
      },
      error: {
        background: `linear-gradient(to bottom right, ${colors.error[500]}, ${colors.error[600]}, ${colors.error[700]})`,
        color: '#ffffff',
      },
      success: {
        background: `linear-gradient(to bottom right, ${colors.success[500]}, ${colors.success[600]}, ${colors.success[700]})`,
        color: '#ffffff',
      },
      warning: {
        background: `linear-gradient(to bottom right, ${colors.warning[500]}, ${colors.warning[600]}, ${colors.warning[700]})`,
        color: '#ffffff',
      },
      info: {
        background: `linear-gradient(to bottom right, ${colors.info[500]}, ${colors.info[600]}, ${colors.info[700]})`,
        color: '#ffffff',
      },
      neutral: {
        background: `linear-gradient(to bottom right, ${colors.neutral[500]}, ${colors.neutral[600]}, ${colors.neutral[700]})`,
        color: '#ffffff',
      },
      gradient: {
        background: `linear-gradient(to right, ${colors.primary[600]}, ${colors.secondary[500]}, ${colors.primary[600]})`,
        color: '#ffffff',
      },
    }
    return frontStyles[variant]
  }

  const sizeClasses = {
    xs: 'h-8 px-3 py-1.5 text-xs gap-1.5',
    sm: 'h-9 px-4 py-2 text-sm gap-2',
    md: 'h-10 px-5 py-2.5 text-base gap-2',
    lg: 'h-12 px-6 py-3 text-lg gap-2.5',
    xl: 'h-14 px-8 py-4 text-xl gap-3',
  }

  const roundedClasses = {
    sm: 'rounded-md',
    md: 'rounded-lg',
    lg: 'rounded-xl',
    full: 'rounded-full',
  }

  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
  }

  const iconSizes = {
    xs: 'w-3.5 h-3.5',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-7 h-7',
  }

  const buttonClasses = [
    baseClasses,
    roundedClasses[rounded],
    fullWidth ? 'w-full' : '',
    pulse ? 'animate-pulse' : '',
    !flipOnHover && shadowClasses[shadow],
    className,
  ].filter(Boolean).join(' ')

  const contentClasses = [
    'relative z-10 flex items-center justify-center',
    sizeClasses[size],
  ].join(' ')

  // Flip animation configuration
  const isVertical = flipDirection === 'top' || flipDirection === 'bottom'
  const rotateAxis = isVertical ? 'rotateX' : 'rotateY'
  const frontOffset = flipDirection === 'top' || flipDirection === 'left' ? '50%' : '-50%'
  const backOffset = flipDirection === 'top' || flipDirection === 'left' ? '-50%' : '50%'

  const flipTransition: Transition = {
    type: 'spring',
    stiffness: 280,
    damping: 20,
    duration: getAnimation('normal') / 1000,
  }

  const buildVariant = (
    opacity: number,
    rotation: number,
    offset: string | null = null
  ): Variant => ({
    opacity,
    [rotateAxis]: rotation,
    ...(isVertical && offset !== null ? { y: offset } : {}),
    ...(!isVertical && offset !== null ? { x: offset } : {}),
  })

  const frontVariants = {
    initial: buildVariant(1, 0, '0%'),
    hover: buildVariant(0, 90, frontOffset),
  }

  const backVariants = {
    initial: buildVariant(0, 90, backOffset),
    hover: buildVariant(1, 0, '0%'),
  }

  // Standard content without flip
  const standardContent = (
    <div className={contentClasses}>
      {/* Shimmer Effect */}
      {!loading && !disabled && !flipOnHover && (
        <motion.span
          className="absolute inset-0 rounded-[inherit] overflow-hidden pointer-events-none"
          style={{ 
            background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.3), transparent)',
            transform: 'translateX(-100%)',
          }}
          animate={isHovered ? { x: ['0%', '200%'] } : {}}
          transition={{
            duration: 0.8,
            repeat: isHovered ? 1 : 0,
            repeatDelay: 1,
          }}
        />
      )}


      {/* Loading State */}
      {loading ? (
        <span className="inline-flex items-center gap-2 relative z-10">
          <motion.svg
            className={iconSizes[size]}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </motion.svg>
          <span>Loading...</span>
        </span>
      ) : (
        <span className="inline-flex items-center gap-2 relative z-10">
          {IconLeft && <IconLeft className={iconSizes[size]} />}
          {children}
          {IconRight && <IconRight className={iconSizes[size]} />}
        </span>
      )}
    </div>
  )

  // Flip content
  const flipContent = (
    <div className={contentClasses} style={{ perspective: '1000px' }}>
      {/* Front Side */}
      <motion.span
        variants={frontVariants}
        transition={flipTransition}
        className={`absolute inset-0 flex items-center justify-center gap-2 ${roundedClasses[rounded]} ${shadowClasses[shadow]}`}
        style={{
          ...getVariantStyle(false),
          margin: 0,
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
        }}
      >
        <span className="inline-flex items-center gap-2">
          {IconLeft && <IconLeft className={iconSizes[size]} />}
          {children}
          {IconRight && <IconRight className={iconSizes[size]} />}
        </span>
      </motion.span>

      {/* Back Side */}
      <motion.span
        variants={backVariants}
        transition={flipTransition}
        className={`absolute inset-0 flex items-center justify-center gap-2 ${roundedClasses[rounded]} ${shadowClasses[shadow]}`}
        style={{
          ...getVariantStyle(true),
          margin: 0,
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
        }}
      >
        <span className="inline-flex items-center text-center gap-2">
          {flipBackText || children}
        </span>
      </motion.span>

      {/* Invisible spacer to maintain size */}
      <span className="invisible inline-flex items-center gap-2">
        {IconLeft && <IconLeft className={iconSizes[size]} />}
        {children}
        {IconRight && <IconRight className={iconSizes[size]} />}
      </span>
    </div>
  )

  const motionProps = {
    initial: 'initial',
    whileHover: isDisabled ? undefined : 'hover',
    whileTap: isDisabled ? undefined : { scale: 0.95 },
    onHoverStart: () => setIsHovered(true),
    onHoverEnd: () => setIsHovered(false),
  }

  const containerStyle = !flipOnHover ? getVariantStyle(false) : {}

  const containerClass = flipOnHover
    ? buttonClasses
    : buttonClasses

  if (isLink) {
    return (
      <Link 
        href={href!} 
        className={`${containerClass} overflow-hidden`}
        style={containerStyle}
        {...(restProps as any)}
      >
        <motion.div
          {...motionProps}
          className="w-full h-full"
          onClick={onClick}
        >
          {flipOnHover ? flipContent : standardContent}
        </motion.div>
      </Link>
    )
  }

  return (
    <motion.button
      type={type}
      disabled={isDisabled}
      onClick={onClick}
      className={`${containerClass} overflow-hidden`}
      style={containerStyle}
      {...motionProps}
      {...(restProps as any)}
    >
      {flipOnHover ? flipContent : standardContent}
    </motion.button>
  )
}

// Export type for external use
export type { ButtonProps }