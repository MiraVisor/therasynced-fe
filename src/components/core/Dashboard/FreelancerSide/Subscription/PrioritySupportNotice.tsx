'use client';

import { Crown, Mail } from 'lucide-react';
import { useEffect, useState } from 'react';

import { useMySubscription } from '@/hooks/queries/useSubscription';
import { isTokenValid } from '@/lib/utils';

/**
 * Surfaces the priority-support email to Gold-tier freelancers on the
 * public /contact page. Hidden for non-Gold users and non-freelancers —
 * they still see the standard support@ email in the page body.
 *
 * Important: /contact is publicly accessible (no auth required). The
 * underlying useMySubscription hook hits an authenticated endpoint, and
 * the API interceptor force-redirects to `/` on any 401. If we fire that
 * query as a logged-out visitor, the whole contact page bounces back to
 * the landing page. Guard with a token check so the query only runs for
 * authenticated users.
 */
export function PrioritySupportNotice() {
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    setHasToken(isTokenValid());
  }, []);

  return hasToken ? <PrioritySupportNoticeAuthed /> : null;
}

function PrioritySupportNoticeAuthed() {
  const { data: subscription, isLoading } = useMySubscription();

  if (isLoading) return null;

  const planName = subscription?.plan?.name;
  const isGold = planName === 'GOLD';

  if (!isGold) return null;

  return (
    <div className="mb-6 rounded-xl border border-amber-300 bg-gradient-to-r from-amber-50 to-yellow-50 p-5">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-amber-100 rounded-lg flex-shrink-0">
          <Crown className="w-5 h-5 text-amber-700" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-poppins font-semibold text-gray-900 mb-1">
            Priority Support - Gold members
          </h3>
          <p className="text-sm text-gray-700 font-inter mb-3">
            As a Gold member, your requests are routed to our priority queue with a 24-hour response
            guarantee during business days.
          </p>
          <a
            href="mailto:priority-support@therasynced.com"
            className="inline-flex items-center gap-2 text-sm font-semibold text-amber-700 hover:underline"
          >
            <Mail className="w-4 h-4" />
            priority-support@therasynced.com
          </a>
        </div>
      </div>
    </div>
  );
}
