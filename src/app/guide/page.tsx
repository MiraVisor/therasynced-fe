import { AlertTriangle, ArrowLeft, CheckCircle, HelpCircle, Shield } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

import { GuideTabs } from '@/components/core/LandingPage/GuideTabs';

export const metadata: Metadata = {
  title: 'Guide',
  description:
    'A quick visual guide to using TheraSynced as a client or a therapist. Booking, messaging, ratings, availability, and more.',
};

export default function GuidePage() {
  return (
    <section className="w-full px-4 sm:px-6 lg:px-8 py-16 lg:py-24 bg-white dark:bg-neutral-900 relative overflow-hidden min-h-screen">
      {/* Subtle background pattern — same circles used across the landing sections */}
      <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03] pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 border border-primary rounded-full" />
        <div className="absolute bottom-20 right-20 w-72 h-72 border border-sage-warm rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Back to home */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary mb-10 transition-colors font-open-sans"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>

        {/* Section Header */}
        <div className="text-center mb-12 lg:mb-16 space-y-4">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white font-playfair">
            How TheraSynced works
          </h1>
          <p className="text-base sm:text-lg text-gray-600 dark:text-neutral-400 max-w-2xl mx-auto font-open-sans">
            A quick tour of the platform for clients and therapists. Pick the view that applies to
            you.
          </p>
        </div>

        {/* Tabs + Cards — client component */}
        <GuideTabs />

        {/* Good to know */}
        <div className="mt-20 lg:mt-24 grid gap-6 lg:grid-cols-3">
          {/* Emergency disclaimer */}
          <div className="lg:col-span-3 p-6 lg:p-7 rounded-2xl bg-red-50/70 dark:bg-red-950/20 border border-red-200/70 dark:border-red-900/40">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-red-100 dark:bg-red-900/40 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div className="min-w-0">
                <h3 className="font-poppins font-semibold text-gray-900 dark:text-white text-base mb-1">
                  TheraSynced is not for emergencies
                </h3>
                <p className="text-sm text-gray-700 dark:text-neutral-300 font-open-sans leading-relaxed">
                  If you are in crisis or experiencing a medical emergency, please contact local
                  emergency services immediately. In Ireland, dial{' '}
                  <strong className="text-gray-900 dark:text-white">112</strong> or{' '}
                  <strong className="text-gray-900 dark:text-white">999</strong>. Our messaging is
                  not monitored for urgent situations.
                </p>
              </div>
            </div>
          </div>

          {/* Privacy + Terms link cards */}
          <Link
            href="/privacy"
            className="p-6 rounded-2xl border border-gray-100 dark:border-neutral-800 bg-[#faf9f6] dark:bg-neutral-800 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-300 group"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/10 to-sage-warm/10 flex items-center justify-center mb-4 group-hover:from-primary/20 group-hover:to-sage-warm/20 transition-all">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-poppins font-semibold text-gray-900 dark:text-white mb-1">
              Privacy Policy
            </h3>
            <p className="text-sm text-gray-600 dark:text-neutral-400 font-open-sans">
              How we collect, use, and protect your personal data.
            </p>
          </Link>

          <Link
            href="/terms"
            className="p-6 rounded-2xl border border-gray-100 dark:border-neutral-800 bg-[#faf9f6] dark:bg-neutral-800 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-300 group"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/10 to-sage-warm/10 flex items-center justify-center mb-4 group-hover:from-primary/20 group-hover:to-sage-warm/20 transition-all">
              <CheckCircle className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-poppins font-semibold text-gray-900 dark:text-white mb-1">
              Terms of Service
            </h3>
            <p className="text-sm text-gray-600 dark:text-neutral-400 font-open-sans">
              Rules and expectations for using the platform.
            </p>
          </Link>

          <Link
            href="/contact"
            className="p-6 rounded-2xl border border-gray-100 dark:border-neutral-800 bg-[#faf9f6] dark:bg-neutral-800 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-300 group"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/10 to-sage-warm/10 flex items-center justify-center mb-4 group-hover:from-primary/20 group-hover:to-sage-warm/20 transition-all">
              <HelpCircle className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-poppins font-semibold text-gray-900 dark:text-white mb-1">
              Contact support
            </h3>
            <p className="text-sm text-gray-600 dark:text-neutral-400 font-open-sans">
              Questions or issues? Our support team is happy to help.
            </p>
          </Link>
        </div>
      </div>
    </section>
  );
}
