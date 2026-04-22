'use client';

import { formatDistanceToNow, parseISO } from 'date-fns';
import { MessageCircle, Star } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useFreelancerRatings } from '@/hooks/queries/useRatings';
import { cn, getDecodedToken } from '@/lib/utils';
import type { RatingWithPatient } from '@/types/rating';

/**
 * Shows the freelancer's 5 most recent ratings on their dashboard home.
 *
 * Ratings on this platform are stars-only (no comment text), so the card
 * surfaces a simple feed: date, patient initial, and the 1-5 star value.
 * Purpose is to give the freelancer visibility into incoming feedback
 * without them having to navigate to an analytics page (especially since
 * full analytics is Gold-only).
 */
export function RecentReviewsCard() {
  // Read the freelancer's own ID from the JWT token. useAuth only exposes
  // token/role and not id, so we decode the token for the subject claim.
  const [freelancerId, setFreelancerId] = useState<string | null>(null);
  useEffect(() => {
    const token = getDecodedToken();
    setFreelancerId(token?.sub ?? null);
  }, []);

  const { data, isLoading } = useFreelancerRatings(freelancerId, {
    page: 1,
    limit: 5,
  });

  // Extract ratings list from paginated response. The service returns
  // { success, data: { data: [...], pagination: {...} } } so we unwrap
  // defensively in case the shape varies across environments.
  const ratings: RatingWithPatient[] =
    (data as { data?: RatingWithPatient[] } | undefined)?.data ?? [];

  return (
    <Card className="border border-gray-200/80 shadow-soft backdrop-blur-sm bg-white/80 rounded-2xl">
      <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-mint/30 to-white px-5 py-5">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-poppins font-semibold text-charcoal">
              Recent reviews
            </CardTitle>
            <CardDescription className="text-sm font-inter text-muted-foreground mt-1">
              The last five ratings your clients have left
            </CardDescription>
          </div>
          <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
        </div>
      </CardHeader>
      <CardContent className="p-5">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : ratings.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 rounded-full bg-gray-100 mx-auto flex items-center justify-center mb-3">
              <MessageCircle className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-sm font-inter font-medium text-charcoal">No reviews yet</p>
            <p className="text-xs font-inter text-muted-foreground mt-1">
              Completed sessions can be rated by your clients. Their feedback will appear here.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {ratings.map((r) => {
              const createdAt = parseISO(r.createdAt);
              const initial = r.patient?.name?.charAt(0)?.toUpperCase() ?? '?';
              return (
                <li key={r.id} className="py-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-semibold text-primary font-poppins">
                      {initial}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-inter font-medium text-charcoal truncate">
                      {r.patient?.name ?? 'Anonymous client'}
                    </p>
                    <p className="text-xs text-muted-foreground font-inter">
                      {formatDistanceToNow(createdAt, { addSuffix: true })}
                    </p>
                  </div>
                  <div className="flex items-center gap-0.5 flex-shrink-0">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star
                        key={n}
                        className={cn(
                          'h-4 w-4',
                          n <= r.rating ? 'text-amber-500 fill-amber-500' : 'text-gray-200',
                        )}
                      />
                    ))}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
