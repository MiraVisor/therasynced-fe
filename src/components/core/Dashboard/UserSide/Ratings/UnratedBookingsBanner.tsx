'use client';

import { Star } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { usePatientBookings } from '@/hooks/queries/useBookings';
import type { Booking } from '@/types/types';

/**
 * Banner that nudges the client to rate past sessions they haven't
 * reviewed yet. Used on both the patient dashboard home and the My
 * Bookings page so the reminder is surfaced in both the places a
 * client actually lands.
 *
 * Returns null if there are no rate-eligible unrated bookings, so the
 * page layout stays clean when there's nothing waiting.
 */
export function UnratedBookingsBanner() {
  const router = useRouter();

  // Reuse the same bookings query key so this component shares cache
  // with the My Bookings page and never triggers a duplicate request.
  const { data: bookings = [] } = usePatientBookings({
    page: 1,
    limit: 1000,
    sortBy: 'slot.startTime',
    sortOrder: 'desc',
  });

  const unratedCount = bookings.filter(
    (b: Booking) => b.canBeRated === true && b.hasRating === false && b.status !== 'CANCELLED',
  ).length;

  if (unratedCount === 0) return null;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 shadow-sm">
      <div className="flex items-center gap-4 flex-1">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Star className="w-6 h-6 text-primary fill-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-poppins font-semibold text-charcoal dark:text-white text-base">
            {unratedCount} {unratedCount === 1 ? 'session' : 'sessions'} waiting for your review
          </h3>
          <p className="text-sm text-muted-foreground font-inter mt-0.5">
            Share your feedback to help other clients find the right therapist.
          </p>
        </div>
      </div>
      <Button
        onClick={() => router.push('/dashboard/my-bookings?filter=completed')}
        className="bg-primary hover:bg-primary/90 text-white font-semibold whitespace-nowrap"
      >
        Leave a review
      </Button>
    </div>
  );
}
