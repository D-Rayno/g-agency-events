// app/controllers/legal_controller.ts
import type { HttpContext } from '@adonisjs/core/http'

export default class LegalController {
    /**
     * Show Terms of Use page
     */
    async termsOfUse({ inertia }: HttpContext) {
        return inertia.render('legal/terms_of_use')
    }

    /**
     * Show Privacy Policy page
     */
    async privacyPolicy({ inertia }: HttpContext) {
        return inertia.render('legal/privacy_policy')
    }

    /**
     * Show Cookies Policy page
     */
    async cookies({ inertia }: HttpContext) {
        return inertia.render('legal/cookies')
    }
}
