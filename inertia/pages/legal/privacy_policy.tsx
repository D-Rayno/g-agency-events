// inertia/pages/legal/privacy_policy.tsx
import { Head } from '@inertiajs/react'
import { motion } from 'motion/react'
import { ShieldCheckIcon } from '@heroicons/react/24/outline'
import AppLayout from '~/components/layouts/AppLayout'
import Card from '~/components/ui/Card'
import { useTheme } from '~/hooks/useTheme'

export default function PrivacyPolicy() {
  const { colors } = useTheme()

  const sections = [
    {
      title: '1. Introduction',
      content: `Nous attachons une grande importance à la protection de vos données personnelles. Cette politique de confidentialité explique comment nous collectons, utilisons, partageons et protégeons vos informations lorsque vous utilisez notre plateforme d'événements.`,
    },
    {
      title: '2. Données collectées',
      content: `Nous collectons les informations suivantes :

**Informations d'identification :**
• Nom et prénom
• Adresse email
• Âge
• Numéro de téléphone (optionnel)
• Wilaya et commune de résidence

**Données d'utilisation :**
• Historique de navigation sur la plateforme
• Événements consultés et auxquels vous vous êtes inscrit
• Préférences et paramètres de compte

**Données techniques :**
• Adresse IP
• Type de navigateur et appareil
• Données de cookies`,
    },
    {
      title: '3. Utilisation des données',
      content: `Nous utilisons vos données pour :

• Créer et gérer votre compte utilisateur
• Traiter vos inscriptions aux événements
• Vous envoyer des confirmations et des QR codes
• Vous informer sur les événements susceptibles de vous intéresser
• Améliorer nos services et votre expérience utilisateur
• Assurer la sécurité de la plateforme
• Se conformer aux obligations légales`,
    },
    {
      title: '4. Partage des données',
      content: `Nous ne vendons jamais vos données personnelles. Nous pouvons partager vos informations uniquement dans les cas suivants :

**Avec les organisateurs d'événements :**
Lorsque vous vous inscrivez à un événement, nous partageons les informations nécessaires (nom, email, etc.) avec l'organisateur pour faciliter votre participation.

**Avec nos prestataires de services :**
Nous travaillons avec des partenaires de confiance qui nous aident à fournir nos services (hébergement, envoi d'emails, paiement).

**Pour des raisons légales :**
Si la loi l'exige ou pour protéger nos droits et ceux de nos utilisateurs.`,
    },
    {
      title: '5. Sécurité des données',
      content: `Nous mettons en œuvre des mesures de sécurité appropriées pour protéger vos données :

• Cryptage SSL/TLS pour toutes les communications
• Stockage sécurisé des données sur des serveurs protégés
• Accès limité aux données personnelles (uniquement le personnel autorisé)
• Mots de passe chiffrés
• Surveillance régulière de nos systèmes
• Sauvegardes régulières des données`,
    },
    {
      title: '6. Vos droits',
      content: `Conformément à la réglementation en vigueur, vous disposez des droits suivants :

**Droit d'accès :** Vous pouvez demander une copie de vos données personnelles

**Droit de rectification :** Vous pouvez corriger vos informations inexactes

**Droit de suppression :** Vous pouvez demander la suppression de votre compte et de vos données

**Droit d'opposition :** Vous pouvez vous opposer au traitement de vos données à des fins marketing

**Droit à la portabilité :** Vous pouvez recevoir vos données dans un format structuré

Pour exercer ces droits, contactez-nous via notre page de contact.`,
    },
    {
      title: '7. Cookies',
      content: `Notre plateforme utilise des cookies pour améliorer votre expérience. Pour plus d'informations, consultez notre Politique des Cookies.

Les cookies nous permettent de :
• Mémoriser vos préférences
• Analyser l'utilisation du site
• Personnaliser votre expérience
• Assurer la sécurité de votre session`,
    },
    {
      title: '8. Conservation des données',
      content: `Nous conservons vos données aussi longtemps que nécessaire pour :

• Fournir nos services
• Se conformer à nos obligations légales
• Résoudre les litiges

Les données des comptes inactifs depuis plus de 3 ans peuvent être supprimées après notification préalable.`,
    },
    {
      title: '9. Modifications de la politique',
      content: `Nous pouvons mettre à jour cette politique de confidentialité périodiquement. Nous vous informerons des changements importants par email ou via une notification sur la plateforme. La date de dernière mise à jour est indiquée en haut de cette page.`,
    },
    {
      title: '10. Contact',
      content: `Pour toute question concernant cette politique de confidentialité ou pour exercer vos droits, contactez-nous :

• Email : privacy@example.dz
• Via notre page de contact`,
    },
  ]

  return (
    <>
      <Head title="Politique de confidentialité" />
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
              style={{ backgroundColor: `${colors.success[500]}15` }}
            >
              <ShieldCheckIcon className="w-8 h-8" style={{ color: colors.success[500] }} />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
              Politique de confidentialité
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
                <div className="mb-8 p-6 rounded-xl bg-success-50 border-l-4 border-success-500">
                  <p className="text-lg text-neutral-800 font-medium">
                    Votre vie privée est importante pour nous. Cette politique explique comment nous protégeons vos données personnelles.
                  </p>
                </div>

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
                    <div className="text-neutral-700 leading-relaxed whitespace-pre-line">
                      {section.content}
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>
      </AppLayout>
    </>
  )
}
