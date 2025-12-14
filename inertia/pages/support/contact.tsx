// inertia/pages/support/contact.tsx
import { Head } from '@inertiajs/react'
import { motion } from 'motion/react'
import {
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  UserIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline'
import AppLayout from '~/components/layouts/AppLayout'
import Card from '~/components/ui/Card'
import Input from '~/components/ui/Input'
import TextArea from '~/components/ui/TextArea'
import Button from '~/components/ui/Button'
import { useValidatedForm } from '~/hooks/useValidatedForm'
import { useTheme } from '~/hooks/useTheme'
import * as yup from 'yup'

const contactSchema = yup.object({
  name: yup.string().min(2, 'Le nom doit contenir au moins 2 caractères').required('Le nom est requis'),
  email: yup.string().email('Adresse email invalide').required('L\'email est requis'),
  subject: yup.string().min(5, 'Le sujet doit contenir au moins 5 caractères').required('Le sujet est requis'),
  message: yup.string().min(10, 'Le message doit contenir au moins 10 caractères').required('Le message est requis'),
})

export default function Contact() {
  const { colors } = useTheme()

  const { form, getError, handleBlur, submit, shouldShowError } = useValidatedForm({
    schema: contactSchema,
    initialData: {
      name: '',
      email: '',
      subject: '',
      message: '',
    },
  })

  const handleSubmit = async () => {
    await submit('post', '/support/contact')
  }

  const contactInfo = [
    {
      icon: EnvelopeIcon,
      label: 'Email',
      value: 'support@example.dz',
      color: colors.primary[500],
    },
    {
      icon: PhoneIcon,
      label: 'Téléphone',
      value: '+213 555 123 456',
      color: colors.secondary[500],
    },
    {
      icon: MapPinIcon,
      label: 'Adresse',
      value: 'Alger, Algérie',
      color: colors.success[500],
    },
  ]

  return (
    <>
      <Head title="Nous contacter" />
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
              Nous contacter
            </h1>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              Une question ? Une suggestion ? Notre équipe est à votre écoute.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Contact Info */}
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {contactInfo.map((info, index) => (
                <motion.div
                  key={info.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                >
                  <Card className="p-6">
                    <div className="flex items-start gap-4">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${info.color}15` }}
                      >
                        <info.icon className="w-6 h-6" style={{ color: info.color }} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-neutral-900 mb-1">{info.label}</h3>
                        <p className="text-neutral-600">{info.value}</p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}

              <Card className="p-6 bg-linear-to-br from-primary-50 to-secondary-50">
                <h3 className="font-bold text-neutral-900 mb-2">Heures d'ouverture</h3>
                <p className="text-sm text-neutral-600 mb-2">Lundi - Vendredi</p>
                <p className="text-sm font-semibold text-neutral-900">9h00 - 18h00</p>
              </Card>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              className="lg:col-span-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="p-8">
                <h2 className="text-2xl font-bold text-neutral-900 mb-6">Envoyez-nous un message</h2>
                
                <div className="space-y-6">
                  <Input
                    label="Nom complet"
                    type="text"
                    value={form.data.name}
                    onChange={(value) => form.setData('name', value as string)}
                    onBlur={() => handleBlur('name')}
                    error={shouldShowError('name') ? getError('name') : undefined}
                    icon={UserIcon}
                    placeholder="Votre nom"
                    required
                    disabled={form.processing}
                  />

                  <Input
                    label="Adresse email"
                    type="email"
                    value={form.data.email}
                    onChange={(value) => form.setData('email', value as string)}
                    onBlur={() => handleBlur('email')}
                    error={shouldShowError('email') ? getError('email') : undefined}
                    icon={EnvelopeIcon}
                    placeholder="votre.email@exemple.com"
                    required
                    disabled={form.processing}
                  />

                  <Input
                    label="Sujet"
                    type="text"
                    value={form.data.subject}
                    onChange={(value) => form.setData('subject', value as string)}
                    onBlur={() => handleBlur('subject')}
                    error={shouldShowError('subject') ? getError('subject') : undefined}
                    icon={ChatBubbleLeftRightIcon}
                    placeholder="De quoi souhaitez-vous parler ?"
                    required
                    disabled={form.processing}
                  />

                  <TextArea
                    label="Message"
                    value={form.data.message}
                    onChange={(value) => form.setData('message', value)}
                    onBlur={() => handleBlur('message')}
                    error={shouldShowError('message') ? getError('message') : undefined}
                    placeholder="Décrivez votre question ou suggestion en détail..."
                    required
                    rows={6}
                    disabled={form.processing}
                  />

                  <Button
                    variant="gradient"
                    size="lg"
                    fullWidth
                    loading={form.processing}
                    disabled={form.processing}
                    onClick={handleSubmit}
                  >
                    Envoyer le message
                  </Button>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </AppLayout>
    </>
  )
}
