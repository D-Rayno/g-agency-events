// inertia/pages/auth/login.tsx - ENHANCED VERSION
import { Head, Link } from '@inertiajs/react'
import { motion } from 'motion/react'
import { EnvelopeIcon, LockClosedIcon, ArrowRightIcon } from '@heroicons/react/24/outline'
import AuthLayout from '~/components/layouts/AuthLayout'
import Input from '~/components/ui/Input'
import Button from '~/components/ui/Button'
import Logo from '~/components/ui/Logo'
import { useValidatedForm } from '~/hooks/useValidatedForm'
import { loginSchema } from '~/lib/validation'
import { useRouteGuard } from '~/hooks/useRouteGuard'
import { useTheme } from '~/hooks/useTheme'

export default function Login() {
  useRouteGuard({ requiresGuest: true })
  const { colors } = useTheme()

  const { form, getError, handleBlur, submit, shouldShowError } = useValidatedForm({
    schema: loginSchema,
    initialData: {
      email: '',
      password: '',
    },
  })

  const handleSubmit = async () => {
    await submit('post', '/auth/login')
  }

  return (
    <>
      <Head title="Connexion" />
      <AuthLayout>
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8 md:p-10 relative overflow-hidden">
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
              <div className="mb-4 flex justify-center">
                <Logo size="lg" clickable={false} animate={false} />
              </div>
              
              <h1 className="text-3xl font-bold text-neutral-900 mb-2">
                Bon retour !
              </h1>
              <p className="text-neutral-600">
                Connectez-vous pour continuer
              </p>
            </motion.div>

            {/* Form Fields */}
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
              >
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
                  autoFocus
                  disabled={form.processing}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
              >
                <Input
                  label="Mot de passe"
                  type="password"
                  value={form.data.password}
                  onChange={(value) => form.setData('password', value as string)}
                  onBlur={() => handleBlur('password')}
                  error={shouldShowError('password') ? getError('password') : undefined}
                  icon={LockClosedIcon}
                  placeholder="••••••••"
                  required
                  disabled={form.processing}
                />
              </motion.div>

              {/* Forgot Password Link */}
              <motion.div
                className="flex items-center justify-end"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.5 }}
              >
                <Link
                  href="/auth/forgot-password"
                  className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors cursor-pointer"
                >
                  <motion.span whileHover={{ x: 3 }} className="inline-block">
                    Mot de passe oublié ?
                  </motion.span>
                </Link>
              </motion.div>

              {/* Submit Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.6 }}
              >
                <Button
                  variant="gradient"
                  size="lg"
                  fullWidth
                  loading={form.processing}
                  disabled={form.processing}
                  onClick={handleSubmit}
                  iconRight={ArrowRightIcon}
                  className="cursor-pointer"
                >
                  Se connecter
                </Button>
              </motion.div>

              {/* Sign Up Link */}
              <motion.div
                className="text-center pt-4 border-t border-neutral-200"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.7 }}
              >
                <p className="text-sm text-neutral-600">
                  Pas encore de compte ?{' '}
                  <Link
                    href="/auth/register"
                    className="font-semibold text-primary-600 hover:text-primary-700 transition-colors cursor-pointer"
                  >
                    <motion.span 
                      whileHover={{ x: 3 }} 
                      className="inline-block"
                    >
                      Créer un compte
                    </motion.span>
                  </Link>
                </p>
              </motion.div>
            </div>
          </div>

          {/* Additional Info */}
          <motion.div
            className="mt-6 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.8 }}
          >
            <p className="text-xs text-neutral-500">
              En vous connectant, vous acceptez nos{' '}
              <a href="#" className="text-primary-600 hover:underline cursor-pointer">
                Conditions d'utilisation
              </a>{' '}
              et notre{' '}
              <a href="#" className="text-primary-600 hover:underline cursor-pointer">
                Politique de confidentialité
              </a>
            </p>
          </motion.div>
        </motion.div>
      </AuthLayout>
    </>
  )
}