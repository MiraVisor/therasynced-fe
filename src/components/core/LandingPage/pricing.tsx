'use client';

import { CheckCircle2 } from 'lucide-react';
import { useTheme } from 'next-themes';
import Link from 'next/link';

import { Button } from '@/components/ui/button';

const pricingPlans = [
  {
    id: 1,
    title: 'For Customers',
    description:
      'Book sessions with certified physiotherapists, massage professionals, and wellness experts—anytime, anywhere.',
    button: {
      text: 'Join Free - No Card Needed',
      variant: 'light-green',
      href: '#',
    },
    features: [
      'Book unlimited sessions',
      'View profiles and ratings',
      'Secure in-app messaging',
      'Flexible scheduling tools',
      'No booking fees',
    ],
  },
  {
    id: 2,
    title: 'For Freelancers',
    description:
      'Grow your wellness business with powerful tools to manage appointments, build your brand, and get paid on time.',
    button: {
      text: 'Start Earning',
      variant: 'primary',
      href: '#',
    },
    features: [
      'Professional public profile',
      'Client booking system',
      'Automated calendar sync',
      'Secure payments & payouts',
      'Advanced analytics & reporting',
      'Priority support',
    ],
  },
  {
    id: 3,
    title: 'For Teams',
    description:
      'Manage your clinic or group practice with tools for team scheduling, therapist performance, and client bookings.',
    button: {
      text: 'Try Teams for Free',
      variant: 'light-green',
      href: '#',
    },
    features: [
      'Multi-user team dashboard',
      'Assign bookings to staff',
      'Unified calendar management',
      'Performance insights & reports',
      'Custom branding options',
      'No monthly fee (limited time)',
    ],
  },
];

const Pricing = () => {
  useTheme();

  return (
    <section
      id="pricing"
      className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-10 lg:py-16 transition-all duration-500"
    >
      <div className="max-w-screen-xl mx-auto flex flex-col items-center gap-8 sm:gap-12 lg:gap-16">
        {/* Header */}
        <div className="text-center space-y-3 sm:space-y-4 lg:space-y-6 max-w-4xl mx-auto">
          <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 dark:text-white leading-[1.1]">
            Choose Your <span className="text-primary">Plan</span>
          </h2>
          <p className="text-sm xs:text-base sm:text-lg md:text-xl text-gray-600 dark:text-neutral-400 leading-relaxed">
            Select the perfect plan that aligns with your needs and goals. All plans include
            personalized support and expert guidance.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10 w-full max-w-xl lg:max-w-none mx-auto">
          {pricingPlans.map((plan) => (
            <div
              key={plan.id}
              className={`flex flex-col rounded-2xl p-5 sm:p-6 lg:p-8 gap-4 sm:gap-6 
                bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm
                border-2 border-gray-200/50 dark:border-neutral-800/50
                hover:border-primary/30 dark:hover:border-primary/30
                transition-all duration-300
                shadow-lg shadow-primary/5 dark:shadow-primary/10
                hover:shadow-xl hover:shadow-neutral-900/80 dark:hover:shadow-white/20
                h-full`}
            >
              {/* Plan Title & Description */}
              <div className="flex flex-col gap-2 sm:gap-3">
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary dark:text-primary/90">
                  {plan.title}
                </h3>
                <p className="text-sm sm:text-base lg:text-lg text-gray-700 dark:text-neutral-300">
                  {plan.description}
                </p>
              </div>

              {/* Features */}
              <div className="flex flex-col gap-3 sm:gap-4 flex-grow">
                <h4 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                  What&apos;s included?
                </h4>
                <ul className="flex flex-col gap-2">
                  {plan.features.map((feature, index) => (
                    <li
                      key={index}
                      className="flex items-center gap-2 text-sm sm:text-base text-gray-700 dark:text-neutral-300"
                    >
                      <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary dark:text-primary/90 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA Button */}
              <Button
                asChild
                className={`w-full h-9 sm:h-10 lg:h-11 rounded-xl text-sm sm:text-base font-medium 
                  shadow-md shadow-primary/5 dark:shadow-primary/10
                  transition-all duration-300 
                  bg-primary hover:bg-primary/90 text-white
                  hover:shadow-lg hover:shadow-neutral-900/80 dark:hover:shadow-white/20
                  hover:scale-[1.02]`}
              >
                <Link href={plan.button.href}>{plan.button.text}</Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
