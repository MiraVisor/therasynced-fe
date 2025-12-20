'use client';

import { CheckCircle2, Heart, Loader2, Stamp } from 'lucide-react';
import { useState } from 'react';

import { ReportFreelancerDialog } from '@/components/core/Dashboard/Complaints/ReportFreelancerDialog';
import { RatingDisplay } from '@/components/core/Dashboard/UserSide/Ratings/RatingDisplay';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { TierBadge } from '@/components/ui/tier-badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { VerificationBadge } from '@/components/ui/verification-badge';
import { useFavoriteFreelancer } from '@/hooks/queries/useFreelancers';
import { Expert } from '@/types/types';

interface FavoriteFreelancerCardProps {
  freelancer: Expert;
  onBook: (freelancer: Expert) => void;
}

const FavoriteFreelancerCard: React.FC<FavoriteFreelancerCardProps> = ({ freelancer, onBook }) => {
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
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
    onBook(freelancer);
  };

  // Check if slots are available
  const hasAvailableSlots = freelancer.slots && freelancer.slots.length > 0;

  const freelancerName = freelancer.name;

  // Get tier from props or planFeatures
  const freelancerTier = freelancer.tier || freelancer.planFeatures?.planType || null;

  // Get pricing information from new structure
  const getPricingInfo = () => {
    if (!freelancer.pricing) return null;

    // Check for new pricing structure (lowestPrice, currency, hasPriceRange)
    if (
      'lowestPrice' in freelancer.pricing &&
      freelancer.pricing.lowestPrice !== undefined &&
      freelancer.pricing.lowestPrice !== null
    ) {
      return {
        lowestPrice: freelancer.pricing.lowestPrice,
        highestPrice:
          'highestPrice' in freelancer.pricing && freelancer.pricing.highestPrice
            ? freelancer.pricing.highestPrice
            : null,
        currency:
          'currency' in freelancer.pricing && freelancer.pricing.currency
            ? freelancer.pricing.currency
            : 'EUR',
        hasPriceRange:
          'hasPriceRange' in freelancer.pricing ? freelancer.pricing.hasPriceRange : false,
      };
    }

    // Fallback to old structure for backward compatibility
    const prices: number[] = [];
    if (freelancer.pricing.online?.min !== undefined && freelancer.pricing.online?.min !== null) {
      prices.push(freelancer.pricing.online.min);
    }
    if (freelancer.pricing.office?.min !== undefined && freelancer.pricing.office?.min !== null) {
      prices.push(freelancer.pricing.office.min);
    }
    if (freelancer.pricing.home?.min !== undefined && freelancer.pricing.home?.min !== null) {
      prices.push(freelancer.pricing.home.min);
    }

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
      <Card className="group border-gray-200/80 dark:border-gray-700 overflow-hidden bg-white/80 dark:bg-gray-800 backdrop-blur-sm shadow-soft min-h-[320px] flex flex-col">
        <CardHeader className="pb-3 px-4">
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
                className="flex-1 border-primary text-primary h-9 text-sm"
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
                      <VerificationBadge
                        status={freelancer.verificationStatus || 'unverified'}
                        size="md"
                      />
                    </div>

                    {freelancer.jobTitle?.name && (
                      <p className="text-lg font-inter text-primary font-medium mb-2">
                        {freelancer.jobTitle.name}
                      </p>
                    )}

                    {/* Rating and Experience */}
                    <div className="flex items-center gap-4 text-sm">
                      <RatingDisplay
                        rating={freelancer.rating}
                        reviewCount={freelancer.cardInfo?.totalRatings || freelancer.reviews || 0}
                        size="md"
                        showCount={true}
                      />
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
                    {freelancer.availableSlots || 0}
                  </div>
                  <div className="text-sm font-inter text-gray-600 dark:text-gray-400">
                    Available Slots
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 text-center">
                  <div className="text-2xl font-poppins font-bold text-primary mb-1">
                    {freelancer.reviews || 0}
                  </div>
                  <div className="text-sm font-inter text-gray-600 dark:text-gray-400">
                    Total Reviews
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 text-center">
                  <div className="text-2xl font-poppins font-bold text-primary mb-1">
                    {freelancer.services?.length || 0}
                  </div>
                  <div className="text-sm font-inter text-gray-600 dark:text-gray-400">
                    Services
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 text-center">
                  <div className="text-2xl font-poppins font-bold text-primary mb-1">
                    {freelancer.sessionTypes?.length || 0}
                  </div>
                  <div className="text-sm font-inter text-gray-600 dark:text-gray-400">
                    Session Types
                  </div>
                </div>
              </div>

              {/* Services Section */}
              {freelancer.services && freelancer.services.length > 0 && (
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3 text-base flex items-center gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full"></span>
                    Services Offered
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {freelancer.services.map((service: any, index: number) => (
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
              {freelancer.sessionTypes && freelancer.sessionTypes.length > 0 && (
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3 text-base flex items-center gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full"></span>
                    Session Types Available
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {freelancer.sessionTypes.map((type: string, index: number) => (
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
              {freelancer.pricing && (
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-4 text-base flex items-center gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full"></span>
                    Pricing Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {freelancer.pricing.online && (
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                          Online Sessions
                        </div>
                        <div className="text-lg font-bold text-gray-900 dark:text-white">
                          ${freelancer.pricing.online.min} - ${freelancer.pricing.online.max}
                        </div>
                      </div>
                    )}
                    {freelancer.pricing.office && (
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                          Office Sessions
                        </div>
                        <div className="text-lg font-bold text-gray-900 dark:text-white">
                          ${freelancer.pricing.office.min} - ${freelancer.pricing.office.max}
                        </div>
                      </div>
                    )}
                    {freelancer.pricing.home && (
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                          Home Visits
                        </div>
                        <div className="text-lg font-bold text-gray-900 dark:text-white">
                          ${freelancer.pricing.home.min} - ${freelancer.pricing.home.max}
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
                      freelancer.verificationStatus === 'APPROVED' ||
                      freelancer.verificationStatus === 'verified'
                        ? 'border-green-300 text-green-700 bg-green-50 dark:bg-green-900/20 dark:text-green-400'
                        : 'border-gray-300 text-gray-600 bg-gray-50'
                    }`}
                  >
                    {freelancer.verificationStatus === 'APPROVED' ||
                    freelancer.verificationStatus === 'verified'
                      ? '✓ Verified Professional'
                      : 'Verification Pending'}
                  </Badge>

                  {(freelancer.firstAidCertificateStatus === 'APPROVED' ||
                    freelancer.firstAidCertificateStatus === 'PENDING' ||
                    freelancer.firstAidCertificateStatus === 'REJECTED') && (
                    <Badge
                      variant="outline"
                      className={`px-3 py-2 text-sm font-medium ${
                        freelancer.firstAidCertificateStatus === 'APPROVED'
                          ? 'border-green-300 text-green-700 bg-green-50 dark:bg-green-900/20 dark:text-green-400'
                          : freelancer.firstAidCertificateStatus === 'PENDING'
                            ? 'border-yellow-300 text-yellow-700 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400'
                            : 'border-gray-300 text-gray-600 bg-gray-50'
                      }`}
                    >
                      {freelancer.firstAidCertificateStatus === 'APPROVED'
                        ? '✓ First Aid Certified'
                        : freelancer.firstAidCertificateStatus === 'PENDING'
                          ? '⏳ First Aid Certificate Pending'
                          : 'First Aid Certificate'}
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
                      className={`w-4 h-4 ${freelancer.isFavorite ? 'fill-current text-red-500' : 'text-gray-500'}`}
                    />
                    {freelancer.isFavorite ? 'Remove Favorite' : 'Add Favorite'}
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
        freelancerId={freelancer.id}
        freelancerName={freelancer.name}
      />
    </TooltipProvider>
  );
};

export default FavoriteFreelancerCard;
