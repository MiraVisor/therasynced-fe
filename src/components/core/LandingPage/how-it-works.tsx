'use client';

import { Award, Calendar, MessageCircle, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import SlideArrowButton from '@/components/ui/SlideArrowButton';
import { isTokenValid } from '@/lib/utils';

const stepsData = [
  {
    id: 1,
    title: 'Browse & Search',
    description: 'Find licensed freelancers by specialty, location, or availability.',
    icon: Search,
  },
  {
    id: 2,
    title: 'Book Appointment',
    description: 'Select your preferred time slot and service type.',
    icon: Calendar,
  },
  {
    id: 3,
    title: 'Connect & Communicate',
    description: 'Message your freelancer before and after sessions.',
    icon: MessageCircle,
  },
  {
    id: 4,
    title: 'Earn Rewards',
    description: 'Get points and stamps for discounts on future bookings.',
    icon: Award,
  },
];

const HowItWorks = () => {
  const router = useRouter();
  const [hasValidToken, setHasValidToken] = useState(false);

  useEffect(() => {
    setHasValidToken(isTokenValid());
  }, []);

  const handleCTAClick = () => {
    if (hasValidToken) {
      router.push('/dashboard/explore');
    } else {
      router.push('/authentication/sign-in');
    }
  };

  return (
    <section
      id="how-it-works"
      className="w-full px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24 bg-white dark:bg-black"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center space-y-4 mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 dark:text-white leading-[1.1]">
            How It <span className="text-primary">Works</span>
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-neutral-400 max-w-2xl mx-auto">
            Getting started is simple. Follow these four easy steps to connect with licensed
            freelancers and begin your wellness journey.
          </p>
        </div>

        {/* Steps - Simple Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-12">
          {stepsData.map((step) => (
            <div
              key={step.id}
              className="group relative bg-white dark:bg-neutral-900 rounded-xl p-6 sm:p-8 border border-gray-200 dark:border-neutral-800 hover:border-primary/50 transition-all duration-300"
            >
              {/* Icon */}
              <div className="mb-6 w-14 h-14 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center group-hover:bg-primary/20 dark:group-hover:bg-primary/30 transition-colors">
                <step.icon className="w-7 h-7 text-primary" />
              </div>

              {/* Step Number */}
              <div className="absolute top-6 right-6 text-4xl font-bold text-gray-100 dark:text-neutral-800 group-hover:text-primary/20 transition-colors">
                {step.id}
              </div>

              {/* Content */}
              <div className="space-y-3 relative z-10">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{step.title}</h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-neutral-400 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <SlideArrowButton
            text={hasValidToken ? 'Explore Freelancers' : 'Get Started Free'}
            className="w-full sm:w-auto min-w-[240px] h-14 text-lg font-medium"
            onClick={handleCTAClick}
          />
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
