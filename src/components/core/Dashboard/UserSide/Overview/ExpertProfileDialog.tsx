import { Clock, ExternalLink, Heart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { ProfileAvatarImage } from '@/components/common/ProfileAvatarImage';
import { ReportFreelancerDialog } from '@/components/core/Dashboard/Complaints/ReportFreelancerDialog';
import { RatingDisplay } from '@/components/core/Dashboard/UserSide/Ratings/RatingDisplay';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { VerificationBadge } from '@/components/ui/verification-badge';
import { useFavoriteFreelancer } from '@/hooks/queries/useFreelancers';
import type { DurationPricing, ServicePricing } from '@/types/pricing';
import { Expert } from '@/types/types';

interface ExpertProfileDialogProps {
  isOpen: boolean;
  onClose: () => void;
  expert: Partial<Expert> & {
    id: string;
    name?: string;
    profilePicture?: string;
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
    durationPricing?: DurationPricing[];
    serviceCategoryPricing?: ServicePricing[];
  };
}

export function ExpertProfileDialog({ isOpen, onClose, expert }: ExpertProfileDialogProps) {
  const router = useRouter();
  const { mutate: toggleFavorite, isPending: isFavoriteLoading } = useFavoriteFreelancer();
  const [showReportDialog, setShowReportDialog] = useState(false);

  const {
    name,
    jobTitle,
    rating,
    cardInfo,
    services: _services = [],
    sessionTypes: _sessionTypes = [],
    pricing,
    availableSlots = 0,
    verificationStatus = 'unverified',
    firstAidCertificateStatus,
    isFavorite = false,
    onBookNow,
    hasAvailableSlots,
    description,
    durationPricing = [],
    serviceCategoryPricing = [],
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
                  <Avatar className="w-16 h-16 flex-shrink-0 border-2 border-primary/20">
                    <ProfileAvatarImage
                      src={expert.profilePicture || undefined}
                      alt={freelancerName || 'Freelancer'}
                    />
                    <AvatarFallback className="bg-primary/15 text-primary font-bold text-xl">
                      {freelancerName?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  {/* Profile Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <DialogTitle className="text-2xl lg:text-3xl font-poppins font-bold text-gray-900 truncate">
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
                <div className="bg-gradient-to-br from-primary/5 via-primary/3 to-transparent rounded-lg p-5 border border-primary/20">
                  <h4 className="font-poppins font-semibold text-gray-900 mb-3 text-lg flex items-center gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full" />
                    About {freelancerName}
                  </h4>
                  <p className="text-sm font-inter text-gray-700 leading-relaxed whitespace-pre-line">
                    {description}
                  </p>
                </div>
              )}

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
                  <div className="text-2xl font-poppins font-bold text-primary mb-1">
                    {availableSlots || 0}
                  </div>
                  <div className="text-sm font-inter text-gray-600">
                    Available Slots
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
                  <div className="text-2xl font-poppins font-bold text-primary mb-1">
                    {cardInfo?.totalRatings || 0}
                  </div>
                  <div className="text-sm font-inter text-gray-600">
                    Total Reviews
                  </div>
                </div>
              </div>

              {/* Duration Pricing */}
              {durationPricing && durationPricing.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-poppins font-semibold text-gray-900 mb-4 text-base flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" />
                    Pricing by Duration
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                    {durationPricing
                      .sort((a, b) => a.duration - b.duration)
                      .map((dp) => (
                        <div
                          key={dp.duration}
                          className="bg-white rounded-lg p-3 border border-gray-200 text-center"
                        >
                          <div className="text-xs font-inter text-gray-600 mb-1">
                            {dp.duration} min
                          </div>
                          <div className="text-lg font-poppins font-bold text-primary">
                            €{dp.price.toFixed(2)}
                          </div>
                          {dp.currency && dp.currency !== 'EUR' && (
                            <div className="text-xs text-gray-500 mt-1">
                              {dp.currency}
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Service Category Pricing */}
              {serviceCategoryPricing && serviceCategoryPricing.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-poppins font-semibold text-gray-900 mb-4 text-base flex items-center gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full" />
                    Pricing by Service Category
                  </h4>
                  <div className="space-y-3">
                    {serviceCategoryPricing.map((sp) => (
                      <div
                        key={sp.serviceId}
                        className="bg-white rounded-lg p-4 border border-gray-200"
                      >
                        <div className="font-poppins font-semibold text-gray-900 mb-2">
                          {sp.serviceName}
                        </div>
                        {sp.locations && sp.locations.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                            {sp.locations.map((location, idx) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between p-2 bg-gray-50 rounded"
                              >
                                <span className="text-sm font-inter text-gray-600">
                                  {location.locationType === 'HOME' ? 'Home Visit' : 'Clinic'}
                                </span>
                                <span className="text-base font-poppins font-bold text-primary">
                                  €{location.price.toFixed(2)}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-sm font-inter text-gray-600">
                              Standard Price
                            </span>
                            <span className="text-base font-poppins font-bold text-primary">
                              €{sp.price.toFixed(2)}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Legacy Pricing Information (fallback) */}
              {pricing && (!durationPricing || durationPricing.length === 0) && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-poppins font-semibold text-gray-900 mb-4 text-base flex items-center gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full" />
                    Pricing Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {pricing.online && (
                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <div className="text-sm font-inter text-gray-600 mb-1">
                          Online Sessions
                        </div>
                        <div className="text-lg font-poppins font-bold text-gray-900">
                          EUR {pricing.online.min} - {pricing.online.max}
                        </div>
                      </div>
                    )}
                    {pricing.office && (
                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <div className="text-sm font-inter text-gray-600 mb-1">
                          Office Sessions
                        </div>
                        <div className="text-lg font-poppins font-bold text-gray-900">
                          EUR {pricing.office.min} - {pricing.office.max}
                        </div>
                      </div>
                    )}
                    {pricing.home && (
                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <div className="text-sm font-inter text-gray-600 mb-1">
                          Home Visits
                        </div>
                        <div className="text-lg font-poppins font-bold text-gray-900">
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
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 text-base flex items-center gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full" />
                    Certifications & Verification
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {(verificationStatus === 'APPROVED' || verificationStatus === 'verified') && (
                      <Badge
                        variant="outline"
                        className="px-3 py-2 text-sm font-medium border-green-300 text-green-700 bg-green-50"
                      >
                        ✓ Verified Professional
                      </Badge>
                    )}

                    {firstAidCertificateStatus === 'APPROVED' && (
                      <Badge
                        variant="outline"
                        className="px-3 py-2 text-sm font-medium border-green-300 text-green-700 bg-green-50"
                      >
                        ✓ First Aid Certified
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-4 pt-4 border-t border-gray-200">
                {/* View Full Profile Button */}
                <Button
                  variant="outline"
                  className="w-full h-10 text-sm border-primary/30 text-primary hover:bg-primary/5 hover:border-primary/50 flex items-center justify-center gap-2"
                  onClick={() => {
                    onClose();
                    router.push(`/dashboard/freelancer-profile/${expert.id}`);
                  }}
                  tabIndex={2}
                >
                  <ExternalLink className="w-4 h-4" />
                  View Full Profile
                </Button>

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
                            className="w-full h-12 text-base font-semibold shadow-md bg-gray-100 text-gray-600 border-2 border-gray-300 cursor-not-allowed hover:bg-gray-100 hover:text-gray-600">
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
