import { Heart, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { memo, useCallback } from 'react';

import { ProfileAvatarImage } from '@/components/common/ProfileAvatarImage';
import { RatingDisplay } from '@/components/core/Dashboard/UserSide/Ratings/RatingDisplay';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { TierBadge } from '@/components/ui/tier-badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { VerificationBadge } from '@/components/ui/verification-badge';
import { useFavoriteFreelancer } from '@/hooks/queries/useFreelancers';
import { cn } from '@/lib/utils';
import type { CardInfo } from '@/types/common';
import type { Service } from '@/types/service';
import type { PlanFeatures } from '@/types/subscription';
import { Expert, SubscriptionPlanType } from '@/types/types';

interface ExpertCardContentProps extends Partial<Expert> {
  id: string;
  name?: string;
  profilePicture?: string;
  rating?: number;
  isFavorite?: boolean;
  showFavoriteText?: boolean;
  services?: Array<Partial<Service> & { id: string; name: string }>;
  availableSlots?: number;
  cardInfo?: CardInfo;
  slots?: Array<{ id: string; startTime: string; endTime: string; status: string }>;
  verificationStatus?:
    | 'verified'
    | 'pending'
    | 'rejected'
    | 'unverified'
    | 'APPROVED'
    | 'PENDING'
    | 'REJECTED'
    | 'UNVERIFIED';
  tier?: SubscriptionPlanType | null;
  planFeatures?: PlanFeatures | null;
  onViewProfile: () => void;
  showBookNow?: boolean;
}

export const ExpertCardContent = memo(
  ({
    id,
    name,
    profilePicture,
    rating,
    isFavorite = false,
    showFavoriteText = false,
    services = [],
    availableSlots,
    cardInfo,
    slots = [],
    verificationStatus = 'unverified',
    tier,
    planFeatures,
    onViewProfile,
    showBookNow = false,
  }: ExpertCardContentProps) => {
    const router = useRouter();
    const { mutate: toggleFavorite, isPending: isFavoriteLoading } = useFavoriteFreelancer();

    const handleBookNow = useCallback(() => {
      // Navigate to the new booking page with freelancer pre-selected
      const freelancerData = {
        id,
        name,
        rating,
        isFavorite,
        services,
        availableSlots,
        cardInfo,
      };

      router.push(
        `/dashboard/book?freelancer=${encodeURIComponent(JSON.stringify(freelancerData))}`,
      );
    }, [id, name, rating, isFavorite, services, availableSlots, cardInfo, router]);

    const handleFavorite = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isFavoriteLoading) return;

        toggleFavorite(id, {
          onSuccess: () => {
            // Toast is handled by the mutation hook
          },
        });
      },
      [id, isFavoriteLoading, toggleFavorite],
    );

    // Get freelancer info from the available props
    const freelancerName = name || cardInfo?.name;

    // Check if slots are available
    const hasAvailableSlots = slots && slots.length > 0;

    // Get tier from props or planFeatures
    const freelancerTier = tier || planFeatures?.planType || null;

    // Get rating from cardInfo.averageRating (real calculated ratings from API) as primary source
    // Fall back to rating prop if cardInfo.averageRating is not available
    const displayRating =
      cardInfo?.averageRating !== undefined && cardInfo.averageRating !== null
        ? cardInfo.averageRating
        : rating;

    return (
      <TooltipProvider>
        <Card
          className={cn(
            'group overflow-hidden bg-white/80 dark:bg-gray-800 backdrop-blur-sm shadow-soft min-h-[320px] flex flex-col border-gray-200/80 dark:border-gray-700',
          )}
        >
          <CardHeader className="pb-3 px-4">
            {showFavoriteText && (
              <h3 className="text-base font-semibold mb-3 text-gray-900 dark:text-white">
                Your <span className="text-primary">Favorites</span>
              </h3>
            )}

            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <Avatar className="w-12 h-12 flex-shrink-0 border-2 border-primary/20">
                  <ProfileAvatarImage
                    src={profilePicture || undefined}
                    alt={freelancerName || 'Freelancer'}
                  />
                  <AvatarFallback className="bg-primary/15 text-primary font-bold text-base">
                    {freelancerName?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0 space-y-1.5">
                  {/* Row 1: Name and Verification Badge */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-base font-poppins font-semibold text-gray-900 dark:text-white truncate">
                      {freelancerName}
                    </h4>
                    <VerificationBadge status={verificationStatus} size="sm" />
                  </div>

                  {/* Row 2: Tier Badge */}
                  {freelancerTier && (
                    <div>
                      <TierBadge tier={freelancerTier} size="sm" showIcon={true} />
                    </div>
                  )}

                  {/* Row 3: Rating/Reviews */}
                  <RatingDisplay
                    rating={displayRating}
                    reviewCount={cardInfo?.totalRatings || 0}
                    size="sm"
                    showCount={false}
                  />
                </div>
              </div>

              <button
                className={`p-2 rounded-full flex-shrink-0 ${
                  isFavorite ? 'text-red-500 bg-red-50 dark:bg-red-900/20' : 'text-gray-400'
                } ${isFavoriteLoading ? 'cursor-not-allowed opacity-50' : ''}`}
                onClick={handleFavorite}
                disabled={isFavoriteLoading}
                aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                {isFavoriteLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                )}
              </button>
            </div>
          </CardHeader>

          <CardContent className="pt-4 pb-4 px-4 flex-1 flex flex-col">
            {/* Expert Details */}
            <div className="mb-4 space-y-2 bg-gradient-to-br from-mint/10 to-transparent rounded-lg p-3">
              {cardInfo?.totalRatings && (
                <div className="flex items-center justify-between text-sm">
                  <span className="font-inter text-muted-foreground">Reviews:</span>
                  <span className="font-poppins font-semibold text-charcoal">
                    {cardInfo.totalRatings}
                  </span>
                </div>
              )}
              {(availableSlots || 0) > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="font-inter text-muted-foreground">Availability:</span>
                  <span className="font-poppins font-semibold text-success">
                    {availableSlots || 0} slots
                  </span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="mt-auto space-y-3">
              <div className="flex flex-col md:flex-row gap-2">
                <Button
                  variant="outline"
                  className="flex-1 border-primary text-primary  h-9 text-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewProfile();
                  }}
                >
                  View Profile
                </Button>
                {showBookNow && (
                  <>
                    {hasAvailableSlots ? (
                      <Button
                        className="flex-1 bg-primary hover:bg-primary/90 text-white shadow-sm h-9 text-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBookNow();
                        }}
                      >
                        Book Now
                      </Button>
                    ) : (
                      <TooltipProvider delayDuration={300}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="flex-1">
                              <Button
                                className="w-full !bg-primary/50 !text-white shadow-sm h-9 text-sm opacity-60 cursor-not-allowed hover:!bg-primary/50"
                                disabled
                                style={{ cursor: 'disabled' }}
                                onClick={(e) => e.stopPropagation()}
                              >
                                Book Now
                              </Button>
                            </span>
                          </TooltipTrigger>
                          <TooltipContent className="bg-gray-900 text-white text-sm px-3 py-2 rounded-md shadow-lg border border-gray-700">
                            <div className="flex items-center gap-2">
                              <span className="text-orange-400">⚠️</span>
                              <span>No slots available</span>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </TooltipProvider>
    );
  },
);
