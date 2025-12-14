// inertia/components/events/Hero.tsx - CREATIVE REDESIGN
import { motion } from 'motion/react'
import {
  FireIcon,
  TrophyIcon,
  SparklesIcon,
  MagnifyingGlassIcon,
  TicketIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline'
import Button from '~/components/ui/Button'
import { useTheme } from '~/hooks/useTheme'
import type { FilterStats } from '~/types/event'

interface HeroSectionProps {
  filterStats?: FilterStats
  searchValue: string
  onSearchChange: (value: string) => void
  onSearchSubmit: () => void
}

export default function HeroSection({
  filterStats,
  searchValue,
  onSearchChange,
  onSearchSubmit,
}: HeroSectionProps) {
  const { colors } = useTheme()

  const stats = filterStats
    ? [
        {
          icon: CalendarIcon,
          label: 'Événements',
          value: filterStats.total,
          gradient: `linear-gradient(135deg, ${colors.primary[500]}, ${colors.primary[600]})`,
        },
        {
          icon: TrophyIcon,
          label: 'Compétitions',
          value: filterStats.gameEvents,
          gradient: `linear-gradient(135deg, ${colors.secondary[500]}, ${colors.secondary[600]})`,
        },
        {
          icon: TicketIcon,
          label: 'Gratuits',
          value: filterStats.freeEvents,
          gradient: `linear-gradient(135deg, ${colors.success[500]}, ${colors.success[600]})`,
        },
      ]
    : []

  return (
    <section className="relative -mt-8 mb-12">
      {/* Background with Wave Pattern */}
      <div
        className="relative pb-32 pt-24"
        style={{
          background: `linear-gradient(135deg, ${colors.primary[600]} 0%, ${colors.primary[700]} 50%, ${colors.secondary[600]} 100%)`,
        }}
      >
        {/* Animated Gradient Overlay */}
        <div className="absolute inset-0 opacity-30">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                radial-gradient(circle at 20% 30%, ${colors.primary[400]} 0%, transparent 50%),
                radial-gradient(circle at 80% 70%, ${colors.secondary[400]} 0%, transparent 50%),
                radial-gradient(circle at 50% 50%, ${colors.primary[300]} 0%, transparent 60%)
              `,
            }}
          />
        </div>

        {/* Floating Elements */}
        <motion.div
          className="absolute top-20 right-[10%] opacity-10"
          animate={{
            y: [0, -30, 0],
            rotate: [0, 10, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <SparklesIcon className="w-32 h-32 text-white" />
        </motion.div>

        <motion.div
          className="absolute bottom-20 left-[15%] opacity-10"
          animate={{
            y: [0, 20, 0],
            rotate: [0, -10, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <TrophyIcon className="w-40 h-40 text-white" />
        </motion.div>

        <motion.div
          className="absolute top-1/2 right-[20%] opacity-10"
          animate={{
            scale: [1, 1.2, 1],
            rotate: 360,
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          <FireIcon className="w-24 h-24 text-white" />
        </motion.div>

        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 drop-shadow-lg">
                Découvrez l'Extraordinaire
              </h1>
              <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto drop-shadow">
                Des événements inoubliables vous attendent. Trouvez votre prochaine aventure !
              </p>
            </motion.div>

            {/* Stats Cards */}
            {stats.length > 0 && (
              <motion.div
                className="flex flex-wrap justify-center gap-4 mb-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    className="bg-white/95 backdrop-blur-sm rounded-2xl px-6 py-5 shadow-xl border border-white/50 min-w-[150px]"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + index * 0.1, type: 'spring' }}
                    whileHover={{ scale: 1.05, y: -5 }}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div
                        className="w-14 h-14 rounded-xl flex items-center justify-center shadow-lg"
                        style={{ background: stat.gradient }}
                      >
                        <stat.icon className="w-7 h-7 text-white" />
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-neutral-900">{stat.value}</div>
                        <div className="text-sm font-medium text-neutral-600">{stat.label}</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Search Card - Overlapping */}
      <motion.div
        className="relative -mt-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 border border-neutral-100">
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${colors.primary[500]}, ${colors.secondary[500]})` }}
            >
              <MagnifyingGlassIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-neutral-900">Rechercher un événement</h3>
              <p className="text-sm text-neutral-600">
                Trouvez l'événement parfait parmi notre sélection
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <input
                type="text"
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') onSearchSubmit()
                }}
                placeholder="Nom de l'événement, catégorie, lieu..."
                className="w-full px-5 py-4 rounded-xl border-2 border-neutral-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none transition-all text-neutral-900 placeholder:text-neutral-400 text-base font-medium"
                style={{
                  backgroundColor: colors.neutral[50],
                }}
              />
            </div>
            <Button
              variant="gradient"
              size="md"
              onClick={onSearchSubmit}
              shadow="xl"
              className="px-4 sm:px-6 whitespace-nowrap"
              iconLeft={MagnifyingGlassIcon}
            >
              Rechercher
            </Button>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-neutral-100">
            <span className="text-sm font-semibold text-neutral-600">Recherches populaires:</span>
            {['Jeux', 'Gratuit', 'Ce weekend', 'Sport'].map((tag) => (
              <button
                key={tag}
                onClick={() => {
                  onSearchChange(tag)
                  onSearchSubmit()
                }}
                className="px-3 py-1.5 rounded-lg text-sm font-medium border transition-all hover:scale-105"
                style={{
                  borderColor: colors.neutral[300],
                  color: colors.neutral[700],
                  backgroundColor: 'white',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = colors.primary[500]
                  e.currentTarget.style.color = colors.primary[700]
                  e.currentTarget.style.backgroundColor = colors.primary[50]
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = colors.neutral[300]
                  e.currentTarget.style.color = colors.neutral[700]
                  e.currentTarget.style.backgroundColor = 'white'
                }}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  )
}