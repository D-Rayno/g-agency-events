// inertia/pages/auth/resend_verification.tsx
import { Head, Link, useForm } from '@inertiajs/react'
import { motion } from 'motion/react'
import { EnvelopeIcon, ArrowRightIcon, ArrowLeftIcon } from '@heroicons/react/24/outline'
import AuthLayout from '~/components/layouts/AuthLayout'
import Input from '~/components/ui/Input'
import Button from '~/components/ui/Button'
import { useTheme } from '~/hooks/useTheme'

export default function ResendVerification() {
  const { colors } = useTheme()
  const { data, setData, post, processing } = useForm({
    email: '',
  })

  const handleSubmit = () => {
    post('/auth/resend-verification-public')
  }

  return (
    <>
      <Head title="Renvoyer l'email de vérification" />
      <AuthLayout>
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <motion.div 
            className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8 md:p-10 relative overflow-hidden"
            whileHover={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
            transition={{ duration: 0.3 }}
          >
            {/* Decorative gradient */}
            <div 
              className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl"
              style={{
                background: `linear-gradient(to right, ${colors.primary[500]}, ${colors.secondary[500]})`,
              }}
            />

            {/* Header */}
            <motion.div
              className="text-center mb-8"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <motion.div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{
                  background: `linear-gradient(135deg, ${colors.info[100]}, ${colors.info[200]})`,
                }}
              >
                <EnvelopeIcon 
                  className="w-8 h-8"
                  style={{ color: colors.info[600] }}
                />
              </motion.div>
              
              <h1 className="text-3xl font-bold text-neutral-900 mb-2">
                Email de vérification
              </h1>
              <p className="text-neutral-600">
                Vous n'avez pas reçu l'email de vérification ? Entrez votre adresse email et nous vous en enverrons un nouveau.
              </p>
            </motion.div>

            {/* Form */}
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
              >
                <Input
                  label="Adresse email"
                  type="email"
                  value={data.email}
                  onChange={(value) => setData('email', value as string)}
                  icon={EnvelopeIcon}
                  placeholder="votre.email@exemple.com"
                  required
                  autoFocus
                  disabled={processing}
                />
              </motion.div>

              {/* Submit Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
              >
                <Button
                  variant="gradient"
                  size="lg"
                  fullWidth
                  loading={processing}
                  disabled={processing}
                  onClick={handleSubmit}
                  iconRight={ArrowRightIcon}
                  className="cursor-pointer"
                >
                  Renvoyer l'email
                </Button>
              </motion.div>

              {/* Back to Login Link */}
              <motion.div
                className="text-center pt-4 border-t border-neutral-200"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.5 }}
              >
                <Link
                  href="/auth/login"
                  className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors cursor-pointer"
                >
                  <ArrowLeftIcon className="w-4 h-4" />
                  <motion.span whileHover={{ x: -3 }} className="inline-block">
                    Retour à la connexion
                  </motion.span>
                </Link>
              </motion.div>
            </div>
          </motion.div>

          {/* Info Box */}
          <motion.div
            className="mt-6 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.6 }}
          >
            <div className="bg-info-50 border border-info-200 rounded-xl p-4">
              <p className="text-sm text-info-800">
                <strong>Conseil :</strong> Vérifiez également votre dossier spam ou courrier indésirable.
              </p>
            </div>
          </motion.div>
        </motion.div>
      </AuthLayout>
    </>
  )
}
