'use client';

import { motion } from 'framer-motion';
import { Clock, Heart, Lock, ShieldCheck, Star, Zap } from 'lucide-react';

import { useIsMobile } from '@/hooks/use-mobile';

const trustFactors = [
  {
    title: 'Verification Process',
    description:
      'We encourage all therapists to undergo identity and license verification. Professionals can start listing services immediately while the verification is in progress.',
    icon: ShieldCheck,
  },
  {
    title: 'Data Privacy',
    description:
      'Your health data and messages are protected with industry-standard encryption. We prioritize your confidentiality above all else.',
    icon: Lock,
  },
  {
    title: 'Real-time Scheduling',
    description:
      'No more "contact for availability". See exactly when your therapist is free and book a slot instantly.',
    icon: Zap,
  },
  {
    title: 'Flexible Care',
    description:
      'Book sessions that fit your life. From early morning to late evening, our professionals offer a wide range of slots.',
    icon: Clock,
  },
  {
    title: 'Transparent Ratings',
    description:
      'Every session can be rated by the client. We display these ratings transparently so you can see real-time feedback from others.',
    icon: Star,
  },
  {
    title: 'Patient-First Focus',
    description:
      'Our platform is built to make the journey to wellness as smooth as possible, removing the friction from traditional booking.',
    icon: Heart,
  },
];

const WhyChooseUs = () => {
  const isMobile = useIsMobile();

  return (
    <section
      id="why-choose-us"
      className="w-full px-4 sm:px-6 lg:px-8 py-24 bg-[#f5f4f1] dark:bg-neutral-950/50"
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: isMobile ? 0 : 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: isMobile ? '0px' : '-100px' }}
          transition={{ duration: isMobile ? 0.3 : 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-20 space-y-4"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
            A foundation built on trust
          </h2>
          <p className="text-lg text-gray-600 dark:text-neutral-400 max-w-2xl mx-auto">
            We understand that health care requires a higher standard of security and transparency.
            TheraSynced is designed to provide exactly that.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16">
          {trustFactors.map((factor, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: isMobile ? 0 : 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: isMobile ? '0px' : '-50px' }}
              transition={{
                delay: isMobile ? 0 : index * 0.1,
                duration: isMobile ? 0.3 : 0.6,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="flex gap-6 group"
            >
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-100 dark:border-green-900 flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all duration-300 shadow-sm group-hover:shadow-md group-hover:shadow-primary/20">
                  <factor.icon className="w-6 h-6 text-primary group-hover:text-white transition-colors duration-300" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{factor.title}</h3>
                <p className="text-sm text-gray-600 dark:text-neutral-400 leading-relaxed">
                  {factor.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
