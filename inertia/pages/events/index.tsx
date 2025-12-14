// inertia/pages/events/index.tsx - REFACTORED WITH COMPONENTS
import { Head, router } from '@inertiajs/react'
import { useState, useMemo, useEffect } from 'react'
import { motion } from 'motion/react'
import AppLayout from '~/components/layouts/AppLayout'
import Pagination from '~/components/ui/Pagination'
import HeroSection from '~/components/events/Hero'
import FiltersBar from '~/components/events/Filter/Bar'
import FiltersPanel from '~/components/events/Filter/Panel'
import ActiveFilters from '~/components/events/Filter/Active'
import EventsGrid from '~/components/events/Grid'
import type { PaginatedResponse } from '~/types/common'

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

interface FilterStats {
  total: number
  gameEvents: number
  normalEvents: number
  freeEvents: number
  paidEvents: number
  availableGameTypes: string[]
}

interface Filters {
  search?: string
  category?: string
  province?: string
  eventType?: string
  gameType?: string
  difficulty?: string
  priceRange?: string
  status?: string
  page?: number
}

interface Props {
  events: PaginatedResponse<Event>
  filters: Filters
  filterStats?: FilterStats
}

export default function EventsIndex({ events, filters, filterStats }: Props) {
  const [showFilters, setShowFilters] = useState(false)
  
  // Local state for form inputs (controlled components)
  const [localFilters, setLocalFilters] = useState({
    search: filters.search || '',
    category: filters.category || '',
    province: filters.province || '',
    eventType: filters.eventType || '',
    gameType: filters.gameType || '',
    difficulty: filters.difficulty || '',
    priceRange: filters.priceRange || '',
    status: filters.status || '',
  })

  // Sync local state with URL params when they change
  useEffect(() => {
    setLocalFilters({
      search: filters.search || '',
      category: filters.category || '',
      province: filters.province || '',
      eventType: filters.eventType || '',
      gameType: filters.gameType || '',
      difficulty: filters.difficulty || '',
      priceRange: filters.priceRange || '',
      status: filters.status || '',
    })
  }, [filters])

  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (filters.search) count++
    if (filters.category) count++
    if (filters.province) count++
    if (filters.eventType) count++
    if (filters.gameType) count++
    if (filters.difficulty) count++
    if (filters.priceRange) count++
    if (filters.status) count++
    return count
  }, [filters])

  const handleFilterChange = (key: string, value: string) => {
    setLocalFilters((prev) => ({ ...prev, [key]: value }))
  }

  const handleSearchChange = (value: string) => {
    setLocalFilters((prev) => ({ ...prev, search: value }))
  }

  const applyFilters = () => {
    const params: Record<string, string> = {}
    if (localFilters.search) params.search = localFilters.search
    if (localFilters.category) params.category = localFilters.category
    if (localFilters.province) params.province = localFilters.province
    if (localFilters.eventType) params.eventType = localFilters.eventType
    if (localFilters.gameType) params.gameType = localFilters.gameType
    if (localFilters.difficulty) params.difficulty = localFilters.difficulty
    if (localFilters.priceRange) params.priceRange = localFilters.priceRange
    if (localFilters.status) params.status = localFilters.status

    router.get('/events', params, {
      preserveState: true,
      preserveScroll: true,
    })
  }

  const clearFilters = () => {
    setLocalFilters({
      search: '',
      category: '',
      province: '',
      eventType: '',
      gameType: '',
      difficulty: '',
      priceRange: '',
      status: '',
    })
    router.get('/events', {}, {
      preserveState: true,
      preserveScroll: true,
    })
    setShowFilters(false)
  }

  const handlePageChange = (page: number) => {
    // Create params without the old page number
    const { page: _oldPage, ...filterParams } = filters
    const params: Record<string, any> = { ...filterParams, page }
    router.get('/events', params, {
      preserveState: true,
      preserveScroll: false,
    })
  }


  return (
    <>
      <Head title="Événements" />
      <AppLayout>
        {/* Hero Section */}
        <HeroSection
          filterStats={filterStats}
          searchValue={localFilters.search}
          onSearchChange={handleSearchChange}
          onSearchSubmit={applyFilters}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          {/* Filters Bar */}
          <FiltersBar
            activeFiltersCount={activeFiltersCount}
            showFilters={showFilters}
            toggleFilters={() => setShowFilters(!showFilters)}
            clearFilters={clearFilters}
            totalEvents={events.meta.total}
          />

          {/* Filters Panel */}
          <FiltersPanel
            showFilters={showFilters}
            localFilters={localFilters}
            onFilterChange={handleFilterChange}
            onApplyFilters={applyFilters}
            onClose={() => setShowFilters(false)}
          />

          {/* Active Filters Display */}
          <ActiveFilters
            filters={filters}
            onFilterChange={handleFilterChange}
          />

          {/* Events Grid */}
          <EventsGrid events={events.data} />

          {/* Pagination */}
          {events.meta.last_page > 1 && (
            <motion.div
              className="mt-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Pagination
                currentPage={events.meta.current_page}
                lastPage={events.meta.last_page}
                totalItems={events.meta.total}
                itemsPerPage={events.meta.per_page}
                onChangePage={handlePageChange}
              />
            </motion.div>
          )}
        </div>
      </AppLayout>
    </>
  )
}