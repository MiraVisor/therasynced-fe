'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { isTokenValid } from '@/lib/utils';

const Hero = () => {
  const [hasValidToken, setHasValidToken] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setHasValidToken(isTokenValid());
  }, []);

  const handleCTAClick = () => {
    if (hasValidToken) {
      router.push('/dashboard');
    } else {
      router.push('/authentication/sign-in');
    }
  };

  return (
    <section
      id="hero"
      className="relative w-full px-4 sm:px-6 lg:px-8 py-24 lg:py-40 bg-[#faf9f6] dark:bg-black overflow-hidden"
    >
      {/* Enhanced subtle green ambient background with animation */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
        className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, delay: 0.3, ease: 'easeOut' }}
        className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none"
      />
      {/* Subtle geometric pattern overlay */}
      <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03] pointer-events-none">
        <div className="absolute top-20 right-20 w-32 h-32 border border-primary rounded-full" />
        <div className="absolute bottom-32 left-32 w-24 h-24 border border-primary rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="flex-1 text-left space-y-8"
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-gray-900 dark:text-white leading-[1.1]">
              Connecting you with <br />
              <span className="text-primary">care that matters.</span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-600 dark:text-neutral-400 max-w-2xl leading-relaxed">
              Find licensed physiotherapists, massage therapists, and wellness experts near you.
              Real availability, instant booking, and secure messaging—designed for your well-being.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-5 pt-4">
              <Button
                onClick={handleCTAClick}
                size="lg"
                className="group w-full sm:w-auto px-10 h-14 text-lg font-semibold bg-primary hover:bg-primary/90 text-white rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                {hasValidToken ? 'Go to Dashboard' : 'Find a Therapist'}
                <ArrowRight className="ml-2 w-5 h-5 transition-colors duration-300" />
              </Button>
              <Button
                variant="ghost"
                size="lg"
                onClick={() => {
                  const el = document.getElementById('how-it-works');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full sm:w-auto px-10 h-14 text-lg font-semibold text-gray-600 dark:text-neutral-400 hover:text-primary transition-all duration-300 hover:bg-[#f5f4f1] dark:hover:bg-neutral-900 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                Learn more
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="flex-1 w-full max-w-[500px] lg:max-w-none"
          >
            <div className="relative aspect-square sm:aspect-[4/3] lg:aspect-square flex items-center justify-center">
              {/* Illustration using an existing SVG if possible, otherwise a clean abstract representation */}
              <div className="relative w-full h-full">
                <Image
                  src="/svgs/header.svg"
                  alt="Wellness and Therapy Illustration"
                  fill
                  className="object-contain"
                  priority
                />
              </div>

              {/* Subtle accent shadows/decorations */}
              <div className="absolute -z-10 w-4/5 h-4/5 bg-primary/5 rounded-full blur-3xl animate-pulse" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
