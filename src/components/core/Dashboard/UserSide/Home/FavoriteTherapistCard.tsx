'use client';

import { CheckCircle2, Heart, Loader2, Stamp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { ProfileAvatarImage } from '@/components/common/ProfileAvatarImage';
import { ExpertProfileDialog } from '@/components/core/Dashboard/UserSide/Overview/ExpertProfileDialog';
import { RatingDisplay } from '@/components/core/Dashboard/UserSide/Ratings/RatingDisplay';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { TierBadge } from '@/components/ui/tier-badge';
import { TooltipProvider } from '@/components/ui/tooltip';
import { VerificationBadge } from '@/components/ui/verification-badge';
import { useFavoriteFreelancer } from '@/hooks/queries/useFreelancers';
import { Expert } from '@/types/types';

interface FavoriteFreelancerCardProps {
  freelancer: Expert;
  onBook?: (freelancer: Expert) => void;
}

const FavoriteFreelancerCard: React.FC<FavoriteFreelancerCardProps> = ({ freelancer }) => {
  const router = useRouter();
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const { mutate: toggleFavorite, isPending: isFavoriteLoading } = useFavoriteFreelancer();

  // Get stamp information from freelancer object (stampInfo is included in API response)
  const stampInfo = freelancer.stampInfo || null;

  const handleViewProfile = () => {
    setShowProfileDialog(true);
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFavoriteLoading) return;
    toggleFavorite(freelancer.id);
  };

  const handleBookNow = () => {
    // Navigate to the new booking page with freelancer pre-selected
    const freelancerData = {
      id: freelancer.id,
      name: freelancer.name,
      specialty: freelancer.specialty,
      jobTitle: freelancer.jobTitle,
      rating: freelancer.rating,
      reviews: freelancer.reviews,
      description: freelancer.description,
      isFavorite: freelancer.isFavorite,
      services: freelancer.services,
      location: freelancer.location,
      sessionTypes: freelancer.sessionTypes,
      pricing: freelancer.pricing,
      availableSlots: freelancer.availableSlots,
      cardInfo: freelancer.cardInfo,
      verificationStatus: freelancer.verificationStatus,
      firstAidCertificateStatus: freelancer.firstAidCertificateStatus,
      durationPricing: freelancer.durationPricing,
      serviceCategoryPricing: freelancer.serviceCategoryPricing,
    };

    router.push(`/dashboard/book?freelancer=${encodeURIComponent(JSON.stringify(freelancerData))}`);
  };

  // Check if slots are available
  const hasAvailableSlots = freelancer.slots && freelancer.slots.length > 0;

  const freelancerName = freelancer.name;

  // Get tier from props or planFeatures
  const freelancerTier = freelancer.tier || freelancer.planFeatures?.planType || null;

  return (
    <TooltipProvider>
      <Card className="group border-gray-200/80 dark:border-gray-700 overflow-hidden bg-white/80 dark:bg-gray-800 backdrop-blur-sm shadow-soft min-h-[320px] flex flex-col">
        <CardHeader className="pb-3 px-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <Avatar className="w-12 h-12 flex-shrink-0 border-2 border-primary/20">
                <ProfileAvatarImage
                  src={freelancer.profilePicture || undefined}
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
                  <VerificationBadge
                    status={freelancer.verificationStatus || 'unverified'}
                    size="sm"
                  />
                </div>

                {/* Row 2: Tier Badge */}
                {freelancerTier && (
                  <div>
                    <TierBadge tier={freelancerTier} size="sm" showIcon={true} />
                  </div>
                )}

                {/* Row 3: Rating/Reviews */}
                <RatingDisplay
                  rating={freelancer.rating}
                  reviewCount={freelancer.cardInfo?.totalRatings || 0}
                  size="sm"
                  showCount={false}
                />
              </div>
            </div>

            <button
              className={`p-2 rounded-full flex-shrink-0 ${
                freelancer.isFavorite
                  ? 'text-red-500 bg-red-50 dark:bg-red-900/20'
                  : 'text-gray-400'
              } ${isFavoriteLoading ? 'cursor-not-allowed opacity-50' : ''}`}
              onClick={handleFavorite}
              disabled={isFavoriteLoading}
              aria-label={freelancer.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              {isFavoriteLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Heart className={`w-5 h-5 ${freelancer.isFavorite ? 'fill-current' : ''}`} />
              )}
            </button>
          </div>
        </CardHeader>

        <CardContent className="pt-4 pb-4 px-4 flex-1 flex flex-col">
          {/* Expert Details */}
          <div className="mb-4 space-y-2 bg-gradient-to-br from-mint/10 to-transparent rounded-lg p-3">
            {freelancer.reviews && freelancer.reviews > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="font-inter text-muted-foreground">Reviews:</span>
                <span className="font-poppins font-semibold text-charcoal">
                  {freelancer.reviews}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between text-sm">
              <span className="font-inter text-muted-foreground">Stamps:</span>
              <div className="flex items-center gap-1.5">
                {(() => {
                  const target = stampInfo?.stampTarget ?? 5;
                  const currentCount = Number(stampInfo?.currentStampCount ?? 0);
                  const maxCount = Math.min(currentCount, target);
                  return Array.from({ length: target }, (_, index) => {
                    const isFilled = stampInfo && index < maxCount;
                    return (
                      <div
                        key={index}
                        className={`flex items-center justify-center w-5 h-5 rounded-full border ${
                          isFilled
                            ? 'bg-primary border-primary text-white'
                            : 'bg-gray-100 border-gray-300 text-gray-400'
                        }`}
                      >
                        {isFilled ? (
                          <CheckCircle2 className="h-3 w-3" />
                        ) : (
                          <Stamp className="h-3 w-3" />
                        )}
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
            {(freelancer.availableSlots || 0) > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="font-inter text-muted-foreground">Availability:</span>
                <span className="font-poppins font-semibold text-success">
                  {freelancer.availableSlots || 0} slots
                </span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="mt-auto space-y-3">
            <Button
              variant="outline"
              className="w-full border-primary text-primary h-9 text-sm"
              onClick={handleViewProfile}
            >
              View Profile
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Use the shared ExpertProfileDialog */}
      <ExpertProfileDialog
        isOpen={showProfileDialog}
        onClose={() => setShowProfileDialog(false)}
        expert={{
          id: freelancer.id,
          name: freelancer.name,
          profilePicture: freelancer.profilePicture,
          specialty: freelancer.specialty,
          jobTitle: freelancer.jobTitle,
          rating: freelancer.rating,
          description: freelancer.description,
          isFavorite: freelancer.isFavorite,
          services: freelancer.services,
          sessionTypes: freelancer.sessionTypes,
          pricing: freelancer.pricing,
          availableSlots: freelancer.availableSlots,
          cardInfo: freelancer.cardInfo,
          verificationStatus: freelancer.verificationStatus,
          firstAidCertificateStatus: freelancer.firstAidCertificateStatus,
          onBookNow: handleBookNow,
          hasAvailableSlots: hasAvailableSlots ?? false,
          stampInfo: stampInfo || undefined,
          durationPricing: freelancer.durationPricing,
          serviceCategoryPricing: freelancer.serviceCategoryPricing,
        }}
      />
    </TooltipProvider>
  );
};

export default FavoriteFreelancerCard;
