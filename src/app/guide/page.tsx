import { AlertTriangle, ArrowLeft, CheckCircle, HelpCircle, Shield } from 'lucide-react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

import { GuideTabs } from '@/components/core/LandingPage/GuideTabs';

export const metadata: Metadata = {
  title: 'Guide',
  description:
    'A quick visual guide to using TheraSynced as a client or a therapist. Booking, messaging, ratings, availability, and more.',
};

export default function GuidePage() {
  return (
    <div className="w-full bg-white min-h-screen">
      {/* Top / Hero area */}
      <section className="relative w-full px-4 sm:px-6 lg:px-8 pt-10 pb-16 lg:pt-14 lg:pb-20 overflow-hidden">
        {/* Subtle background pattern (same circles used across landing sections) */}
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
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

          {/* Two-column hero: copy + photo */}
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div className="space-y-5">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 font-playfair leading-[1.1]">
                How TheraSynced works
              </h1>
              <p className="text-base sm:text-lg text-gray-600 font-open-sans max-w-xl leading-relaxed">
                A quick tour of the platform for clients and therapists. Pick the view that applies
                to you, and you will be up and running in a few minutes.
              </p>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-2 text-sm font-open-sans text-gray-600
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  Free for clients
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  30-day trial for therapists
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  Cancel anytime
                </span>
              </div>
            </div>

            {/* Hero image */}
            <div className="relative rounded-2xl overflow-hidden aspect-[4/3] lg:aspect-[5/4] shadow-lg border border-gray-100
              <Image
                src="/images/physio/pilates-therapy-session.jpg"
                alt="A therapist guiding a client through a session"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
              {/* subtle primary-tinted overlay so the image blends with the page palette */}
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-transparent pointer-events-none" />
            </div>
          </div>
        </div>
      </section>

      {/* Tabs + Cards */}
      <section className="relative w-full px-4 sm:px-6 lg:px-8 py-16 lg:py-20 bg-[#faf9f6] overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <GuideTabs />
        </div>
      </section>

      {/* FAQ section */}
      <section className="w-full px-4 sm:px-6 lg:px-8 py-16 lg:py-20 bg-white
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 space-y-3">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 font-playfair">
              Frequently asked
            </h2>
            <p className="text-base text-gray-600 font-open-sans max-w-2xl mx-auto">
              Quick answers to the things people ask most often.
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                q: 'Is my data safe?',
                a: 'Your data is encrypted at rest and in transit. Messages are encrypted between you and the therapist. Payments are processed by Stripe. We never see or store card details.',
              },
              {
                q: 'Does TheraSynced work on mobile?',
                a: 'Yes, the platform runs on any modern browser and is fully responsive on phones and tablets. Native apps are on the roadmap.',
              },
              {
                q: 'What happens if I need to cancel?',
                a: 'Cancellations made 24 hours or more before the session are always free. Shorter-notice cancellations may be subject to the therapist’s individual policy. You can cancel anytime from My Bookings.',
              },
              {
                q: 'How does payment work?',
                a: 'You enter your card when you book. Payment is held securely by Stripe and only captured when the therapist marks the session complete. If the session does not happen, the hold is released.',
              },
              {
                q: 'Can I change my subscription tier?',
                a: 'Therapists can switch between Bronze, Silver and Gold anytime from Account → Subscription. Upgrades apply immediately; downgrades take effect at the next billing cycle.',
              },
              {
                q: 'I forgot to mark a session complete. What now?',
                a: 'You can mark any past session complete at any time from My Slots or My Bookings. The session only counts toward your revenue once you complete it, so tick them off the same day to keep your numbers accurate.',
              },
              {
                q: 'Why can’t I leave a rating yet?',
                a: 'Ratings unlock once the session’s scheduled time has passed. If the session has just finished and the button is not showing, give it a few minutes and refresh.',
              },
              {
                q: 'How do I get verified as a therapist?',
                a: 'Upload your qualification documents from the Verification section of your account. Approval usually takes 1-2 business days. Your profile only appears in client search once you are verified.',
              },
              {
                q: 'I am in crisis, can I use TheraSynced?',
                a: 'No. TheraSynced is not monitored for emergencies. If you are in crisis or experiencing a medical emergency, please call local emergency services. In Ireland, dial 112 or 999.',
              },
            ].map((item, idx) => (
              <details
                key={idx}
                className="group p-5 lg:p-6 rounded-2xl border border-gray-100 bg-[#faf9f6] shadow-sm open:shadow-md transition-all"
              >
                <summary className="flex items-start justify-between gap-4 cursor-pointer list-none font-poppins font-semibold text-gray-900
                  <span className="text-base">{item.q}</span>
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-lg leading-none transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-4 text-sm text-gray-600 font-open-sans leading-relaxed pr-10">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Good to know */}
      <section className="w-full px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="max-w-6xl mx-auto">
          {/* Emergency disclaimer */}
          <div className="p-6 lg:p-7 rounded-2xl bg-red-50/70 border border-red-200/70 mb-6">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-600 />
              </div>
              <div className="min-w-0">
                <h3 className="font-poppins font-semibold text-gray-900 text-base mb-1">
                  TheraSynced is not for emergencies
                </h3>
                <p className="text-sm text-gray-700 font-open-sans leading-relaxed">
                  If you are in crisis or experiencing a medical emergency, please contact local
                  emergency services immediately. In Ireland, dial{' '}
                  <strong className="text-gray-900 or{' '}
                  <strong className="text-gray-900 Our messaging is
                  not monitored for urgent situations.
                </p>
              </div>
            </div>
          </div>

          {/* Privacy + Terms + Contact link cards */}
          <div className="grid gap-5 md:grid-cols-3">
            <Link
              href="/privacy"
              className="p-6 rounded-2xl border border-gray-100 bg-[#faf9f6] shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-300 group"
            >
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/10 to-sage-warm/10 flex items-center justify-center mb-4 group-hover:from-primary/20 group-hover:to-sage-warm/20 transition-all">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-poppins font-semibold text-gray-900 mb-1">
                Privacy Policy
              </h3>
              <p className="text-sm text-gray-600 font-open-sans">
                How we collect, use, and protect your personal data.
              </p>
            </Link>

            <Link
              href="/terms"
              className="p-6 rounded-2xl border border-gray-100 bg-[#faf9f6] shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-300 group"
            >
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/10 to-sage-warm/10 flex items-center justify-center mb-4 group-hover:from-primary/20 group-hover:to-sage-warm/20 transition-all">
                <CheckCircle className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-poppins font-semibold text-gray-900 mb-1">
                Terms of Service
              </h3>
              <p className="text-sm text-gray-600 font-open-sans">
                Rules and expectations for using the platform.
              </p>
            </Link>

            <Link
              href="/contact"
              className="p-6 rounded-2xl border border-gray-100 bg-[#faf9f6] shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-300 group"
            >
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/10 to-sage-warm/10 flex items-center justify-center mb-4 group-hover:from-primary/20 group-hover:to-sage-warm/20 transition-all">
                <HelpCircle className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-poppins font-semibold text-gray-900 mb-1">
                Contact support
              </h3>
              <p className="text-sm text-gray-600 font-open-sans">
                Questions or issues? Our support team is happy to help.
              </p>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
