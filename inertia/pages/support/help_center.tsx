// inertia/pages/support/help_center.tsx
import { Head, Link } from '@inertiajs/react'
import { motion } from 'motion/react'
import {
  QuestionMarkCircleIcon,
  BookOpenIcon,
  ChatBubbleLeftRightIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline'
import AppLayout from '~/components/layouts/AppLayout'
import Card from '~/components/ui/Card'
import Button from '~/components/ui/Button'
import { useTheme } from '~/hooks/useTheme'

export default function HelpCenter() {
  const { colors } = useTheme()

  const helpTopics = [
    {
      icon: BookOpenIcon,
      title: 'Comment ça marche',
      description: 'Découvrez comment utiliser la plateforme et toutes ses fonctionnalités',
      href: '/support/faq',
      color: colors.primary[500],
    },
    {
      icon: QuestionMarkCircleIcon,
      title: 'FAQ',
      description: 'Trouvez rapidement des réponses aux questions fréquentes',
      href: '/support/faq',
      color: colors.secondary[500],
    },
    {
      icon: ChatBubbleLeftRightIcon,
      title: 'Nous contacter',
      description: 'Besoin d\'aide ? Notre équipe est là pour vous',
      href: '/support/contact',
      color: colors.success[500],
    },
  ]

  const quickLinks = [
    { label: 'Inscription à un événement', href: '/events' },
    { label: 'Gérer mon profil', href: '/profile' },
    { label: 'Mes inscriptions', href: '/registrations' },
    { label: 'Politique de confidentialité', href: '/legal/privacy-policy' },
  ]

  return (
    <>
      <Head title="Centre d'aide" />
      <AppLayout>
        <div className="py-12">
          {/* Header */}
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
              Centre d'aide
            </h1>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              Nous sommes là pour vous aider. Trouvez des réponses à vos questions ou contactez notre équipe.
            </p>
          </motion.div>

          {/* Help Topics */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {helpTopics.map((topic, index) => (
              <motion.div
                key={topic.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link href={topic.href}>
                  <Card hoverable className="h-full text-center p-8 cursor-pointer">
                    <div
                      className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center"
                      style={{
                        backgroundColor: `${topic.color}15`,
                      }}
                    >
                      <topic.icon className="w-8 h-8" style={{ color: topic.color }} />
                    </div>
                    <h3 className="text-xl font-bold text-neutral-900 mb-3">{topic.title}</h3>
                    <p className="text-neutral-600">{topic.description}</p>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Quick Links Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="p-8">
              <h2 className="text-2xl font-bold text-neutral-900 mb-6">Liens rapides</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {quickLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="flex items-center gap-3 p-4 rounded-xl hover:bg-neutral-50 transition-colors"
                  >
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: colors.primary[500] }}
                    />
                    <span className="text-neutral-700 hover:text-primary-600 transition-colors">
                      {link.label}
                    </span>
                  </Link>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            className="mt-16 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="p-8 bg-linear-to-br from-primary-50 to-secondary-50">
              <h2 className="text-2xl font-bold text-neutral-900 mb-4">
                Vous ne trouvez pas ce que vous cherchez ?
              </h2>
              <p className="text-neutral-600 mb-6">
                Notre équipe est disponible pour répondre à toutes vos questions
              </p>
              <Button href="/support/contact" variant="gradient" size="lg">
                Nous contacter
              </Button>
            </Card>
          </motion.div>
        </div>
      </AppLayout>
    </>
  )
}
