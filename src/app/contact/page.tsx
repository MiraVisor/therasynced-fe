import {
  ArrowLeft,
  Briefcase,
  Facebook,
  Instagram,
  LifeBuoy,
  Linkedin,
  Mail,
  Phone,
} from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

import { PrioritySupportNotice } from '@/components/core/Dashboard/FreelancerSide/Subscription/PrioritySupportNotice';

const XIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

export const metadata: Metadata = {
  title: 'Contact Us',
  description:
    'Get in touch with TheraSynced — reach our support team, talk to sales, or call our business line.',
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary mb-8 transition-colors font-open-sans"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>

        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 font-poppins">
          Get in touch
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-6 max-w-2xl font-open-sans">
          We&apos;d love to hear from you. Whether you need help with your account, want to learn
          more about TheraSynced for your practice, or just have a question — here&apos;s how to
          reach us.
        </p>

        {/* Gold-only priority support banner — client component, renders only if logged-in user is Gold */}
        <PrioritySupportNotice />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Support Card */}
          <div className="border border-gray-200 dark:border-neutral-800 rounded-lg p-6 hover:border-primary/40 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <LifeBuoy className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 font-poppins">
              Support
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 font-open-sans">
              Having trouble with your account, a booking, or something else on the platform? Our
              support team is here to help.
            </p>
            <a
              href="mailto:support@therasynced.com"
              className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline break-all"
            >
              <Mail className="w-4 h-4 flex-shrink-0" />
              support@therasynced.com
            </a>
          </div>

          {/* Sales Card */}
          <div className="border border-gray-200 dark:border-neutral-800 rounded-lg p-6 hover:border-primary/40 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Briefcase className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 font-poppins">
              Sales &amp; Partnerships
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 font-open-sans">
              Interested in bringing TheraSynced to your clinic or practice? Want to explore a
              partnership? Drop our sales team a line.
            </p>
            <a
              href="mailto:sales@therasynced.com"
              className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline break-all"
            >
              <Mail className="w-4 h-4 flex-shrink-0" />
              sales@therasynced.com
            </a>
          </div>

          {/* Phone Card - full width */}
          <div className="md:col-span-2 border border-gray-200 dark:border-neutral-800 rounded-lg p-6 hover:border-primary/40 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Phone className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 font-poppins">
              Prefer to call?
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 font-open-sans">
              Reach us by phone during Irish business hours (Mon–Fri, 9:00–17:00).
            </p>
            <a
              href="tel:+353894958346"
              className="inline-flex items-center gap-2 text-base font-semibold text-primary hover:underline"
            >
              <Phone className="w-4 h-4" />
              089 495 8346
            </a>
          </div>
        </div>

        {/* Before you email us */}
        <div className="bg-gray-50 dark:bg-neutral-900/50 rounded-lg p-6 border border-gray-100 dark:border-neutral-900">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3 font-poppins">
            Before you reach out
          </h3>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2 list-disc pl-5 font-open-sans">
            <li>
              Trouble signing in? Try{' '}
              <Link
                href="/authentication/sign-in"
                className="text-primary hover:underline font-medium"
              >
                resetting your password
              </Link>{' '}
              first — it solves most account issues.
            </li>
            <li>
              For questions about how we handle your data, please see our{' '}
              <Link href="/privacy" className="text-primary hover:underline font-medium">
                Privacy Policy
              </Link>{' '}
              and{' '}
              <Link href="/terms" className="text-primary hover:underline font-medium">
                Terms of Service
              </Link>
              .
            </li>
            <li>
              <strong>In an emergency</strong>, please contact local emergency services — in
              Ireland, dial <strong>112</strong> or <strong>999</strong>. TheraSynced is not
              intended for urgent or crisis situations.
            </li>
          </ul>
        </div>

        {/* Follow us */}
        <div className="mt-10 text-center">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white font-poppins mb-4">
            Follow us
          </h3>
          <div className="flex items-center justify-center gap-4">
            {[
              {
                href: 'https://www.facebook.com/share/14Wed3qHeke/',
                label: 'Facebook',
                icon: Facebook,
                hoverClass: 'hover:text-[#1877F2] hover:border-[#1877F2]/40',
              },
              {
                href: 'https://x.com/therasynced',
                label: 'X (Twitter)',
                icon: XIcon,
                hoverClass:
                  'hover:text-black dark:hover:text-white hover:border-black/40 dark:hover:border-white/40',
              },
              {
                href: 'https://www.instagram.com/therasynced',
                label: 'Instagram',
                icon: Instagram,
                hoverClass: 'hover:text-[#E1306C] hover:border-[#E1306C]/40',
              },
              {
                href: 'https://www.linkedin.com/in/lee-o-grady-9a517518b',
                label: 'LinkedIn',
                icon: Linkedin,
                hoverClass: 'hover:text-[#0A66C2] hover:border-[#0A66C2]/40',
              },
            ].map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                className={`w-10 h-10 rounded-full border border-gray-200 dark:border-neutral-800 flex items-center justify-center text-gray-500 transition-colors ${social.hoverClass}`}
              >
                <social.icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>

        <p className="text-xs text-gray-400 mt-6 text-center font-open-sans">
          We aim to respond to support and sales enquiries within 1–2 business days.
        </p>
      </div>
    </div>
  );
}
