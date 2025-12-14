// inertia/pages/legal/cookies.tsx
import { Head } from '@inertiajs/react'
import { motion } from 'motion/react'
import { SparklesIcon } from '@heroicons/react/24/outline'
import AppLayout from '~/components/layouts/AppLayout'
import Card from '~/components/ui/Card'
import Badge from '~/components/ui/Badge'
import { useTheme } from '~/hooks/useTheme'

export default function Cookies() {
  const { colors } = useTheme()

  const cookieTypes = [
    {
      name: 'Cookies strictement nécessaires',
      badge: 'Obligatoires',
      badgeVariant: 'error' as const,
      description: 'Ces cookies sont essentiels au fonctionnement de la plateforme. Ils permettent la navigation et l\'utilisation des fonctionnalités de base.',
      examples: [
        'Cookie de session (maintien de la connexion)',
        'Cookie de sécurité CSRF',
        'Préférences de consentement aux cookies',
      ],
      canDisable: false,
    },
    {
      name: 'Cookies de performance',
      badge: 'Optionnels',
      badgeVariant: 'warning' as const,
      description: 'Ces cookies collectent des informations sur la façon dont vous utilisez notre site. Ils nous aident à améliorer nos services.',
      examples: [
        'Analyse du trafic et des pages visitées',
        'Temps de chargement des pages',
        'Erreurs rencontrées',
      ],
      canDisable: true,
    },
    {
      name: 'Cookies fonctionnels',
      badge: 'Optionnels',
      badgeVariant: 'info' as const,
      description: 'Ces cookies permettent de mémoriser vos choix (langue, région, etc.) pour améliorer votre expérience.',
      examples: [
        'Préférences de langue',
        'Préférences de région (wilaya)',
        'Paramètres d\'affichage',
      ],
      canDisable: true,
    },
    {
      name: 'Cookies publicitaires',
      badge: 'Optionnels',
      badgeVariant: 'secondary' as const,
      description: 'Ces cookies sont utilisés pour afficher des publicités pertinentes. Nous ne les utilisons actuellement pas.',
      examples: [
        'Actuellement non utilisés sur notre plateforme',
      ],
      canDisable: true,
    },
  ]

  const sections = [
    {
      title: '1. Qu\'est-ce qu\'un cookie ?',
      content: `Un cookie est un petit fichier texte stocké sur votre appareil (ordinateur, smartphone, tablette) lorsque vous visitez un site web. Les cookies permettent au site de mémoriser vos actions et préférences pendant une période donnée.`,
    },
    {
      title: '2. Pourquoi utilisons-nous des cookies ?',
      content: `Nous utilisons des cookies pour :

• Assurer le bon fonctionnement de la plateforme
• Mémoriser votre session de connexion
• Améliorer la sécurité de votre compte
• Analyser l'utilisation du site pour l'améliorer
• Personnaliser votre expérience utilisateur
• Mémoriser vos préférences`,
    },
    {
      title: '3. Durée de conservation',
      content: `La durée de conservation des cookies varie selon leur type :

**Cookies de session :** Supprimés à la fermeture de votre navigateur
**Cookies persistants :** Conservés pour une durée maximale de 13 mois`,
    },
    {
      title: '4. Gestion des cookies',
      content: `Vous pouvez contrôler et gérer les cookies de plusieurs façons :

**Via votre navigateur :**
Tous les navigateurs permettent de gérer les cookies via leurs paramètres. Vous pouvez :
• Refuser tous les cookies
• Accepter uniquement certains cookies
• Supprimer les cookies existants

**Sur notre plateforme :**
Lors de votre première visite, vous pouvez choisir d'accepter ou de refuser les cookies non essentiels.

⚠️ **Attention :** La désactivation de certains cookies peut affecter le fonctionnement de la plateforme.`,
    },
    {
      title: '5. Cookies tiers',
      content: `Nous n'utilisons actuellement aucun cookie tiers (Google Analytics, Facebook Pixel, etc.). Si cela change à l'avenir, nous mettrons à jour cette politique et vous en informerons.`,
    },
    {
      title: '6. Modification de la politique',
      content: `Nous pouvons modifier cette politique des cookies pour refléter les changements dans nos pratiques. La date de dernière mise à jour est indiquée en haut de cette page. Nous vous encourageons à consulter régulièrement cette page.`,
    },
  ]

  return (
    <>
      <Head title="Politique des cookies" />
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
              style={{ backgroundColor: `${colors.warning[500]}15` }}
            >
              <SparklesIcon className="w-8 h-8" style={{ color: colors.warning[500] }} />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
              Politique des cookies
            </h1>
            <p className="text-neutral-600">
              Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
            </p>
          </motion.div>

          {/* Cookie Types */}
          <motion.div
            className="max-w-5xl mx-auto mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold text-neutral-900 mb-8 text-center">
              Types de cookies utilisés
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {cookieTypes.map((type, index) => (
                <motion.div
                  key={type.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
                >
                  <Card className="h-full p-6">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-lg font-bold text-neutral-900">{type.name}</h3>
                      <Badge variant={type.badgeVariant} size="sm">
                        {type.badge}
                      </Badge>
                    </div>
                    <p className="text-neutral-700 mb-4 text-sm leading-relaxed">
                      {type.description}
                    </p>
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-neutral-600 uppercase">
                        Exemples :
                      </p>
                      <ul className="space-y-1">
                        {type.examples.map((example, i) => (
                          <li key={i} className="text-sm text-neutral-600 flex items-start gap-2">
                            <span className="text-primary-500 mt-1">•</span>
                            <span>{example}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Detailed Content */}
          <motion.div
            className="max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="p-8 md:p-12">
              <div className="prose prose-neutral max-w-none">
                {sections.map((section, index) => (
                  <motion.div
                    key={index}
                    className="mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.5 + index * 0.05 }}
                  >
                    <h2 className="text-2xl font-bold text-neutral-900 mb-4">
                      {section.title}
                    </h2>
                    <div className="text-neutral-700 leading-relaxed whitespace-pre-line">
                      {section.content}
                    </div>
                  </motion.div>
                ))}

                <div className="mt-12 p-6 rounded-xl bg-neutral-50 border-l-4 border-primary-500">
                  <h3 className="text-lg font-bold text-neutral-900 mb-2">
                    Questions sur les cookies ?
                  </h3>
                  <p className="text-neutral-700">
                    Si vous avez des questions concernant notre utilisation des cookies, n'hésitez pas à nous contacter via notre{' '}
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
