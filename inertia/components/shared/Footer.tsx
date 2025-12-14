import { Link } from '@inertiajs/react'
import Logo from '~/components/ui/Logo'
import { useTheme } from '~/hooks/useTheme'

export default function Footer() {
  const { config } = useTheme()
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-neutral-900 text-neutral-300 border-t border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand - Using Logo Component */}
          <div className="space-y-4">
            <Logo
              variant="light"
              size="md"
              showText={true}
              clickable={true}
              animate={true}
              width={40}
              height={40}
            />
            <p className="text-sm text-neutral-400">{config.app.description}</p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="font-semibold text-white mb-4">Plateforme</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-neutral-400 hover:text-white transition-colors">
                  Accueil
                </Link>
              </li>
              <li>
                <Link href="/events" className="text-neutral-400 hover:text-white transition-colors">
                  Événements
                </Link>
              </li>
              <li>
                <Link
                  href="/registrations"
                  className="text-neutral-400 hover:text-white transition-colors"
                >
                  Mes Inscriptions
                </Link>
              </li>
              <li>
                <Link href="/profile" className="text-neutral-400 hover:text-white transition-colors">
                  Profil
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-white mb-4">Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/support/help-center" className="text-neutral-400 hover:text-white transition-colors">
                  Centre d'aide
                </Link>
              </li>
              <li>
                <Link href="/support/contact" className="text-neutral-400 hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/support/faq" className="text-neutral-400 hover:text-white transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-white mb-4">Légal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/legal/terms-of-use" className="text-neutral-400 hover:text-white transition-colors">
                  Conditions d'utilisation
                </Link>
              </li>
              <li>
                <Link href="/legal/privacy-policy" className="text-neutral-400 hover:text-white transition-colors">
                  Politique de confidentialité
                </Link>
              </li>
              <li>
                <Link href="/legal/cookies" className="text-neutral-400 hover:text-white transition-colors">
                  Cookies
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-neutral-800 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Copyright */}
            <p className="text-sm text-neutral-400">
              © {currentYear} {config.branding.logo.text}. Tous droits réservés.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-4">
              {Object.entries(config.social).map(([platform, url]) => (
                <a
                  key={platform}
                  href={url as string}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Follow us on ${platform}`}
                  className="text-neutral-400 hover:text-white transition-colors"
                >
                  <span className="capitalize text-sm font-medium">{platform}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}