// inertia/components/events/Card.tsx - ENHANCED VERSION
import { motion } from 'motion/react'
import {
  TrophyIcon,
  UsersIcon,
  CalendarIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline'
import Card from '~/components/ui/Card'
import Badge from '~/components/ui/Badge'
import Button from '~/components/ui/Button'
import { useTheme } from '~/hooks/useTheme'
import { formatDate, formatCurrency, truncate, getStoragePath } from '~/lib/utils'
import type { Event } from '~/types/event'

interface EventCardProps {
  event: Event
  index?: number
}

export default function EventCard({ event, index = 0 }: EventCardProps) {
  const { colors, getPlaceholder } = useTheme()

  const getEventStatusBadge = () => {
    if (event.isOngoing) {
      return (
        <Badge variant="info" dot pulse size="md">
          En cours
        </Badge>
      )
    }
    if (event.isUpcoming) {
      return (
        <Badge variant="success" dot size="md">
          À venir
        </Badge>
      )
    }
    if (event.isFinished) {
      return (
        <Badge variant="neutral" size="md">
          Terminé
        </Badge>
      )
    }
    return null
  }

  const getDifficultyBadge = () => {
    if (!event.difficulty) return null
    const config = {
      easy: { variant: 'success' as const, label: 'Facile', icon: '😊' },
      medium: { variant: 'warning' as const, label: 'Moyen', icon: '😐' },
      hard: { variant: 'error' as const, label: 'Difficile', icon: '😰' },
      extreme: { variant: 'error' as const, label: 'Extrême', icon: '💀' },
    }
    const c = config[event.difficulty as keyof typeof config]
    return c ? (
      <Badge variant={c.variant} size="sm">
        {c.icon} {c.label}
      </Badge>
    ) : null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <a href={`/events/${event.id}`} className="block h-full">
        <Card hoverable className="h-full flex flex-col overflow-hidden group cursor-pointer">
          {/* Event Image with Gradient Overlay */}
          <div className="relative overflow-clip rounded-t-md">
            <div className="aspect-video overflow-hidden">
              <img
                src={event.imageUrl ? getStoragePath(event.imageUrl) : getPlaceholder('event')}
                alt={event.name}
                className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-110"
              />
            </div>

            {/* Gradient Overlay */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                background: `linear-gradient(to bottom, transparent 0%, ${colors.primary[900]}80 100%)`,
              }}
            />

            {/* Top Badges */}
            <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
              {getEventStatusBadge()}
              {event.eventType === 'game' && (
                <Badge variant="secondary" size="md">
                  <TrophyIcon className="w-4 h-4" />
                  Jeu
                </Badge>
              )}
            </div>

            {/* Registration Badge */}
            {!!event.isRegistered && (
              <div className="absolute top-3 left-3 z-10">
                <Badge variant="success" size="md">
                  <CheckCircleIcon className="w-4 h-4" />
                  Inscrit
                </Badge>
              </div>
            )}

            {/* Prize Badge */}
            {!!event.prizeInformation && (
              <div className="absolute bottom-3 left-3 z-10">
                <Badge
                  variant="warning"
                  size="md"
                  className="bg-linear-to-r from-yellow-400 to-orange-500 text-white border-0"
                >
                  <TrophyIcon className="w-4 h-4" />
                  Prix
                </Badge>
              </div>
            )}

            {/* Team Badge */}
            {!!event.allowsTeams && (
              <div className="absolute bottom-3 right-3 z-10">
                <Badge variant="info" size="md">
                  <UsersIcon className="w-4 h-4" />
                  Équipes
                </Badge>
              </div>
            )}
          </div>

          {/* Card Content */}
          <div className="flex-1 flex flex-col mt-4">
            {/* Category and Difficulty */}
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="primary" size="sm">
                {event.category}
              </Badge>
              {event.gameType && (
                <Badge variant="secondary" size="sm">
                  🎮 {event.gameType}
                </Badge>
              )}
              {getDifficultyBadge()}
            </div>

            {/* Event Title */}
            <h3 className="text-xl font-bold text-neutral-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
              {event.name}
            </h3>

            {/* Description */}
            <p className="text-sm text-neutral-600 mb-4 line-clamp-2 grow">
              {truncate(event.description, 120)}
            </p>

            {/* Event Details */}
            <div className="space-y-2 mb-4">
              <div
                className="flex items-center gap-2 text-sm p-2 rounded-lg"
                style={{ backgroundColor: `${colors.primary[50]}` }}
              >
                <CalendarIcon className="w-4 h-4 shrink-0" style={{ color: colors.primary[600] }} />
                <span className="font-medium" style={{ color: colors.primary[700] }}>
                  {formatDate(event.startDate)}
                </span>
              </div>
              <div
                className="flex items-center gap-2 text-sm p-2 rounded-lg"
                style={{ backgroundColor: `${colors.secondary[50]}` }}
              >
                <MapPinIcon
                  className="w-4 h-4 shrink-0"
                  style={{ color: colors.secondary[600] }}
                />
                <span className="truncate font-medium" style={{ color: colors.secondary[700] }}>
                  {event.commune}, {event.province}
                </span>
              </div>
              {event.availableSeats !== undefined && (
                <div
                  className="flex items-center gap-2 text-sm p-2 rounded-lg"
                  style={{ backgroundColor: `${colors.success[50]}` }}
                >
                  <UsersIcon className="w-4 h-4 shrink-0" style={{ color: colors.success[600] }} />
                  <span className="font-medium" style={{ color: colors.success[700] }}>
                    {event.availableSeats} place{event.availableSeats > 1 ? 's' : ''} disponible
                    {event.availableSeats > 1 ? 's' : ''}
                  </span>
                </div>
              )}
            </div>

              <div className="my-4 border-t border-neutral-200 w-full"></div>

            {/* Footer - Price and Action */}
            <div className="flex items-center justify-between">
              <div>
                {event.basePrice > 0 ? (
                  <div className="flex items-center gap-1">
                    <CurrencyDollarIcon
                      className="w-5 h-5"
                      style={{ color: colors.primary[600] }}
                    />
                    <p className="text-2xl font-bold" style={{ color: colors.primary[600] }}>
                      {formatCurrency(event.basePrice)}
                    </p>
                  </div>
                ) : (
                  <Badge variant="success" size="lg">
                    Gratuit
                  </Badge>
                )}
              </div>
              <Button
                variant="gradient"
                size="md"
                shadow="lg"
                className="transform group-hover:scale-105 transition-transform"
              >
                Détails
              </Button>
            </div>
          </div>
        </Card>
      </a>
    </motion.div>
  )
}