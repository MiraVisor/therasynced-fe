'use client';

import { Facebook, Instagram, Linkedin, Twitter } from 'lucide-react';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import Link from 'next/link';

import { openCookieSettings } from '@/components/common/CookieConsent';

const socialLinks = [
  {
    href: 'https://www.facebook.com/share/14Wed3qHeke/',
    label: 'Facebook',
    icon: Facebook,
  },
  {
    href: 'https://x.com/therasynced',
    label: 'X (Twitter)',
    icon: Twitter,
  },
  {
    href: 'https://www.instagram.com/therasynced',
    label: 'Instagram',
    icon: Instagram,
  },
  {
    href: 'https://www.linkedin.com/in/lee-o-grady-9a517518b',
    label: 'LinkedIn',
    icon: Linkedin,
  },
];

const Footer = () => {
  const { resolvedTheme } = useTheme();

  return (
    <footer className="w-full bg-[#faf9f6] dark:bg-black border-t border-gray-100 dark:border-neutral-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="col-span-2 space-y-4">
            <Link href="/" className="inline-block">
              <Image
                src={resolvedTheme === 'dark' ? '/svgs/NewLogoLight.svg' : '/svgs/NewLogoDark.svg'}
                alt="TheraSynced"
                width={120}
                height={32}
                className="h-8 w-auto transition-opacity hover:opacity-80"
                priority={false}
                loading="lazy"
              />
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed max-w-xs font-open-sans">
              Find and book sessions with independent therapists.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-3 pt-1">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="text-gray-400 hover:text-primary transition-colors"
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4 font-inter">
              Platform
            </h3>
            <ul className="space-y-2.5 text-sm text-gray-500 font-open-sans">
              <li>
                <Link href="#how-it-works" className="hover:text-primary transition-colors">
                  How it Works
                </Link>
              </li>
              <li>
                <Link href="#features" className="hover:text-primary transition-colors">
                  Why Us
                </Link>
              </li>
              <li>
                <Link href="#pricing" className="hover:text-primary transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="/authentication/sign-in"
                  className="hover:text-primary transition-colors"
                >
                  Join as Therapist
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4 font-inter">
              Legal
            </h3>
            <ul className="space-y-2.5 text-sm text-gray-500 font-open-sans">
              <li>
                <Link href="/privacy" className="hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-primary transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/terms#billing" className="hover:text-primary transition-colors">
                  Billing Terms
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="hover:text-primary transition-colors">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <button
                  onClick={openCookieSettings}
                  className="hover:text-primary transition-colors text-left"
                >
                  Cookie Settings
                </button>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4 font-inter">
              Contact
            </h3>
            <ul className="space-y-2.5 text-sm text-gray-500 font-open-sans">
              <li>
                <Link href="/contact" className="hover:text-primary transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <a
                  href="mailto:support@therasynced.com"
                  className="hover:text-primary transition-colors break-all"
                >
                  support@therasynced.com
                </a>
              </li>
              <li>
                <a
                  href="mailto:sales@therasynced.com"
                  className="hover:text-primary transition-colors break-all"
                >
                  sales@therasynced.com
                </a>
              </li>
              <li>
                <a href="tel:+353894958346" className="hover:text-primary transition-colors">
                  089 495 8346
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-6 border-t border-gray-100 dark:border-neutral-900 flex flex-col sm:flex-row justify-between gap-4">
          <p className="text-xs text-gray-400 font-inter">
            © {new Date().getFullYear()} TheraSynced. All rights reserved.
          </p>
          <p className="text-[10px] text-gray-400 font-open-sans max-w-lg">
            TheraSynced connects clients with independent therapists. We do not provide medical
            advice. Therapists are responsible for their own professional conduct.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
