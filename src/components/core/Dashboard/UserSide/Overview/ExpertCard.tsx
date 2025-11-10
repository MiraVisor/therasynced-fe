import { CheckCircle, Heart, Loader2, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';

import { ReportFreelancerDialog } from '@/components/core/Dashboard/Complaints/ReportFreelancerDialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { VerificationBadge } from '@/components/ui/verification-badge';
import { favoriteFreelancer } from '@/redux/slices/overviewSlice';
import { Expert } from '@/types/types';

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
  verificationStatus = 'unverified',
  firstAidCertificateStatus,
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

  return (
    <>
      <Card className="group transition-all duration-300 border-gray-200/80 dark:border-gray-700 overflow-hidden bg-white/80 dark:bg-gray-800 backdrop-blur-sm hover:border-primary/30 shadow-soft hover:shadow-soft-lg min-h-[320px] flex flex-col">
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
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-base font-semibold text-gray-900 dark:text-white truncate transition-colors">
                    {freelancerName}
                  </h4>
                  <VerificationBadge status={verificationStatus} size="sm" />
                </div>
                {rating && rating > 0 ? (
                  <div className="flex items-center gap-1 mt-2">
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
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    No ratings yet
                  </div>
                )}
              </div>
            </div>

            <button
              className={`p-2 rounded-full transition-all duration-200 hover:scale-110 flex-shrink-0 ${
                isFavorite
                  ? 'text-red-500 bg-red-50 dark:bg-red-900/20'
                  : 'text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
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
            <div className="flex items-center justify-between text-sm">
              <span className="font-inter text-muted-foreground">Experience:</span>
              <span className="font-poppins font-semibold text-charcoal">{yearsOfExperience}</span>
            </div>
            {cardInfo?.patientStories && (
              <div className="flex items-center justify-between text-sm">
                <span className="font-inter text-muted-foreground">Reviews:</span>
                <span className="font-poppins font-semibold text-charcoal">
                  {cardInfo.patientStories}
                </span>
              </div>
            )}
            {(availableSlots || 0) > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="font-inter text-muted-foreground">Availability:</span>
                <div className="flex items-center gap-1 text-success">
                  <CheckCircle className="w-3 h-3" />
                  <span className="font-poppins font-semibold">{availableSlots || 0} slots</span>
                </div>
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
              <Button
                className="flex-1 bg-primary hover:bg-primary/90 text-white shadow-sm h-9 text-sm"
                onClick={handleBookNow}
              >
                Book Now
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Dialog */}
      <Dialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
        <DialogContent className="max-w-[95vw] lg:max-w-3xl max-h-[90vh] lg:max-h-[85vh] overflow-y-auto mx-4 lg:mx-auto">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white text-center">
              Freelancer Profile
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Simple Profile Header */}
            <div className="text-center pb-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-center gap-2 mb-1">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{name}</h3>
                <VerificationBadge status={verificationStatus} size="md" />
              </div>
              {jobTitle?.name && (
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">{jobTitle.name}</p>
              )}
              {firstAidCertificateStatus === 'APPROVED' && (
                <p className="text-sm text-green-600 dark:text-green-400">
                  First Aid Certificate: Approved
                </p>
              )}
            </div>

            {/* Services Section with Clear Label */}
            {services.length > 0 && (
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3 text-base flex items-center gap-2">
                  Services Offered
                </h4>
                <div className="flex flex-wrap gap-2">
                  {services.map((service: any, index: number) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200 transition-colors dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                    >
                      {service.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Session Types with Clear Label */}
            {sessionTypes && sessionTypes.length > 0 && (
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3 text-base flex items-center gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full"></span>
                  Session Types Available
                </h4>
                <div className="flex flex-wrap gap-2">
                  {sessionTypes.map((type: string, index: number) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="px-3 py-1.5 text-xs font-medium capitalize"
                    >
                      {type} Session
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Pricing Information with Clear Label */}
            {pricing && (
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3 text-base flex items-center gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full"></span>
                  Pricing Information
                </h4>
                <div className="space-y-2">
                  {pricing.online && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Online Sessions:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        ${pricing.online.min} - ${pricing.online.max}
                      </span>
                    </div>
                  )}
                  {pricing.office && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Office Sessions:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        ${pricing.office.min} - ${pricing.office.max}
                      </span>
                    </div>
                  )}
                  {pricing.home && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Home Visits:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        ${pricing.home.min} - ${pricing.home.max}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons with Clear Labels */}
            <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              {/* Primary Action - Book a Session */}
              <Button
                className="w-full bg-primary hover:bg-primary/90 h-12 text-base font-semibold shadow-md"
                onClick={() => {
                  setShowProfileDialog(false);
                  handleBookNow();
                }}
                tabIndex={1}
                autoFocus
              >
                Book a Session
              </Button>

              {/* Secondary Actions Row */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 h-10 text-sm border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 flex items-center justify-center gap-2"
                  onClick={handleFavorite}
                  tabIndex={2}
                >
                  <Heart
                    className={`w-4 h-4 ${isFavorite ? 'fill-current text-red-500' : 'text-gray-500'}`}
                  />
                  {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 h-10 text-sm border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
                  onClick={() => setShowReportDialog(true)}
                  tabIndex={3}
                >
                  Report/Block
                </Button>
              </div>

              {/* Close Button */}
              <Button
                variant="ghost"
                className="w-full h-10 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                onClick={() => setShowProfileDialog(false)}
                tabIndex={4}
              >
                Close Profile
              </Button>
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
    </>
  );
};

export default ExpertCard;
