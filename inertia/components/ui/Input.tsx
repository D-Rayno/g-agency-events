import { useState, useMemo } from 'react'
import { motion } from 'motion/react'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import { useTheme } from '~/hooks/useTheme'

interface Props {
  value?: string | number
  onChange?: (value: string | number) => void
  onBlur?: () => void
  onFocus?: () => void
  label?: string
  error?: string
  hint?: string
  success?: string
  required?: boolean
  icon?: React.ComponentType<{ className?: string }>
  iconRight?: React.ComponentType<{ className?: string }>
  type?: string
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  autoFocus?: boolean
  variant?: 'default' | 'filled' | 'flushed'
  [key: string]: any
}

export default function Input({
  value = '',
  onChange,
  onBlur,
  onFocus,
  label,
  error,
  hint,
  success,
  required = false,
  icon: Icon,
  iconRight: IconRight,
  type = 'text',
  size = 'md',
  disabled = false,
  autoFocus = false,
  variant = 'default',
  ...rest
}: Props) {
  const { getAnimation } = useTheme()
  const [showPassword, setShowPassword] = useState(false)
  const [isFocused, setIsFocused] = useState(false)

  const inputType = useMemo(() => {
    if (type === 'password') {
      return showPassword ? 'text' : 'password'
    }
    return type
  }, [type, showPassword])

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-5 py-4 text-lg',
  }

  const variantClasses = {
    default: 'border-2 rounded-xl',
    filled: 'border-0 rounded-xl bg-neutral-100',
    flushed: 'border-0 border-b-2 rounded-none px-0',
  }

  const inputClasses = [
    'w-full font-medium transition-all duration-300 placeholder:text-neutral-400 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed',
    sizeClasses[size],
    variantClasses[variant],
    error
      ? 'border-error-400 focus:border-error-500 focus:ring-4 focus:ring-error-500/20 bg-error-50/30 text-error-900'
      : success
        ? 'border-success-400 focus:border-success-500 focus:ring-4 focus:ring-success-500/20 bg-success-50/30 text-success-900'
        : isFocused
          ? 'border-primary-500 ring-4 ring-primary-500/20 bg-white'
          : 'border-neutral-200 hover:border-neutral-300 bg-white',
    Icon ? 'pl-11' : '',
    IconRight || type === 'password' ? 'pr-11' : '',
  ].join(' ')

  const labelAnimation = {
    initial: { opacity: 0, y: -10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: getAnimation('fast') / 1000 },
  }

  const inputAnimation = {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: getAnimation('normal') / 1000, delay: 0.05 },
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e.target.value)
    }
  }

  const handleFocus = () => {
    setIsFocused(true)
    if (onFocus) onFocus()
  }

  const handleBlur = () => {
    setIsFocused(false)
    if (onBlur) onBlur()
  }

  return (
    <div className="space-y-2">
      {label && (
        <motion.label
          {...labelAnimation}
          className={`block text-sm font-semibold text-neutral-800 transition-colors ${isFocused ? 'text-primary-600' : ''}`}
        >
          {label}
          {required && <span className="text-error-500 ml-1">*</span>}
        </motion.label>
      )}

      <motion.div {...inputAnimation} className="relative group">
        {Icon && (
          <motion.div
            className={`absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10 transition-all duration-300 ${
              error
                ? 'text-error-500'
                : success
                  ? 'text-success-500'
                  : isFocused
                    ? 'text-primary-600'
                    : 'text-neutral-400'
            }`}
            animate={{ scale: isFocused ? 1.05 : 1 }}
          >
            <Icon className="w-5 h-5" />
          </motion.div>
        )}

        <input
          value={value}
          type={inputType}
          className={inputClasses}
          disabled={disabled}
          autoFocus={autoFocus}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          {...rest}
        />

        {(IconRight || type === 'password') && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 z-10">
            {type === 'password' && !disabled ? (
              <motion.button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-neutral-400 hover:text-neutral-700 transition-colors p-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  animate={{ rotate: showPassword ? 180 : 0 }}
                  transition={{ duration: getAnimation('fast') / 1000 }}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </motion.div>
              </motion.button>
            ) : (
              IconRight && <IconRight className="w-5 h-5 text-neutral-400" />
            )}
          </div>
        )}
      </motion.div>


      {(error || success || hint) && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: getAnimation('normal') / 1000 }}
        >
          {error ? (
            <p className="text-sm text-error-600 font-medium flex items-center gap-1.5">
              <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                  clipRule="evenodd"
                />
              </svg>
              {error}
            </p>
          ) : success ? (
            <p className="text-sm text-success-600 font-medium flex items-center gap-1.5">
              <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                  clipRule="evenodd"
                />
              </svg>
              {success}
            </p>
          ) : (
            <p className="text-sm text-neutral-500 flex items-center gap-1.5">
              <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
                  clipRule="evenodd"
                />
              </svg>
              {hint}
            </p>
          )}
        </motion.div>
      )}
    </div>
  )
}
