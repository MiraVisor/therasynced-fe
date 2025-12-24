'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import SlideArrowButton from '@/components/ui/SlideArrowButton';
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
    <section className="relative w-full min-h-[85vh] flex items-center justify-center overflow-hidden bg-white dark:bg-black">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5 dark:opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(0,119,69,0.1),transparent_50%)]" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
        <div className="text-center space-y-8 sm:space-y-10 lg:space-y-12">
          {/* Main Heading */}
          <div className="space-y-4 sm:space-y-6">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1]">
              <span className="text-gray-900 dark:text-white">Find Your</span>
              <br />
              <span className="text-primary">Perfect Therapist</span>
            </h1>

            <p className="text-lg sm:text-xl md:text-2xl text-gray-600 dark:text-neutral-400 max-w-3xl mx-auto leading-relaxed">
              Book appointments with licensed therapists. Get personalized care when you need it.
            </p>
          </div>

          {/* CTA Button */}
          <div className="flex justify-center">
            <SlideArrowButton
              text={hasValidToken ? 'Go to Dashboard' : 'Get Started Free'}
              reverse={true}
              className="w-full sm:w-auto min-w-[240px] h-14 text-lg font-medium"
              onClick={handleCTAClick}
            />
          </div>
        </div>
      </div>

      {/* Bottom decorative line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
    </section>
  );
};

export default Hero;
