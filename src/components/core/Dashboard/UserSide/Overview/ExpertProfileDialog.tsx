import { CheckCircle2, Gift, Heart, Stamp } from 'lucide-react';
import { useState } from 'react';

import { ReportFreelancerDialog } from '@/components/core/Dashboard/Complaints/ReportFreelancerDialog';
import { RatingDisplay } from '@/components/core/Dashboard/UserSide/Ratings/RatingDisplay';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { VerificationBadge } from '@/components/ui/verification-badge';
import { useFavoriteFreelancer } from '@/hooks/queries/useFreelancers';
import { Expert } from '@/types/types';

interface ExpertProfileDialogProps {
  isOpen: boolean;
  onClose: () => void;
  expert: Partial<Expert> & {
    id: string;
    name?: string;
    jobTitle?: { id: string; name: string; description?: string };
    rating?: number;
    services?: Array<{
      id: string;
      name: string;
      description?: string;
      additionalPrice?: number;
      duration?: number;
    }>;
    sessionTypes?: string[];
    pricing?: { basePrice?: number; additionalFees?: number };
    availableSlots?: number;
    cardInfo?: {
      name: string;
      title?: string;
      mainService?: string;
      yearsOfExperience?: string;
      country?: string;
      averageRating?: number;
      totalRatings: number;
      patientStories?: number;
      initials?: string;
    };
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
    onBookNow: () => void;
    hasAvailableSlots: boolean;
    stampInfo?: {
      currentStampCount: number;
      stampTarget: number;
      stampsRemaining: number;
      rewardReady: boolean;
      rewardReserved: boolean;
      discountPercentage: number;
      customConfigApplied: boolean;
    };
  };
}

export function ExpertProfileDialog({ isOpen, onClose, expert }: ExpertProfileDialogProps) {
  const { mutate: toggleFavorite, isPending: isFavoriteLoading } = useFavoriteFreelancer();
  const [showReportDialog, setShowReportDialog] = useState(false);

  const {
    name,
    jobTitle,
    rating,
    cardInfo,
    services = [],
    sessionTypes = [],
    pricing,
    availableSlots = 0,
    verificationStatus = 'unverified',
    firstAidCertificateStatus,
    isFavorite = false,
    onBookNow,
    hasAvailableSlots,
    description,
    stampInfo,
  } = expert;

  const freelancerName = name || cardInfo?.name;
  const displayRating =
    cardInfo?.averageRating !== undefined && cardInfo.averageRating !== null
      ? cardInfo.averageRating
      : rating;

  const handleFavorite = () => {
    if (isFavoriteLoading) return;
    toggleFavorite(expert.id, {
      onSuccess: () => {
        // Toast is handled by the mutation hook
      },
    });
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
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
                      <p className="text-lg font-inter text-primary font-medium mb-2">
                        {jobTitle.name}
                      </p>
                    )}

                    {/* Rating and Experience */}
                    <div className="flex items-center gap-4 text-sm">
                      <RatingDisplay
                        rating={displayRating}
                        reviewCount={cardInfo?.totalRatings || 0}
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
              {/* Bio/Description */}
              {description && (
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                  <h4 className="font-poppins font-semibold text-gray-900 dark:text-white mb-3 text-base flex items-center gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full" />
                    About
                  </h4>
                  <p className="text-sm font-inter text-gray-700 dark:text-gray-300 leading-relaxed">
                    {description}
                  </p>
                </div>
              )}

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
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
                    {cardInfo?.totalRatings || 0}
                  </div>
                  <div className="text-sm font-inter text-gray-600 dark:text-gray-400">
                    Total Reviews
                  </div>
                </div>
              </div>

              {/* Stamps Section */}
              {stampInfo && (
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                  <h4 className="font-poppins font-semibold text-gray-900 dark:text-white mb-4 text-base flex items-center gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full" />
                    Your Stamps Progress
                  </h4>

                  {/* Stamp Visual Display */}
                  <div className="mb-4">
                    <div className="flex items-center justify-center gap-2 mb-3">
                      {(() => {
                        const target = stampInfo.stampTarget ?? 5;
                        const currentCount = Number(stampInfo.currentStampCount ?? 0);
                        const maxCount = Math.min(currentCount, target);
                        return Array.from({ length: target }, (_, index) => {
                          const isFilled = index < maxCount;
                          return (
                            <div
                              key={index}
                              className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                                isFilled
                                  ? 'bg-primary border-primary text-white'
                                  : 'bg-gray-100 border-gray-300 text-gray-400 dark:bg-gray-700 dark:border-gray-600'
                              }`}
                            >
                              {isFilled ? (
                                <CheckCircle2 className="h-5 w-5" />
                              ) : (
                                <Stamp className="h-5 w-5" />
                              )}
                            </div>
                          );
                        });
                      })()}
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <Progress
                        value={(stampInfo.currentStampCount / stampInfo.stampTarget) * 100}
                        className="h-3"
                      />
                      <div className="flex justify-between text-sm font-inter text-gray-600 dark:text-gray-400">
                        <span>
                          {stampInfo.currentStampCount} of {stampInfo.stampTarget} stamps
                        </span>
                        <span>{stampInfo.stampsRemaining} stamps to reward</span>
                      </div>
                    </div>
                  </div>

                  {/* Reward Status */}
                  {stampInfo.rewardReady && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      {stampInfo.rewardReserved ? (
                        <Badge
                          variant="secondary"
                          className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 px-3 py-2 text-sm font-medium"
                        >
                          <Gift className="h-4 w-4 mr-2 inline" />
                          Reward Reserved
                        </Badge>
                      ) : (
                        <Badge
                          variant="default"
                          className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 px-3 py-2 text-sm font-medium"
                        >
                          <CheckCircle2 className="h-4 w-4 mr-2 inline" />
                          {stampInfo.discountPercentage}% Discount Available!
                        </Badge>
                      )}
                    </div>
                  )}

                  {stampInfo.customConfigApplied && (
                    <div className="mt-2">
                      <Badge variant="outline" className="text-xs">
                        Custom Configuration Applied
                      </Badge>
                    </div>
                  )}
                </div>
              )}

              {/* Pricing Information */}
              {pricing && (
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                  <h4 className="font-poppins font-semibold text-gray-900 dark:text-white mb-4 text-base flex items-center gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full" />
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

              {/* Certifications - Only show approved verifications */}
              {(verificationStatus === 'APPROVED' ||
                verificationStatus === 'verified' ||
                firstAidCertificateStatus === 'APPROVED') && (
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3 text-base flex items-center gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full" />
                    Certifications & Verification
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {(verificationStatus === 'APPROVED' || verificationStatus === 'verified') && (
                      <Badge
                        variant="outline"
                        className="px-3 py-2 text-sm font-medium border-green-300 text-green-700 bg-green-50 dark:bg-green-900/20 dark:text-green-400"
                      >
                        ✓ Verified Professional
                      </Badge>
                    )}

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
              )}

              {/* Action Buttons */}
              <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                {/* Primary Action */}
                {hasAvailableSlots ? (
                  <Button
                    className="w-full h-12 text-base font-semibold shadow-md bg-primary hover:bg-primary/90 text-white"
                    onClick={() => {
                      onClose();
                      onBookNow();
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
        freelancerId={expert.id}
        freelancerName={expert.name || ''}
      />
    </>
  );
}
