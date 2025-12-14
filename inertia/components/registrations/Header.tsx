// inertia/components/registrations/Header.tsx - ENHANCED VERSION
import { motion } from 'motion/react'
import { TicketIcon } from '@heroicons/react/24/outline'
import { useTheme } from '~/hooks/useTheme'

interface RegistrationHeaderProps {
  title: string
  description: string
}

export default function RegistrationHeader({ title, description }: RegistrationHeaderProps) {
  const { colors } = useTheme()

  return (
    <motion.div
      className="mb-12"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Decorative Header */}
      <div
        className="rounded-2xl p-8 mb-8"
        style={{
          background: `linear-gradient(135deg, ${colors.primary[500]}, ${colors.secondary[500]})`,
        }}
      >
        <div className="flex items-center gap-4 mb-4">
          <div
            className="w-16 h-16 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
          >
            <TicketIcon className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white drop-shadow-lg">{title}</h1>
            <p className="text-white/90 text-lg mt-1">{description}</p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
