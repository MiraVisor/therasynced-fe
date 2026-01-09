'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { JOB_TITLE_INFO } from '@/config/serviceCategories';
import { useIsMobile } from '@/hooks/use-mobile';
import { isTokenValid } from '@/lib/utils';
import { JobTitleEnum } from '@/types/types';

const serviceTypes = [
  {
    id: JobTitleEnum.PHYSIOTHERAPY,
    title: JOB_TITLE_INFO[JobTitleEnum.PHYSIOTHERAPY].displayName,
    description: JOB_TITLE_INFO[JobTitleEnum.PHYSIOTHERAPY].description,
    color: 'from-primary/20 to-sage-warm/20',
    hoverColor: 'hover:from-primary/30 hover:to-sage-warm/30',
  },
  {
    id: JobTitleEnum.MASSAGE_THERAPY,
    title: JOB_TITLE_INFO[JobTitleEnum.MASSAGE_THERAPY].displayName,
    description: JOB_TITLE_INFO[JobTitleEnum.MASSAGE_THERAPY].description,
    color: 'from-sage-warm/20 to-mint-light/20',
    hoverColor: 'hover:from-sage-warm/30 hover:to-mint-light/30',
  },
  {
    id: JobTitleEnum.ATHLETIC_THERAPY,
    title: JOB_TITLE_INFO[JobTitleEnum.ATHLETIC_THERAPY].displayName,
    description: JOB_TITLE_INFO[JobTitleEnum.ATHLETIC_THERAPY].description,
    color: 'from-mint-light/20 to-primary/20',
    hoverColor: 'hover:from-mint-light/30 hover:to-primary/30',
  },
];

const Hero = () => {
  const [, setHasValidToken] = useState(false);
  const router = useRouter();
  const isMobile = useIsMobile();

  useEffect(() => {
    setHasValidToken(isTokenValid());
  }, []);

  const handleServiceTypeClick = (_serviceType?: JobTitleEnum) => {
    // Navigate to sign-in (could be enhanced to filter by service type in future)
    router.push('/authentication/sign-in');
  };

  return (
    <section
      id="hero"
      className="relative w-full min-h-screen flex items-center px-4 sm:px-6 lg:px-8 py-20 lg:py-24 overflow-hidden"
    >
      {/* Background Image - Subtle */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/physio/clinic-rehabilitation.jpg"
          alt="Professional rehabilitation clinic"
          fill
          className="object-cover object-center opacity-[0.08] dark:opacity-[0.05]"
          priority
          quality={75}
          sizes="100vw"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-cream via-cream/95 to-[#faf9f6] dark:from-black dark:via-black/95 dark:to-black" />
      </div>

      {/* Warm gradient background effects */}
      {!isMobile && (
        <>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            className="absolute top-20 right-10 w-[500px] h-[500px] bg-gradient-to-br from-primary/10 via-sage-warm/10 to-mint-light/20 rounded-full blur-[100px] pointer-events-none z-[1]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, delay: 0.3, ease: 'easeOut' }}
            className="absolute bottom-20 left-10 w-[400px] h-[400px] bg-gradient-to-tr from-sage-warm/10 via-primary/10 to-teal/10 rounded-full blur-[80px] pointer-events-none z-[1]"
          />
        </>
      )}

      <div className="max-w-5xl mx-auto relative z-10 w-full">
        {/* Main Content - Centered */}
        <div className="flex flex-col items-center text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: isMobile ? 0 : 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: isMobile ? 0.3 : 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-4 max-w-3xl"
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-gray-900 dark:text-white leading-[1.1] font-playfair py-3">
              Find & Book <br /> Your Next Session
            </h1>

            <p className="text-base sm:text-lg text-gray-600 dark:text-neutral-400 max-w-2xl mx-auto leading-relaxed font-open-sans font-normal py-8">
              TheraSynced connects you with independent professionals, letting you view availability
              and book sessions more efficiently and securely.
            </p>
          </motion.div>

          {/* Service Type Selection Cards */}
          <motion.div
            initial={{ opacity: 0, y: isMobile ? 0 : 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-3xl"
          >
            <p className="text-sm font-medium text-gray-500 dark:text-neutral-500 mb-4 font-open-sans">
              What type of service are you looking for?
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {serviceTypes.map((type, index) => (
                <motion.button
                  key={type.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                  onClick={() => handleServiceTypeClick(type.id)}
                  className={`group relative p-5 rounded-xl bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border border-gray-100 dark:border-neutral-800 hover:border-primary/40 transition-all duration-300 text-left shadow-sm hover:shadow-lg hover:scale-[1.02]`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1 font-poppins">
                        {type.title}
                      </h3>
                      <p className="text-xs text-gray-600 dark:text-neutral-400 font-open-sans leading-snug line-clamp-2">
                        {type.description}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300 flex-shrink-0 mt-0.5" />
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Organic Wave Transition */}
      <div className="absolute bottom-0 left-0 right-0 h-24 overflow-hidden pointer-events-none">
        <svg
          className="absolute bottom-0 w-full h-full"
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          <path
            d="M0,80 Q360,40 720,60 T1440,40 L1440,120 L0,120 Z"
            fill="url(#waveGradient)"
            className="opacity-60"
          />
          <path
            d="M0,100 Q360,50 720,70 T1440,50 L1440,120 L0,120 Z"
            fill="url(#waveGradient2)"
            className="opacity-40"
          />
          <defs>
            <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="var(--mint-light)" />
              <stop offset="100%" stopColor="var(--sage)" />
            </linearGradient>
            <linearGradient id="waveGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="var(--sage)" />
              <stop offset="100%" stopColor="var(--primary)" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </section>
  );
};

export default Hero;
