// app/controllers/support_controller.ts
import type { HttpContext } from '@adonisjs/core/http'

export default class SupportController {
    /**
     * Show help center page
     */
    async helpCenter({ inertia }: HttpContext) {
        return inertia.render('support/help_center')
    }

    /**
     * Show contact page
     */
    async contact({ inertia }: HttpContext) {
        return inertia.render('support/contact')
    }

    /**
     * Show FAQ page
     */
    async faq({ inertia }: HttpContext) {
        return inertia.render('support/faq')
    }

    /**
     * Handle contact form submission
     */
    async sendContact({ request, session, response }: HttpContext) {
        // TODO: Implement email sending logic
        const data = request.only(['name', 'email', 'subject', 'message'])

        console.log('Contact form submission:', data)

        session.flash('success', 'Votre message a été envoyé avec succès. Nous vous répondrons dans les plus brefs délais.')

        return response.redirect().back()
    }
}
