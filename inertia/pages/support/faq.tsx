// inertia/pages/support/faq.tsx
import { Head } from '@inertiajs/react'
import { motion, AnimatePresence } from 'motion/react'
import { useState } from 'react'
import { ChevronDownIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import AppLayout from '~/components/layouts/AppLayout'
import Card from '~/components/ui/Card'
import Input from '~/components/ui/Input'
import Badge from '~/components/ui/Badge'
import { useTheme } from '~/hooks/useTheme'

interface FAQItem {
  question: string
  answer: string
  category: string
}

export default function FAQ() {
  const { colors } = useTheme()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Tous')
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const categories = ['Tous', 'Inscription', 'Événements', 'Compte', 'Paiement', 'Technique']

  const faqItems: FAQItem[] = [
    {
      category: 'Inscription',
      question: 'Comment m\'inscrire à un événement ?',
      answer: 'Pour vous inscrire à un événement, rendez-vous sur la page de l\'événement qui vous intéresse et cliquez sur le bouton "S\'inscrire". Vous devrez être connecté à votre compte. Suivez ensuite les étapes pour compléter votre inscription. Vous recevrez un email de confirmation avec votre QR code.',
    },
    {
      category: 'Inscription',
      question: 'Puis-je annuler mon inscription ?',
      answer: 'Oui, vous pouvez annuler votre inscription jusqu\'à 48 heures avant le début de l\'événement. Pour ce faire, rendez-vous dans la section "Mes inscriptions", sélectionnez l\'événement concerné et cliquez sur "Annuler l\'inscription".',
    },
    {
      category: 'Événements',
      question: 'Comment trouver des événements près de chez moi ?',
      answer: 'Sur la page "Événements", vous pouvez filtrer les événements par wilaya. Sélectionnez votre région dans le menu de filtrage pour voir uniquement les événements organisés dans votre région.',
    },
    {
      category: 'Événements',
      question: 'Les événements sont-ils tous gratuits ?',
      answer: 'Non, certains événements peuvent être payants. Le prix est clairement indiqué sur la page de chaque événement. Vous verrez le montant avant de confirmer votre inscription.',
    },
    {
      category: 'Compte',
      question: 'Comment créer un compte ?',
      answer: 'Cliquez sur le bouton "S\'inscrire" en haut à droite de la page. Remplissez le formulaire avec vos informations personnelles (nom, prénom, email, etc.). Vous recevrez un email de vérification pour activer votre compte.',
    },
    {
      category: 'Compte',
      question: 'J\'ai oublié mon mot de passe, que faire ?',
      answer: 'Sur la page de connexion, cliquez sur "Mot de passe oublié ?". Entrez votre adresse email et vous recevrez un lien pour réinitialiser votre mot de passe.',
    },
    {
      category: 'Compte',
      question: 'Comment modifier mes informations personnelles ?',
      answer: 'Une fois connecté, accédez à votre profil en cliquant sur votre nom en haut à droite, puis sélectionnez "Mon profil". Vous pourrez y modifier vos informations personnelles.',
    },
    {
      category: 'Paiement',
      question: 'Quels sont les moyens de paiement acceptés ?',
      answer: 'Nous acceptons les paiements par carte bancaire (CIB, Visa, Mastercard) et certains portefeuilles électroniques. Les options disponibles s\'affichent lors du processus de paiement.',
    },
    {
      category: 'Paiement',
      question: 'Mes informations de paiement sont-elles sécurisées ?',
      answer: 'Absolument. Toutes les transactions sont sécurisées et cryptées. Nous ne stockons jamais vos informations de paiement complètes sur nos serveurs.',
    },
    {
      category: 'Technique',
      question: 'Je n\'ai pas reçu mon QR code, que faire ?',
      answer: 'Vérifiez d\'abord vos spams. Si vous ne trouvez toujours pas l\'email, rendez-vous dans "Mes inscriptions", sélectionnez l\'événement concerné et cliquez sur "Renvoyer le QR code".',
    },
    {
      category: 'Technique',
      question: 'Le site ne fonctionne pas correctement, que faire ?',
      answer: 'Essayez d\'abord de vider le cache de votre navigateur et de rafraîchir la page. Si le problème persiste, contactez notre support technique via la page de contact en décrivant le problème rencontré.',
    },
  ]

  const filteredFAQs = faqItems.filter((item) => {
    const matchesCategory = selectedCategory === 'Tous' || item.category === selectedCategory
    const matchesSearch =
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const toggleOpen = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <>
      <Head title="Questions fréquentes" />
      <AppLayout>
        <div className="py-12">
          {/* Header */}
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
              Questions fréquentes
            </h1>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              Trouvez rapidement des réponses à vos questions
            </p>
          </motion.div>

          {/* Search */}
          <motion.div
            className="max-w-2xl mx-auto mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Input
              type="text"
              value={searchQuery}
              onChange={(value) => setSearchQuery(value as string)}
              icon={MagnifyingGlassIcon}
              placeholder="Rechercher une question..."
            />
          </motion.div>

          {/* Categories */}
          <motion.div
            className="flex flex-wrap gap-3 justify-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className="focus:outline-none"
              >
                <Badge
                  variant={selectedCategory === category ? 'primary' : 'neutral'}
                  size="lg"
                  className="cursor-pointer"
                >
                  {category}
                </Badge>
              </button>
            ))}
          </motion.div>

          {/* FAQ Items */}
          <motion.div
            className="max-w-4xl mx-auto space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {filteredFAQs.length > 0 ? (
              filteredFAQs.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card className="overflow-hidden">
                    <button
                      onClick={() => toggleOpen(index)}
                      className="w-full text-left focus:outline-none"
                    >
                      <div className="p-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <Badge variant="info" size="sm">
                                {item.category}
                              </Badge>
                            </div>
                            <h3 className="text-lg font-semibold text-neutral-900">
                              {item.question}
                            </h3>
                          </div>
                          <motion.div
                            animate={{ rotate: openIndex === index ? 180 : 0 }}
                            transition={{ duration: 0.3 }}
                            className="shrink-0"
                          >
                            <ChevronDownIcon
                              className="w-5 h-5"
                              style={{ color: colors.neutral[600] }}
                            />
                          </motion.div>
                        </div>

                        <AnimatePresence>
                          {openIndex === index && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="overflow-hidden"
                            >
                              <div className="pt-4 mt-4 border-t border-neutral-200">
                                <p className="text-neutral-700 leading-relaxed">{item.answer}</p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </button>
                  </Card>
                </motion.div>
              ))
            ) : (
              <Card className="p-12 text-center">
                <p className="text-neutral-600">
                  Aucune question trouvée pour "{searchQuery}" dans la catégorie "{selectedCategory}"
                </p>
              </Card>
            )}
          </motion.div>

          {/* Contact CTA */}
          <motion.div
            className="mt-16 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="p-8 max-w-2xl mx-auto bg-linear-to-br from-primary-50 to-secondary-50">
              <h2 className="text-2xl font-bold text-neutral-900 mb-4">
                Vous ne trouvez pas votre réponse ?
              </h2>
              <p className="text-neutral-600 mb-6">
                Notre équipe est là pour vous aider
              </p>
              <a
                href="/support/contact"
                className="inline-flex items-center justify-center px-6 py-3 rounded-xl font-semibold text-white transition-all hover:scale-105"
                style={{
                  background: `linear-gradient(135deg, ${colors.primary[500]}, ${colors.secondary[500]})`,
                }}
              >
                Contactez-nous
              </a>
            </Card>
          </motion.div>
        </div>
      </AppLayout>
    </>
  )
}
