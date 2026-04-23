'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
  Calendar,
  CheckCircle,
  Clock,
  Eye,
  Lock,
  Shield,
  Sliders,
  Star,
  UserCheck,
} from 'lucide-react';
import { useState } from 'react';

import { useIsMobile } from '@/hooks/use-mobile';

const features = {
  client: [
    {
      title: 'Book in Minutes',
      description:
        'View availability and schedule sessions directly with professionals - no calls or back-and-forth.',
      icon: Clock,
    },
    {
      title: 'Verified Professionals',
      description:
        'Only qualified therapists, trainers, and coaches with verified credentials can be listed.',
      icon: Shield,
    },
    {
      title: 'Flexible Sessions',
      description:
        'Book private sessions, clinic appointments, or event support at times that suit you.',
      icon: Calendar,
    },
    {
      title: 'Transparent Rates',
      description:
        'Professionals set their own pricing, so you always know what to expect before booking.',
      icon: Eye,
    },
    {
      title: 'Secure Messaging',
      description:
        'Communicate with your professional safely through encrypted messaging before or after your session.',
      icon: Lock,
    },
  ],
  professional: [
    {
      title: 'Control Your Schedule',
      description:
        'Set your available slots and rates, and let clients book directly into your calendar.',
      icon: Sliders,
    },
    {
      title: 'Simple Booking Management',
      description: 'Keep all appointments, messages, and client details organised in one place.',
      icon: Calendar,
    },
    {
      title: 'Flexible Work',
      description:
        'Take on as many or as few bookings as you want - no long-term commitments required.',
      icon: Clock,
    },
    {
      title: 'Build Trust',
      description:
        'Share your qualifications, certificates, and experience so clients book with confidence.',
      icon: UserCheck,
    },
    {
      title: 'Ratings & Reviews',
      description:
        'Grow your reputation with verified client ratings after every completed session.',
      icon: Star,
    },
  ],
};

const Features = () => {
  const [activeTab, setActiveTab] = useState<'client' | 'professional'>('client');
  const isMobile = useIsMobile();

  return (
    <section
      id="features"
      className="w-full px-4 sm:px-6 lg:px-8 py-24 lg:py-32 bg-[#f5f4f1] dark:bg-neutral-950/50 relative overflow-hidden"
    >
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03] pointer-events-none">
        <div className="absolute top-32 right-16 w-72 h-72 border border-primary rounded-full" />
        <div className="absolute bottom-16 left-16 w-56 h-56 border border-sage-warm rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header with Tab Toggle */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-16 gap-8">
          <motion.div
            initial={{ opacity: 0, x: isMobile ? 0 : -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: isMobile ? '0px' : '-100px' }}
            transition={{ duration: isMobile ? 0.3 : 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-4 max-w-2xl"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white font-playfair">
              Why Choose TheraSynced
            </h2>
            <p className="text-base sm:text-lg text-gray-600 dark:text-neutral-400 font-open-sans">
              A simple platform to manage bookings, communicate securely, and focus on what matters.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: isMobile ? 0 : 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: isMobile ? '0px' : '-100px' }}
            transition={{ duration: isMobile ? 0.3 : 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="flex bg-white dark:bg-neutral-900 p-1.5 rounded-xl border border-gray-100 dark:border-neutral-800 self-start"
          >
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
              onClick={() => setActiveTab('professional')}
              className={`px-8 py-2.5 text-sm font-semibold rounded-lg transition-all duration-300 ${
                activeTab === 'professional'
                  ? 'bg-[#f5f4f1] dark:bg-neutral-800 text-primary shadow-md shadow-primary/5'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              For Professionals
            </button>
          </motion.div>
        </div>

        {/* Feature Cards Grid */}
        <div className="relative min-h-[400px] lg:min-h-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {features[activeTab].map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: isMobile ? 0 : 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: isMobile ? 0 : index * 0.1,
                    duration: isMobile ? 0.2 : 0.5,
                  }}
                  className="p-6 rounded-2xl border border-gray-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-primary/50 transition-all duration-300 group hover:shadow-xl hover:shadow-primary/10"
                >
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/10 to-sage-warm/10 flex items-center justify-center mb-5 group-hover:from-primary/20 group-hover:to-sage-warm/20 transition-all duration-300">
                    <feature.icon className="w-7 h-7 text-primary transition-colors duration-300" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 font-poppins">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-neutral-400 leading-relaxed font-open-sans">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Trust Line */}
        <motion.div
          initial={{ opacity: 0, y: isMobile ? 0 : 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: isMobile ? '0px' : '-50px' }}
          transition={{ delay: 0.5, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mt-12 lg:mt-16 flex justify-center"
        >
          <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 shadow-sm">
            <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
            <p className="text-sm text-gray-600 dark:text-neutral-400 font-open-sans">
              Encrypted messaging · Verified professionals · GDPR compliant
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Features;
