// inertia/components/events/Grid.tsx - ENHANCED VERSION
import { motion } from 'motion/react'
import { SparklesIcon, FaceFrownIcon } from '@heroicons/react/24/outline'
import EventCard from './Card'
import { useTheme } from '~/hooks/useTheme'

interface Event {
  id: number
  name: string
  description: string
  location: string
  province: string
  commune: string
  startDate: string
  endDate: string
  capacity: number
  registeredCount: number
  availableSeats: number
  imageUrl: string | null
  category: string
  basePrice: number
  isFull: boolean
  canRegister: boolean
  isRegistered: boolean
  isUpcoming: boolean
  isOngoing: boolean
  isFinished: boolean
  eventType?: string | null
  gameType?: string | null
  difficulty?: string | null
  prizeInformation?: string | null
  allowsTeams?: boolean
}

interface EventsGridProps {
  events: Event[]
}

export default function EventsGrid({ events }: EventsGridProps) {
  const { colors } = useTheme()

  // Empty State
  if (events.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="text-center py-20"
      >
        <motion.div
          animate={{
            y: [0, -10, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="mb-6"
        >
          <div className="relative inline-block">
            <FaceFrownIcon
              className="w-32 h-32 mx-auto mb-4"
              style={{ color: colors.neutral[300] }}
            />
            <motion.div
              className="absolute -top-2 -right-2"
              animate={{
                rotate: [0, 15, -15, 0],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <SparklesIcon className="w-8 h-8" style={{ color: colors.warning[400] }} />
            </motion.div>
          </div>
        </motion.div>

        <h3 className="text-3xl font-bold text-neutral-900 mb-3">Aucun événement trouvé</h3>
        <p className="text-lg text-neutral-600 mb-8 max-w-md mx-auto">
          Aucun événement ne correspond à vos critères de recherche. Essayez d'ajuster vos filtres
          !
        </p>

        <div
          className="max-w-md mx-auto p-6 rounded-2xl border-2 border-dashed"
          style={{ borderColor: colors.neutral[200], backgroundColor: colors.neutral[50] }}
        >
          <h4 className="font-semibold text-neutral-900 mb-3">Suggestions :</h4>
          <ul className="text-left space-y-2 text-neutral-700">
            <li className="flex items-center gap-2">
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: colors.primary[500] }}
              />
              Vérifiez l'orthographe des mots-clés
            </li>
            <li className="flex items-center gap-2">
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: colors.primary[500] }}
              />
              Utilisez des termes plus généraux
            </li>
            <li className="flex items-center gap-2">
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: colors.primary[500] }}
              />
              Réduisez le nombre de filtres actifs
            </li>
          </ul>
        </div>
      </motion.div>
    )
  }

  // Grid with Events
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
      {events.map((event, index) => (
        <EventCard key={event.id} event={event} index={index} />
      ))}
    </div>
  )
}
