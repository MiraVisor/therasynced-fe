'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Bell, Calendar, Clock, FileText, MessageSquare, Search, Star } from 'lucide-react';
import { useState } from 'react';

import { useIsMobile } from '@/hooks/use-mobile';

const Features = () => {
  const [activeTab, setActiveTab] = useState<'client' | 'therapist'>('client');
  const isMobile = useIsMobile();

  const features = {
    client: [
      {
        title: 'Find therapists',
        description:
          'Search for therapists by service type, location, availability, and price. Profiles include clear information to help you decide before booking.',
        icon: Search,
      },
      {
        title: 'Book appointments',
        description:
          'View real-time availability and book a session immediately. Bookings are confirmed without phone calls or follow-up messages.',
        icon: Calendar,
      },
      {
        title: 'Message securely',
        description:
          'Send private messages to your therapist through the platform. Conversations are encrypted and kept confidential.',
        icon: MessageSquare,
      },
      {
        title: 'View ratings',
        description:
          'See ratings and feedback from other clients based on completed sessions. This helps you choose with more confidence.',
        icon: Star,
      },
      {
        title: 'Get reminders',
        description:
          "Receive email reminders before your appointment so you don't forget or miss a session.",
        icon: Bell,
      },
    ],
    therapist: [
      {
        title: 'List your services',
        description:
          'Create a public profile that shows your services, pricing, and working hours. Clients can view this information before booking.',
        icon: FileText,
      },
      {
        title: 'Manage availability',
        description:
          'Set and update your available time slots at any time. Only open slots are visible to clients.',
        icon: Clock,
      },
      {
        title: 'Accept bookings',
        description:
          'Clients book directly into your calendar based on your availability. This reduces calls, emails, and manual scheduling.',
        icon: Calendar,
      },
      {
        title: 'Message securely',
        description:
          'Communicate with clients through private messaging before or after sessions. Messages are encrypted and kept within the platform.',
        icon: MessageSquare,
      },
      {
        title: 'Get reminders',
        description:
          'Receive email notifications for upcoming bookings to help you stay organised.',
        icon: Bell,
      },
    ],
  };

  return (
    <section id="features" className="w-full px-4 sm:px-6 lg:px-8 py-24 bg-[#faf9f6] dark:bg-black">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-16 gap-8">
          <motion.div
            initial={{ opacity: 0, x: isMobile ? 0 : -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: isMobile ? '0px' : '-100px' }}
            transition={{ duration: isMobile ? 0.3 : 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-4 max-w-2xl"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white font-playfair">
              What we offer
            </h2>
            <p className="text-lg text-gray-600 dark:text-neutral-400 font-open-sans">
              TheraSynced is built to remove the usual friction from booking therapy sessions.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: isMobile ? 0 : 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: isMobile ? '0px' : '-100px' }}
            transition={{ duration: isMobile ? 0.3 : 0.6, ease: [0.16, 1, 0.3, 1] }}
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
                  className="p-6 rounded-2xl border border-gray-100 dark:border-neutral-900 bg-white dark:bg-neutral-900/50 hover:border-primary/50 transition-all duration-300 group hover:shadow-xl hover:shadow-primary/10"
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
      </div>
    </section>
  );
};

export default Features;
