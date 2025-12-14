// inertia/components/ui/Alert.tsx
import { motion } from 'motion/react'
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { useTheme } from '~/hooks/useTheme'

interface AlertProps {
  type?: 'success' | 'error' | 'warning' | 'info'
  title?: string
  dismissible?: boolean
  variant?: 'default' | 'left-accent' | 'top-accent' | 'solid'
  onDismiss?: () => void
  children: React.ReactNode
}

const config = {
  success: {
    icon: CheckCircleIcon,
    default: 'bg-success-50 border-success-200 text-success-800',
    solid: 'bg-success-600 text-white',
    accent: 'border-l-4 border-success-600 bg-success-50',
    iconColor: 'text-success-600',
  },
  error: {
    icon: XCircleIcon,
    default: 'bg-error-50 border-error-200 text-error-800',
    solid: 'bg-error-600 text-white',
    accent: 'border-l-4 border-error-600 bg-error-50',
    iconColor: 'text-error-600',
  },
  warning: {
    icon: ExclamationTriangleIcon,
    default: 'bg-warning-50 border-warning-200 text-warning-800',
    solid: 'bg-warning-600 text-white',
    accent: 'border-l-4 border-warning-600 bg-warning-50',
    iconColor: 'text-warning-600',
  },
  info: {
    icon: InformationCircleIcon,
    default: 'bg-info-50 border-info-200 text-info-800',
    solid: 'bg-info-600 text-white',
    accent: 'border-l-4 border-info-600 bg-info-50',
    iconColor: 'text-info-600',
  },
}

export default function Alert({
  type = 'info',
  title,
  dismissible = false,
  variant = 'default',
  onDismiss,
  children,
}: AlertProps) {
  const { getAnimation } = useTheme()
  const alertConfig = config[type]
  const Icon = alertConfig.icon

  const alertClasses = [
    'border rounded-xl p-4 flex gap-3',
    variant === 'solid'
      ? alertConfig.solid
      : variant === 'left-accent'
        ? alertConfig.accent
        : alertConfig.default,
  ].join(' ')

  const iconClasses = variant === 'solid' ? 'text-white' : alertConfig.iconColor

  return (
    <motion.div
      className={alertClasses}
      role="alert"
      initial={{ opacity: 0, x: -50, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 50, scale: 0.95 }}
      transition={{ duration: getAnimation('normal') / 1000, type: 'spring', stiffness: 200 }}
    >
      <div>
        <Icon className={`w-6 h-6 shrink-0 ${iconClasses}`} />
      </div>


      <div className="flex-1 min-w-0">
        {title && <h3 className="font-semibold mb-1">{title}</h3>}
        <div className="text-sm">{children}</div>
      </div>

      {dismissible && (
        <motion.button
          onClick={onDismiss}
          className={`shrink-0 transition-colors rounded-lg p-1 ${
            variant === 'solid' ? 'hover:bg-white/20' : 'hover:bg-black/5'
          }`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Fermer"
        >
          <XMarkIcon className="w-5 h-5" />
        </motion.button>
      )}
    </motion.div>
  )
}
