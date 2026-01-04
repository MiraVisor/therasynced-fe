'use client';

import { useTheme } from 'next-themes';
import Image from 'next/image';
import Link from 'next/link';

const Footer = () => {
  const { resolvedTheme } = useTheme();

  return (
    <footer className="w-full bg-[#faf9f6] dark:bg-black border-t border-gray-100 dark:border-neutral-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Column */}
          <div className="space-y-6">
            <Link href="/" className="inline-block">
              <Image
                src={resolvedTheme === 'dark' ? '/svgs/NewLogoLight.svg' : '/svgs/NewLogoDark.svg'}
                alt="TheraSynced"
                width={140}
                height={40}
                className="h-12 w-auto transition-opacity hover:opacity-80"
                priority={false}
                loading="lazy"
              />
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
              A professional infrastructure for wellness professionals and their clients. Built for
              security, privacy, and efficiency.
            </p>
          </div>

          {/* Platform Links */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-6">
              Platform
            </h3>
            <ul className="space-y-4 text-sm text-gray-500">
              <li>
                <Link
                  href="#how-it-works"
                  className="hover:text-primary transition-colors duration-300"
                >
                  How it Works
                </Link>
              </li>
              <li>
                <Link
                  href="#features"
                  className="hover:text-primary transition-colors duration-300"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link href="#pricing" className="hover:text-primary transition-colors duration-300">
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="/authentication/sign-in"
                  className="hover:text-primary transition-colors duration-300"
                >
                  Join as Therapist
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-6">
              Legal
            </h3>
            <ul className="space-y-4 text-sm text-gray-500">
              <li>
                <Link href="/privacy" className="hover:text-primary transition-colors duration-300">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-primary transition-colors duration-300">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="hover:text-primary transition-colors duration-300">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Column */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-6">
              Support
            </h3>
            <ul className="space-y-4 text-sm text-gray-500">
              <li>
                <a
                  href="mailto:support@therasynced.com"
                  className="hover:text-primary transition-colors duration-300"
                >
                  support@therasynced.com
                </a>
              </li>
              <li>
                <Link href="#" className="hover:text-primary transition-colors duration-300">
                  Help Center
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-gray-100 dark:border-neutral-900 flex flex-col md:flex-row justify-between gap-6 relative">
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} TheraSynced. All rights reserved.
          </p>
          <div className="max-w-2xl">
            <p className="text-[10px] text-gray-400 leading-relaxed">
              <strong>Disclaimer:</strong> TheraSynced is a platform connecting clients with
              independent therapists. We do not provide medical advice or treatment. Therapists are
              responsible for their own professional conduct.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
