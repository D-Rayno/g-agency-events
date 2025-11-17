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
            <h3 className="font-semibold text-white mb-4">Platform</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-neutral-400 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/events" className="text-neutral-400 hover:text-white transition-colors">
                  Events
                </Link>
              </li>
              <li>
                <Link
                  href="/registrations"
                  className="text-neutral-400 hover:text-white transition-colors"
                >
                  My Registrations
                </Link>
              </li>
              <li>
                <Link href="/profile" className="text-neutral-400 hover:text-white transition-colors">
                  Profile
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-white mb-4">Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-neutral-400 hover:text-white transition-colors">
                  Help
                </a>
              </li>
              <li>
                <a href="#" className="text-neutral-400 hover:text-white transition-colors">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="text-neutral-400 hover:text-white transition-colors">
                  Contact
                </a>
              </li>
              <li>
                <a href="#" className="text-neutral-400 hover:text-white transition-colors">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-white mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-neutral-400 hover:text-white transition-colors">
                  Terms of Use
                </a>
              </li>
              <li>
                <a href="#" className="text-neutral-400 hover:text-white transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-neutral-400 hover:text-white transition-colors">
                  Cookies
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-neutral-800 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Copyright */}
            <p className="text-sm text-neutral-400">
              &copy; {currentYear} {config.branding.logo.text}. All rights reserved.
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