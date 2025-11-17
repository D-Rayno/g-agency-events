// inertia/pages/home.tsx - REFINED VERSION
import { Head } from '@inertiajs/react'
import {
  CalendarIcon,
  MapPinIcon,
  UsersIcon,
  SparklesIcon as SparklesOutlineIcon,
  ArrowRightIcon,
  RocketLaunchIcon,
  StarIcon,
  BoltIcon,
  HeartIcon,
  TrophyIcon,
} from '@heroicons/react/24/outline'
import { SparklesIcon as SparklesSolidIcon } from '@heroicons/react/24/solid'
import AppLayout from '~/components/layouts/AppLayout'
import Button from '~/components/ui/Button'
import Card from '~/components/ui/Card'
import Badge from '~/components/ui/Badge'
import { useTheme } from '~/hooks/useTheme'
import { useAuthStore } from '~/stores/auth'
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'motion/react'
import { useRef } from 'react'

export default function Home() {
  const { config, appName, appTagline, colors } = useTheme()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated())
  const user = useAuthStore((s) => s.user)

  const heroRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  })

  const heroY = useTransform(scrollYProgress, [0, 1], [0, 300])

  const features = [
    {
      icon: CalendarIcon,
      title: 'Événements variés',
      description: "Des conférences aux concerts, trouvez l'événement parfait pour vous",
      gradient: `linear-gradient(135deg, ${colors.primary[400]}, ${colors.primary[600]})`,
      iconColor: colors.primary[500],
    },
    {
      icon: MapPinIcon,
      title: 'Partout en Algérie',
      description: 'Découvrez des événements dans toutes les wilayas du pays',
      gradient: `linear-gradient(135deg, ${colors.secondary[400]}, ${colors.secondary[600]})`,
      iconColor: colors.secondary[500],
    },
    {
      icon: UsersIcon,
      title: 'Communauté active',
      description: 'Rejoignez des milliers de participants passionnés',
      gradient: `linear-gradient(135deg, ${colors.warning[400]}, ${colors.error[500]})`,
      iconColor: colors.warning[500],
    },
    {
      icon: SparklesOutlineIcon,
      title: 'Inscription facile',
      description: 'Réservez votre place en quelques clics avec QR code',
      gradient: `linear-gradient(135deg, ${colors.success[400]}, ${colors.success[600]})`,
      iconColor: colors.success[500],
    },
  ]

  const benefits = [
    { text: 'Inscription rapide et sécurisée', icon: BoltIcon },
    { text: 'Codes QR pour un accès facile', icon: SparklesOutlineIcon },
    { text: 'Notifications pour vos événements', icon: HeartIcon },
    { text: 'Gérez vos inscriptions', icon: CalendarIcon },
    { text: 'Support 24/7', icon: StarIcon },
    { text: 'Paiement sécurisé', icon: TrophyIcon },
  ]

  const stats = [
    {
      label: 'Événements',
      value: '500+',
      icon: CalendarIcon,
      color: colors.primary[500],
      description: 'Événements organisés',
    },
    {
      label: 'Participants',
      value: '10K+',
      icon: UsersIcon,
      color: colors.secondary[500],
      description: 'Utilisateurs actifs',
    },
    {
      label: 'Villes',
      value: '48',
      icon: MapPinIcon,
      color: colors.success[500],
      description: 'Villes couvertes',
    },
  ]

  return (
    <>
      <Head>
        <title>{config.seo.defaultTitle}</title>
        <meta name="description" content={config.seo.description} />
        <meta name="keywords" content={config.seo.keywords.join(', ')} />
      </Head>

      <AppLayout layout="full" showHeader={true} showFooter={true}>
        {/* ENHANCED HERO SECTION - FULL WIDTH */}
        <section
          ref={heroRef}
          className="relative w-full min-h-screen flex items-center justify-center overflow-hidden"
        >
          {/* Background Image with Parallax */}
          <motion.div className="absolute inset-0 z-0" style={{ y: heroY }}>
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: `url(${config.images.banner.home})`,
              }}
            />
            {/* Dark gradient overlay for better text readability */}
            <div className="absolute inset-0 bg-linear-to-b from-black/60 via-black/50 to-black/70" />

            {/* Animated gradient overlay */}
            <motion.div
              className="absolute inset-0"
              style={{
                background: `radial-gradient(circle at 50% 50%, ${colors.primary[500]}15, transparent 70%)`,
              }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          </motion.div>

          {/* Animated Grid Pattern */}
          <div className="absolute inset-0 z-1 opacity-[0.03]">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `linear-gradient(${colors.primary[500]} 1.5px, transparent 1.5px), linear-gradient(90deg, ${colors.primary[500]} 1.5px, transparent 1.5px)`,
                backgroundSize: '60px 60px',
              }}
            />
          </div>

          {/* Floating Particles */}
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white rounded-full opacity-20 z-1 pointer-events-none"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.2, 0.5, 0.2],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
                ease: 'easeInOut',
              }}
            />
          ))}

          {/* Main Content */}
          <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center">
            {/* Welcome Badge */}
            <AnimatePresence>
              {isAuthenticated && user && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="mb-8"
                >
                  <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.3 }}>
                    <Badge variant="success" size="lg" pulse className="cursor-default">
                      <SparklesSolidIcon className="w-5 h-5" />
                      Bienvenue, {user.firstName}! 🎉
                    </Badge>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Main Title */}
            <motion.h1
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-6 leading-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <motion.span
                className="inline-block cursor-default"
                whileHover={{
                  scale: 1.05,
                  textShadow: `0 0 30px ${colors.primary[400]}`,
                }}
                transition={{ duration: 0.3 }}
              >
                {appName}
              </motion.span>
            </motion.h1>

            {/* Tagline */}
            <motion.p
              className="text-xl sm:text-2xl md:text-3xl text-white/95 mb-12 max-w-4xl mx-auto font-light leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              {appTagline}
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <Button
                href="/events"
                variant="info"
                size="xl"
                iconRight={ArrowRightIcon}
                flipOnHover
                flipDirection="right"
                flipBackText="Explorez maintenant ✨"
                shadow="xl"
              >
                Découvrir les événements
              </Button>

              {!isAuthenticated && (
                <Button
                  href="/auth/register"
                  size="xl"
                  variant="outline"
                  iconLeft={RocketLaunchIcon}
                  flipOnHover
                  flipDirection="top"
                  flipBackText="Rejoignez-nous 🚀"
                  shadow="lg"
                >
                  Créer un compte
                </Button>
              )}

              {isAuthenticated && (
                <Button
                  href="/registrations"
                  variant="secondary"
                  size="xl"
                  iconLeft={CalendarIcon}
                  flipOnHover
                  flipDirection="left"
                  flipBackText="Voir mes événements 📅"
                  shadow="lg"
                >
                  Mes inscriptions
                </Button>
              )}
            </motion.div>

            {/* Scroll Indicator */}
            <motion.div
              className="absolute bottom-8 left-1/2 transform -translate-x-1/2 cursor-pointer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.8 }}
              whileHover={{ scale: 1.1 }}
              onClick={() => window.scrollBy({ top: window.innerHeight, behavior: 'smooth' })}
            >
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-white/80 flex flex-col items-center gap-2"
              >
                <span className="text-sm font-medium">Découvrez plus</span>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                  />
                </svg>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-32 bg-linear-to-b from-white to-neutral-50 relative overflow-hidden">
          {/* Background Decorations */}
          <motion.div
            className="absolute top-0 left-0 w-96 h-96 rounded-full blur-3xl opacity-10 pointer-events-none"
            style={{ background: colors.primary[300] }}
            animate={{
              scale: [1, 1.2, 1],
              x: [0, 50, 0],
              y: [0, 30, 0],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute bottom-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-10 pointer-events-none"
            style={{ background: colors.secondary[300] }}
            animate={{
              scale: [1.2, 1, 1.2],
              x: [0, -50, 0],
              y: [0, -30, 0],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div
              className="text-center mb-20"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6 }}
            >
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
              >
                <Badge variant="primary" size="lg" className="mb-6 cursor-default">
                  <StarIcon className="w-5 h-5" />
                  Pourquoi nous choisir
                </Badge>
              </motion.div>

              <h2 className="text-5xl md:text-6xl font-bold text-neutral-900 mb-6">
                Pourquoi choisir {appName}?
              </h2>
              <p className="text-xl text-neutral-600 max-w-3xl mx-auto leading-relaxed">
                Découvrez tous les avantages de notre plateforme d'événements moderne et intuitive
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <FeatureCard key={feature.title} feature={feature} index={index} />
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section
          className="py-24 relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${colors.primary[50]}, ${colors.secondary[50]}, ${colors.primary[50]})`,
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-12">
              {stats.map((stat, index) => (
                <StatCard key={stat.label} stat={stat} index={index} />
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-32 bg-white overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-20 items-center">
              <motion.div
                initial={{ opacity: 0, x: -80 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.8 }}
              >
                <Badge variant="info" size="lg" className="mb-6 cursor-default">
                  <HeartIcon className="w-5 h-5" />
                  Avantages
                </Badge>

                <h2 className="text-5xl md:text-6xl font-bold text-neutral-900 mb-6 leading-tight">
                  Découvrez la meilleure plateforme d'événements
                </h2>
                <p className="text-xl text-neutral-700 mb-12 leading-relaxed">
                  Rejoignez des milliers d'utilisateurs satisfaits qui font confiance à {appName}{' '}
                  pour leurs besoins en événements.
                </p>

                <div className="space-y-5 mb-12">
                  {benefits.map((benefit, index) => (
                    <BenefitItem
                      key={benefit.text}
                      benefit={benefit}
                      index={index}
                      colors={colors}
                    />
                  ))}
                </div>

                {!isAuthenticated ? (
                  <Button
                    href="/auth/register"
                    variant="gradient"
                    size="xl"
                    iconLeft={SparklesSolidIcon}
                    flipOnHover
                    flipDirection="right"
                    flipBackText="Commencer maintenant ✨"
                    shadow="xl"
                  >
                    Commencer gratuitement
                  </Button>
                ) : (
                  <Button
                    href="/events"
                    variant="gradient"
                    size="xl"
                    iconRight={ArrowRightIcon}
                    flipOnHover
                    flipDirection="right"
                    flipBackText="Voir les événements 🎉"
                    shadow="xl"
                  >
                    Explorer les événements
                  </Button>
                )}
              </motion.div>

              <ImageShowcase config={config} colors={colors} />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <CTASection isAuthenticated={isAuthenticated} colors={colors} />

        {/* Contact Section */}
        <ContactSection config={config} colors={colors} />

        {/* Trust Badges */}
        <TrustBadges colors={colors} />

        {/* Final CTA */}
        <FinalCTA isAuthenticated={isAuthenticated} appName={appName} colors={colors} />
      </AppLayout>
    </>
  )
}

// Feature Card Component
interface FeatureCardProps {
  feature: {
    icon: React.ComponentType<{ className?: string }>
    title: string
    description: string
    gradient: string
    iconColor: string
  }
  index: number
}

function FeatureCard({ feature, index }: FeatureCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * 0.15, duration: 0.5 }}
    >
      <motion.div whileHover={{ y: -10 }} transition={{ duration: 0.3 }}>
        <Card
          hoverable
          className="h-full text-center p-8 border-2 border-transparent hover:border-current transition-all duration-300"
        >
          <motion.div
            className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center shadow-xl cursor-pointer"
            style={{ background: feature.gradient }}
            whileHover={{
              scale: 1.15,
              rotate: [0, -5, 5, -5, 0],
              boxShadow: `0 25px 50px -10px ${feature.iconColor}60`,
            }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <feature.icon className="w-10 h-10 text-white" />
          </motion.div>
          <h3 className="text-2xl font-bold text-neutral-900 mb-4">{feature.title}</h3>
          <p className="text-neutral-600 leading-relaxed">{feature.description}</p>
        </Card>
      </motion.div>
    </motion.div>
  )
}

// Stat Card Component
interface StatCardProps {
  stat: {
    label: string
    value: string
    icon: React.ComponentType<{ className?: string }>
    color: string
    description: string
  }
  index: number
}

function StatCard({ stat, index }: StatCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, amount: 0.5 })

  return (
    <motion.div
      ref={ref}
      className="text-center cursor-default"
      initial={{ opacity: 0, scale: 0.5 }}
      animate={isInView ? { opacity: 1, scale: 1 } : {}}
      transition={{
        delay: index * 0.2,
        type: 'spring',
        stiffness: 200,
      }}
    >
      <motion.div
        className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-white shadow-2xl mb-6 relative cursor-pointer"
        whileHover={{
          scale: 1.15,
          rotate: 360,
          boxShadow: `0 30px 60px -15px ${stat.color}50`,
        }}
        transition={{ duration: 0.6 }}
      >
        <stat.icon className="w-12 h-12" />
        <motion.div
          className="absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg"
          style={{ background: stat.color }}
          whileHover={{ scale: 1.3, rotate: 360 }}
          transition={{ duration: 0.3 }}
        >
          ✓
        </motion.div>
      </motion.div>

      <motion.h3
        className="text-6xl font-bold text-neutral-900 mb-2"
        initial={{ scale: 0 }}
        animate={isInView ? { scale: 1 } : {}}
        transition={{
          type: 'spring',
          stiffness: 200,
          delay: index * 0.2 + 0.3,
        }}
        style={{ color: stat.color }}
      >
        {stat.value}
      </motion.h3>
      <p className="text-neutral-900 text-xl font-semibold mb-2">{stat.label}</p>
      <p className="text-neutral-600">{stat.description}</p>
    </motion.div>
  )
}

// Benefit Item Component
interface BenefitItemProps {
  benefit: {
    text: string
    icon: React.ComponentType<{ className?: string }>
  }
  index: number
  colors: any
}

function BenefitItem({ benefit, index, colors }: BenefitItemProps) {
  return (
    <motion.div
      className="flex items-start gap-4 cursor-pointer"
      initial={{ opacity: 0, x: -30 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      viewport={{ once: true, amount: 0.5 }}
      whileHover={{ x: 10 }}
    >
      <motion.div
        className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-lg cursor-pointer"
        style={{
          background: `linear-gradient(135deg, ${colors.success[400]}, ${colors.success[600]})`,
        }}
        whileHover={{ scale: 1.15, rotate: 5 }}
        transition={{ duration: 0.3 }}
      >
        <benefit.icon className="w-6 h-6 text-white" />
      </motion.div>
      <div className="pt-2">
        <span className="text-lg font-semibold text-neutral-800">{benefit.text}</span>
      </div>
    </motion.div>
  )
}

// Image Showcase Component
interface ImageShowcaseProps {
  config: any
  colors: any
}

function ImageShowcase({ config, colors }: ImageShowcaseProps) {
  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, x: 80 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.8 }}
    >
      <motion.div
        className="relative z-10 cursor-pointer"
        whileHover={{ scale: 1.03 }}
        transition={{ duration: 0.4 }}
      >
        <img
          src={config.images.placeholder.event}
          alt="Plateforme d'événements"
          className="rounded-3xl shadow-2xl"
        />

        {/* Floating Badge */}
        <motion.div
          className="absolute -top-6 -right-6 bg-white rounded-2xl shadow-2xl p-6 cursor-pointer"
          initial={{ opacity: 0, scale: 0 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          viewport={{ once: true }}
          whileHover={{ scale: 1.1, rotate: 5 }}
        >
          <div className="text-center">
            <div className="text-4xl font-bold" style={{ color: colors.primary[600] }}>
              4.9
            </div>
            <div className="flex gap-1 my-2">
              {[...Array(5)].map((_, i) => (
                <StarIcon
                  key={i}
                  className="w-4 h-4 fill-current"
                  style={{ color: colors.warning[500] }}
                />
              ))}
            </div>
            <div className="text-xs text-neutral-600">10K+ avis</div>
          </div>
        </motion.div>
      </motion.div>

      {/* Background Blobs */}
      <motion.div
        className="absolute -bottom-16 -left-16 w-80 h-80 rounded-full blur-3xl opacity-30 pointer-events-none"
        style={{ background: colors.primary[300] }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.2, 0.3],
        }}
        transition={{ duration: 5, repeat: Infinity }}
      />
      <motion.div
        className="absolute -top-16 -right-16 w-80 h-80 rounded-full blur-3xl opacity-30 pointer-events-none"
        style={{ background: colors.secondary[300] }}
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.2, 0.3, 0.2],
        }}
        transition={{ duration: 5, repeat: Infinity }}
      />
    </motion.div>
  )
}

// CTA Section Component
interface CTASectionProps {
  isAuthenticated: boolean
  colors: any
}

function CTASection({ isAuthenticated, colors }: CTASectionProps) {
  return (
    <section
      className="py-32 text-white relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${colors.primary[600]}, ${colors.primary[700]}, ${colors.secondary[600]})`,
      }}
    >
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-32 h-32 border-2 border-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            <Badge
              variant="neutral"
              size="lg"
              className="mb-8 bg-white/20 backdrop-blur-sm cursor-default"
            >
              <RocketLaunchIcon className="w-5 h-5" />
              Rejoignez-nous
            </Badge>
          </motion.div>

          <h2 className="text-5xl md:text-6xl font-bold mb-8 leading-tight">
            Prêt à découvrir des événements incroyables?
          </h2>
          <p className="text-2xl text-white/90 mb-14 max-w-3xl mx-auto leading-relaxed">
            Rejoignez notre communauté dès aujourd'hui et ne manquez plus jamais un événement près
            de chez vous.
          </p>

          <motion.div
            className="flex flex-col sm:flex-row gap-6 justify-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            {!isAuthenticated ? (
              <>
                <Button
                  href="/auth/register"
                  bgColor="#ffffff"
                  textColor={colors.primary[600]}
                  size="xl"
                  iconLeft={RocketLaunchIcon}
                  flipOnHover
                  flipDirection="top"
                  flipBackText="Commencez maintenant 🚀"
                  shadow="xl"
                >
                  S'inscrire gratuitement
                </Button>
                <Button
                  href="/events"
                  variant="gradient"
                  size="xl"
                  iconRight={ArrowRightIcon}
                  flipOnHover
                  flipDirection="bottom"
                  flipBackText="Découvrez-les 🎉"
                  shadow="lg"
                >
                  Voir les événements
                </Button>
              </>
            ) : (
              <Button
                href="/events"
                bgColor="#ffffff"
                textColor={colors.primary[600]}
                size="xl"
                iconRight={ArrowRightIcon}
                flipOnHover
                flipDirection="right"
                flipBackText="Explorez maintenant 🎊"
                shadow="xl"
              >
                Explorer les événements
              </Button>
            )}
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

// Contact Section Component
interface ContactSectionProps {
  config: any
  colors: any
}

function ContactSection({ config, colors }: ContactSectionProps) {
  const contactCards = [
    {
      icon: '✉️',
      title: 'Email',
      value: config.contact.email,
      href: `mailto:${config.contact.email}`,
      buttonText: 'Nous contacter',
      flipText: 'Envoyez-nous un email 📧',
      gradient: `linear-gradient(135deg, ${colors.primary[400]}, ${colors.primary[600]})`,
    },
    {
      icon: '📱',
      title: 'Téléphone',
      value: config.contact.phone,
      href: `tel:${config.contact.phone}`,
      buttonText: 'Appeler',
      flipText: 'Appelez-nous 📞',
      gradient: `linear-gradient(135deg, ${colors.secondary[400]}, ${colors.secondary[600]})`,
    },
    {
      icon: '📍',
      title: 'Adresse',
      value: config.contact.address,
      href: '#',
      buttonText: 'Nous visiter',
      flipText: 'Visitez-nous 🗺️',
      gradient: `linear-gradient(135deg, ${colors.success[400]}, ${colors.success[600]})`,
    },
  ]

  return (
    <section className="py-32 bg-linear-to-b from-neutral-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
        >
          <Badge variant="primary" size="lg" className="mb-6 cursor-default">
            <HeartIcon className="w-5 h-5" />
            Contactez-nous
          </Badge>
          <h2 className="text-5xl font-bold text-neutral-900 mb-4">Nous sommes là pour vous</h2>
          <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
            Une question ? N'hésitez pas à nous contacter
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {contactCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: index * 0.1 }}
            >
              <motion.div whileHover={{ y: -10 }} transition={{ duration: 0.3 }}>
                <Card hoverable className="text-center h-full p-8">
                  <motion.div
                    className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center text-5xl shadow-xl cursor-pointer"
                    style={{ background: card.gradient }}
                    whileHover={{
                      scale: 1.15,
                      rotate: [0, -10, 10, 0],
                    }}
                    transition={{ duration: 0.5 }}
                  >
                    {card.icon}
                  </motion.div>
                  <h3 className="text-2xl font-bold text-neutral-900 mb-3">{card.title}</h3>
                  <p className="text-neutral-600 mb-6 text-lg">{card.value}</p>
                  <Button
                    href={card.href}
                    variant="ghost"
                    size="md"
                    flipOnHover
                    flipDirection="right"
                    flipBackText={card.flipText}
                  >
                    {card.buttonText}
                  </Button>
                </Card>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Social Proof Section */}
        <motion.div
          className="mt-20 text-center"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ delay: 0.4 }}
        >
          <motion.div
            className="inline-flex items-center gap-4 px-8 py-4 rounded-full shadow-xl cursor-pointer"
            style={{
              background: `linear-gradient(135deg, ${colors.primary[50]}, ${colors.secondary[50]})`,
            }}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex -space-x-3">
              {[...Array(4)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-12 h-12 rounded-full border-4 border-white shadow-lg flex items-center justify-center font-bold text-white cursor-pointer"
                  style={{
                    background: `linear-gradient(135deg, ${colors.primary[400 + i * 100]}, ${colors.secondary[400 + i * 100]})`,
                  }}
                  whileHover={{ scale: 1.3, zIndex: 10 }}
                  transition={{ duration: 0.3 }}
                >
                  {String.fromCharCode(65 + i)}
                </motion.div>
              ))}
            </div>
            <div className="text-left">
              <div className="font-bold text-neutral-900 text-lg">
                +10,000 utilisateurs satisfaits
              </div>
              <div className="flex items-center gap-1 text-sm text-neutral-600">
                <span className="flex">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon
                      key={i}
                      className="w-4 h-4 fill-current"
                      style={{ color: colors.warning[500] }}
                    />
                  ))}
                </span>
                <span className="ml-1">4.9/5 étoiles</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

// Trust Badges Component
interface TrustBadgesProps {
  colors: any
}

function TrustBadges({ colors }: TrustBadgesProps) {
  const badges = [
    { icon: '🔒', title: 'Paiement sécurisé', desc: '100% sûr' },
    { icon: '⚡', title: 'Inscription rapide', desc: 'En 2 minutes' },
    { icon: '🎯', title: 'Support 24/7', desc: 'Toujours là' },
    { icon: '💎', title: 'Qualité garantie', desc: 'Événements vérifiés' },
  ]

  return (
    <section
      className="py-20 relative overflow-hidden"
      style={{
        background: `linear-gradient(to right, ${colors.primary[600]}, ${colors.secondary[600]})`,
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="grid md:grid-cols-4 gap-8 text-white text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
        >
          {badges.map((badge, index) => (
            <motion.div
              key={badge.title}
              className="cursor-default"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.08, y: -5 }}
            >
              <motion.div
                className="text-5xl mb-3"
                whileHover={{ scale: 1.2, rotate: [0, -10, 10, 0] }}
                transition={{ duration: 0.5 }}
              >
                {badge.icon}
              </motion.div>
              <div className="font-bold text-xl mb-1">{badge.title}</div>
              <div className="text-white/80">{badge.desc}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

// Final CTA Component
interface FinalCTAProps {
  isAuthenticated: boolean
  appName: string
  colors: any
}

function FinalCTA({ isAuthenticated, appName, colors }: FinalCTAProps) {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="rounded-3xl p-12 text-center relative overflow-hidden shadow-2xl"
          style={{
            background: `linear-gradient(135deg, ${colors.neutral[900]}, ${colors.neutral[800]})`,
          }}
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          {/* Animated Background Shapes */}
          <motion.div
            className="absolute top-0 left-0 w-64 h-64 rounded-full opacity-20 pointer-events-none"
            style={{ background: colors.primary[500] }}
            animate={{
              x: [0, 50, 0],
              y: [0, 30, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{ duration: 5, repeat: Infinity }}
          />
          <motion.div
            className="absolute bottom-0 right-0 w-64 h-64 rounded-full opacity-20 pointer-events-none"
            style={{ background: colors.secondary[500] }}
            animate={{
              x: [0, -50, 0],
              y: [0, -30, 0],
              scale: [1.1, 1, 1.1],
            }}
            transition={{ duration: 5, repeat: Infinity }}
          />

          <div className="relative z-10">
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              <motion.div
                className="inline-block text-6xl mb-6"
                whileHover={{ scale: 1.2, rotate: [0, -10, 10, 0] }}
                transition={{ duration: 0.5 }}
              >
                🎉
              </motion.div>
            </motion.div>

            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Prêt à commencer votre aventure ?
            </h2>
            <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
              Rejoignez {appName} aujourd'hui et découvrez un monde d'événements extraordinaires
            </p>

            <Button
              href={isAuthenticated ? '/events' : '/auth/register'}
              variant="gradient"
              size="xl"
              iconRight={ArrowRightIcon}
              flipOnHover
              flipDirection="right"
              flipBackText={isAuthenticated ? "C'est parti ! 🚀" : 'Inscrivez-vous 🎊'}
              shadow="xl"
            >
              {isAuthenticated ? 'Découvrir les événements' : 'Commencer gratuitement'}
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
