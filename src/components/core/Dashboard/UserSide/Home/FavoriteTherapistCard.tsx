'use client';

import { Heart, Loader2 } from 'lucide-react';
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
      <Card className="group border-2 border-gray-200/60 overflow-hidden bg-gradient-to-br from-white via-white to-primary/5 shadow-lg hover:shadow-xl transition-all duration-300 min-h-[340px] flex flex-col hover:border-primary/40 hover:scale-[1.02]">
        <CardHeader className="pb-4 px-5 pt-5 bg-gradient-to-r from-primary/5 via-transparent to-transparent">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4 flex-1 min-w-0">
              <Avatar className="w-14 h-14 flex-shrink-0 border-[3px] border-primary/30 shadow-md ring-2 ring-primary/10">
                <ProfileAvatarImage
                  src={freelancer.profilePicture || undefined}
                  alt={freelancerName || 'Freelancer'}
                />
                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/30 text-primary font-bold text-lg">
                  {freelancerName?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0 space-y-2">
                {/* Row 1: Name and Verification Badge */}
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-lg font-poppins font-bold text-gray-900 truncate">
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
              className={`p-2.5 rounded-full flex-shrink-0 transition-all duration-200 ${
                freelancer.isFavorite
                  ? 'text-red-500 bg-gradient-to-br from-red-50 to-red-100   shadow-md'
                  : 'text-gray-400 hover:text-red-400 hover:bg-gray-100 '
              } ${isFavoriteLoading ? 'cursor-not-allowed opacity-50' : 'hover:scale-110'}`}
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

        <CardContent className="pt-5 pb-5 px-5 flex-1 flex flex-col">
          {/* Expert Details */}
          <div className="mb-5 space-y-3 bg-gradient-to-br from-primary/8 via-primary/5 to-transparent rounded-xl p-4 border border-primary/20 shadow-sm">
            {freelancer.reviews && freelancer.reviews > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="font-inter text-gray-600">Reviews:</span>
                <span className="font-poppins font-bold text-gray-900">{freelancer.reviews}</span>
              </div>
            )}
            {(freelancer.availableSlots || 0) > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="font-inter text-gray-600">Availability:</span>
                <span className="font-poppins font-bold text-green-600">
                  {freelancer.availableSlots || 0} slots
                </span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="mt-auto">
            <Button
              variant="outline"
              className="w-full border-2 border-primary/30 text-primary bg-primary/5 hover:bg-primary/10 hover:border-primary/50 h-10 text-sm font-semibold transition-all duration-200 hover:shadow-md"
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
          durationPricing: freelancer.durationPricing,
          serviceCategoryPricing: freelancer.serviceCategoryPricing,
        }}
      />
    </TooltipProvider>
  );
};

export default FavoriteFreelancerCard;
