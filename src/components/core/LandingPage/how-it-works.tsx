'use client';

import { motion } from 'framer-motion';
import { Award, Calendar, MessageSquare, Search } from 'lucide-react';

const steps = [
  {
    title: 'Search & Filter',
    description:
      'Browse verified profiles by specialty, location, or availability. Find the right professional for your specific health goals.',
    icon: Search,
  },
  {
    title: 'Select a Slot',
    description:
      'View real-time availability. Choose a time that fits your schedule and book instantly—no waiting for callbacks.',
    icon: Calendar,
  },
  {
    title: 'Secure Consultation',
    description:
      'Message your therapist directly through our secure platform. Discuss your needs before or after your session.',
    icon: MessageSquare,
  },
  {
    title: 'Earn Rewards',
    description:
      'Get loyalty stamps for every session you attend. Redeem them for discounts on future treatments.',
    icon: Award,
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="w-full px-4 sm:px-6 lg:px-8 py-24 bg-white dark:bg-black">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20 space-y-4"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
            Simple, transparent booking
          </h2>
          <p className="text-lg text-gray-600 dark:text-neutral-400 max-w-2xl mx-auto">
            We've streamlined the process of finding and booking healthcare services. No more
            endless phone calls or manual forms.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="relative group"
            >
              {/* Connector line for desktop */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-1/2 w-full h-[1px] bg-gray-100 dark:bg-neutral-800 -z-0" />
              )}

              <div className="relative z-10 flex flex-col items-center text-center space-y-6">
                <div className="w-16 h-16 rounded-2xl bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 flex items-center justify-center shadow-sm group-hover:border-primary group-hover:shadow-lg group-hover:shadow-primary/5 transition-all duration-300">
                  <step.icon className="w-7 h-7 text-primary" />
                </div>

                <div className="space-y-2">
                  <div className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">
                    Step 0{index + 1}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{step.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-neutral-400 leading-relaxed px-4">
                    {step.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
