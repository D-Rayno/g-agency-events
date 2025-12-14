// inertia/components/events/Header.tsx - ENHANCED VERSION
import { motion } from 'motion/react'
import {
  ArrowLeftIcon,
  ShareIcon,
  CheckCircleIcon,
  TrophyIcon,
  CalendarIcon,
  MapPinIcon,
  ClockIcon,
  UsersIcon,
} from '@heroicons/react/24/outline'
import Badge from '~/components/ui/Badge'
import Button from '~/components/ui/Button'
import { useTheme } from '~/hooks/useTheme'
import { getStoragePath } from '~/lib/utils'
import type { Event } from '~/types/event'

interface EventHeaderProps {
  event: Event
  isRegistered: boolean
  onShare: () => void
}

export default function EventHeader({ event, isRegistered, onShare }: EventHeaderProps) {
  const { colors, getPlaceholder } = useTheme()

  const getStatusBadge = () => {
    if (event.isOngoing) {
      return (
        <Badge variant="info" size="lg" dot pulse>
          En cours
        </Badge>
      )
    }
    if (event.isUpcoming) {
      return (
        <Badge variant="success" size="lg" dot>
          À venir
        </Badge>
      )
    }
    return (
      <Badge variant="neutral" size="lg">
        Terminé
      </Badge>
    )
  }

  const getDifficultyBadge = () => {
    if (!event.difficulty) return null
    const colors = {
      easy: 'success' as const,
      medium: 'warning' as const,
      hard: 'error' as const,
      extreme: 'error' as const,
    }
    const labels = {
      easy: '😊 Facile',
      medium: '😐 Moyen',
      hard: '😰 Difficile',
      extreme: '💀 Extrême',
    }
    return (
      <Badge variant={colors[event.difficulty as keyof typeof colors]} size="lg">
        {labels[event.difficulty as keyof typeof labels]}
      </Badge>
    )
  }

  return (
    <>
      {/* Back Button */}
      <motion.div className="mb-6" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <Button variant="ghost" iconLeft={ArrowLeftIcon} href="/events">
          Retour aux événements
        </Button>
      </motion.div>

      {/* Hero Section */}
      <motion.div
        className="relative rounded-3xl overflow-hidden mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Background Image with Overlay */}
        <div className="relative h-[500px]">
          <img
            src={event.imageUrl ? getStoragePath(event.imageUrl) : getPlaceholder('event')}
            alt={event.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
          
          {/* Gradient Overlays */}
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to bottom, 
                rgba(0,0,0,0) 0%, 
                rgba(0,0,0,0.3) 40%, 
                rgba(0,0,0,0.8) 100%)`,
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, 
                ${colors.primary[900]}40 0%, 
                ${colors.secondary[900]}40 100%)`,
              mixBlendMode: 'multiply',
            }}
          />

          {/* Top Badges */}
          <div className="absolute top-6 right-6 flex flex-col gap-2 z-10">
            {getStatusBadge()}
            {event.eventType === 'game' && (
              <Badge variant="secondary" size="lg">
                <TrophyIcon className="w-5 h-5" />
                Compétition
              </Badge>
            )}
            {isRegistered && (
              <Badge variant="success" size="lg">
                <CheckCircleIcon className="w-5 h-5" />
                Inscrit
              </Badge>
            )}
          </div>

          {/* Content */}
          <div className="absolute inset-0 flex flex-col justify-end p-8 z-10">
            <div className="max-w-4xl">
              {/* Category Badges */}
              <motion.div
                className="flex flex-wrap items-center gap-2 mb-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Badge variant="primary" size="lg">
                  {event.category}
                </Badge>
                {event.gameType && (
                  <Badge variant="secondary" size="lg">
                    🎮 {event.gameType}
                  </Badge>
                )}
                {getDifficultyBadge()}
              </motion.div>

              {/* Title */}
              <motion.h1
                className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 drop-shadow-lg"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {event.name}
              </motion.h1>

              {/* Game Summary */}
              {event.gameSummary && (
                <motion.p
                  className="text-xl text-white/90 mb-6 max-w-2xl drop-shadow"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  {event.gameSummary}
                </motion.p>
              )}

              {/* Quick Info Grid */}
              <motion.div
                className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <QuickInfoItem
                  icon={CalendarIcon}
                  label="Date"
                  value={new Date(event.startDate).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'short',
                  })}
                  color={colors.primary[400]}
                />
                <QuickInfoItem
                  icon={ClockIcon}
                  label="Heure"
                  value={new Date(event.startDate).toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                  color={colors.secondary[400]}
                />
                <QuickInfoItem
                  icon={MapPinIcon}
                  label="Lieu"
                  value={event.province}
                  color={colors.success[400]}
                />
                <QuickInfoItem
                  icon={UsersIcon}
                  label="Places"
                  value={
                    event.capacity
                      ? `${event.registeredCount || 0}/${event.capacity}`
                      : 'Illimité'
                  }
                  color={colors.warning[400]}
                />
              </motion.div>

              {/* Action Button */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Button
                  variant="outline"
                  size="md"
                  iconLeft={ShareIcon}
                  onClick={onShare}
                  className="bg-white/10 backdrop-blur-md border-white/30 text-white hover:bg-white/20"
                >
                  Partager cet événement
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  )
}

// Quick Info Item Component
interface QuickInfoItemProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  color: string
}

function QuickInfoItem({ icon: Icon, label, value, color }: QuickInfoItemProps) {
  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
      <div className="flex items-center gap-2 mb-1">
        <Icon className="w-5 h-5" style={{ color }} />
        <span className="text-xs font-semibold text-white/70 uppercase tracking-wide">
          {label}
        </span>
      </div>
      <div className="text-white font-bold text-lg">{value}</div>
    </div>
  )
}