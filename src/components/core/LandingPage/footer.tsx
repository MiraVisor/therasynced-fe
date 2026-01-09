'use client';

import { useTheme } from 'next-themes';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

const Footer = () => {
  const { resolvedTheme } = useTheme();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubscribed(true);
    setEmail('');
    setTimeout(() => setSubscribed(false), 3000);
  };

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

            {/* Newsletter */}
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
                  Features
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
                <Link href="/cookies" className="hover:text-primary transition-colors">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4 font-inter">
              Support
            </h3>
            <ul className="space-y-2.5 text-sm text-gray-500 font-open-sans">
              <li>
                <a
                  href="mailto:support@therasynced.com"
                  className="hover:text-primary transition-colors"
                >
                  Contact Us
                </a>
              </li>
              <li>
                <Link href="#" className="hover:text-primary transition-colors">
                  Help Center
                </Link>
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
