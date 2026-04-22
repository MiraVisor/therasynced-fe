'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Check, CreditCard, Lock, Sparkles, Users, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { getPublicSubscriptionPlans } from '@/services/subscriptionService';

const Pricing = () => {
  const router = useRouter();
  const isMobile = useIsMobile();

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
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: isMobile ? 0 : 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: isMobile ? '0px' : '-100px' }}
          transition={{ duration: isMobile ? 0.3 : 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16 space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-semibold text-primary uppercase tracking-wider font-open-sans">
              Simple pricing
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white font-playfair">
            Choose the plan that fits
          </h2>
          <p className="text-base sm:text-lg text-gray-600 dark:text-neutral-400 max-w-2xl mx-auto font-open-sans">
            Transparent monthly pricing with no hidden fees. Start free, upgrade as you grow, cancel
            whenever you want.
          </p>
        </motion.div>

        {/* Always Free for Clients */}
        <motion.div
          initial={{ opacity: 0, y: isMobile ? 0 : 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mb-20"
        >
          <div className="bg-gradient-to-br from-primary/5 via-gray-50/50 to-primary/5 dark:from-primary/10 dark:via-neutral-950/50 dark:to-primary/10 border border-primary/10 dark:border-primary/20 rounded-2xl p-8 max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="text-center sm:text-left">
                <div className="inline-flex items-center gap-2 mb-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider font-open-sans">
                    Free forever
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 font-playfair">
                  Always free for clients
                </h3>
                <p className="text-base text-gray-600 dark:text-neutral-400 font-open-sans">
                  Search, browse, book, and message therapists — all free, forever. No hidden fees,
                  no commissions.
                </p>
              </div>
              <Button
                onClick={() => router.push('/authentication/sign-in')}
                className="bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg px-8 h-12 transition-all duration-300 shadow-sm hover:shadow-md whitespace-nowrap"
              >
                Get started
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
          className="mb-10"
        >
          <div className="text-center space-y-3">
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white font-playfair">
              Plans for therapists
            </h3>
            <p className="text-base text-gray-600 dark:text-neutral-400 font-open-sans max-w-2xl mx-auto">
              Every plan starts with a{' '}
              <span className="font-semibold text-gray-900 dark:text-white">30-day free trial</span>
              . Explore everything risk-free before you commit.
            </p>

            {/* Trust signals */}
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-3 text-sm font-open-sans">
              <div className="flex items-center gap-1.5 text-gray-600 dark:text-neutral-400">
                <Check className="w-4 h-4 text-emerald-500 stroke-[2.5]" />
                30-day free trial
              </div>
              <div className="flex items-center gap-1.5 text-gray-600 dark:text-neutral-400">
                <Check className="w-4 h-4 text-emerald-500 stroke-[2.5]" />
                No credit card to start
              </div>
              <div className="flex items-center gap-1.5 text-gray-600 dark:text-neutral-400">
                <Check className="w-4 h-4 text-emerald-500 stroke-[2.5]" />
                Cancel anytime
              </div>
            </div>
          </div>
        </motion.div>

        {/* Plan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {isLoading
            ? [1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-[560px] rounded-2xl bg-[#f5f4f1] dark:bg-neutral-900 animate-pulse border border-gray-100 dark:border-neutral-800"
                />
              ))
            : sortedPlans.map((plan, index) => {
                const isGold = plan.name === 'GOLD';
                const isSilver = plan.name === 'SILVER';

                return (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: isMobile ? 0 : 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: isMobile ? '0px' : '-50px' }}
                    transition={{
                      delay: isMobile ? 0 : index * 0.1,
                      duration: isMobile ? 0.2 : 0.5,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className={`relative flex flex-col rounded-2xl p-8 transition-all duration-300 ${
                      isGold
                        ? 'bg-gradient-to-b from-primary/[0.04] to-white dark:from-primary/10 dark:to-neutral-900 border-2 border-primary/40 shadow-xl shadow-primary/5 hover:shadow-primary/10 hover:-translate-y-1'
                        : 'bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 shadow-sm hover:shadow-lg hover:border-gray-300 dark:hover:border-neutral-700 hover:-translate-y-0.5'
                    }`}
                  >
                    {/* Popular badge */}
                    {isGold && (
                      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-primary text-white text-[11px] font-bold rounded-full uppercase tracking-widest shadow-md">
                        Most popular
                      </div>
                    )}

                    {/* Plan Header */}
                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-3">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white font-playfair">
                          {plan.displayName}
                        </h3>
                        {isSilver && (
                          <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                            Best value
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-neutral-400 font-open-sans leading-relaxed">
                        {plan.description}
                      </p>
                    </div>

                    {/* Price */}
                    <div className="mb-6 pb-6 border-b border-gray-100 dark:border-neutral-800">
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-gray-900 dark:text-white font-playfair">
                          €
                        </span>
                        <span className="text-5xl font-bold text-gray-900 dark:text-white font-playfair leading-none">
                          {Math.floor(plan.price)}
                        </span>
                        {plan.price % 1 !== 0 && (
                          <span className="text-2xl font-bold text-gray-900 dark:text-white font-playfair">
                            .{String(plan.price).split('.')[1]?.padEnd(2, '0').slice(0, 2)}
                          </span>
                        )}
                        <span className="text-sm text-gray-500 dark:text-neutral-400 font-open-sans ml-2">
                          /month
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-neutral-500 font-open-sans mt-2">
                        Billed monthly after your 30-day free trial
                      </p>
                    </div>

                    {/* Features List */}
                    <div className="mb-8 flex-1">
                      <h4 className="text-[11px] font-bold text-gray-500 dark:text-neutral-500 uppercase tracking-widest mb-4 font-open-sans">
                        What&apos;s Included
                      </h4>
                      <ul className="space-y-3">
                        {plan.features?.map((f, idx) => {
                          const formattedFeature =
                            f.charAt(0).toUpperCase() + f.slice(1).replace(/\.$/, '');
                          return (
                            <li
                              key={idx}
                              className="flex items-start gap-3 text-sm text-gray-700 dark:text-neutral-300 font-open-sans leading-relaxed"
                            >
                              <div
                                className={`flex-shrink-0 mt-0.5 w-5 h-5 rounded-full flex items-center justify-center ${
                                  isGold ? 'bg-primary/15' : 'bg-gray-100 dark:bg-neutral-800'
                                }`}
                              >
                                <Check
                                  className={`w-3 h-3 stroke-[3] ${
                                    isGold ? 'text-primary' : 'text-gray-700 dark:text-neutral-300'
                                  }`}
                                />
                              </div>
                              <span className="flex-1 pt-0.5">{formattedFeature}</span>
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
                          ? 'bg-primary text-white hover:bg-primary/90 shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30'
                          : 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100'
                      }`}
                    >
                      Start free trial
                    </Button>
                    <p className="text-center text-[11px] text-gray-500 dark:text-neutral-500 font-open-sans mt-3">
                      No credit card required
                    </p>
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
          className="mt-14 flex flex-col items-center gap-3 text-center"
        >
          <div className="flex items-center gap-6 text-gray-500 dark:text-neutral-400 text-sm font-open-sans">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              <span>
                Secured by{' '}
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
            <span className="hidden sm:inline text-gray-300 dark:text-neutral-700">·</span>
            <div className="hidden sm:flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              <span>All major cards accepted</span>
            </div>
            <span className="hidden sm:inline text-gray-300 dark:text-neutral-700">·</span>
            <div className="hidden sm:flex items-center gap-2">
              <XCircle className="w-4 h-4" />
              <span>Cancel anytime</span>
            </div>
          </div>
          <p className="text-xs text-gray-400 dark:text-neutral-500 font-open-sans max-w-lg">
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
          className="mt-20 p-8 rounded-2xl bg-gray-50/50 dark:bg-neutral-950/50 border border-gray-100 dark:border-neutral-800"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Users className="w-7 h-7 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white font-playfair">
                    Team plans
                  </h3>
                  <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Coming soon
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-neutral-400 font-open-sans">
                  Custom pricing for clinics and practices with multiple therapists
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => router.push('/contact')}
              className="border-gray-200 dark:border-neutral-800 text-gray-700 dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-neutral-800 font-semibold rounded-lg px-8 h-12 transition-all duration-300 whitespace-nowrap"
            >
              Talk to sales
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Pricing;
