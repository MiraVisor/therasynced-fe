'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
  Calendar,
  Clock,
  FileText,
  MessageSquare,
  Search,
  ShieldCheck,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useState } from 'react';

const Features = () => {
  const [activeTab, setActiveTab] = useState<'client' | 'therapist'>('client');

  const features = {
    client: [
      {
        title: 'Global Exploration',
        description:
          'Search our directory of licensed professionals with advanced filters for price, rating, and expertise.',
        icon: Search,
      },
      {
        title: 'Instant Booking',
        description:
          'See live slots and book appointments in seconds. Syncs directly with your therapist’s calendar.',
        icon: Calendar,
      },
      {
        title: 'Secure Messages',
        description:
          'A private, encrypted channel to discuss treatments and goals with your therapist.',
        icon: MessageSquare,
      },
      {
        title: 'Verified Profiles',
        description: 'Every professional is background-checked and license-verified by our team.',
        icon: ShieldCheck,
      },
    ],
    therapist: [
      {
        title: 'Slot Management',
        description:
          'Complete control over your availability. Set recurring schedules or one-off sessions effortlessly.',
        icon: Clock,
      },
      {
        title: 'Finance Tracking',
        description:
          'Comprehensive dashboard to track revenue, manage invoices, and monitor appointments.',
        icon: TrendingUp,
      },
      {
        title: 'Patient Directory',
        description:
          'Manage your client list, view booking history, and keep track of personalized care records.',
        icon: Users,
      },
      {
        title: 'Digital Intake',
        description:
          'Digital intake forms and progress notes to manage your practice efficiently and paper-free.',
        icon: FileText,
      },
    ],
  };

  return (
    <section id="features" className="w-full px-4 sm:px-6 lg:px-8 py-24 bg-[#faf9f6] dark:bg-black">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-16 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-4 max-w-2xl"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
              Professional tools for better care
            </h2>
            <p className="text-lg text-gray-600 dark:text-neutral-400">
              Built on real needs, TheraSynced provides a robust infrastructure for both clients
              seeking wellness and therapists growing their practice.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="flex bg-[#f5f4f1] dark:bg-neutral-900 p-1.5 rounded-xl border border-gray-100 dark:border-neutral-800 self-start"
          >
            <button
              onClick={() => setActiveTab('client')}
              className={`px-8 py-2.5 text-sm font-semibold rounded-lg transition-all duration-300 ${
                activeTab === 'client'
                  ? 'bg-[#faf9f6] dark:bg-neutral-800 text-primary shadow-md shadow-primary/5'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              For Clients
            </button>
            <button
              onClick={() => setActiveTab('therapist')}
              className={`px-8 py-2.5 text-sm font-semibold rounded-lg transition-all duration-300 ${
                activeTab === 'therapist'
                  ? 'bg-[#faf9f6] dark:bg-neutral-800 text-primary shadow-md shadow-primary/5'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              For Therapists
            </button>
          </motion.div>
        </div>

        <div className="relative min-h-[400px] lg:min-h-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
            >
              {features[activeTab].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.5 }}
                  className="p-8 rounded-2xl border border-gray-100 dark:border-neutral-900 bg-[#faf9f6] dark:bg-neutral-900/50 hover:border-primary/50 transition-all duration-300 group hover:shadow-xl hover:shadow-primary/10"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center mb-6 group-hover:bg-primary/10 transition-colors duration-300">
                    <feature.icon className="w-6 h-6 text-primary transition-colors duration-300" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-neutral-400 leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default Features;
