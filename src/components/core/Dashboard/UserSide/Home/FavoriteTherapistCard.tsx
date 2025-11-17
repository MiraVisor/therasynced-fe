'use client';

import { CheckCircle2, Heart, Loader2, Stamp, Star } from 'lucide-react';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { VerificationBadge } from '@/components/ui/verification-badge';
import { favoriteFreelancer } from '@/redux/slices/overviewSlice';
import { RootState } from '@/redux/store';
import { Expert } from '@/types/types';

interface FavoriteFreelancerCardProps {
  freelancer: Expert;
  onBook: (freelancer: Expert) => void;
}

const FavoriteFreelancerCard: React.FC<FavoriteFreelancerCardProps> = ({ freelancer, onBook }) => {
  const dispatch = useDispatch();
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);

  // Get stamp information for this therapist
  const { stampSummaries } = useSelector((state: RootState) => state.stamps);
  const therapistStamp = stampSummaries?.find((stamp) => stamp.therapist.id === freelancer.id);

  const handleViewProfile = () => {
    setShowProfileDialog(true);
  };

  const handleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFavoriteLoading) return;

    setIsFavoriteLoading(true);
    try {
      const result = await dispatch(favoriteFreelancer(freelancer.id) as any).unwrap();
      if (result && typeof result === 'object' && 'favorited' in result) {
        toast.success(result.favorited ? 'Added to favorites' : 'Removed from favorites');
      } else {
        toast.success(!freelancer.isFavorite ? 'Added to favorites' : 'Removed from favorites');
      }
    } catch (err: any) {
      toast.error('Failed to update favorite');
    } finally {
      setIsFavoriteLoading(false);
    }
  };

  const handleBookNow = () => {
    onBook(freelancer);
  };

  const freelancerName = freelancer.name;

  return (
    <>
      <Card className="group transition-all duration-300 border-gray-200/80 dark:border-gray-700 overflow-hidden bg-white/80 dark:bg-gray-800 backdrop-blur-sm hover:border-primary/30 shadow-soft hover:shadow-soft-lg min-h-[320px] flex flex-col">
        <CardHeader className="pb-3 px-4">
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
                  <VerificationBadge
                    status={freelancer.verificationStatus || 'unverified'}
                    size="sm"
                  />
                </div>
                {freelancer.rating && freelancer.rating > 0 ? (
                  <div className="flex items-center gap-1 mt-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${i < Math.floor(freelancer.rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                      />
                    ))}
                    <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                      ({freelancer.rating})
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
                freelancer.isFavorite
                  ? 'text-red-500 bg-red-50 dark:bg-red-900/20'
                  : 'text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
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
            <div className="flex items-center justify-between text-sm">
              <span className="font-inter text-muted-foreground">Experience:</span>
              <span className="font-poppins font-semibold text-charcoal">
                {freelancer.yearsOfExperience || '0'} years
              </span>
            </div>
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
                {Array.from({ length: therapistStamp?.stampTarget || 5 }, (_, index) => {
                  const isFilled = therapistStamp && index < therapistStamp.currentStampCount;
                  return (
                    <div
                      key={index}
                      className={`flex items-center justify-center w-5 h-5 rounded-full border transition-all ${
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
                })}
              </div>
            </div>
            {(freelancer.availableSlots || 0) > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="font-inter text-muted-foreground">Availability:</span>
                <div className="flex items-center gap-1 text-success">
                  <CheckCircle2 className="w-3 h-3" />
                  <span className="font-poppins font-semibold">
                    {freelancer.availableSlots || 0} slots
                  </span>
                </div>
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
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {freelancer.name}
                </h3>
                <VerificationBadge
                  status={freelancer.verificationStatus || 'unverified'}
                  size="md"
                />
              </div>
              {freelancer.jobTitle?.name && (
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">
                  {freelancer.jobTitle.name}
                </p>
              )}
            </div>

            {/* Services Section */}
            {freelancer.services && freelancer.services.length > 0 && (
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3 text-base flex items-center gap-2">
                  Services Offered
                </h4>
                <div className="flex flex-wrap gap-2">
                  {freelancer.services.map((service: any, index: number) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200 rounded-md dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
                    >
                      {service.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                className="w-full bg-primary hover:bg-primary/90 h-12 text-base font-semibold shadow-md"
                onClick={() => {
                  setShowProfileDialog(false);
                  handleBookNow();
                }}
              >
                Book a Session
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FavoriteFreelancerCard;
