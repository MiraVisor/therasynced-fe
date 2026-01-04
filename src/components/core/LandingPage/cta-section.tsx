'use client';

import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { isTokenValid } from '@/lib/utils';

const CtaSection = () => {
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
    <section className="w-full px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-36 bg-gradient-to-br from-primary via-emerald-600 to-teal-600 dark:from-primary dark:via-emerald-700 dark:to-teal-700 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-emerald-400/10 rounded-full blur-2xl" />

      <div className="relative max-w-4xl mx-auto text-center">
        <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
          Ready to Start Feeling Better?
        </h2>

        <p className="text-xl sm:text-2xl text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed">
          Join thousands of clients who've found their perfect therapist match. Your wellness
          journey is just a click away.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
          <Button
            onClick={handleCTAClick}
            size="lg"
            className="group w-full sm:w-auto min-w-[280px] h-16 text-xl font-semibold bg-white text-primary hover:bg-gray-100 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
          >
            {hasValidToken ? 'Go to Dashboard' : 'Get Started Free'}
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-white/90">
          {['No credit card required', 'Free forever for clients', 'Cancel anytime'].map((item) => (
            <div key={item} className="flex items-center gap-2 text-base">
              <CheckCircle2 className="w-5 h-5" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CtaSection;
