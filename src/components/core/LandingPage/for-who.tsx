'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Briefcase, UserCheck } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

const ForWho = () => {
  const router = useRouter();
  const isMobile = useIsMobile();

  return (
    <section
      id="for-who"
      className="w-full px-4 sm:px-6 lg:px-8 py-24 lg:py-32 bg-[#f5f4f1] relative overflow-hidden"
    >
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
        <div className="absolute top-20 right-20 w-80 h-80 border border-primary rounded-full" />
        <div className="absolute bottom-20 left-20 w-64 h-64 border border-sage-warm rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: isMobile ? 0 : 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: isMobile ? '0px' : '-100px' }}
          transition={{ duration: isMobile ? 0.3 : 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16 lg:mb-20 space-y-4"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 font-playfair">
            For Freelancers & Clients
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto font-open-sans">
            Whether you&apos;re looking for work or looking to hire, TheraSynced makes it simple.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Freelancers Card */}
          <motion.div
            initial={{ opacity: 0, x: isMobile ? 0 : -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: isMobile ? '0px' : '-50px' }}
            transition={{ duration: isMobile ? 0.3 : 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg hover:border-primary/20 transition-all duration-300"
          >
            {/* Hero photo for this card */}
            <div className="relative w-full aspect-[16/9] bg-gray-100"
              <Image
                src="/images/physio/doctor-glues-tepee-athlete-hospital.jpg"
                alt="A therapist providing sports recovery support"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/0 to-transparent pointer-events-none" />
              <div className="absolute top-4 left-4 w-11 h-11 rounded-xl bg-white/95 backdrop-blur-sm flex items-center justify-center shadow-md">
                <UserCheck className="w-5 h-5 text-primary" />
              </div>
            </div>

            <div className="p-8 lg:p-10">
              <h3 className="text-2xl font-bold text-gray-900 mb-4 font-playfair">
                Freelancers
              </h3>
              <p className="text-gray-600 leading-relaxed font-open-sans mb-6">
                Create your profile, set your availability and rates, and let clients book you for
                freelance and locum work across clinics, sports teams, gyms, and organisations.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  'Showcase your qualifications and experience',
                  'Control your schedule with flexible availability and pricing',
                  'Get booked and paid without long-term commitments',
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-sm text-gray-700 font-open-sans"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Button
                onClick={() => router.push('/authentication/sign-in')}
                className="group bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg px-6 h-11 transition-all duration-300"
              >
                Join as a Freelancer
                <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
          </motion.div>

          {/* Employers Card */}
          <motion.div
            initial={{ opacity: 0, x: isMobile ? 0 : 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: isMobile ? '0px' : '-50px' }}
            transition={{
              delay: isMobile ? 0 : 0.15,
              duration: isMobile ? 0.3 : 0.6,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg hover:border-primary/20 transition-all duration-300"
          >
            {/* Hero photo for this card */}
            <div className="relative w-full aspect-[16/9] bg-gray-100"
              <Image
                src="/images/physio/woman-working-with-personal-trainer.jpg"
                alt="A client training with a personal trainer"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/0 to-transparent pointer-events-none" />
              <div className="absolute top-4 left-4 w-11 h-11 rounded-xl bg-white/95 backdrop-blur-sm flex items-center justify-center shadow-md">
                <Briefcase className="w-5 h-5 text-primary" />
              </div>
            </div>

            <div className="p-8 lg:p-10">
              <h3 className="text-2xl font-bold text-gray-900 mb-4 font-playfair">
                Clients
              </h3>
              <p className="text-gray-600 leading-relaxed font-open-sans mb-6">
                Find and book qualified therapists, coaches, and trainers with ease. Whether you
                need clinic cover, event support, or a private session, discover trusted
                professionals and secure your booking in minutes.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  'Browse verified professionals',
                  'View real-time availability and transparent pricing',
                  'Ideal for businesses and individuals',
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-sm text-gray-700 font-open-sans"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Button
                onClick={() => router.push('/authentication/sign-in')}
                variant="outline"
                className="group border-gray-200 text-gray-700 hover:bg-gray-100 hover:border-primary/40 font-semibold rounded-lg px-6 h-11 transition-all duration-300"
              >
                Hire Professionals
                <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ForWho;
