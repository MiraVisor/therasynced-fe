'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Check, Lock, Users } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { getPublicSubscriptionPlans } from '@/services/subscriptionService';

const Pricing = () => {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'annual'>('monthly');

  const { data: subscriptionPlans = [], isLoading } = useQuery({
    queryKey: ['public-subscription-plans'],
    queryFn: getPublicSubscriptionPlans,
    staleTime: 10 * 60 * 1000,
  });

  const sortedPlans = [...subscriptionPlans].sort((a, b) => (a.price || 0) - (b.price || 0));

  return (
    <section
      id="pricing"
      className="w-full px-4 sm:px-6 lg:px-8 py-24 bg-white dark:bg-neutral-900"
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: isMobile ? 0 : 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: isMobile ? '0px' : '-100px' }}
          transition={{ duration: isMobile ? 0.3 : 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-12 space-y-4"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white font-playfair">
            Pricing for All
          </h2>
        </motion.div>

        {/* Always Free for Clients */}
        <motion.div
          initial={{ opacity: 0, y: isMobile ? 0 : 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mb-16"
        >
          <div className="bg-gray-50/50 dark:bg-neutral-950/50 border border-gray-100 dark:border-neutral-800 rounded-xl p-8 max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="text-center sm:text-left">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 font-playfair">
                  Always Free for Clients
                </h3>
                <p className="text-base text-gray-600 dark:text-neutral-400 font-open-sans">
                  Booking, messaging, and search are free forever. No hidden fees or commissions.
                </p>
              </div>
              <Button
                onClick={() => router.push('/authentication/sign-in')}
                className="bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg px-8 h-12 transition-all duration-300"
              >
                Join Now
              </Button>
            </div>
          </div>
        </motion.div>

        {/* For Therapists Header */}
        <motion.div
          initial={{ opacity: 0, y: isMobile ? 0 : 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mb-8"
        >
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 font-playfair">
              For Therapists
            </h3>
            <p className="text-base text-gray-600 dark:text-neutral-400 font-open-sans">
              Choose a plan that fits your practice. All plans include a 30-day free trial.
            </p>
          </div>
        </motion.div>

        {/* Billing Toggle */}
        {sortedPlans.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="flex flex-col items-center gap-4 mb-12"
          >
            <div className="inline-flex bg-[#f5f4f1] dark:bg-neutral-900 p-1.5 rounded-xl border border-gray-100 dark:border-neutral-800">
              <button
                onClick={() => setBillingInterval('monthly')}
                className={`px-6 py-2 text-sm font-semibold rounded-lg transition-all duration-300 ${
                  billingInterval === 'monthly'
                    ? 'bg-white dark:bg-neutral-800 text-primary shadow-sm'
                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingInterval('annual')}
                className={`px-6 py-2 text-sm font-semibold rounded-lg transition-all duration-300 ${
                  billingInterval === 'annual'
                    ? 'bg-white dark:bg-neutral-800 text-primary shadow-sm'
                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                Annual
                <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                  Save 20%
                </span>
              </button>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Freelancer Plans */}
          {isLoading
            ? [1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-[500px] rounded-2xl bg-[#f5f4f1] dark:bg-neutral-900 animate-pulse border border-gray-100 dark:border-neutral-800"
                />
              ))
            : sortedPlans.map((plan, index) => {
                const isGold = plan.name === 'GOLD';

                return (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, scale: isMobile ? 1 : 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, margin: isMobile ? '0px' : '-50px' }}
                    transition={{
                      delay: isMobile ? 0 : index * 0.1,
                      duration: isMobile ? 0.2 : 0.5,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className={`relative flex flex-col bg-white dark:bg-neutral-900 border ${
                      isGold
                        ? 'border-primary/30 shadow-lg'
                        : 'border-gray-100 dark:border-neutral-800 shadow-sm'
                    } rounded-xl p-8 transition-all duration-300 hover:shadow-lg hover:border-primary/20`}
                  >
                    {isGold && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-white text-xs font-semibold rounded-full uppercase tracking-wider">
                        Popular
                      </div>
                    )}

                    {/* Plan Header */}
                    <div className="mb-8">
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 font-playfair">
                        {plan.displayName}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-neutral-400 font-open-sans leading-relaxed">
                        {plan.description}
                      </p>
                    </div>

                    {/* Price */}
                    <div className="mb-10">
                      {billingInterval === 'annual' ? (
                        <>
                          <div className="flex items-baseline mb-2">
                            <span className="text-5xl font-bold text-gray-900 dark:text-white font-playfair">
                              €{Math.round(plan.price * 12 * 0.8)}
                            </span>
                            <span className="text-gray-500 dark:text-neutral-400 text-lg font-open-sans ml-1">
                              /year
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-neutral-400 font-open-sans">
                            €{plan.price}/month, billed annually
                          </p>
                          <p className="text-sm text-primary font-semibold mt-1 font-open-sans">
                            Save €{Math.round(plan.price * 12 * 0.2)}/year
                          </p>
                        </>
                      ) : (
                        <div className="flex items-start">
                          <span className="text-2xl font-bold text-gray-900 dark:text-white font-playfair mt-2">
                            €
                          </span>
                          <span className="text-5xl font-bold text-gray-900 dark:text-white font-playfair">
                            {Math.floor(plan.price)}
                          </span>
                          {plan.price % 1 !== 0 && (
                            <span className="text-2xl font-bold text-gray-900 dark:text-white font-playfair mt-2">
                              .{String(plan.price).split('.')[1]?.padEnd(2, '0').slice(0, 2)}
                            </span>
                          )}
                          <span className="text-gray-500 dark:text-neutral-400 text-lg font-open-sans ml-2 mt-3">
                            /{plan.billingInterval}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Features List */}
                    <div className="mb-8 flex-1">
                      <h4 className="text-xs font-semibold text-gray-500 dark:text-neutral-500 uppercase tracking-wider mb-4 font-open-sans">
                        What&apos;s Included
                      </h4>
                      <ul className="space-y-3.5">
                        {plan.features?.map((f, idx) => {
                          // Format feature text: capitalize first letter, ensure proper punctuation
                          const formattedFeature =
                            f.charAt(0).toUpperCase() + f.slice(1).replace(/\.$/, '');
                          return (
                            <li
                              key={idx}
                              className="flex items-start gap-3 text-sm text-gray-700 dark:text-neutral-300 font-open-sans leading-relaxed"
                            >
                              <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5 stroke-[2.5]" />
                              <span className="flex-1 pt-px">{formattedFeature}</span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>

                    {/* CTA Button */}
                    <Button
                      onClick={() => router.push('/authentication/sign-in')}
                      className={`w-full h-12 font-semibold rounded-lg transition-all duration-300 ${
                        isGold
                          ? 'bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20'
                          : 'bg-transparent dark:bg-white text-black dark:text-gray-900 hover:border-black dark:hover:bg-gray-100 border border-gray-100 dark:border-neutral-800'
                      }`}
                    >
                      Start with {plan.displayName}
                    </Button>
                  </motion.div>
                );
              })}
        </div>

        {/* Payment Security Notice */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mt-12 flex flex-col items-center gap-3 text-center"
        >
          <div className="flex items-center gap-2 text-gray-500 dark:text-neutral-400">
            <Lock className="w-4 h-4" />
            <span className="text-sm font-open-sans">
              Payments securely processed by{' '}
              <a
                href="https://stripe.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline font-semibold"
              >
                Stripe
              </a>
            </span>
          </div>
          <p className="text-xs text-gray-400 dark:text-neutral-500 font-open-sans max-w-md">
            Your card details are handled directly by Stripe and never touch our servers. By
            subscribing, you agree to our{' '}
            <Link href="/terms#billing" className="text-primary hover:underline">
              Billing Terms
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </Link>
            .
          </p>
        </motion.div>

        {/* Team Plans Card */}
        <motion.div
          initial={{ opacity: 0, y: isMobile ? 0 : 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: isMobile ? '0px' : '-50px' }}
          transition={{ delay: 0.4, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mt-16 p-8 rounded-xl bg-gray-50/50 dark:bg-neutral-950/50 border border-gray-100 dark:border-neutral-800"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1 font-playfair">
                  Team Plans Coming Soon
                </h3>
                <p className="text-sm text-gray-600 dark:text-neutral-400 font-open-sans">
                  Custom pricing for clinics and practices with multiple therapists
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => router.push('/authentication/sign-in')}
              className="border-gray-200 dark:border-neutral-800 text-gray-700 dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-neutral-800 font-semibold rounded-lg px-8 h-12 transition-all duration-300"
            >
              Contact Us
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Pricing;
