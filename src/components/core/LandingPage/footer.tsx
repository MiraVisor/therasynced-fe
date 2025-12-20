'use client';

import { useTheme } from 'next-themes';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const Footer = () => {
  useTheme();
  const router = useRouter();

  return (
    <footer className="w-full flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-gray-100 dark:bg-neutral-900/50 backdrop-blur-sm transition-colors duration-300">
      <div className="w-full max-w-screen-2xl my-6 sm:my-8 lg:my-12 flex flex-col gap-8 sm:gap-12 text-gray-700 dark:text-neutral-300">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12">
          {/* Branding */}
          <div className="col-span-1 sm:col-span-2 space-y-4">
            <h2 className="text-2xl xs:text-3xl sm:text-4xl font-bold tracking-wide text-gray-900 dark:text-white">
              THERA<span className="text-primary dark:text-primary/90">SYNCED</span>
            </h2>
            <p className="text-base xs:text-lg text-gray-700 dark:text-neutral-300 max-w-md leading-relaxed">
              Discover expert physiotherapists ready to help you relax, recover, and recharge.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-lg xs:text-xl font-semibold text-gray-900 dark:text-white">
              Quick Links
            </h3>
            <ul className="space-y-2 text-base xs:text-lg text-gray-700 dark:text-neutral-300">
              <li>
                <Link
                  href="#services"
                  onClick={(e) => {
                    e.preventDefault();
                    const el = document.getElementById('services');
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    else router.push('/#services');
                  }}
                  className="hover:text-primary dark:hover:text-primary/90 transition-colors"
                >
                  Services
                </Link>
              </li>
              <li>
                <Link
                  href="#features"
                  onClick={(e) => {
                    e.preventDefault();
                    const el = document.getElementById('features');
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    else router.push('/#features');
                  }}
                  className="hover:text-primary dark:hover:text-primary/90 transition-colors"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href="#how-it-works"
                  className="hover:text-primary dark:hover:text-primary/90 transition-colors"
                >
                  How It Works
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Support */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-lg xs:text-xl font-semibold text-gray-900 dark:text-white">
              Legal & Support
            </h3>
            <ul className="space-y-2 text-base xs:text-lg text-gray-700 dark:text-neutral-300">
              <li>
                <Link
                  href="/privacy"
                  className="hover:text-primary dark:hover:text-primary/90 transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="hover:text-primary dark:hover:text-primary/90 transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/cookies"
                  className="hover:text-primary dark:hover:text-primary/90 transition-colors"
                >
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Platform Disclaimer */}
        <div className="border-t border-gray-200/50 dark:border-neutral-800/50 pt-6">
          <p className="text-sm text-gray-600 dark:text-neutral-400 text-center max-w-4xl mx-auto">
            <strong className="text-gray-900 dark:text-white">Platform Disclaimer:</strong>{' '}
            TheraSynced is a booking platform that connects clients with licensed healthcare
            professionals and therapists. We do not provide medical advice, diagnosis, or treatment
            services. All healthcare services are provided by independent practitioners who are
            responsible for their own professional conduct and services.
          </p>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200/50 dark:border-neutral-800/50 pt-6 text-sm flex flex-col sm:flex-row justify-between items-center gap-4 text-gray-700 dark:text-neutral-300">
          <div className="text-center sm:text-left">
            <p className="mb-2">Copyright © 2025 therasynced | All Rights Reserved</p>
          </div>
          <div className="flex flex-wrap justify-center sm:justify-end gap-4">
            <p className="mb-2">
              For data protection inquiries:{' '}
              <a href="mailto:privacy@therasynced.com" className="text-primary hover:underline">
                privacy@therasynced.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
