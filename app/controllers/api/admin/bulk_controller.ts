// app/controllers/api/admin/bulk_controller.ts
import type { HttpContext } from '@adonisjs/core/http'
import Event from '#models/event'
import User from '#models/user'
import Registration from '#models/registration'
import db from '@adonisjs/lucid/services/db'

export default class BulkController {
    /**
     * Bulk update events
     * PUT /api/admin/bulk/events
     * Body: { eventIds: [1, 2, 3], updates: { status: 'published' } }
     */
    async updateEvents({ request, response }: HttpContext) {
        const { eventIds, updates } = request.only(['eventIds', 'updates'])

        if (!eventIds || !Array.isArray(eventIds) || eventIds.length === 0) {
            return response.badRequest({
                error: 'IDs manquants',
                message: 'Veuillez fournir un tableau d\'IDs d\'événements.',
            })
        }

        if (!updates || Object.keys(updates).length === 0) {
            return response.badRequest({
                error: 'Données manquantes',
                message: 'Veuillez fournir les champs à mettre à jour.',
            })
        }

        // Whitelist des champs autorisés
        const allowedFields = [
            'status',
            'is_public',
            'is_active',
            'is_featured',
            'requires_approval',
        ]

        const filteredUpdates: Record<string, any> = {}
        for (const [key, value] of Object.entries(updates)) {
            if (allowedFields.includes(key)) {
                filteredUpdates[key] = value
            }
        }

        if (Object.keys(filteredUpdates).length === 0) {
            return response.badRequest({
                error: 'Champs invalides',
                message: `Seuls ces champs sont autorisés: ${allowedFields.join(', ')}`,
            })
        }

        const trx = await db.transaction()

        try {
            const updated = await Event.query({ client: trx })
                .whereIn('id', eventIds)
                .update(filteredUpdates)

            await trx.commit()

            return response.ok({
                success: true,
                message: `${updated} événement(s) mis à jour avec succès`,
                data: {
                    updated,
                    fields: Object.keys(filteredUpdates),
                },
            })
        } catch (error) {
            await trx.rollback()
            console.error('Bulk update events error:', error)
            return response.internalServerError({
                error: 'Erreur serveur',
                message: 'Une erreur est survenue lors de la mise à jour.',
            })
        }
    }

    /**
     * Bulk delete events
     * DELETE /api/admin/bulk/events
     * Body: { eventIds: [1, 2, 3] }
     */
    async deleteEvents({ request, response }: HttpContext) {
        const { eventIds } = request.only(['eventIds'])

        if (!eventIds || !Array.isArray(eventIds) || eventIds.length === 0) {
            return response.badRequest({
                error: 'IDs manquants',
                message: 'Veuillez fournir un tableau d\'IDs d\'événements.',
            })
        }

        const trx = await db.transaction()

        try {
            // Vérifier les inscriptions actives
            const activeRegs = await db
                .from('registrations')
                .whereIn('event_id', eventIds)
                .whereIn('status', ['confirmed', 'attended'])
                .count('* as total')

            const count = activeRegs[0].total

            if (count > 0) {
                await trx.rollback()
                return response.badRequest({
                    error: 'Suppression impossible',
                    message: `${count} inscription(s) active(s) trouvée(s). Veuillez les gérer avant suppression.`,
                })
            }

            // Supprimer les événements
            const deleted = await Event.query({ client: trx })
                .whereIn('id', eventIds)
                .delete()

            await trx.commit()

            return response.ok({
                success: true,
                message: `${deleted} événement(s) supprimé(s) avec succès`,
                data: { deleted },
            })
        } catch (error) {
            await trx.rollback()
            console.error('Bulk delete events error:', error)
            return response.internalServerError({
                error: 'Erreur serveur',
                message: 'Une erreur est survenue lors de la suppression.',
            })
        }
    }

    /**
     * Bulk update users
     * PUT /api/admin/bulk/users
     * Body: { userIds: [1, 2, 3], updates: { is_blocked: true } }
     */
    async updateUsers({ request, response }: HttpContext) {
        const { userIds, updates } = request.only(['userIds', 'updates'])

        if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
            return response.badRequest({
                error: 'IDs manquants',
                message: 'Veuillez fournir un tableau d\'IDs d\'utilisateurs.',
            })
        }

        // Whitelist
        const allowedFields = ['is_blocked', 'is_active', 'is_email_verified']

        const filteredUpdates: Record<string, any> = {}
        for (const [key, value] of Object.entries(updates)) {
            if (allowedFields.includes(key)) {
                filteredUpdates[key] = value
            }
        }

        if (Object.keys(filteredUpdates).length === 0) {
            return response.badRequest({
                error: 'Champs invalides',
                message: `Seuls ces champs sont autorisés: ${allowedFields.join(', ')}`,
            })
        }

        const trx = await db.transaction()

        try {
            const updated = await User.query({ client: trx })
                .whereIn('id', userIds)
                .where('is_admin', false) // Protéger les admins
                .update(filteredUpdates)

            await trx.commit()

            return response.ok({
                success: true,
                message: `${updated} utilisateur(s) mis à jour avec succès`,
                data: {
                    updated,
                    fields: Object.keys(filteredUpdates),
                },
            })
        } catch (error) {
            await trx.rollback()
            console.error('Bulk update users error:', error)
            return response.internalServerError({
                error: 'Erreur serveur',
                message: 'Une erreur est survenue lors de la mise à jour.',
            })
        }
    }

    /**
     * Bulk delete users
     * DELETE /api/admin/bulk/users
     * Body: { userIds: [1, 2, 3] }
     */
    async deleteUsers({ request, response }: HttpContext) {
        const { userIds } = request.only(['userIds'])

        if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
            return response.badRequest({
                error: 'IDs manquants',
                message: 'Veuillez fournir un tableau d\'IDs d\'utilisateurs.',
            })
        }

        const trx = await db.transaction()

        try {
            // Vérifier les inscriptions actives
            const activeRegs = await db
                .from('registrations')
                .whereIn('user_id', userIds)
                .whereIn('status', ['confirmed', 'attended'])
                .count('* as total')

            const count = activeRegs[0].total

            if (count > 0) {
                await trx.rollback()
                return response.badRequest({
                    error: 'Suppression impossible',
                    message: `${count} inscription(s) active(s) trouvée(s). Veuillez les gérer avant suppression.`,
                })
            }

            // Supprimer les utilisateurs (protéger les admins)
            const deleted = await User.query({ client: trx })
                .whereIn('id', userIds)
                .where('is_admin', false)
                .delete()

            await trx.commit()

            return response.ok({
                success: true,
                message: `${deleted} utilisateur(s) supprimé(s) avec succès`,
                data: { deleted },
            })
        } catch (error) {
            await trx.rollback()
            console.error('Bulk delete users error:', error)
            return response.internalServerError({
                error: 'Erreur serveur',
                message: 'Une erreur est survenue lors de la suppression.',
            })
        }
    }

    /**
     * Bulk cancel registrations
     * POST /api/admin/bulk/registrations/cancel
     * Body: { registrationIds: [1, 2, 3] }
     */
    async cancelRegistrations({ request, response }: HttpContext) {
        const { registrationIds } = request.only(['registrationIds'])

        if (!registrationIds || !Array.isArray(registrationIds) || registrationIds.length === 0) {
            return response.badRequest({
                error: 'IDs manquants',
                message: 'Veuillez fournir un tableau d\'IDs d\'inscriptions.',
            })
        }

        const trx = await db.transaction()

        try {
            // Mettre à jour les inscriptions
            const updated = await Registration.query({ client: trx })
                .whereIn('id', registrationIds)
                .whereIn('status', ['pending', 'confirmed'])
                .update({ status: 'canceled' })

            // Mettre à jour les compteurs des événements
            const registrations = await Registration.query({ client: trx })
                .whereIn('id', registrationIds)
                .select('event_id')

            const eventIds = [...new Set(registrations.map((r) => r.eventId))]

            for (const eventId of eventIds) {
                const event = await Event.find(eventId, { client: trx })
                if (event) {
                    const canceledCount = registrations.filter((r) => r.eventId === eventId).length
                    event.registeredCount = Math.max(0, event.registeredCount - canceledCount)
                    await event.save()
                }
            }

            await trx.commit()

            return response.ok({
                success: true,
                message: `${updated} inscription(s) annulée(s) avec succès`,
                data: { canceled: updated },
            })
        } catch (error) {
            await trx.rollback()
            console.error('Bulk cancel registrations error:', error)
            return response.internalServerError({
                error: 'Erreur serveur',
                message: 'Une erreur est survenue lors de l\'annulation.',
            })
        }
    }

    /**
     * Bulk delete registrations
     * DELETE /api/admin/bulk/registrations
     * Body: { registrationIds: [1, 2, 3] }
     */
    async deleteRegistrations({ request, response }: HttpContext) {
        const { registrationIds } = request.only(['registrationIds'])

        if (!registrationIds || !Array.isArray(registrationIds) || registrationIds.length === 0) {
            return response.badRequest({
                error: 'IDs manquants',
                message: 'Veuillez fournir un tableau d\'IDs d\'inscriptions.',
            })
        }

        const trx = await db.transaction()

        try {
            // Récupérer les inscriptions avant suppression
            const registrations = await Registration.query({ client: trx })
                .whereIn('id', registrationIds)
                .select('event_id', 'status')

            // Supprimer les inscriptions
            const deleted = await Registration.query({ client: trx })
                .whereIn('id', registrationIds)
                .delete()

            // Mettre à jour les compteurs des événements
            const eventIds = [...new Set(registrations.map((r) => r.eventId))]

            for (const eventId of eventIds) {
                const event = await Event.find(eventId, { client: trx })
                if (event) {
                    const activeRegs = registrations.filter(
                        (r) => r.eventId === eventId && ['confirmed', 'attended'].includes(r.status)
                    )
                    event.registeredCount = Math.max(0, event.registeredCount - activeRegs.length)
                    await event.save()
                }
            }

            await trx.commit()

            return response.ok({
                success: true,
                message: `${deleted} inscription(s) supprimée(s) avec succès`,
                data: { deleted },
            })
        } catch (error) {
            await trx.rollback()
            console.error('Bulk delete registrations error:', error)
            return response.internalServerError({
                error: 'Erreur serveur',
                message: 'Une erreur est survenue lors de la suppression.',
            })
        }
    }
}