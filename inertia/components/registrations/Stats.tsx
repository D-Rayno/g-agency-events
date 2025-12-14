// inertia/components/registrations/Stats.tsx - ENHANCED VERSION
import { motion } from 'motion/react'
import { CheckCircleIcon, ClockIcon, TicketIcon } from '@heroicons/react/24/outline'
import Card from '~/components/ui/Card'
import { useTheme } from '~/hooks/useTheme'

interface RegistrationStatsProps {
  activeCount: number
  pastCount: number
  totalCount: number
}

export default function RegistrationStats({
  activeCount,
  pastCount,
  totalCount,
}: RegistrationStatsProps) {
  const { colors } = useTheme()

  const stats = [
    {
      icon: ClockIcon,
      value: activeCount,
      label: 'Inscriptions actives',
      gradient: `linear-gradient(135deg, ${colors.primary[500]}, ${colors.primary[600]})`,
      bgColor: colors.primary[50],
      iconBg: colors.primary[100],
    },
    {
      icon: CheckCircleIcon,
      value: pastCount,
      label: 'Événements assistés',
      gradient: `linear-gradient(135deg, ${colors.success[500]}, ${colors.success[600]})`,
      bgColor: colors.success[50],
      iconBg: colors.success[100],
    },
    {
      icon: TicketIcon,
      value: totalCount,
      label: "Total d'inscriptions",
      gradient: `linear-gradient(135deg, ${colors.secondary[500]}, ${colors.secondary[600]})`,
      bgColor: colors.secondary[50],
      iconBg: colors.secondary[100],
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 + index * 0.1, type: 'spring' }}
        >
          <Card className="overflow-hidden" hoverable>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center shadow-lg"
                  style={{ background: stat.gradient }}
                >
                  <stat.icon className="w-7 h-7 text-white" />
                </div>
                <motion.div
                  className="text-5xl font-bold"
                  style={{
                    background: stat.gradient,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3 + index * 0.1, type: 'spring', stiffness: 200 }}
                >
                  {stat.value}
                </motion.div>
              </div>
              <p className="text-sm font-semibold text-neutral-700">{stat.label}</p>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
