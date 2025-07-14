import React, { useState } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { useDispatch } from 'react-redux';

import DotLoader from '@/components/common/DotLoader';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { submitFreelancerRating } from '@/redux/slices/bookingSlice';

interface RateFreelancerDialogProps {
  open: boolean;
  onClose: () => void;
  freelancerName: string;
  freelancerId: string;
  bookingId: string;
  onSubmit?: (rating: number, review: string) => void;
}

export const RateFreelancerDialog: React.FC<RateFreelancerDialogProps> = (props) => {
  const { open, onClose, freelancerName, freelancerId, bookingId, onSubmit } = props;
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const dispatch = useDispatch();

  const handleRate = async () => {
    setSubmitting(true);
    try {
      let response;
      if (onSubmit) {
        response = await onSubmit(rating, review);
      } else if (freelancerId && bookingId) {
        response = await dispatch(
          submitFreelancerRating({ freelancerId, rating, review, bookingId }) as any,
        );
      }
      // Try to get message from response (RTK thunk returns an action)
      let message = 'Thank you for your feedback!';
      if (response && response.payload && response.payload.message) {
        message = response.payload.message;
      } else if (response && response.message) {
        message = response.message;
      }
      toast.success(message);
    } catch (e: any) {
      let errorMsg = e?.message || 'Failed to submit rating. Please try again.';
      if (e && e.payload && e.payload.message) errorMsg = e.payload.message;
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
      onClose();
    }
  };

  return (
    <>
      <Toaster position="top-center" />
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rate {freelancerName}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-2">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={`text-2xl ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
                  onClick={() => setRating(star)}
                  aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                >
                  ★
                </button>
              ))}
            </div>
            <textarea
              className="w-full border rounded p-2 min-h-[80px]"
              placeholder="Write a review (optional)"
              value={review}
              onChange={(e) => setReview(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button onClick={handleRate} disabled={submitting || rating === 0}>
              {submitting ? <DotLoader size={14} /> : 'Submit'}
            </Button>
            <DialogClose asChild>
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RateFreelancerDialog;
