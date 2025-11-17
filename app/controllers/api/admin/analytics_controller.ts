// app/controllers/api/admin/analytics_controller.ts
import type { HttpContext } from '@adonisjs/core/http'
import Event from '#models/event'
import User from '#models/user'
import Registration from '#models/registration'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'

export default class AnalyticsController {
  /**
   * Get comprehensive dashboard statistics
   * GET /api/admin/analytics/dashboard
   */
  async dashboard({ response }: HttpContext) {
    const now = DateTime.now()

    // Events stats
    const eventsStats = await this.getEventsStats()

    // Users stats
    const usersStats = await this.getUsersStats()

    // Registrations stats
    const registrationsStats = await this.getRegistrationsStats()

    // Revenue stats
    const revenueStats = await this.getRevenueStats()

    // Recent activity
    const recentActivity = await this.getRecentActivity()

    // Trending events
    const trendingEvents = await this.getTrendingEvents()

    return response.ok({
      success: true,
      data: {
        events: eventsStats,
        users: usersStats,
        registrations: registrationsStats,
        revenue: revenueStats,
        recentActivity,
        trendingEvents,
        lastUpdated: now.toISO(),
      },
    })
  }

  /**
   * Get events statistics
   */
  private async getEventsStats() {
    const now = DateTime.now()

    const total = await Event.query().count('* as total').first()
    const published = await Event.query().where('status', 'published').count('* as total').first()
    const ongoing = await Event.query()
      .where('start_date', '<=', now.toSQL())
      .where('end_date', '>=', now.toSQL())
      .count('* as total')
      .first()
    const upcoming = await Event.query()
      .where('start_date', '>', now.toSQL())
      .count('* as total')
      .first()
    const finished = await Event.query()
      .where('end_date', '<', now.toSQL())
      .count('* as total')
      .first()

    // Game vs Normal events
    const gameEvents = await Event.query()
      .whereNotNull('event_type')
      .count('* as total')
      .first()
    const normalEvents = await Event.query().whereNull('event_type').count('* as total').first()

    // By category
    const byCategory = await Event.query()
      .select('category')
      .count('* as count')
      .groupBy('category')

    return {
      total: Number(total?.$extras.total ?? 0),
      published: Number(published?.$extras.total ?? 0),
      ongoing: Number(ongoing?.$extras.total ?? 0),
      upcoming: Number(upcoming?.$extras.total ?? 0),
      finished: Number(finished?.$extras.total ?? 0),
      gameEvents: Number(gameEvents?.$extras.total ?? 0),
      normalEvents: Number(normalEvents?.$extras.total ?? 0),
      byCategory: byCategory.map((item) => ({
        category: item.category,
        count: Number(item.$extras.count),
      })),
    }
  }

  /**
   * Get users statistics
   */
  private async getUsersStats() {
    const total = await User.query().count('* as total').first()
    const verified = await User.query()
      .where('is_email_verified', true)
      .count('* as total')
      .first()
    const active = await User.query().where('is_active', true).count('* as total').first()
    const blocked = await User.query().where('is_blocked', true).count('* as total').first()

    // New users last 30 days
    const thirtyDaysAgo = DateTime.now().minus({ days: 30 }).toSQL()
    const newUsers = await User.query()
      .where('created_at', '>', thirtyDaysAgo)
      .count('* as total')
      .first()

    // By province
    const byProvince = await User.query()
      .select('province')
      .count('* as count')
      .groupBy('province')
      .orderBy('count', 'desc')
      .limit(10)

    return {
      total: Number(total?.$extras.total ?? 0),
      verified: Number(verified?.$extras.total ?? 0),
      active: Number(active?.$extras.total ?? 0),
      blocked: Number(blocked?.$extras.total ?? 0),
      newLast30Days: Number(newUsers?.$extras.total ?? 0),
      byProvince: byProvince.map((item) => ({
        province: item.province,
        count: Number(item.$extras.count),
      })),
    }
  }

  /**
   * Get registrations statistics
   */
  private async getRegistrationsStats() {
    const total = await Registration.query().count('* as total').first()
    const confirmed = await Registration.query()
      .where('status', 'confirmed')
      .count('* as total')
      .first()
    const attended = await Registration.query()
      .where('status', 'attended')
      .count('* as total')
      .first()
    const pending = await Registration.query().where('status', 'pending').count('* as total').first()
    const canceled = await Registration.query()
      .where('status', 'canceled')
      .count('* as total')
      .first()

    // Last 7 days
    const sevenDaysAgo = DateTime.now().minus({ days: 7 }).toSQL()
    const last7Days = await Registration.query()
      .where('created_at', '>', sevenDaysAgo)
      .count('* as total')
      .first()

    // Attendance rate
    const attendanceRate =
      Number(total?.$extras.total ?? 0) > 0
        ? (Number(attended?.$extras.total ?? 0) / Number(total?.$extras.total ?? 0)) * 100
        : 0

    return {
      total: Number(total?.$extras.total ?? 0),
      confirmed: Number(confirmed?.$extras.total ?? 0),
      attended: Number(attended?.$extras.total ?? 0),
      pending: Number(pending?.$extras.total ?? 0),
      canceled: Number(canceled?.$extras.total ?? 0),
      last7Days: Number(last7Days?.$extras.total ?? 0),
      attendanceRate: Math.round(attendanceRate * 100) / 100,
    }
  }

  /**
   * Get revenue statistics
   */
  private async getRevenueStats() {
    const totalRevenue = await db
      .from('registrations')
      .whereIn('status', ['confirmed', 'attended'])
      .sum('price as total')
      .first()

    const last30DaysRevenue = await db
      .from('registrations')
      .whereIn('status', ['confirmed', 'attended'])
      .where('created_at', '>', DateTime.now().minus({ days: 30 }).toSQL())
      .sum('price as total')
      .first()

    const pendingRevenue = await db
      .from('registrations')
      .where('status', 'pending')
      .sum('price as total')
      .first()

    // Revenue by category
    const byCategory = await db
      .from('registrations')
      .join('events', 'registrations.event_id', 'events.id')
      .whereIn('registrations.status', ['confirmed', 'attended'])
      .select('events.category')
      .sum('registrations.price as revenue')
      .groupBy('events.category')
      .orderBy('revenue', 'desc')

    return {
      total: Number(totalRevenue?.total ?? 0),
      last30Days: Number(last30DaysRevenue?.total ?? 0),
      pending: Number(pendingRevenue?.total ?? 0),
      byCategory: byCategory.map((item) => ({
        category: item.category,
        revenue: Number(item.revenue),
      })),
    }
  }

  /**
   * Get recent activity
   */
  private async getRecentActivity() {
    const recentRegistrations = await Registration.query()
      .preload('user')
      .preload('event')
      .orderBy('created_at', 'desc')
      .limit(10)

    return recentRegistrations.map((reg) => ({
      id: reg.id,
      type: 'registration',
      user: {
        id: reg.user.id,
        name: reg.user.fullName,
      },
      event: {
        id: reg.event.id,
        name: reg.event.name,
      },
      status: reg.status,
      createdAt: reg.createdAt.toISO(),
    }))
  }

  /**
   * Get trending events
   */
  private async getTrendingEvents() {
    const events = await Event.query()
      .where('status', 'published')
      .orderBy('registered_count', 'desc')
      .limit(5)

    return events.map((event) => ({
      id: event.id,
      name: event.name,
      category: event.category,
      registeredCount: event.registeredCount,
      capacity: event.capacity,
      occupancyRate: Math.round((event.registeredCount / event.capacity) * 100),
      startDate: event.startDate.toISO(),
    }))
  }

  /**
   * Get registrations over time (for charts)
   * GET /api/admin/analytics/registrations-chart
   * Query: ?period=7d|30d|90d|1y
   */
  async registrationsChart({ request, response }: HttpContext) {
    const period = request.input('period', '30d')

    let days = 30
    if (period === '7d') days = 7
    else if (period === '90d') days = 90
    else if (period === '1y') days = 365

    const startDate = DateTime.now().minus({ days })

    const data = await db
      .from('registrations')
      .select(db.raw('DATE(created_at) as date'))
      .count('* as count')
      .where('created_at', '>', startDate.toSQL())
      .groupBy(db.raw('DATE(created_at)'))
      .orderBy('date', 'asc')

    return response.ok({
      success: true,
      data: {
        period,
        days,
        chart: data.map((item) => ({
          date: item.date,
          count: Number(item.count),
        })),
      },
    })
  }

  /**
   * Get revenue over time (for charts)
   * GET /api/admin/analytics/revenue-chart
   * Query: ?period=7d|30d|90d|1y
   */
  async revenueChart({ request, response }: HttpContext) {
    const period = request.input('period', '30d')

    let days = 30
    if (period === '7d') days = 7
    else if (period === '90d') days = 90
    else if (period === '1y') days = 365

    const startDate = DateTime.now().minus({ days })

    const data = await db
      .from('registrations')
      .select(db.raw('DATE(created_at) as date'))
      .sum('price as revenue')
      .where('created_at', '>', startDate.toSQL())
      .whereIn('status', ['confirmed', 'attended'])
      .groupBy(db.raw('DATE(created_at)'))
      .orderBy('date', 'asc')

    return response.ok({
      success: true,
      data: {
        period,
        days,
        chart: data.map((item) => ({
          date: item.date,
          revenue: Number(item.revenue),
        })),
      },
    })
  }

  /**
   * Get popular events by province
   * GET /api/admin/analytics/events-by-province
   */
  async eventsByProvince({ response }: HttpContext) {
    const data = await db
      .from('events')
      .select('province')
      .count('* as count')
      .sum('registered_count as totalRegistrations')
      .groupBy('province')
      .orderBy('count', 'desc')

    return response.ok({
      success: true,
      data: data.map((item) => ({
        province: item.province,
        eventsCount: Number(item.count),
        totalRegistrations: Number(item.totalRegistrations),
      })),
    })
  }

  /**
   * Get user engagement metrics
   * GET /api/admin/analytics/user-engagement
   */
  async userEngagement({ response }: HttpContext) {
    // Users with registrations
    const usersWithRegs = await db
      .from('users')
      .join('registrations', 'users.id', 'registrations.user_id')
      .select('users.id')
      .distinct()
      .count('* as count')
      .first()

    const totalUsers = await User.query().count('* as total').first()

    // Average registrations per user
    const avgRegsPerUser = await db
      .from('registrations')
      .select(db.raw('COUNT(*) / COUNT(DISTINCT user_id) as avg'))
      .first()

    // Top active users
    const topUsers = await db
      .from('registrations')
      .join('users', 'registrations.user_id', 'users.id')
      .select('users.id', 'users.first_name', 'users.last_name')
      .count('* as registrations')
      .groupBy('users.id', 'users.first_name', 'users.last_name')
      .orderBy('registrations', 'desc')
      .limit(10)

    return response.ok({
      success: true,
      data: {
        totalUsers: Number(totalUsers?.$extras.total ?? 0),
        activeUsers: Number(usersWithRegs?.count ?? 0),
        engagementRate:
          Number(totalUsers?.$extras.total ?? 0) > 0
            ? (Number(usersWithRegs?.count ?? 0) / Number(totalUsers?.$extras.total ?? 0)) * 100
            : 0,
        averageRegistrationsPerUser: Number(avgRegsPerUser?.avg ?? 0).toFixed(2),
        topUsers: topUsers.map((user) => ({
          id: user.id,
          name: `${user.first_name} ${user.last_name}`,
          registrations: Number(user.registrations),
        })),
      },
    })
  }
}