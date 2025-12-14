// inertia/pages/auth/register.tsx - ENHANCED VERSION
import { Head, Link } from '@inertiajs/react'
import { motion } from 'motion/react'
import {
  EnvelopeIcon,
  LockClosedIcon,
  UserIcon,
  MapPinIcon,
  PhoneIcon,
  CalendarIcon,
  RocketLaunchIcon,
} from '@heroicons/react/24/outline'
import AuthLayout from '~/components/layouts/AuthLayout'
import Input from '~/components/ui/Input'
import Select from '~/components/ui/Select'
import Button from '~/components/ui/Button'
import Logo from '~/components/ui/Logo'
import { useValidatedForm } from '~/hooks/useValidatedForm'
import { registerSchema } from '~/lib/validation'
import { useRouteGuard } from '~/hooks/useRouteGuard'
import { PROVINCES } from '~/lib/constants'
import { useTheme } from '~/hooks/useTheme'

export default function Register() {
  useRouteGuard({ requiresGuest: true })
  const { colors } = useTheme()

  const { form, getError, handleBlur, submit, shouldShowError } = useValidatedForm({
    schema: registerSchema,
    initialData: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      password_confirmation: '',
      age: '',
      province: '',
      commune: '',
      phoneNumber: '',
    },
  })

  const provinceOptions = PROVINCES.map((p) => ({
    value: p,
    label: p,
  }))

  const handleSubmit = async () => {
    await submit('post', '/auth/register')
  }

  return (
    <>
      <Head title="Inscription" />
      <AuthLayout>
        <motion.div
          className="w-full max-w-3xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8 md:p-10 relative overflow-hidden">
            {/* Decorative gradient */}
            <div 
              className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl"
              style={{
                background: `linear-gradient(to right, ${colors.primary[500]}, ${colors.secondary[500]}, ${colors.success[500]})`,
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
                Créer un compte
              </h1>
              <p className="text-neutral-600">
                Rejoignez notre communauté d'événements
              </p>
            </motion.div>

            {/* Form */}
            <div className="space-y-6">
              {/* Name Fields */}
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
              >
                <Input
                  label="Prénom"
                  type="text"
                  value={form.data.firstName}
                  onChange={(value) => form.setData('firstName', value as string)}
                  onBlur={() => handleBlur('firstName')}
                  error={shouldShowError('firstName') ? getError('firstName') : undefined}
                  icon={UserIcon}
                  placeholder="Jean"
                  required
                  disabled={form.processing}
                />
                <Input
                  label="Nom"
                  type="text"
                  value={form.data.lastName}
                  onChange={(value) => form.setData('lastName', value as string)}
                  onBlur={() => handleBlur('lastName')}
                  error={shouldShowError('lastName') ? getError('lastName') : undefined}
                  icon={UserIcon}
                  placeholder="Dupont"
                  required
                  disabled={form.processing}
                />
              </motion.div>

              {/* Email */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
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
                  disabled={form.processing}
                />
              </motion.div>

              {/* Password Fields */}
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.5 }}
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
                  hint="Au moins 8 caractères"
                  disabled={form.processing}
                />
                <Input
                  label="Confirmer le mot de passe"
                  type="password"
                  value={form.data.password_confirmation}
                  onChange={(value) => form.setData('password_confirmation', value as string)}
                  onBlur={() => handleBlur('password_confirmation')}
                  error={
                    shouldShowError('password_confirmation')
                      ? getError('password_confirmation')
                      : undefined
                  }
                  icon={LockClosedIcon}
                  placeholder="••••••••"
                  required
                  disabled={form.processing}
                />
              </motion.div>

              {/* Age */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.6 }}
              >
                <Input
                  label="Âge"
                  type="number"
                  value={form.data.age}
                  onChange={(value) => form.setData('age', value.toString())}
                  onBlur={() => handleBlur('age')}
                  error={shouldShowError('age') ? getError('age') : undefined}
                  icon={CalendarIcon}
                  placeholder="25"
                  required
                  min={13}
                  max={120}
                  disabled={form.processing}
                />
              </motion.div>

              {/* Location Fields */}
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.7 }}
              >
                <Select
                  label="Wilaya"
                  value={form.data.province}
                  onChange={(value) => form.setData('province', value as string)}
                  options={provinceOptions}
                  placeholder="Sélectionnez une wilaya"
                  error={shouldShowError('province') ? getError('province') : undefined}
                  required
                  searchable
                  disabled={form.processing}
                />
                <Input
                  label="Commune"
                  type="text"
                  value={form.data.commune}
                  onChange={(value) => form.setData('commune', value as string)}
                  onBlur={() => handleBlur('commune')}
                  error={shouldShowError('commune') ? getError('commune') : undefined}
                  icon={MapPinIcon}
                  placeholder="Ex: Bab Ezzouar"
                  required
                  disabled={form.processing}
                />
              </motion.div>

              {/* Phone Number */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.8 }}
              >
                <Input
                  label="Numéro de téléphone"
                  type="tel"
                  value={form.data.phoneNumber}
                  onChange={(value) => form.setData('phoneNumber', value as string)}
                  onBlur={() => handleBlur('phoneNumber')}
                  error={shouldShowError('phoneNumber') ? getError('phoneNumber') : undefined}
                  icon={PhoneIcon}
                  placeholder="+213 555 123 456"
                  hint="Optionnel"
                  disabled={form.processing}
                />
              </motion.div>

              {/* Submit Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.9 }}
              >
                <Button
                  variant="gradient"
                  size="lg"
                  fullWidth
                  loading={form.processing}
                  disabled={form.processing}
                  onClick={handleSubmit}
                  iconLeft={RocketLaunchIcon}
                  className="cursor-pointer"
                >
                  Créer mon compte
                </Button>
              </motion.div>

              {/* Login Link */}
              <motion.div
                className="text-center pt-4 border-t border-neutral-200"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 1.0 }}
              >
                <p className="text-sm text-neutral-600">
                  Vous avez déjà un compte ?{' '}
                  <Link
                    href="/auth/login"
                    className="font-semibold text-primary-600 hover:text-primary-700 transition-colors cursor-pointer"
                  >
                    <motion.span 
                      whileHover={{ x: 3 }} 
                      className="inline-block"
                    >
                      Se connecter
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
            transition={{ duration: 0.4, delay: 1.1 }}
          >
            <p className="text-xs text-neutral-500">
              En créant un compte, vous acceptez nos{' '}
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