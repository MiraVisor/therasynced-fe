import { CheckCircle2, Heart, Loader2, Stamp, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';

import { ReportFreelancerDialog } from '@/components/core/Dashboard/Complaints/ReportFreelancerDialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { TierBadge } from '@/components/ui/tier-badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { VerificationBadge } from '@/components/ui/verification-badge';
import { cn } from '@/lib/utils';
import { favoriteFreelancer } from '@/redux/slices/overviewSlice';
import { Expert, SubscriptionPlanType } from '@/types/types';

interface ExpertCardProps extends Expert {
  showFavoriteText?: boolean;
  imageUrl?: string;
  verificationStatus?:
    | 'verified'
    | 'pending'
    | 'rejected'
    | 'unverified'
    | 'APPROVED'
    | 'PENDING'
    | 'REJECTED'
    | 'UNVERIFIED';
  firstAidCertificateStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
  tier?: SubscriptionPlanType | null;
}

const ExpertCard: React.FC<ExpertCardProps> = ({
  id,
  name,
  specialty,
  jobTitle,
  yearsOfExperience,
  rating,
  description,
  isFavorite = false,
  showFavoriteText = false,
  services = [],
  location = 'Online',
  sessionTypes = ['online', 'office'],
  pricing,
  availableSlots,
  cardInfo,
  slots = [],
  verificationStatus = 'unverified',
  firstAidCertificateStatus,
  tier,
  planFeatures,
  stampInfo,
}) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);
  const handleBookNow = () => {
    // Pass freelancer data through route state to avoid loading issues
    const freelancerData = {
      id,
      name,
      specialty,
      yearsOfExperience,
      rating,
      description,
      isFavorite,
      services,
      location,
      sessionTypes,
      pricing,
      availableSlots,
      cardInfo,
    };

    router.push(
      `/dashboard/freelancer/${id}?data=${encodeURIComponent(JSON.stringify(freelancerData))}`,
    );
  };
  const handleViewProfile = () => {
    setShowProfileDialog(true);
  };

  const handleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFavoriteLoading) return;

    // Prevent multiple clicks
    setIsFavoriteLoading(true);
    try {
      const result = await dispatch(favoriteFreelancer(id) as any).unwrap();
      if (result && typeof result === 'object' && 'favorited' in result) {
        toast.success(result.favorited ? 'Added to favorites' : 'Removed from favorites');
      } else {
        toast.success(!isFavorite ? 'Added to favorites' : 'Removed from favorites');
      }
    } catch (err: any) {
      toast.error('Failed to update favorite');
    } finally {
      setIsFavoriteLoading(false);
    }
  };

  // Get the lowest price for quick display

  // Check if we have a valid price to display

  // Get session type icons

  // Get freelancer info from the available props
  const freelancerName = name || cardInfo?.name;

  // Check if slots are available
  const hasAvailableSlots = slots && slots.length > 0;

  // Get tier from props or planFeatures
  const freelancerTier = tier || planFeatures?.planType || null;

  // Get pricing information from new structure
  const getPricingInfo = () => {
    if (!pricing) return null;

    // Check for new pricing structure (lowestPrice, currency, hasPriceRange)
    if ('lowestPrice' in pricing && pricing.lowestPrice) {
      return {
        lowestPrice: pricing.lowestPrice,
        highestPrice: 'highestPrice' in pricing ? pricing.highestPrice : null,
        currency: 'currency' in pricing && pricing.currency ? pricing.currency : 'EUR',
        hasPriceRange: 'hasPriceRange' in pricing ? pricing.hasPriceRange : false,
      };
    }

    // Fallback to old structure for backward compatibility
    const prices: number[] = [];
    if (pricing.online?.min) prices.push(pricing.online.min);
    if (pricing.office?.min) prices.push(pricing.office.min);
    if (pricing.home?.min) prices.push(pricing.home.min);

    if (prices.length > 0) {
      return {
        lowestPrice: Math.min(...prices),
        highestPrice: null,
        currency: 'EUR',
        hasPriceRange: false,
      };
    }

    return null;
  };

  const pricingInfo = getPricingInfo();

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
              <div className="w-12 h-12 rounded-full bg-primary/15 text-primary flex items-center justify-center font-bold text-base flex-shrink-0 border-2 border-primary/20">
                {freelancerName?.charAt(0).toUpperCase()}
              </div>
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
                {rating && rating > 0 ? (
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                      />
                    ))}
                    <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                      ({rating})
                    </span>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 dark:text-gray-400">No ratings yet</div>
                )}
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
            {cardInfo?.patientStories && (
              <div className="flex items-center justify-between text-sm">
                <span className="font-inter text-muted-foreground">Reviews:</span>
                <span className="font-poppins font-semibold text-charcoal">
                  {cardInfo.patientStories}
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
            {(availableSlots || 0) > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="font-inter text-muted-foreground">Availability:</span>
                <span className="font-poppins font-semibold text-success">
                  {availableSlots || 0} slots
                </span>
              </div>
            )}
            {pricingInfo && (
              <div className="flex items-center justify-between text-sm">
                <span className="font-inter text-muted-foreground">Starting price:</span>
                <span className="font-poppins font-semibold text-charcoal">
                  {pricingInfo.hasPriceRange && pricingInfo.highestPrice
                    ? `${pricingInfo.currency} ${pricingInfo.lowestPrice} - ${pricingInfo.highestPrice}`
                    : `${pricingInfo.currency} ${pricingInfo.lowestPrice}`}
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
                onClick={handleViewProfile}
              >
                View Profile
              </Button>
              {hasAvailableSlots ? (
                <Button
                  className="flex-1 bg-primary hover:bg-primary/90 text-white shadow-sm h-9 text-sm"
                  onClick={handleBookNow}
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
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Dialog */}
      <Dialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
        <DialogContent className="max-w-[95vw] lg:max-w-4xl max-h-[90vh] lg:max-h-[85vh] overflow-y-auto mx-4 lg:mx-auto p-0">
          <div className="relative">
            {/* Header with gradient background */}
            <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 pb-8">
              <DialogHeader className="pb-0">
                <div className="flex items-start gap-4">
                  {/* Profile Avatar */}
                  <div className="w-16 h-16 rounded-full bg-primary/15 text-primary flex items-center justify-center font-bold text-xl flex-shrink-0 border-2 border-primary/20">
                    {freelancerName?.charAt(0).toUpperCase()}
                  </div>

                  {/* Profile Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <DialogTitle className="text-2xl lg:text-3xl font-poppins font-bold text-gray-900 dark:text-white truncate">
                        {freelancerName}
                      </DialogTitle>
                      <VerificationBadge status={verificationStatus} size="md" />
                    </div>

                    {jobTitle?.name && (
                      <p className="text-lg font-inter text-primary font-medium mb-1">
                        {jobTitle.name}
                      </p>
                    )}

                    {specialty && (
                      <p className="text-base font-inter text-gray-600 dark:text-gray-400 mb-2">
                        {specialty}
                      </p>
                    )}

                    {/* Rating and Experience */}
                    <div className="flex items-center gap-4 text-sm">
                      {rating && rating > 0 ? (
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                            />
                          ))}
                          <span className="text-gray-600 dark:text-gray-400 ml-1 font-medium">
                            {rating.toFixed(1)} ({cardInfo?.patientStories || 0} reviews)
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-500 dark:text-gray-400">No ratings yet</span>
                      )}
                    </div>
                  </div>
                </div>
              </DialogHeader>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 text-center">
                  <div className="text-2xl font-poppins font-bold text-primary mb-1">
                    {availableSlots || 0}
                  </div>
                  <div className="text-sm font-inter text-gray-600 dark:text-gray-400">
                    Available Slots
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 text-center">
                  <div className="text-2xl font-poppins font-bold text-primary mb-1">
                    {cardInfo?.patientStories || 0}
                  </div>
                  <div className="text-sm font-inter text-gray-600 dark:text-gray-400">
                    Total Reviews
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 text-center">
                  <div className="text-2xl font-poppins font-bold text-primary mb-1">
                    {services.length}
                  </div>
                  <div className="text-sm font-inter text-gray-600 dark:text-gray-400">
                    Services
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 text-center">
                  <div className="text-2xl font-poppins font-bold text-primary mb-1">
                    {sessionTypes.length}
                  </div>
                  <div className="text-sm font-inter text-gray-600 dark:text-gray-400">
                    Session Types
                  </div>
                </div>
              </div>

              {/* Services Section */}
              {services.length > 0 && (
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                  <h4 className="font-poppins font-semibold text-gray-900 dark:text-white mb-3 text-base flex items-center gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full"></span>
                    Services Offered
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {services.map((service, index: number) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="px-3 py-2 text-sm font-medium bg-primary/10 text-primary border border-primary/20"
                      >
                        {service.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Session Types */}
              {sessionTypes && sessionTypes.length > 0 && (
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                  <h4 className="font-poppins font-semibold text-gray-900 dark:text-white mb-3 text-base flex items-center gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full"></span>
                    Session Types Available
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {sessionTypes.map((type: string, index: number) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="px-3 py-2 text-sm font-medium capitalize border-primary/30 text-primary hover:bg-primary/5"
                      >
                        {type} Session
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Pricing Information */}
              {pricing && (
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                  <h4 className="font-poppins font-semibold text-gray-900 dark:text-white mb-4 text-base flex items-center gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full"></span>
                    Pricing Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {pricing.online && (
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                        <div className="text-sm font-inter text-gray-600 dark:text-gray-400 mb-1">
                          Online Sessions
                        </div>
                        <div className="text-lg font-poppins font-bold text-gray-900 dark:text-white">
                          EUR {pricing.online.min} - {pricing.online.max}
                        </div>
                      </div>
                    )}
                    {pricing.office && (
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                        <div className="text-sm font-inter text-gray-600 dark:text-gray-400 mb-1">
                          Office Sessions
                        </div>
                        <div className="text-lg font-poppins font-bold text-gray-900 dark:text-white">
                          EUR {pricing.office.min} - {pricing.office.max}
                        </div>
                      </div>
                    )}
                    {pricing.home && (
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                        <div className="text-sm font-inter text-gray-600 dark:text-gray-400 mb-1">
                          Home Visits
                        </div>
                        <div className="text-lg font-poppins font-bold text-gray-900 dark:text-white">
                          EUR {pricing.home.min} - {pricing.home.max}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Certifications */}
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3 text-base flex items-center gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full"></span>
                  Certifications & Verification
                </h4>
                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant="outline"
                    className={`px-3 py-2 text-sm font-medium ${
                      verificationStatus === 'APPROVED' || verificationStatus === 'verified'
                        ? 'border-green-300 text-green-700 bg-green-50 dark:bg-green-900/20 dark:text-green-400'
                        : 'border-gray-300 text-gray-600 bg-gray-50'
                    }`}
                  >
                    {verificationStatus === 'APPROVED' || verificationStatus === 'verified'
                      ? '✓ Verified Professional'
                      : 'Verification Pending'}
                  </Badge>

                  {firstAidCertificateStatus === 'APPROVED' && (
                    <Badge
                      variant="outline"
                      className="px-3 py-2 text-sm font-medium border-green-300 text-green-700 bg-green-50 dark:bg-green-900/20 dark:text-green-400"
                    >
                      ✓ First Aid Certified
                    </Badge>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                {/* Primary Action */}
                {hasAvailableSlots ? (
                  <Button
                    className="w-full h-12 text-base font-semibold shadow-md bg-primary hover:bg-primary/90 text-white"
                    onClick={() => {
                      setShowProfileDialog(false);
                      handleBookNow();
                    }}
                    tabIndex={1}
                    autoFocus
                  >
                    Book a Session
                  </Button>
                ) : (
                  <TooltipProvider delayDuration={300}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="inline-block w-full">
                          <Button
                            variant="outline"
                            className="w-full h-12 text-base font-semibold shadow-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-2 border-gray-300 dark:border-gray-600 cursor-not-allowed hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-400"
                            disabled
                            tabIndex={1}
                            autoFocus
                          >
                            Book a Session
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

                {/* Secondary Actions */}
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    className="h-10 text-sm border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 flex items-center justify-center gap-2"
                    onClick={handleFavorite}
                    tabIndex={3}
                  >
                    <Heart
                      className={`w-4 h-4 ${isFavorite ? 'fill-current text-red-500' : 'text-gray-500'}`}
                    />
                    {isFavorite ? 'Remove Favorite' : 'Add Favorite'}
                  </Button>

                  <Button
                    variant="outline"
                    className="h-10 text-sm border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 flex items-center justify-center gap-2"
                    onClick={() => setShowReportDialog(true)}
                    tabIndex={4}
                  >
                    Report
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Report Dialog */}
      <ReportFreelancerDialog
        isOpen={showReportDialog}
        onClose={() => setShowReportDialog(false)}
        freelancerId={id}
        freelancerName={name}
      />
    </TooltipProvider>
  );
};

export default ExpertCard;
