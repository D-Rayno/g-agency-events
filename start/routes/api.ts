// start/routes/api.ts
import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

const AdminAuthController = () => import('#controllers/api/admin/auth_controller')
const AdminEventController = () => import('#controllers/api/admin/event_controller')
const AdminRegistrationController = () => import('#controllers/api/admin/registrations_controller')
const AdminUserController = () => import('#controllers/api/admin/users_controller')
const ExportController = () => import('#controllers/api/admin/export_controller')
const BulkController = () => import('#controllers/api/admin/bulk_controller')

export default () => {
  router
    .group(() => {
      // ========================================
      // Authentication Routes (PUBLIC)
      // ========================================
      router.post('/auth/login', [AdminAuthController, 'login'])
      router.post('/auth/refresh', [AdminAuthController, 'refresh'])

      // ========================================
      // Protected Routes
      // ========================================
      router
        .group(() => {
          // ---- Auth Management ----
          router.get('/auth/check', [AdminAuthController, 'check'])
          router.post('/auth/logout', [AdminAuthController, 'logout'])
          router.post('/auth/logout-all', [AdminAuthController, 'logoutAll'])
          router.post('/auth/logout-device', [AdminAuthController, 'logoutDevice'])
          router.get('/auth/stats', [AdminAuthController, 'stats'])
          router.get('/auth/sessions', [AdminAuthController, 'sessions'])
          router.post('/auth/update-fcm-token', [AdminAuthController, 'updateFcmToken'])
          router.get('/auth/security-alerts', [AdminAuthController, 'securityAlerts'])

          // ---- Events ----
          router.get('/events', [AdminEventController, 'index'])
          router.get('/events/stats', [AdminEventController, 'stats'])
          router.get('/events/:id', [AdminEventController, 'show'])
          router.post('/events', [AdminEventController, 'store'])
          router.put('/events/:id', [AdminEventController, 'update'])
          router.delete('/events/:id', [AdminEventController, 'destroy'])

          // ---- Registrations ----
          router.get('/registrations', [AdminRegistrationController, 'index'])
          router.get('/registrations/stats', [AdminRegistrationController, 'stats'])
          router.get('/registrations/:id', [AdminRegistrationController, 'show'])
          router.post('/registrations/verify', [AdminRegistrationController, 'verifyQRCode'])
          router.post('/registrations/confirm', [AdminRegistrationController, 'confirmAttendance'])
          router.delete('/registrations/:id', [AdminRegistrationController, 'cancel'])

          // ---- Users ----
          router.get('/users', [AdminUserController, 'index'])
          router.get('/users/stats', [AdminUserController, 'stats'])
          router.get('/users/:id', [AdminUserController, 'show'])
          router.patch('/users/:id/toggle-block', [AdminUserController, 'toggleBlock'])
          router.patch('/users/:id/toggle-active', [AdminUserController, 'toggleActive'])
          router.delete('/users/:id', [AdminUserController, 'destroy'])

          // ---- Exports ----
          router.get('/exports/events/csv', [ExportController, 'exportEventsCSV'])
          router.get('/exports/events/excel', [ExportController, 'exportEventsExcel'])
          router.get('/exports/users/csv', [ExportController, 'exportUsersCSV'])
          router.get('/exports/users/excel', [ExportController, 'exportUsersExcel'])
          router.get('/exports/registrations/csv', [ExportController, 'exportRegistrationsCSV'])
          router.get('/exports/registrations/excel', [ExportController, 'exportRegistrationsExcel'])

          // ---- Bulk Operations ----
          router.put('/bulk/events', [BulkController, 'updateEvents'])
          router.delete('/bulk/events', [BulkController, 'deleteEvents'])
          router.put('/bulk/users', [BulkController, 'updateUsers'])
          router.delete('/bulk/users', [BulkController, 'deleteUsers'])
          router.post('/bulk/registrations/cancel', [BulkController, 'cancelRegistrations'])
          router.delete('/bulk/registrations', [BulkController, 'deleteRegistrations'])

        })
        .middleware([middleware.adminApi(), middleware.rateLimit()])
    })
    .prefix('/api/admin')
}