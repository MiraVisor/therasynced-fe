'use client';

import { format } from 'date-fns';
import { Calendar, Clock, Loader2, Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { StarRatingSelector } from '@/components/ui/star-rating-selector';
import { useCreateRating, useRatingEligibility } from '@/hooks/queries/useRatings';
import { Booking } from '@/types/types';

interface RatingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: Booking | null;
  onSuccess?: () => void;
}

export const RatingModal: React.FC<RatingModalProps> = ({
  open,
  onOpenChange,
  booking,
  onSuccess,
}) => {
  const [rating, setRating] = useState<number>(0);
  const { mutate: createRatingMutation, isPending: isSubmitting } = useCreateRating();
  const { data: eligibilityData, isLoading: isCheckingEligibility } = useRatingEligibility(
    booking?.id ?? null,
  );

  const eligibility = eligibilityData
    ? {
        canBeRated: eligibilityData.canBeRated,
        hasRating: eligibilityData.hasRating,
        reason: eligibilityData.reason,
      }
    : null;

  useEffect(() => {
    if (open && booking) {
      // Use booking.canBeRated and booking.hasRating if available from API response
      if (booking.canBeRated !== undefined && booking.hasRating !== undefined) {
        // Eligibility is handled by React Query hook
        if (booking.hasRating && booking.rating) {
          setRating(booking.rating.rating);
        }
      } else if (eligibilityData?.hasRating && eligibilityData.rating) {
        setRating(eligibilityData.rating.rating);
      }
    } else {
      setRating(0);
    }
  }, [open, booking, eligibilityData]);

  const handleSubmit = () => {
    if (!booking || rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    createRatingMutation(
      {
        bookingId: booking.id,
        rating: rating,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          if (onSuccess) {
            onSuccess();
          }
        },
      },
    );
  };

  if (!booking) return null;

  const freelancer = booking.slot?.freelancer;
  const { slot } = booking;
  const bookingDate = slot ? new Date(slot.startTime) : null;

  const canSubmit =
    rating > 0 && !isSubmitting && eligibility?.canBeRated && !eligibility.hasRating;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-poppins font-bold text-charcoal">
            Rate Your Experience
          </DialogTitle>
          <DialogDescription className="font-inter text-muted-foreground">
            Share your feedback about this appointment
          </DialogDescription>
        </DialogHeader>

        {isCheckingEligibility ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-6 py-4">
            {/* Booking Details */}
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 space-y-3">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/15 text-primary flex items-center justify-center font-bold text-lg flex-shrink-0 border-2 border-primary/20">
                  {freelancer?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-poppins font-semibold text-charcoal mb-1">
                    {freelancer?.name || 'Unknown Professional'}
                  </h3>
                  {bookingDate && (
                    <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{format(bookingDate, 'EEEE, MMMM d, yyyy')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>
                          {format(bookingDate, 'h:mm a')} -{' '}
                          {slot ? format(new Date(slot.endTime), 'h:mm a') : ''}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Eligibility Message */}
            {eligibility && !eligibility.canBeRated && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  {eligibility.reason || 'This booking cannot be rated at this time.'}
                </p>
              </div>
            )}

            {eligibility && eligibility.hasRating && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  You have already rated this booking.
                </p>
              </div>
            )}

            {/* Rating Selector */}
            {eligibility && eligibility.canBeRated && !eligibility.hasRating && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-poppins font-semibold text-charcoal mb-3 block">
                    How would you rate this appointment?
                  </label>
                  <div className="flex justify-center py-4">
                    <StarRatingSelector
                      value={rating}
                      onChange={setRating}
                      size="lg"
                      disabled={isSubmitting}
                    />
                  </div>
                  {rating > 0 && (
                    <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-2">
                      You selected {rating} star{rating !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            {eligibility?.hasRating ? 'Close' : 'Cancel'}
          </Button>
          {canSubmit && (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || rating === 0}
              className="bg-primary hover:bg-primary/90 text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Star className="w-4 h-4 mr-2" />
                  Submit Rating
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RatingModal;
