// app/controllers/api/admin/export_controller.ts
import type { HttpContext } from '@adonisjs/core/http'
import Event from '#models/event'
import User from '#models/user'
import Registration from '#models/registration'
import ExcelJS from 'exceljs'
import { createObjectCsvStringifier } from 'csv-writer'

export default class ExportController {
    /**
     * Export events to CSV
     * GET /api/admin/exports/events/csv
     */
    async exportEventsCSV({ response, request }: HttpContext) {
        const status = request.input('status')
        const category = request.input('category')

        let query = Event.query().orderBy('start_date', 'desc')

        if (status) query = query.where('status', status)
        if (category) query = query.where('category', category)

        const events = await query.exec()

        const csvStringifier = createObjectCsvStringifier({
            header: [
                { id: 'id', title: 'ID' },
                { id: 'name', title: 'Nom' },
                { id: 'category', title: 'Catégorie' },
                { id: 'province', title: 'Province' },
                { id: 'commune', title: 'Commune' },
                { id: 'startDate', title: 'Date Début' },
                { id: 'endDate', title: 'Date Fin' },
                { id: 'capacity', title: 'Capacité' },
                { id: 'registeredCount', title: 'Inscrits' },
                { id: 'availableSeats', title: 'Places Disponibles' },
                { id: 'basePrice', title: 'Prix de Base' },
                { id: 'status', title: 'Statut' },
                { id: 'eventType', title: 'Type Événement' },
                { id: 'gameType', title: 'Type Jeu' },
                { id: 'difficulty', title: 'Difficulté' },
            ],
        })

        const records = events.map((e) => ({
            id: e.id,
            name: e.name,
            category: e.category,
            province: e.province,
            commune: e.commune,
            startDate: e.startDate.toFormat('dd/MM/yyyy HH:mm'),
            endDate: e.endDate.toFormat('dd/MM/yyyy HH:mm'),
            capacity: e.capacity,
            registeredCount: e.registeredCount,
            availableSeats: e.availableSeats,
            basePrice: e.basePrice,
            status: e.status,
            eventType: e.eventType || 'Normal',
            gameType: e.gameType || '-',
            difficulty: e.difficulty || '-',
        }))

        const csv =
            csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(records)

        response.header('Content-Type', 'text/csv; charset=utf-8')
        response.header('Content-Disposition', `attachment; filename="events_${Date.now()}.csv"`)

        return response.send('\uFEFF' + csv) // BOM for Excel UTF-8 support
    }

    /**
     * Export events to Excel
     * GET /api/admin/exports/events/excel
     */
    async exportEventsExcel({ response, request }: HttpContext) {
        const status = request.input('status')
        const category = request.input('category')

        let query = Event.query().orderBy('start_date', 'desc')

        if (status) query = query.where('status', status)
        if (category) query = query.where('category', category)

        const events = await query.exec()

        const workbook = new ExcelJS.Workbook()
        const worksheet = workbook.addWorksheet('Événements')

        // Style pour l'en-tête
        worksheet.columns = [
            { header: 'ID', key: 'id', width: 8 },
            { header: 'Nom', key: 'name', width: 30 },
            { header: 'Catégorie', key: 'category', width: 15 },
            { header: 'Province', key: 'province', width: 15 },
            { header: 'Commune', key: 'commune', width: 15 },
            { header: 'Date Début', key: 'startDate', width: 18 },
            { header: 'Date Fin', key: 'endDate', width: 18 },
            { header: 'Capacité', key: 'capacity', width: 12 },
            { header: 'Inscrits', key: 'registered', width: 12 },
            { header: 'Disponibles', key: 'available', width: 12 },
            { header: 'Prix', key: 'price', width: 12 },
            { header: 'Statut', key: 'status', width: 12 },
            { header: 'Type', key: 'eventType', width: 15 },
            { header: 'Jeu', key: 'gameType', width: 15 },
            { header: 'Difficulté', key: 'difficulty', width: 12 },
        ]

        // Style de l'en-tête
        worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF4F46E5' },
        }
        worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' }

        // Ajouter les données
        events.forEach((event) => {
            worksheet.addRow({
                id: event.id,
                name: event.name,
                category: event.category,
                province: event.province,
                commune: event.commune,
                startDate: event.startDate.toFormat('dd/MM/yyyy HH:mm'),
                endDate: event.endDate.toFormat('dd/MM/yyyy HH:mm'),
                capacity: event.capacity,
                registered: event.registeredCount,
                available: event.availableSeats,
                price: `${event.basePrice} DZD`,
                status: event.status,
                eventType: event.eventType || 'Normal',
                gameType: event.gameType || '-',
                difficulty: event.difficulty || '-',
            })
        })

        // Bordures
        worksheet.eachRow((row) => {
            row.eachCell((cell) => {
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' },
                }
            })
        })

        const buffer = await workbook.xlsx.writeBuffer()

        response.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        response.header('Content-Disposition', `attachment; filename="events_${Date.now()}.xlsx"`)

        return response.send(buffer)
    }

    /**
     * Export users to CSV
     * GET /api/admin/exports/users/csv
     */
    async exportUsersCSV({ response, request }: HttpContext) {
        const province = request.input('province')
        const isBlocked = request.input('is_blocked')

        let query = User.query()
            .withCount('registrations', (q) => q.whereIn('status', ['confirmed', 'attended']))
            .orderBy('created_at', 'desc')

        if (province) query = query.where('province', province)
        if (isBlocked !== undefined) query = query.where('is_blocked', isBlocked === 'true')

        const users = await query.exec()

        const csvStringifier = createObjectCsvStringifier({
            header: [
                { id: 'id', title: 'ID' },
                { id: 'fullName', title: 'Nom Complet' },
                { id: 'email', title: 'Email' },
                { id: 'age', title: 'Âge' },
                { id: 'province', title: 'Province' },
                { id: 'commune', title: 'Commune' },
                { id: 'phoneNumber', title: 'Téléphone' },
                { id: 'registrationsCount', title: 'Inscriptions' },
                { id: 'isVerified', title: 'Vérifié' },
                { id: 'isActive', title: 'Actif' },
                { id: 'isBlocked', title: 'Bloqué' },
                { id: 'createdAt', title: 'Date Inscription' },
            ],
        })

        const records = users.map((u) => ({
            id: u.id,
            fullName: u.fullName,
            email: u.email,
            age: u.age,
            province: u.province,
            commune: u.commune,
            phoneNumber: u.phoneNumber || '-',
            registrationsCount: u.$extras.registrations_count || 0,
            isVerified: u.isEmailVerified ? 'Oui' : 'Non',
            isActive: u.isActive ? 'Oui' : 'Non',
            isBlocked: u.isBlocked ? 'Oui' : 'Non',
            createdAt: u.createdAt.toFormat('dd/MM/yyyy'),
        }))

        const csv =
            csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(records)

        response.header('Content-Type', 'text/csv; charset=utf-8')
        response.header('Content-Disposition', `attachment; filename="users_${Date.now()}.csv"`)

        return response.send('\uFEFF' + csv)
    }

    /**
     * Export users to Excel
     * GET /api/admin/exports/users/excel
     */
    async exportUsersExcel({ response, request }: HttpContext) {
        const province = request.input('province')
        const isBlocked = request.input('is_blocked')

        let query = User.query()
            .withCount('registrations', (q) => q.whereIn('status', ['confirmed', 'attended']))
            .orderBy('created_at', 'desc')

        if (province) query = query.where('province', province)
        if (isBlocked !== undefined) query = query.where('is_blocked', isBlocked === 'true')

        const users = await query.exec()

        const workbook = new ExcelJS.Workbook()
        const worksheet = workbook.addWorksheet('Utilisateurs')

        worksheet.columns = [
            { header: 'ID', key: 'id', width: 8 },
            { header: 'Nom Complet', key: 'fullName', width: 25 },
            { header: 'Email', key: 'email', width: 30 },
            { header: 'Âge', key: 'age', width: 8 },
            { header: 'Province', key: 'province', width: 15 },
            { header: 'Commune', key: 'commune', width: 15 },
            { header: 'Téléphone', key: 'phone', width: 15 },
            { header: 'Inscriptions', key: 'registrations', width: 12 },
            { header: 'Vérifié', key: 'verified', width: 10 },
            { header: 'Actif', key: 'active', width: 10 },
            { header: 'Bloqué', key: 'blocked', width: 10 },
            { header: 'Date Inscription', key: 'createdAt', width: 18 },
        ]

        worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF10B981' },
        }
        worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' }

        users.forEach((user) => {
            worksheet.addRow({
                id: user.id,
                fullName: user.fullName,
                email: user.email,
                age: user.age,
                province: user.province,
                commune: user.commune,
                phone: user.phoneNumber || '-',
                registrations: user.$extras.registrations_count || 0,
                verified: user.isEmailVerified ? 'Oui' : 'Non',
                active: user.isActive ? 'Oui' : 'Non',
                blocked: user.isBlocked ? 'Oui' : 'Non',
                createdAt: user.createdAt.toFormat('dd/MM/yyyy'),
            })
        })

        worksheet.eachRow((row) => {
            row.eachCell((cell) => {
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' },
                }
            })
        })

        const buffer = await workbook.xlsx.writeBuffer()

        response.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        response.header('Content-Disposition', `attachment; filename="users_${Date.now()}.xlsx"`)

        return response.send(buffer)
    }

    /**
     * Export registrations to CSV
     * GET /api/admin/exports/registrations/csv
     */
    async exportRegistrationsCSV({ response, request }: HttpContext) {
        const status = request.input('status')
        const eventId = request.input('event_id')

        let query = Registration.query()
            .preload('user')
            .preload('event')
            .orderBy('created_at', 'desc')

        if (status) query = query.where('status', status)
        if (eventId) query = query.where('event_id', eventId)

        const registrations = await query.exec()

        const csvStringifier = createObjectCsvStringifier({
            header: [
                { id: 'id', title: 'ID' },
                { id: 'userName', title: 'Utilisateur' },
                { id: 'userEmail', title: 'Email' },
                { id: 'eventName', title: 'Événement' },
                { id: 'eventDate', title: 'Date Événement' },
                { id: 'status', title: 'Statut' },
                { id: 'price', title: 'Prix' },
                { id: 'qrCode', title: 'QR Code' },
                { id: 'attendedAt', title: 'Présent Le' },
                { id: 'createdAt', title: 'Inscrit Le' },
            ],
        })

        const records = registrations.map((r) => ({
            id: r.id,
            userName: r.user.fullName,
            userEmail: r.user.email,
            eventName: r.event.name,
            eventDate: r.event.startDate.toFormat('dd/MM/yyyy HH:mm'),
            status: r.status,
            price: `${r.price} DZD`,
            qrCode: r.qrCode,
            attendedAt: r.attendedAt ? r.attendedAt.toFormat('dd/MM/yyyy HH:mm') : '-',
            createdAt: r.createdAt.toFormat('dd/MM/yyyy HH:mm'),
        }))

        const csv =
            csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(records)

        response.header('Content-Type', 'text/csv; charset=utf-8')
        response.header('Content-Disposition', `attachment; filename="registrations_${Date.now()}.csv"`)

        return response.send('\uFEFF' + csv)
    }

    /**
     * Export registrations to Excel
     * GET /api/admin/exports/registrations/excel
     */
    async exportRegistrationsExcel({ response, request }: HttpContext) {
        const status = request.input('status')
        const eventId = request.input('event_id')

        let query = Registration.query()
            .preload('user')
            .preload('event')
            .orderBy('created_at', 'desc')

        if (status) query = query.where('status', status)
        if (eventId) query = query.where('event_id', eventId)

        const registrations = await query.exec()

        const workbook = new ExcelJS.Workbook()
        const worksheet = workbook.addWorksheet('Inscriptions')

        worksheet.columns = [
            { header: 'ID', key: 'id', width: 8 },
            { header: 'Utilisateur', key: 'user', width: 25 },
            { header: 'Email', key: 'email', width: 30 },
            { header: 'Événement', key: 'event', width: 30 },
            { header: 'Date Événement', key: 'eventDate', width: 18 },
            { header: 'Statut', key: 'status', width: 12 },
            { header: 'Prix', key: 'price', width: 12 },
            { header: 'QR Code', key: 'qrCode', width: 35 },
            { header: 'Présent Le', key: 'attended', width: 18 },
            { header: 'Inscrit Le', key: 'created', width: 18 },
        ]

        worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF59E0B' },
        }
        worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' }

        registrations.forEach((reg) => {
            worksheet.addRow({
                id: reg.id,
                user: reg.user.fullName,
                email: reg.user.email,
                event: reg.event.name,
                eventDate: reg.event.startDate.toFormat('dd/MM/yyyy HH:mm'),
                status: reg.status,
                price: `${reg.price} DZD`,
                qrCode: reg.qrCode,
                attended: reg.attendedAt ? reg.attendedAt.toFormat('dd/MM/yyyy HH:mm') : '-',
                created: reg.createdAt.toFormat('dd/MM/yyyy HH:mm'),
            })
        })

        worksheet.eachRow((row) => {
            row.eachCell((cell) => {
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' },
                }
            })
        })

        const buffer = await workbook.xlsx.writeBuffer()

        response.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        response.header('Content-Disposition', `attachment; filename="registrations_${Date.now()}.xlsx"`)

        return response.send(buffer)
    }
}