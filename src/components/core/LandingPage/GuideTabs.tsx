'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
  Calendar,
  CheckSquare,
  CreditCard,
  LayoutDashboard,
  MessageSquare,
  RefreshCw,
  Search,
  Settings,
  Star,
  TrendingUp,
  UserCheck,
} from 'lucide-react';
import { useState } from 'react';

import { useIsMobile } from '@/hooks/use-mobile';

type Topic = {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  steps: string[];
  tips: string[];
};

const guides: Record<'client' | 'therapist', Topic[]> = {
  client: [
    {
      title: 'Finding a therapist',
      description:
        'TheraSynced lets you search by specialty, location, availability, and price. Every therapist on the platform is verified so you can book with confidence.',
      icon: Search,
      steps: [
        'Open Explore from the dashboard sidebar',
        'Filter by county, city or home-visit availability',
        'Narrow by specialty - physio, sports massage, counselling, strength coach, and more',
        'Sort by rating, price or availability',
        'Open a profile to read their bio, qualifications and recent ratings',
      ],
      tips: [
        'Read the About section for their clinical approach',
        'Therapists with 10+ ratings tend to have more consistent feedback',
        'Use the "available today" filter if your need is urgent',
      ],
    },
    {
      title: 'Booking a session',
      description:
        'Once you have picked a therapist, booking takes under a minute. Pick a slot, pay securely with Stripe, and your confirmation arrives instantly.',
      icon: Calendar,
      steps: [
        'On a therapist profile, click Book a session',
        'Pick the date and time from their available slots',
        'Choose the service and duration (30, 45, 60, 90 or 120 minutes)',
        'Select location type - clinic, home visit, pitchside, corporate',
        'Review the price, enter your card details, and confirm',
      ],
      tips: [
        'Home-visit bookings may include a small travel surcharge',
        'You get a reminder email 24 hours before the session',
        'Cancel free of charge up to 24 hours before the session starts',
      ],
    },
    {
      title: 'Messaging your therapist',
      description:
        'Every booking unlocks an encrypted chat with your therapist. Use it for pre-session questions, medical info, or post-session follow-ups.',
      icon: MessageSquare,
      steps: [
        'Open Messages from the sidebar',
        'Pick the conversation with your therapist',
        'Type your message, attach files if needed',
        'They are notified and reply within their business hours',
      ],
      tips: [
        'All messages are encrypted and private between you and the therapist',
        'For emergencies always call 112 or 999 - messages are not monitored for urgency',
        'Keep a concise summary of your goals in the first message',
      ],
    },
    {
      title: 'Rescheduling or cancelling',
      description:
        'Life happens. You can reschedule or cancel any upcoming session from the dashboard, subject to the therapist’s cancellation policy.',
      icon: RefreshCw,
      steps: [
        'Open My Bookings from the sidebar',
        'Click the session you want to change',
        'Choose Reschedule (pick a new slot) or Cancel (confirm)',
        'An email confirmation is sent automatically',
      ],
      tips: [
        'Cancellations made 24+ hours before the session are always free',
        'Last-minute cancellations may incur a fee per the therapist’s policy',
        'Rescheduling does not cost anything if done 24+ hours in advance',
      ],
    },
    {
      title: 'Rating after a session',
      description:
        'Once a session completes, you can leave a 1-5 star rating. Your feedback helps other clients pick the right therapist and rewards professionals who consistently deliver.',
      icon: Star,
      steps: [
        'Open My Bookings once the session date has passed',
        'Click the prominent Rate button on the session row',
        'Pick your star rating (1 = poor, 5 = excellent)',
        'Submit - it is instantly added to the therapist’s profile score',
      ],
      tips: [
        'You can rate any session where the scheduled time has passed',
        'Ratings are one-time and cannot be edited afterward',
        'The dashboard banner tells you how many sessions are still waiting for a rating',
      ],
    },
    {
      title: 'Your dashboard',
      description:
        'The dashboard keeps every session, message, receipt and favourite therapist in one place - no spreadsheets, no hunting through emails.',
      icon: LayoutDashboard,
      steps: [
        'Next appointment hero shows your upcoming session at the top',
        'My Bookings lists the full history, filterable by status',
        'Messages opens all your therapist conversations',
        'Favourites lets you rebook a therapist you liked in one click',
        'Account holds your details, payment methods and notifications',
      ],
      tips: [
        'Tap the heart icon on a therapist profile during booking to save them',
        'Receipts are downloadable from any completed booking',
        'Enable email notifications so you never miss a reminder',
      ],
    },
  ],
  therapist: [
    {
      title: 'Setting up your profile',
      description:
        'Your profile decides whether clients trust you enough to book. Spend 15 minutes filling it properly before going live - it pays back many times over.',
      icon: UserCheck,
      steps: [
        'Upload a clear, professional profile photo (headshot works best)',
        'Write a 2-3 paragraph bio covering your approach, experience and specialties',
        'Set your job title (e.g., "Chartered Physiotherapist")',
        'Add the county and city/town you practice in',
        'Upload qualification documents for verification',
        'Add professional memberships (CORU, ISCP, etc.) if relevant',
      ],
      tips: [
        'Bios that mention real problems you solve outrank generic ones',
        'Verification approval typically takes 1-2 business days',
        'You can save drafts and come back to finish the profile later',
      ],
    },
    {
      title: 'Setting your pricing',
      description:
        'Pricing is flexible. Use a flat rate per duration, or layer different prices per service or location type.',
      icon: CreditCard,
      steps: [
        'Open Settings → Pricing from your dashboard',
        'Set a base rate for each session duration (30, 45, 60, 90, 120 minutes)',
        'Optionally override per service category (e.g., massage €60, cupping €75)',
        'Optionally add location surcharges (e.g., home visit +€15 for travel)',
        'Save - the new pricing applies to all future slots',
      ],
      tips: [
        'Clients associate higher prices with quality - do not undercut yourself',
        'Offering 30, 60 and 90 minute options captures different needs',
        'Review your pricing every 6 months as you gain experience and ratings',
      ],
    },
    {
      title: 'Creating availability',
      description:
        'Create a full week of slots in under two minutes using the 3-step guided flow on the Availability page. Slots appear in client search immediately.',
      icon: Calendar,
      steps: [
        'Pick your days - click individual days or use the Weekdays / All Days quick buttons',
        'Set your hours - start time, end time, and slot duration',
        'Review & create - the form shows the slot count and potential revenue before you commit',
      ],
      tips: [
        'Add buffer time between slots (end at 16:30 for a 30 minute break before 17:00)',
        'Post availability 2-3 weeks in advance so clients can plan',
        'Plan limits: Bronze 10 slots/week, Silver 30, Gold unlimited',
      ],
    },
    {
      title: 'Managing bookings',
      description:
        'Every confirmed booking lands on My Bookings. Accept, reschedule, or cancel from one place without phone calls or email back-and-forth.',
      icon: Settings,
      steps: [
        'Open My Bookings from the sidebar',
        'See upcoming, completed and cancelled sessions filtered by status',
        'Click any booking to see client name, notes and payment status',
        'Use Reschedule if the client agrees to a new time',
        'Use Cancel only if unavoidable - clients are auto-notified',
        'Open Messages directly from a booking if you need to reach the client',
      ],
      tips: [
        'Check your dashboard daily - responding to messages within 12 hours keeps clients engaged',
        'Avoid cancelling on short notice - it affects your rating and search placement',
        'Accept / decline happens automatically on the booking itself; no manual accept step needed',
      ],
    },
    {
      title: 'Marking sessions complete',
      description:
        'This is the single most important step. Until you mark a session complete, it does not count toward your revenue and the client cannot leave you a rating.',
      icon: CheckSquare,
      steps: [
        'After the session ends, open My Slots or My Bookings',
        'Find the session in the list (booked / past-time sessions show a Complete button inline)',
        'Click Complete - confirmation happens instantly',
        'The session moves to Completed status, revenue updates, and the client is prompted to rate',
      ],
      tips: [
        'Set a 5-minute reminder at the end of your workday to tick off everything',
        'There is no automatic completion - it must be a conscious action',
        'Silver and Gold also unlock the Generate Invoice button once a session is complete',
      ],
    },
    {
      title: 'Growing your practice',
      description:
        'The dashboard and analytics show what is working. Double down on strong services and time slots, and spot the gaps before they hurt revenue.',
      icon: TrendingUp,
      steps: [
        'Review the revenue chart on the home dashboard weekly',
        'Check Completed Sessions monthly for trend',
        'Watch your average rating - aim to stay above 4.5 for best search placement',
        'On Silver/Gold, open Analytics for deeper breakdowns',
        'Update pricing, availability, or services based on what you learn',
      ],
      tips: [
        'Bronze: home dashboard stats only (revenue + appointments)',
        'Silver: full analytics except services / ratings / peak times',
        'Gold: everything, plus advanced weekly-trend comparisons',
        'If peak booking times cluster (e.g. evenings), consider premium pricing',
      ],
    },
  ],
};

export function GuideTabs() {
  const [activeTab, setActiveTab] = useState<'client' | 'therapist'>('client');
  const isMobile = useIsMobile();

  return (
    <div>
      {/* Tab Toggle */}
      <motion.div
        initial={{ opacity: 0, y: isMobile ? 0 : 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: isMobile ? '0px' : '-100px' }}
        transition={{ duration: isMobile ? 0.3 : 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="flex justify-center mb-12"
      >
        <div className="inline-flex bg-white dark:bg-neutral-900 p-1.5 rounded-xl border border-gray-100 dark:border-neutral-800 shadow-sm">
          <button
            onClick={() => setActiveTab('client')}
            className={`px-8 py-2.5 text-sm font-semibold rounded-lg transition-all duration-300 ${
              activeTab === 'client'
                ? 'bg-[#f5f4f1] dark:bg-neutral-800 text-primary shadow-md shadow-primary/5'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            For Clients
          </button>
          <button
            onClick={() => setActiveTab('therapist')}
            className={`px-8 py-2.5 text-sm font-semibold rounded-lg transition-all duration-300 ${
              activeTab === 'therapist'
                ? 'bg-[#f5f4f1] dark:bg-neutral-800 text-primary shadow-md shadow-primary/5'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            For Therapists
          </button>
        </div>
      </motion.div>

      {/* Detailed topic sections */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-6"
        >
          {guides[activeTab].map((topic, idx) => (
            <motion.section
              key={topic.title}
              initial={{ opacity: 0, y: isMobile ? 0 : 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: isMobile ? 0 : idx * 0.06,
                duration: isMobile ? 0.2 : 0.5,
              }}
              className="p-7 lg:p-10 rounded-2xl border border-gray-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm"
            >
              <div className="flex items-start gap-5 mb-5">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/10 to-sage-warm/10 flex items-center justify-center flex-shrink-0">
                  <topic.icon className="w-7 h-7 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-baseline gap-3 mb-2">
                    <span className="text-xs font-bold text-primary uppercase tracking-widest font-inter">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <h3 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white font-playfair">
                      {topic.title}
                    </h3>
                  </div>
                  <p className="text-sm lg:text-base text-gray-600 dark:text-neutral-400 font-open-sans leading-relaxed">
                    {topic.description}
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mt-6 pl-0 md:pl-[76px]">
                {/* Steps */}
                <div>
                  <h4 className="text-xs font-bold text-gray-500 dark:text-neutral-500 uppercase tracking-widest mb-4 font-inter">
                    How it works
                  </h4>
                  <ol className="space-y-3">
                    {topic.steps.map((step, stepIdx) => (
                      <li
                        key={stepIdx}
                        className="flex items-start gap-3 text-sm text-gray-700 dark:text-neutral-300 font-open-sans leading-relaxed"
                      >
                        <span className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-primary/10 text-primary text-[11px] font-bold flex items-center justify-center font-poppins">
                          {stepIdx + 1}
                        </span>
                        <span className="flex-1 pt-0.5">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Tips */}
                <div>
                  <h4 className="text-xs font-bold text-gray-500 dark:text-neutral-500 uppercase tracking-widest mb-4 font-inter">
                    Tips
                  </h4>
                  <ul className="space-y-3">
                    {topic.tips.map((tip, tipIdx) => (
                      <li
                        key={tipIdx}
                        className="flex items-start gap-3 text-sm text-gray-700 dark:text-neutral-300 font-open-sans leading-relaxed"
                      >
                        <span className="flex-shrink-0 mt-2 w-1.5 h-1.5 rounded-full bg-primary" />
                        <span className="flex-1">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.section>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
