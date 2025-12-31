'use client';

import Image from 'next/image';
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
    <section
      id="about"
      className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-10 lg:py-16 transition-all duration-500"
    >
      <div className="relative w-full aspect-[4/5] xs:aspect-[4/3] sm:aspect-[16/9] lg:aspect-[21/9] rounded-xl overflow-hidden">
        {/* background image */}
        <Image
          src="/svgs/header.svg"
          alt="hero"
          fill
          className="object-cover transition-transform duration-500 hover:scale-105"
          priority
        />

        {/* gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 dark:from-black/70 via-black/70 dark:via-black/60 to-black/60 dark:to-black/50" />

        {/* content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 sm:px-8 md:px-12 gap-6 sm:gap-8 lg:gap-10">
          <div className="max-w-[95vw] xs:max-w-sm sm:max-w-xl md:max-w-3xl lg:max-w-4xl mx-auto space-y-3 sm:space-y-4 lg:space-y-6">
            <h1 className="capitalize font-bold text-white text-balance leading-[1.1] tracking-tight text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl">
              Feel Better, <span className="text-primary">One Click</span> Away
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
