'use client';

import { motion } from 'framer-motion';
import { Clock, Heart, Lock, ShieldCheck, Star, Zap } from 'lucide-react';

import { useIsMobile } from '@/hooks/use-mobile';

const trustFactors = [
  {
    title: 'Verified Therapists',
    description: 'Identity and license verification for every professional.',
    icon: ShieldCheck,
  },
  {
    title: 'Data Privacy',
    description: 'Your health data protected with industry-standard encryption.',
    icon: Lock,
  },
  {
    title: 'Real-time Booking',
    description: 'See availability and book instantly. No callbacks.',
    icon: Zap,
  },
  {
    title: 'Flexible Scheduling',
    description: 'Wide range of time slots to fit your schedule.',
    icon: Clock,
  },
  {
    title: 'Transparent Ratings',
    description: 'Real feedback from verified clients.',
    icon: Star,
  },
  {
    title: 'Client-First',
    description: 'Every feature designed with your experience in mind.',
    icon: Heart,
  },
];

const WhyChooseUs = () => {
  const isMobile = useIsMobile();

  return (
    <section
      id="why-choose-us"
      className="w-full px-4 sm:px-6 lg:px-8 py-24 lg:py-32 bg-[#f5f4f1] relative overflow-hidden"
    >
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: isMobile ? 0 : 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: isMobile ? '0px' : '-100px' }}
          transition={{ duration: isMobile ? 0.3 : 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16 lg:mb-20 space-y-4"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 font-playfair">
            Why trust TheraSynced?
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto font-open-sans">
            Built with your privacy and convenience in mind.
          </p>
        </motion.div>

        {/* Simple Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-14">
          {trustFactors.map((factor, index) => {
            const Icon = factor.icon;

            return (
              <motion.div
                key={factor.title}
                initial={{ opacity: 0, y: isMobile ? 0 : 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: isMobile ? '0px' : '-50px' }}
                transition={{
                  delay: isMobile ? 0 : index * 0.08,
                  duration: isMobile ? 0.3 : 0.5,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="group text-center"
              >
                {/* Icon */}
                <div className="mb-5 flex justify-center">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                    <Icon className="w-8 h-8 text-primary" />
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-lg font-bold text-gray-900 mb-2 font-poppins">
                  {factor.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed font-open-sans max-w-xs mx-auto">
                  {factor.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
