// inertia/pages/legal/terms_of_use.tsx
import { Head } from '@inertiajs/react'
import { motion } from 'motion/react'
import { DocumentTextIcon } from '@heroicons/react/24/outline'
import AppLayout from '~/components/layouts/AppLayout'
import Card from '~/components/ui/Card'
import { useTheme } from '~/hooks/useTheme'

export default function TermsOfUse() {
  const { colors } = useTheme()

  const sections = [
    {
      title: '1. Acceptation des conditions',
      content: `En accédant et en utilisant cette plateforme, vous acceptez d'être lié par les présentes conditions d'utilisation. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser notre service.`,
    },
    {
      title: '2. Utilisation du service',
      content: `Notre plateforme vous permet de découvrir et de vous inscrire à des événements en Algérie. Vous vous engagez à :
      
• Fournir des informations exactes et à jour lors de votre inscription
• Maintenir la sécurité de votre compte et de votre mot de passe
• Utiliser le service de manière conforme à la loi et aux bonnes mœurs
• Ne pas utiliser le service à des fins frauduleuses ou illégales`,
    },
    {
      title: '3. Inscription aux événements',
      content: `Lorsque vous vous inscrivez à un événement :

• Vous vous engagez à assister à l'événement ou à annuler votre inscription dans les délais prévus
• Vous recevrez un QR code personnel non transférable
• Les conditions d'annulation varient selon les événements et sont indiquées sur chaque page d'événement
• Les remboursements, le cas échéant, sont traités selon la politique de chaque organisateur`,
    },
    {
      title: '4. Compte utilisateur',
      content: `Vous êtes responsable de :

• La confidentialité de vos identifiants de connexion
• Toutes les activités effectuées sous votre compte
• La mise à jour de vos informations personnelles
• La notification immédiate en cas d'utilisation non autorisée de votre compte`,
    },
    {
      title: '5. Propriété intellectuelle',
      content: `Tous les contenus présents sur la plateforme (textes, images, logos, code source, etc.) sont protégés par les droits de propriété intellectuelle et appartiennent à la plateforme ou à ses partenaires. Toute reproduction ou utilisation non autorisée est interdite.`,
    },
    {
      title: '6. Limitation de responsabilité',
      content: `La plateforme s'efforce de fournir des informations exactes et à jour, mais ne peut garantir :

• La disponibilité continue du service
• L'exactitude complète de toutes les informations
• L'absence d'erreurs ou d'interruptions
• La tenue effective des événements listés (la responsabilité incombe aux organisateurs)`,
    },
    {
      title: '7. Protection des données',
      content: `Nous nous engageons à protéger vos données personnelles conformément à notre Politique de Confidentialité. Vos informations sont collectées, traitées et stockées de manière sécurisée.`,
    },
    {
      title: '8. Modification des conditions',
      content: `Nous nous réservons le droit de modifier ces conditions d'utilisation à tout moment. Les modifications seront publiées sur cette page avec une date de mise à jour. Votre utilisation continue du service après modification vaut acceptation des nouvelles conditions.`,
    },
    {
      title: '9. Résiliation',
      content: `Nous nous réservons le droit de suspendre ou de résilier votre compte en cas de :

• Violation des présentes conditions
• Activité frauduleuse ou illégale
• Comportement nuisible envers d'autres utilisateurs
• Non-paiement des services payants`,
    },
    {
      title: '10. Droit applicable',
      content: `Ces conditions sont régies par le droit algérien. Tout litige sera soumis à la compétence exclusive des tribunaux d'Alger, Algérie.`,
    },
  ]

  return (
    <>
      <Head title="Conditions d'utilisation" />
      <AppLayout>
        <div className="py-12">
          {/* Header */}
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div
              className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center"
              style={{ backgroundColor: `${colors.primary[500]}15` }}
            >
              <DocumentTextIcon className="w-8 h-8" style={{ color: colors.primary[500] }} />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
              Conditions d'utilisation
            </h1>
            <p className="text-neutral-600">
              Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
            </p>
          </motion.div>

          {/* Content */}
          <motion.div
            className="max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="p-8 md:p-12">
              <div className="prose prose-neutral max-w-none">
                <p className="text-lg text-neutral-700 mb-8 leading-relaxed">
                  Bienvenue sur notre plateforme d'événements. En utilisant nos services, vous acceptez les conditions suivantes. Veuillez les lire attentivement.
                </p>

                {sections.map((section, index) => (
                  <motion.div
                    key={index}
                    className="mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 + index * 0.05 }}
                  >
                    <h2 className="text-2xl font-bold text-neutral-900 mb-4">
                      {section.title}
                    </h2>
                    <p className="text-neutral-700 leading-relaxed whitespace-pre-line">
                      {section.content}
                    </p>
                  </motion.div>
                ))}

                <div className="mt-12 p-6 rounded-xl bg-neutral-50 border-l-4 border-primary-500">
                  <h3 className="text-lg font-bold text-neutral-900 mb-2">Contact</h3>
                  <p className="text-neutral-700">
                    Pour toute question concernant ces conditions d'utilisation, veuillez nous contacter via notre{' '}
                    <a
                      href="/support/contact"
                      className="text-primary-600 hover:text-primary-700 font-semibold"
                    >
                      page de contact
                    </a>
                    .
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </AppLayout>
    </>
  )
}
