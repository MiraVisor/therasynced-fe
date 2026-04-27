'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Check, CheckCircle, Users } from 'lucide-react';
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
      className="w-full px-4 sm:px-6 lg:px-8 py-24 lg:py-32 bg-white relative overflow-hidden"
    >
      {/* Subtle background pattern, matches how-it-works / features sections */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 border border-primary rounded-full" />
        <div className="absolute bottom-20 right-20 w-72 h-72 border border-sage-warm rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: isMobile ? 0 : 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: isMobile ? '0px' : '-100px' }}
          transition={{ duration: isMobile ? 0.3 : 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16 lg:mb-20 space-y-4"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 font-playfair">
            Simple, honest pricing
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto font-open-sans">
            Free for clients, always. Therapists pay a flat monthly fee with a full 30-day free
            trial to start.
          </p>
        </motion.div>

        {/* Always Free for Clients */}
        <motion.div
          initial={{ opacity: 0, y: isMobile ? 0 : 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: isMobile ? '0px' : '-50px' }}
          transition={{ delay: 0.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-20 lg:mb-24"
        >
          <div className="bg-[#faf9f6] border border-gray-100 rounded-2xl p-8 lg:p-10 max-w-4xl mx-auto shadow-sm">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="text-center sm:text-left flex-1">
                <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2 font-poppins">
                  Free for clients, always
                </h3>
                <p className="text-sm lg:text-base text-gray-600 font-open-sans leading-relaxed">
                  Search, browse, book, and message therapists. No hidden fees, no commissions, no
                  subscription required.
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

        {/* Therapist Plans Header */}
        <motion.div
          initial={{ opacity: 0, y: isMobile ? 0 : 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: isMobile ? '0px' : '-50px' }}
          transition={{ delay: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-12 space-y-3"
        >
          <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 font-playfair">
            Plans for therapists
          </h3>
          <p className="text-base text-gray-600 font-open-sans max-w-2xl mx-auto">
            Every plan starts with a full 30-day free trial. No card required to try it.
          </p>
        </motion.div>

        {/* Plan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {isLoading
            ? [1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-[560px] rounded-2xl bg-[#faf9f6] animate-pulse border border-gray-100"
                />
              ))
            : sortedPlans.map((plan, index) => {
                const isGold = plan.name === 'GOLD';

                return (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: isMobile ? 0 : 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: isMobile ? '0px' : '-50px' }}
                    transition={{
                      delay: isMobile ? 0 : index * 0.1,
                      duration: 0.5,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className="relative group"
                  >
                    <div
                      className={`relative flex flex-col h-full rounded-2xl p-8 lg:p-10 transition-all duration-300 ${
                        isGold
                          ? 'bg-[#faf9f6] border-2 border-primary/30 shadow-lg hover:shadow-xl hover:border-primary/50'
                          : 'bg-[#faf9f6] border border-gray-100 shadow-sm hover:shadow-lg hover:border-primary/20'
                      }`}
                    >
                      {isGold && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-white text-xs font-bold rounded-full uppercase tracking-wider shadow-md">
                          Most Popular
                        </div>
                      )}

                      {/* Plan Header */}
                      <div className="mb-6">
                        <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2 font-poppins">
                          {plan.displayName}
                        </h3>
                        <p className="text-sm text-gray-600 font-open-sans leading-relaxed">
                          {plan.description}
                        </p>
                      </div>

                      {/* Price */}
                      <div className="mb-6 pb-6 border-b border-gray-200"
                        <div className="flex items-baseline gap-1">
                          <span className="text-xl font-bold text-gray-900 font-playfair">
                            €
                          </span>
                          <span className="text-5xl font-bold text-gray-900 font-playfair leading-none">
                            {Math.floor(plan.price)}
                          </span>
                          {plan.price % 1 !== 0 && (
                            <span className="text-xl font-bold text-gray-900 font-playfair">
                              .{String(plan.price).split('.')[1]?.padEnd(2, '0').slice(0, 2)}
                            </span>
                          )}
                          <span className="text-sm text-gray-500 font-open-sans ml-2">
                            /month
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 font-open-sans mt-2">
                          Billed monthly after your free trial
                        </p>
                      </div>

                      {/* Features */}
                      <div className="mb-8 flex-1">
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 font-open-sans">
                          What&apos;s included
                        </h4>
                        <ul className="space-y-3">
                          {plan.features?.map((f, idx) => {
                            const formatted =
                              f.charAt(0).toUpperCase() + f.slice(1).replace(/\.$/, '');
                            return (
                              <li
                                key={idx}
                                className="flex items-start gap-3 text-sm text-gray-700 font-open-sans leading-relaxed"
                              >
                                <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5 stroke-[2.5]" />
                                <span className="flex-1 pt-px">{formatted}</span>
                              </li>
                            );
                          })}
                        </ul>
                      </div>

                      {/* CTA */}
                      <Button
                        onClick={() => router.push('/authentication/sign-in')}
                        className={`w-full h-12 font-semibold rounded-lg transition-all duration-300 ${
                          isGold
                            ? 'bg-primary text-white hover:bg-primary/90 shadow-md shadow-primary/20'
                            : 'bg-white text-gray-900 border border-gray-200 hover:border-primary/50 hover:bg-gray-50
                        }`}
                      >
                        Start free trial
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
        </div>

        {/* Trust Line - matches features.tsx style */}
        <motion.div
          initial={{ opacity: 0, y: isMobile ? 0 : 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: isMobile ? '0px' : '-50px' }}
          transition={{ delay: 0.4, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mt-12 lg:mt-16 flex justify-center"
        >
          <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-[#faf9f6] border border-gray-100 shadow-sm">
            <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
            <p className="text-sm text-gray-600 font-open-sans">
              30-day free trial · No card required · Cancel anytime
            </p>
          </div>
        </motion.div>

        {/* Payment / Legal notice */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-6 text-center"
        >
          <p className="text-xs text-gray-400 font-open-sans max-w-xl mx-auto">
            Payments are processed securely by{' '}
            <a
              href="https://stripe.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline font-semibold"
            >
              Stripe
            </a>
            . By subscribing you agree to our{' '}
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

        {/* Team Plans */}
        <motion.div
          initial={{ opacity: 0, y: isMobile ? 0 : 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: isMobile ? '0px' : '-50px' }}
          transition={{ delay: 0.5, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mt-20 lg:mt-24 p-8 lg:p-10 rounded-2xl bg-[#faf9f6] border border-gray-100 shadow-sm"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/10 to-sage-warm/10 flex items-center justify-center flex-shrink-0">
                <Users className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-1 font-poppins">
                  Team plans coming soon
                </h3>
                <p className="text-sm text-gray-600 font-open-sans">
                  Custom pricing for clinics and practices with multiple therapists.
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => router.push('/contact')}
              className="border-gray-200 text-gray-700 hover:bg-white hover:border-primary/50 font-semibold rounded-lg px-8 h-12 transition-all duration-300 whitespace-nowrap"
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
