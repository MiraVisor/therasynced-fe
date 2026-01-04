'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { getPublicSubscriptionPlans } from '@/services/subscriptionService';

const Pricing = () => {
  const router = useRouter();

  const { data: subscriptionPlans = [], isLoading } = useQuery({
    queryKey: ['public-subscription-plans'],
    queryFn: getPublicSubscriptionPlans,
    staleTime: 10 * 60 * 1000,
  });

  const sortedPlans = [...subscriptionPlans].sort((a, b) => (a.price || 0) - (b.price || 0));

  return (
    <section id="pricing" className="w-full px-4 sm:px-6 lg:px-8 py-24 bg-white dark:bg-black">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16 space-y-4"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
            Plans for every practice size
          </h2>
          <p className="text-lg text-gray-600 dark:text-neutral-400">
            Transparent pricing for therapists. Always free for all clients.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Client Plan - Always First */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="flex flex-col p-8 rounded-2xl border border-gray-100 dark:border-neutral-800 bg-gray-50/50 dark:bg-neutral-900/30 h-full"
          >
            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">For Clients</h3>
              <p className="text-sm text-gray-500 mt-2">Always free for health seekers</p>
            </div>
            <div className="mb-8">
              <span className="text-4xl font-bold text-gray-900 dark:text-white">$0</span>
              <span className="text-gray-500">/forever</span>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              {['Unlimited bookings', 'Search directory', 'Secure chat', 'Rewards program'].map(
                (f) => (
                  <li
                    key={f}
                    className="flex items-center gap-2 text-sm text-gray-600 dark:text-neutral-400"
                  >
                    <Check className="w-4 h-4 text-primary" />
                    {f}
                  </li>
                ),
              )}
            </ul>
            <Button
              onClick={() => router.push('/authentication/sign-in')}
              className="w-full h-12 bg-primary text-white font-semibold rounded-xl"
            >
              Get Started Free
            </Button>
          </motion.div>

          {/* Freelancer Plans */}
          {isLoading
            ? [1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-[450px] rounded-2xl bg-gray-50 dark:bg-neutral-900 animate-pulse border border-gray-100 dark:border-neutral-800"
                />
              ))
            : sortedPlans.map((plan, index) => (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex flex-col p-8 rounded-2xl border h-full transition-all ${
                    plan.name === 'GOLD'
                      ? 'border-primary bg-white dark:bg-neutral-900 shadow-xl shadow-primary/5'
                      : 'border-gray-100 dark:border-neutral-800 bg-white dark:bg-neutral-900'
                  }`}
                >
                  <div className="mb-8">
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {plan.displayName}
                      </h3>
                      {plan.name === 'GOLD' && (
                        <span className="px-3 py-1 text-[10px] font-bold bg-primary/10 text-primary rounded-full uppercase tracking-wider">
                          Popular
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-2">{plan.description}</p>
                  </div>
                  <div className="mb-8">
                    <span className="text-4xl font-bold text-gray-900 dark:text-white">
                      ${plan.price}
                    </span>
                    <span className="text-gray-500 text-sm">/{plan.billingInterval}</span>
                  </div>
                  <ul className="space-y-4 mb-8 flex-1">
                    {plan.features?.map((f, i) => (
                      <li
                        key={i}
                        className="flex items-center gap-2 text-sm text-gray-600 dark:text-neutral-400"
                      >
                        <Check className="w-4 h-4 text-primary" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button
                    onClick={() => router.push('/authentication/sign-in')}
                    variant={plan.name === 'GOLD' ? 'default' : 'outline'}
                    className={`w-full h-12 font-semibold rounded-xl ${plan.name === 'GOLD' ? 'bg-primary text-white shadow-lg shadow-primary/20' : ''}`}
                  >
                    Start with {plan.displayName}
                  </Button>
                </motion.div>
              ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-12 p-8 rounded-2xl bg-gray-50/50 dark:bg-neutral-900/30 border border-dashed border-gray-200 dark:border-neutral-800 text-center"
        >
          <p className="text-sm text-gray-500">
            Looking for clinic or team plans? <strong>Teams is coming soon.</strong>
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default Pricing;
