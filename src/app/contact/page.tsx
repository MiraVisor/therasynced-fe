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
    'Get in touch with TheraSynced. Reach our support team, talk to sales, or call our business line.',
};

const socials = [
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
];

export default function ContactPage() {
  return (
    <div className="w-full bg-white dark:bg-neutral-900 min-h-screen">
      {/* Top / Hero area - matches guide page layout */}
      <section className="relative w-full px-4 sm:px-6 lg:px-8 pt-10 pb-16 lg:pt-14 lg:pb-20 overflow-hidden">
        {/* Subtle background pattern, same as guide and other landing sections */}
        <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03] pointer-events-none">
          <div className="absolute top-20 left-20 w-96 h-96 border border-primary rounded-full" />
          <div className="absolute bottom-20 right-20 w-72 h-72 border border-sage-warm rounded-full" />
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          {/* Back to home */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary mb-10 transition-colors font-open-sans"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>

          {/* Header */}
          <div className="max-w-3xl space-y-5">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white font-playfair leading-[1.1]">
              Get in touch
            </h1>
            <p className="text-base sm:text-lg text-gray-600 dark:text-neutral-400 font-open-sans leading-relaxed">
              Whether you need help with your account, want to learn more about TheraSynced for your
              practice, or just have a question, here is how to reach us.
            </p>
          </div>

          {/* Priority support banner for logged-in Gold users only */}
          <div className="mt-8">
            <PrioritySupportNotice />
          </div>
        </div>
      </section>

      {/* Contact options */}
      <section className="relative w-full px-4 sm:px-6 lg:px-8 py-16 lg:py-20 bg-[#faf9f6] dark:bg-neutral-950/30">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Support Card */}
            <div className="p-7 lg:p-8 rounded-2xl border border-gray-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-300 group">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/10 to-sage-warm/10 flex items-center justify-center mb-5 group-hover:from-primary/20 group-hover:to-sage-warm/20 transition-all">
                <LifeBuoy className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2 font-poppins">
                Support
              </h2>
              <p className="text-sm text-gray-600 dark:text-neutral-400 font-open-sans leading-relaxed mb-5">
                Having trouble with your account, a booking, or something else on the platform? Our
                support team is here to help.
              </p>
              <a
                href="mailto:support@therasynced.com"
                className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline break-all font-open-sans"
              >
                <Mail className="w-4 h-4 flex-shrink-0" />
                support@therasynced.com
              </a>
            </div>

            {/* Sales Card */}
            <div className="p-7 lg:p-8 rounded-2xl border border-gray-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-300 group">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/10 to-sage-warm/10 flex items-center justify-center mb-5 group-hover:from-primary/20 group-hover:to-sage-warm/20 transition-all">
                <Briefcase className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2 font-poppins">
                Sales and partnerships
              </h2>
              <p className="text-sm text-gray-600 dark:text-neutral-400 font-open-sans leading-relaxed mb-5">
                Interested in bringing TheraSynced to your clinic or practice? Want to explore a
                partnership? Drop our sales team a line.
              </p>
              <a
                href="mailto:sales@therasynced.com"
                className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline break-all font-open-sans"
              >
                <Mail className="w-4 h-4 flex-shrink-0" />
                sales@therasynced.com
              </a>
            </div>
          </div>

          {/* Phone card - full width */}
          <div className="p-7 lg:p-8 rounded-2xl border border-gray-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-300 group">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
              <div>
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/10 to-sage-warm/10 flex items-center justify-center mb-5 group-hover:from-primary/20 group-hover:to-sage-warm/20 transition-all">
                  <Phone className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2 font-poppins">
                  Prefer to call?
                </h2>
                <p className="text-sm text-gray-600 dark:text-neutral-400 font-open-sans leading-relaxed">
                  Reach us by phone during Irish business hours, Monday to Friday, 9:00 to 17:00.
                </p>
              </div>
              <a
                href="tel:+353894958346"
                className="inline-flex items-center gap-2 text-lg font-bold text-primary hover:underline whitespace-nowrap font-poppins"
              >
                <Phone className="w-5 h-5" />
                089 495 8346
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Before you reach out + Follow us */}
      <section className="w-full px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="max-w-6xl mx-auto space-y-10">
          {/* Before you reach out */}
          <div className="p-7 lg:p-8 rounded-2xl bg-[#faf9f6] dark:bg-neutral-800 border border-gray-100 dark:border-neutral-700">
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4 font-poppins">
              Before you reach out
            </h3>
            <ul className="text-sm text-gray-600 dark:text-neutral-400 space-y-3 list-disc pl-5 font-open-sans leading-relaxed">
              <li>
                Trouble signing in? Try{' '}
                <Link
                  href="/authentication/sign-in"
                  className="text-primary hover:underline font-semibold"
                >
                  resetting your password
                </Link>{' '}
                first. It solves most account issues.
              </li>
              <li>
                For questions about how we handle your data, please see our{' '}
                <Link href="/privacy" className="text-primary hover:underline font-semibold">
                  Privacy Policy
                </Link>{' '}
                and{' '}
                <Link href="/terms" className="text-primary hover:underline font-semibold">
                  Terms of Service
                </Link>
                .
              </li>
              <li>
                In an emergency, please contact local emergency services. In Ireland, dial{' '}
                <strong className="text-gray-900 dark:text-white">112</strong> or{' '}
                <strong className="text-gray-900 dark:text-white">999</strong>. TheraSynced is not
                intended for urgent or crisis situations.
              </li>
            </ul>
          </div>

          {/* Follow us */}
          <div className="text-center">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white font-poppins mb-5 uppercase tracking-wider">
              Follow us
            </h3>
            <div className="flex items-center justify-center gap-3">
              {socials.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className={`w-11 h-11 rounded-full border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 flex items-center justify-center text-gray-500 transition-colors ${social.hoverClass}`}
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-6 font-open-sans">
              We aim to respond to support and sales enquiries within 1 to 2 business days.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
