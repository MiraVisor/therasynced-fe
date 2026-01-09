'use client';

import { motion } from 'framer-motion';
import { Award, Calendar, ChevronRight, MessageSquare, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

const steps = [
  {
    title: 'Search & Filter',
    description:
      'Browse therapists by location, specialty, and availability. Find the right professional for your specific health goals.',
    icon: Search,
    color: 'from-primary/20 to-sage-warm/20',
  },
  {
    title: 'Book a Session',
    description:
      'View real-time availability. Choose a time that fits your schedule and book instantly. No worrying about availability or callbacks.',
    icon: Calendar,
    color: 'from-sage-warm/20 to-mint-light/20',
  },
  {
    title: 'Message',
    description:
      'Message your therapist directly through our secure platform. Discuss your needs before or after your session.',
    icon: MessageSquare,
    color: 'from-mint-light/20 to-primary/20',
  },
  {
    title: 'Earn Rewards',
    description:
      'Get loyalty stamps for every session you attend. Redeem them for discounts on future sessions.',
    icon: Award,
    color: 'from-primary/20 to-warm-green/20',
  },
];

const HowItWorks = () => {
  const router = useRouter();
  const isMobile = useIsMobile();

  return (
    <section
      id="how-it-works"
      className="w-full px-4 sm:px-6 lg:px-8 py-24 lg:py-32 bg-[#f5f4f1] dark:bg-neutral-950/50 relative overflow-hidden"
    >
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03] pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 border border-primary rounded-full" />
        <div className="absolute bottom-20 right-20 w-72 h-72 border border-sage-warm rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-mint-light rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: isMobile ? 0 : 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: isMobile ? '0px' : '-100px' }}
          transition={{ duration: isMobile ? 0.3 : 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16 lg:mb-20 space-y-4"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white font-playfair">
            How it works
          </h2>
          <p className="text-base sm:text-lg text-gray-600 dark:text-neutral-400 max-w-2xl mx-auto font-open-sans">
            Find and book sessions with independent professionals in a few clicks.
          </p>
        </motion.div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: isMobile ? 0 : 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: isMobile ? '0px' : '-50px' }}
              transition={{
                delay: isMobile ? 0 : index * 0.1,
                duration: 0.5,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="relative group"
            >
              <div className="bg-white dark:bg-neutral-900 rounded-2xl p-8 border border-gray-100 dark:border-neutral-800 shadow-sm hover:shadow-lg hover:border-primary/20 transition-all duration-300 h-full">
                {/* Step Number */}
                <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-primary text-white text-sm font-bold flex items-center justify-center shadow-lg">
                  {index + 1}
                </div>

                <div className="flex flex-col items-center text-center space-y-5">
                  {/* Icon */}
                  <div
                    className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${step.color} border border-gray-100 dark:border-neutral-800 flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:border-primary/30 transition-all duration-300 group-hover:scale-105`}
                  >
                    <step.icon className="w-10 h-10 text-primary transition-transform duration-300 group-hover:scale-110" />
                  </div>

                  {/* Content */}
                  <div className="space-y-3">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white font-poppins">
                      {step.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-neutral-400 leading-relaxed font-open-sans">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA at End */}
        <motion.div
          initial={{ opacity: 0, y: isMobile ? 0 : 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: isMobile ? '0px' : '-50px' }}
          transition={{ delay: 0.6, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mt-16 lg:mt-20 flex justify-center"
        >
          <Button
            onClick={() => router.push('/authentication/sign-in')}
            size="lg"
            className="group px-10 h-14 text-lg font-semibold bg-primary hover:bg-primary/90 text-white rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            Get Started Free
            <ChevronRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorks;
