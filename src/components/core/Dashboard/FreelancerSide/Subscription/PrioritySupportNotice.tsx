'use client';

import { Crown, Mail } from 'lucide-react';

import { useMySubscription } from '@/hooks/queries/useSubscription';

/**
 * Surfaces the priority-support email to Gold-tier freelancers on the
 * public /contact page. Hidden for non-Gold users and non-freelancers —
 * they still see the standard support@ email in the page body.
 *
 * Intentionally a client-only component so the rest of the contact page
 * can stay server-rendered for SEO.
 */
export function PrioritySupportNotice() {
  const { data: subscription, isLoading } = useMySubscription();

  if (isLoading) return null;

  const planName = subscription?.plan?.name;
  const isGold = planName === 'GOLD';

  if (!isGold) return null;

  return (
    <div className="mb-6 rounded-xl border border-amber-300 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 p-5">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-amber-100 dark:bg-amber-900/40 rounded-lg flex-shrink-0">
          <Crown className="w-5 h-5 text-amber-700 dark:text-amber-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-poppins font-semibold text-gray-900 dark:text-white mb-1">
            Priority Support — Gold members
          </h3>
          <p className="text-sm text-gray-700 dark:text-gray-300 font-inter mb-3">
            As a Gold member, your requests are routed to our priority queue with a 24-hour response
            guarantee during business days.
          </p>
          <a
            href="mailto:priority-support@therasynced.com"
            className="inline-flex items-center gap-2 text-sm font-semibold text-amber-700 dark:text-amber-300 hover:underline"
          >
            <Mail className="w-4 h-4" />
            priority-support@therasynced.com
          </a>
        </div>
      </div>
    </div>
  );
}
