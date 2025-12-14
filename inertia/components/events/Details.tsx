// inertia/components/events/Details.tsx - ENHANCED VERSION
import { motion } from 'motion/react'
import {
  CalendarIcon,
  MapPinIcon,
  UsersIcon,
  ClockIcon,
  TagIcon,
} from '@heroicons/react/24/outline'
import Card from '~/components/ui/Card'
import Badge from '~/components/ui/Badge'
import { useTheme } from '~/hooks/useTheme'
import { formatDateTime } from '~/lib/utils'

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
  category: string
  tags?: string[]
  gameSummary?: string
}

interface EventDetailsProps {
  event: Event
}

export default function EventDetails({ event }: EventDetailsProps) {
  const { colors } = useTheme()

  const infoItems = [
    {
      icon: CalendarIcon,
      label: 'Date de début',
      value: formatDateTime(event.startDate),
      color: colors.primary[500],
      bgColor: colors.primary[50],
    },
    {
      icon: ClockIcon,
      label: 'Date de fin',
      value: formatDateTime(event.endDate),
      color: colors.secondary[500],
      bgColor: colors.secondary[50],
    },
    {
      icon: MapPinIcon,
      label: 'Lieu',
      value: event.location,
      subValue: `${event.commune}, ${event.province}`,
      color: colors.success[500],
      bgColor: colors.success[50],
    },
    {
      icon: UsersIcon,
      label: 'Places disponibles',
      value: `${event.availableSeats} / ${event.capacity}`,
      progress: Math.min((event.registeredCount / event.capacity) * 100, 100),
      color: colors.info[500],
      bgColor: colors.info[50],
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
    >
      <Card className="p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-neutral-900 mb-2">À propos de l'événement</h2>
              {event.gameSummary && (
                <p className="text-lg font-medium mb-2" style={{ color: colors.primary[600] }}>
                  {event.gameSummary}
                </p>
              )}
            </div>
            <Badge variant="primary" size="lg">
              {event.category}
            </Badge>
          </div>

          {/* Description */}
          <div
            className="prose max-w-none mb-8 p-6 rounded-xl"
            style={{ backgroundColor: colors.neutral[50] }}
          >
            <p className="text-lg leading-relaxed text-neutral-700 m-0 whitespace-pre-line">
              {event.description}
            </p>
          </div>
        </div>

        {/* Details Grid */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-neutral-900 mb-4">Informations pratiques</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {infoItems.map((item, index) => (
              <motion.div
                key={item.label}
                className="p-5 rounded-xl border-2 transition-all hover:shadow-md"
                style={{
                  backgroundColor: item.bgColor,
                  borderColor: `${item.color}20`,
                }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.05 }}
                whileHover={{ y: -2 }}
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
                    style={{ backgroundColor: `${item.color}20` }}
                  >
                    <item.icon className="w-6 h-6" style={{ color: item.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-neutral-600 uppercase tracking-wide mb-1">
                      {item.label}
                    </p>
                    <p className="text-lg font-bold text-neutral-900 wrap-break-word">{item.value}</p>
                    {item.subValue && (
                      <p className="text-sm font-medium text-neutral-600 mt-1">{item.subValue}</p>
                    )}
                    {item.progress !== undefined && (
                      <div className="mt-3">
                        <div
                          className="w-full rounded-full h-2"
                          style={{ backgroundColor: colors.neutral[200] }}
                        >
                          <motion.div
                            className="h-2 rounded-full"
                            style={{ backgroundColor: item.color }}
                            initial={{ width: 0 }}
                            animate={{ width: `${item.progress}%` }}
                            transition={{ duration: 1, delay: 0.5 }}
                          />
                        </div>
                        <p className="text-xs font-medium text-neutral-600 mt-1">
                          {Math.round(item.progress)}% complet
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Tags */}
        {event.tags && event.tags.length > 0 && (
          <div className="pt-6 border-t border-neutral-200">
            <h3 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: colors.primary[100] }}
              >
                <TagIcon className="w-4 h-4" style={{ color: colors.primary[600] }} />
              </div>
              Mots-clés
            </h3>
            <div className="flex flex-wrap gap-2">
              {event.tags.map((tag, index) => (
                <motion.div
                  key={tag}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                >
                  <Badge variant="neutral" size="lg">
                    {tag}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </Card>
    </motion.div>
  )
}