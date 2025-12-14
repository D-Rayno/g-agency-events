// inertia/components/registrations/Card.tsx - ENHANCED VERSION
import { motion } from 'motion/react'
import {
  CalendarIcon,
  MapPinIcon,
  QrCodeIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon as PendingIcon,
  TicketIcon,
} from '@heroicons/react/24/outline'
import Card from '~/components/ui/Card'
import Button from '~/components/ui/Button'
import Badge from '~/components/ui/Badge'
import { useTheme } from '~/hooks/useTheme'
import { formatDate, formatDateTime, getStoragePath } from '~/lib/utils'

interface Event {
  id: number
  name: string
  location: string
  startDate: string
  endDate: string
  imageUrl: string | null
  status: string
}

interface Registration {
  id: number
  status: 'pending' | 'confirmed' | 'attended' | 'canceled'
  qrCode: string
  attendedAt: string | null
  createdAt: string
  event: Event
}

interface RegistrationCardProps {
  registration: Registration
  index: number
}

export default function RegistrationCard({ registration, index }: RegistrationCardProps) {
  const { colors, getPlaceholder } = useTheme()

  const getStatusConfig = (status: string) => {
    const configs = {
      pending: {
        variant: 'warning' as const,
        icon: PendingIcon,
        text: 'En attente',
        color: colors.warning[500],
        bgColor: colors.warning[50],
      },
      confirmed: {
        variant: 'success' as const,
        icon: CheckCircleIcon,
        text: 'Confirmé',
        color: colors.success[500],
        bgColor: colors.success[50],
      },
      attended: {
        variant: 'info' as const,
        icon: CheckCircleIcon,
        text: 'Présent',
        color: colors.info[500],
        bgColor: colors.info[50],
      },
      canceled: {
        variant: 'neutral' as const,
        icon: XCircleIcon,
        text: 'Annulé',
        color: colors.neutral[500],
        bgColor: colors.neutral[50],
      },
    }
    return configs[status as keyof typeof configs] || configs.pending
  }

  const statusConfig = getStatusConfig(registration.status)
  const StatusIcon = statusConfig.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Card hoverable className="group overflow-hidden">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Event Image with Gradient Overlay */}
          <div className="md:w-64 shrink-0 relative overflow-hidden rounded-xl">
            <div className="aspect-video md:aspect-4/3 overflow-hidden">
              <img
                src={
                  registration.event.imageUrl
                    ? getStoragePath(registration.event.imageUrl)
                    : getPlaceholder('event')
                }
                alt={registration.event.name}
                className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-110"
              />
            </div>

            {/* Gradient Overlay */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                background: `linear-gradient(to bottom, transparent 0%, ${colors.primary[900]}60 100%)`,
              }}
            />

            {/* Status Badge on Image */}
            <div className="absolute top-3 right-3">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 + index * 0.05, type: 'spring' }}
              >
                <Badge variant={statusConfig.variant} size="md">
                  <StatusIcon className="w-4 h-4" />
                  {statusConfig.text}
                </Badge>
              </motion.div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 flex flex-col">
            {/* Title */}
            <h3
              className="text-2xl font-bold text-neutral-900 mb-4 line-clamp-2 group-hover:text-primary-600 transition-colors"
              style={{ wordBreak: 'break-word' }}
            >
              {registration.event.name}
            </h3>

            {/* Event Info Grid */}
            <div className="grid sm:grid-cols-2 gap-3 mb-4">
              <div
                className="flex items-center gap-3 p-3 rounded-xl"
                style={{ backgroundColor: colors.primary[50] }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: colors.primary[100] }}
                >
                  <CalendarIcon className="w-5 h-5" style={{ color: colors.primary[600] }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-neutral-600 uppercase tracking-wide">
                    Date
                  </p>
                  <p className="font-bold truncate" style={{ color: colors.primary[700] }}>
                    {formatDate(registration.event.startDate)}
                  </p>
                </div>
              </div>

              <div
                className="flex items-center gap-3 p-3 rounded-xl"
                style={{ backgroundColor: colors.secondary[50] }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: colors.secondary[100] }}
                >
                  <MapPinIcon className="w-5 h-5" style={{ color: colors.secondary[600] }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-neutral-600 uppercase tracking-wide">
                    Lieu
                  </p>
                  <p className="font-bold truncate" style={{ color: colors.secondary[700] }}>
                    {registration.event.location}
                  </p>
                </div>
              </div>
            </div>

            {/* Registration Info */}
            <div
              className="flex items-center gap-2 text-sm p-3 rounded-lg mb-4"
              style={{ backgroundColor: colors.neutral[50] }}
            >
              <TicketIcon className="w-4 h-4" style={{ color: colors.neutral[600] }} />
              <span style={{ color: colors.neutral[700] }}>
                Inscrit le {formatDateTime(registration.createdAt)}
              </span>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3 mt-auto pt-4 border-t border-neutral-200">
              <Button
                variant="gradient"
                size="md"
                href={`/registrations/${registration.id}`}
                iconRight={ArrowRightIcon}
                shadow="lg"
                className="flex-1 sm:flex-none"
              >
                Voir les détails
              </Button>

              {(registration.status === 'confirmed' || registration.status === 'pending') && (
                <Button
                  variant="outline"
                  size="md"
                  href={`/registrations/${registration.id}#qr-code`}
                  iconLeft={QrCodeIcon}
                  className="flex-1 sm:flex-none"
                >
                  Mon QR Code
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}