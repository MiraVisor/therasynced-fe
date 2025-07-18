'use client';

import { ArrowRight } from 'lucide-react';
// import { useTheme } from 'next-themes';
import Image from 'next/image';
import Link from 'next/link';

import { Button } from '@/components/ui/button';

const Hero = () => {
  // const { resolvedTheme } = useTheme();

  return (
    <section className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-10 lg:py-16 transition-all duration-500">
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
            <p className="text-white/90 font-light text-balance tracking-wide leading-relaxed text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl">
              Experience genuine care from dedicated professionals
            </p>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full max-w-[90vw] xs:max-w-xs sm:max-w-sm md:max-w-md lg:max-w-none items-center justify-center">
            <Link href="/authentication/sign-in" passHref>
              <Button className="w-full sm:w-auto lg:w-52 lg:h-12 px-6 py-2 sm:py-3 text-sm sm:text-base rounded-lg bg-primary hover:bg-primary/90 shadow-md hover:shadow-primary/25 lg:hover:scale-105 transition-all duration-300 group flex items-center justify-center gap-2">
                Start Your Journey
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
            </Link>
            {/* <Button
              variant="outline"
              className="w-full sm:w-auto lg:w-52 lg:h-12 px-6 py-2 sm:py-3 text-sm sm:text-base rounded-lg border-2 border-white/20 hover:bg-white/10 text-white shadow-sm lg:hover:scale-105 transition-all duration-300"
            >
              Explore
            </Button> */}
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-12 sm:w-24 lg:w-40 h-1.5 bg-primary/40 rounded-full blur-sm" />
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      </div>
    </section>
  );
};

export default Hero;
