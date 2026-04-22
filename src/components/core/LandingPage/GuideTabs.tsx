'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
  BarChart3,
  Calendar,
  CreditCard,
  FileText,
  LayoutDashboard,
  MapPin,
  MessageSquare,
  RefreshCw,
  Search,
  Settings,
  Star,
  UserCheck,
} from 'lucide-react';
import { useState } from 'react';

import { useIsMobile } from '@/hooks/use-mobile';

const guides = {
  client: [
    {
      title: 'Find a therapist',
      description:
        'Search by location, specialty, availability, and price. Filter to the qualified professional who fits your needs.',
      icon: Search,
    },
    {
      title: 'Book a session',
      description:
        'Pick an open slot, pay securely with Stripe, and receive instant confirmation. No calls, no waiting.',
      icon: Calendar,
    },
    {
      title: 'Message directly',
      description:
        'Chat with your therapist through encrypted in-platform messaging before or after your session.',
      icon: MessageSquare,
    },
    {
      title: 'Reschedule or cancel',
      description:
        'Change your plans from the dashboard. Cancelling before the session start time is free and easy.',
      icon: RefreshCw,
    },
    {
      title: 'Rate your session',
      description:
        'Leave a star rating after each completed session. Your feedback helps other clients choose confidently.',
      icon: Star,
    },
    {
      title: 'Track everything',
      description:
        'Sessions, messages, receipts, and favourite therapists all live in one clean dashboard you can revisit anytime.',
      icon: LayoutDashboard,
    },
  ],
  therapist: [
    {
      title: 'Set up your profile',
      description:
        'Upload your qualifications and documents. Once verified, you appear in client search results.',
      icon: UserCheck,
    },
    {
      title: 'Set your pricing',
      description:
        'Configure a flat session rate or different prices per service, duration, or location type.',
      icon: CreditCard,
    },
    {
      title: 'Create availability',
      description:
        'Pick the days and hours you want to work. Create a whole week of slots in a couple of clicks.',
      icon: Calendar,
    },
    {
      title: 'Manage bookings',
      description:
        'Accept, reschedule, or cancel sessions from a single dashboard. Clients get automatic email updates.',
      icon: Settings,
    },
    {
      title: 'Mark sessions complete',
      description:
        'Tick sessions off once finished. This unlocks your revenue for that session and lets the client leave a rating.',
      icon: FileText,
    },
    {
      title: 'Grow your practice',
      description:
        'Track analytics, generate invoices, and get priority placement in search results on higher-tier plans.',
      icon: BarChart3,
    },
  ],
};

type TabKey = 'client' | 'therapist';

export function GuideTabs() {
  const [activeTab, setActiveTab] = useState<TabKey>('client');
  const isMobile = useIsMobile();

  return (
    <div>
      {/* Tab Toggle — matches the Features section pattern */}
      <motion.div
        initial={{ opacity: 0, y: isMobile ? 0 : 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: isMobile ? '0px' : '-100px' }}
        transition={{ duration: isMobile ? 0.3 : 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="flex justify-center mb-10 lg:mb-12"
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

      {/* Guide Cards Grid */}
      <div className="relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {guides[activeTab].map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: isMobile ? 0 : 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: isMobile ? 0 : index * 0.08,
                  duration: isMobile ? 0.2 : 0.5,
                }}
                className="p-6 lg:p-8 rounded-2xl border border-gray-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-primary/50 transition-all duration-300 group hover:shadow-xl hover:shadow-primary/10 relative"
              >
                {/* Step number in the corner — consistent with how-it-works */}
                <div className="absolute top-5 right-5 w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-xs font-bold text-primary font-poppins">{index + 1}</span>
                </div>

                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/10 to-sage-warm/10 flex items-center justify-center mb-5 group-hover:from-primary/20 group-hover:to-sage-warm/20 transition-all duration-300">
                  <step.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 font-poppins pr-10">
                  {step.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-neutral-400 leading-relaxed font-open-sans">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Location-agnostic note for therapists only */}
      {activeTab === 'therapist' && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="mt-8 flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-neutral-400 font-open-sans"
        >
          <MapPin className="w-4 h-4" />
          Work from a clinic, home visits, pitchside, corporate, or mix and match on higher plans.
        </motion.p>
      )}
    </div>
  );
}
