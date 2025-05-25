'use client';

import { useTheme } from 'next-themes';
import Link from 'next/link';

const Footer = () => {
  useTheme();

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
                  href="#about"
                  className="hover:text-primary dark:hover:text-primary/90 transition-colors"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="#services"
                  className="hover:text-primary dark:hover:text-primary/90 transition-colors"
                >
                  Services
                </Link>
              </li>
              <li>
                <Link
                  href="#features"
                  className="hover:text-primary dark:hover:text-primary/90 transition-colors"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href="#freelancers"
                  className="hover:text-primary dark:hover:text-primary/90 transition-colors"
                >
                  Experts
                </Link>
              </li>
              <li>
                <Link
                  href="#pricing"
                  className="hover:text-primary dark:hover:text-primary/90 transition-colors"
                >
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-lg xs:text-xl font-semibold text-gray-900 dark:text-white">
              Support
            </h3>
            <ul className="space-y-2 text-base xs:text-lg text-gray-700 dark:text-neutral-300">
              <li>
                <Link
                  href="#"
                  className="hover:text-primary dark:hover:text-primary/90 transition-colors"
                >
                  Help Center
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="hover:text-primary dark:hover:text-primary/90 transition-colors"
                >
                  How it works
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="hover:text-primary dark:hover:text-primary/90 transition-colors"
                >
                  Terms and Conditions
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="hover:text-primary dark:hover:text-primary/90 transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200/50 dark:border-neutral-800/50 pt-6 text-sm flex flex-col sm:flex-row justify-between items-center gap-4 text-gray-700 dark:text-neutral-300">
          <p className="text-center sm:text-left">
            Copyright © 2025 therasynced | All Rights Reserved
          </p>
          <div className="flex flex-wrap justify-center sm:justify-end gap-4">
            <Link
              href="#"
              className="hover:text-primary dark:hover:text-primary/90 transition-colors"
            >
              Terms and Conditions
            </Link>
            <Link
              href="#"
              className="hover:text-primary dark:hover:text-primary/90 transition-colors"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
