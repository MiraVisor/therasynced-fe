'use client';

import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, Heart, Users } from 'lucide-react';
import Image from 'next/image';
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

  const handleTherapistCTA = () => {
    router.push('/authentication/sign-in');
  };

  return (
    <section className="w-full px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-36 bg-gradient-to-br from-cream via-mint-light/50 to-sage-warm/30 relative overflow-hidden">
      {/* Background Image with Gradient Overlay */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 opacity-20"
          <Image
            src="/images/physio/close-up-man-training-with-elastic-band.jpg"
            alt="An active session using a resistance band"
            fill
            className="object-cover"
            sizes="100vw"
            priority={false}
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-cream/80 via-mint-light/60 to-sage-warm/40" />
      </div>

      {/* Organic Shapes Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Large organic blob */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/20 to-sage-warm/20 rounded-full blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5, delay: 0.3, ease: 'easeOut' }}
          className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-sage-warm/20 to-mint-light/30 rounded-full blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5, delay: 0.6, ease: 'easeOut' }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-primary/10 via-sage-warm/10 to-mint-light/20 rounded-full blur-2xl"
        />

        {/* Decorative circles */}
        <div className="absolute top-20 left-20 w-32 h-32 border-2 border-primary/10 rounded-full" />
        <div className="absolute bottom-32 right-32 w-24 h-24 border-2 border-sage-warm/20 rounded-full" />
      </div>

      <div className="relative max-w-5xl mx-auto text-center z-10">
        {/* Icon/Illustration Element */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex justify-center mb-8"
        >
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-sage-warm/20 flex items-center justify-center shadow-lg">
            <Heart className="w-10 h-10 text-primary" />
          </div>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight font-playfair"
        >
          Ready to start your wellness journey?
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-xl sm:text-2xl text-gray-700 mb-10 max-w-3xl mx-auto leading-relaxed font-open-sans"
        >
          Join thousands of clients who've found their perfect therapist match. Your wellness
          journey is just a click away.
        </motion.p>

        {/* Primary CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10"
        >
          <Button
            onClick={handleCTAClick}
            size="lg"
            className="group w-full sm:w-auto min-w-[280px] h-16 text-xl font-semibold bg-primary text-white hover:bg-primary/90 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95"
          >
            {hasValidToken ? 'Go to Dashboard' : 'Get Started Free'}
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>

        {/* Reassurance Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-gray-700 mb-12"
        >
          {['No credit card required', 'Free forever for clients', 'Cancel anytime'].map(
            (item, index) => (
              <div key={index} className="flex items-center gap-2 text-base font-inter">
                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                <span>{item}</span>
              </div>
            ),
          )}
        </motion.div>

        {/* Divider */}
        <div className="relative mb-12">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 />
          </div>
          <div className="relative flex justify-center">
            <span className="px-4 bg-gradient-to-br from-cream via-mint-light/50 to-sage-warm/30 text-sm text-gray-500 font-inter">
              Are you a therapist?
            </span>
          </div>
        </div>

        {/* Secondary CTA for Therapists */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <div className="flex items-center gap-3 p-6 rounded-2xl bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div className="text-left">
              <h3 className="text-lg font-bold text-gray-900 mb-1 font-poppins">
                Join Our Network
              </h3>
              <p className="text-sm text-gray-600 font-open-sans">
                Connect with clients and grow your practice
              </p>
            </div>
          </div>
          <Button
            onClick={handleTherapistCTA}
            variant="outline"
            size="lg"
            className="group h-16 px-8 text-lg font-semibold border-2 border-primary text-primary hover:bg-primary hover:text-white rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95"
          >
            Sign Up as Therapist
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default CtaSection;
