'use client';

import { CreditCard, FileText, MessageCircle, RotateCcw, Star, User, X } from 'lucide-react';
import React from 'react';

import { RatingDisplay } from '@/components/core/Dashboard/UserSide/Ratings/RatingDisplay';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { hasRating } from '@/types/rating';
import { Booking } from '@/types/types';

interface BookingDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: Booking | null;
  onMessage?: (booking: Booking) => void;
  onReschedule?: (booking: Booking) => void;
  onCancel?: (booking: Booking) => void;
  onReview?: (booking: Booking) => void;
  cancellingBookingId?: string | null;
}

export const BookingDetailsModal: React.FC<BookingDetailsModalProps> = ({
  open,
  onOpenChange,
  booking,
  onMessage,
  onReschedule,
  onCancel,
  onReview,
  cancellingBookingId,
}) => {
  if (!booking?.slot) return null;

  const { freelancer } = booking.slot;
  const { slot } = booking;
  const bookingDate = new Date(slot.startTime);
  const now = new Date();
  const isUpcoming = booking.status === 'CONFIRMED' && bookingDate > now;
  const isPast = bookingDate < now;
  // Consider completed if past appointment time (status is CONFIRMED but appointment has passed)
  // Note: Backend may update status to COMPLETED, but we also check past confirmed bookings
  const isCompleted = booking.status === 'COMPLETED' || (booking.status === 'CONFIRMED' && isPast);
  const isCancelled = booking.status === 'CANCELLED';
  // User side: Show message for all bookings
  const canMessage = !!onMessage;
  const canReschedule = booking.status === 'CONFIRMED' && isUpcoming;
  const canCancel = booking.status === 'CONFIRMED' && isUpcoming;
  const canReview =
    booking.canBeRated !== undefined
      ? booking.canBeRated && !booking.hasRating
      : isCompleted && !isCancelled;
  const getStatusColor = (status: string) => {
    if (isUpcoming) return 'bg-info/10 text-info border border-info/20';
    if (status === 'CANCELLED') return 'bg-error/10 text-error border border-error/20';
    if (status === 'RESCHEDULED') return 'bg-warning/10 text-warning border border-warning/20';
    return 'bg-success/10 text-success border border-success/20';
  };

  const getStatusText = (status: string) => {
    if (status === 'CONFIRMED') {
      return bookingDate > new Date() ? 'Upcoming' : 'Confirmed';
    }
    if (status === 'RESCHEDULED') return 'Rescheduled';
    if (status === 'CANCELLED') return 'Cancelled';
    return status.charAt(0) + status.slice(1).toLowerCase();
  };

  // Calculate total services price (legacy support)
  const servicesTotal =
    booking.services?.reduce((sum, service) => sum + (service.additionalPrice ?? 0), 0) ?? 0;
  const basePrice = slot?.basePrice ?? 0;
  const totalAmount = booking.totalAmount ?? basePrice + servicesTotal;

  // Extract and safely convert notes from formData
  const getNotesString = (): string | null => {
    const notes = booking.formData?.['notes'];
    if (notes == null) return null;
    return typeof notes === 'string' ? notes : String(notes);
  };
  const notesString = getNotesString();

  // Helper to render freelancer email
  const getFreelancerEmailElement = (): React.ReactNode => {
    if (!freelancer?.email) {
      return null;
    }
    return <p className="text-sm font-inter text-muted-foreground mb-2">{freelancer.email}</p>;
  };

  // Helper to render freelancer overall rating
  const getFreelancerRatingElement = (): React.ReactNode => {
    const rating = freelancer?.cardInfo?.averageRating ?? freelancer?.averageRating ?? 0;
    if (rating > 0) {
      return (
        <RatingDisplay
          rating={rating}
          size="sm"
          showCount={true}
          reviewCount={freelancer?.cardInfo?.totalRatings ?? 0}
        />
      );
    }
    return null;
  };

  // Helper to render booking rating
  const getBookingRatingElement = (): React.ReactNode => {
    if (!booking.hasRating || !hasRating(booking.rating)) {
      return null;
    }
    return (
      <div className="flex items-center gap-3 px-3 py-2 bg-primary/10 border border-primary/30 rounded-lg">
        <span className="text-sm font-poppins font-semibold text-primary">
          Your Rating for this Booking:
        </span>
        <RatingDisplay rating={booking.rating.rating} size="sm" showCount={false} />
      </div>
    );
  };

  // Helper to render service categories
  const getServiceCategoriesElement = (): React.ReactNode => {
    const hasServiceCategories = booking.serviceCategories && booking.serviceCategories.length > 0;
    const hasServices = booking.services && booking.services.length > 0;

    if (!hasServiceCategories && !hasServices) {
      return null;
    }

    const renderCategoryDescription = (description?: string): React.ReactNode => {
      if (!description) return null;
      return <p className="text-xs font-inter text-muted-foreground mt-1">{description}</p>;
    };

    const renderServiceDescription = (description?: string): React.ReactNode => {
      if (!description) return null;
      return <p className="text-xs font-inter text-muted-foreground mt-1">{description}</p>;
    };

    const renderServiceDuration = (duration?: number): React.ReactNode => {
      if (!duration) return null;
      return (
        <p className="text-xs font-inter text-muted-foreground mt-1">
          Duration: {duration} minutes
        </p>
      );
    };

    return (
      <div className="space-y-3">
        <h3 className="text-sm font-poppins font-semibold text-charcoal flex items-center gap-2">
          <CreditCard className="h-4 w-4" />
          Service Categories
        </h3>
        <div className="space-y-2">
          {hasServiceCategories
            ? booking.serviceCategories!.map((category, index) => (
                <div
                  key={category.id || index}
                  className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex-1">
                    <p className="text-sm font-poppins font-medium text-charcoal">
                      {category.name}
                    </p>
                    {renderCategoryDescription(category.description)}
                  </div>
                </div>
              ))
            : (booking.services?.map((service, index) => (
                <div
                  key={service.id || index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="text-sm font-poppins font-medium text-charcoal">{service.name}</p>
                    {renderServiceDescription(service.description)}
                    {renderServiceDuration(service.duration)}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-poppins font-semibold text-primary">
                      €{service.additionalPrice || 0}
                    </p>
                  </div>
                </div>
              )) ?? null)}
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-poppins font-bold text-charcoal">
            Booking Details
          </DialogTitle>
          <DialogDescription className="font-inter text-muted-foreground">
            View complete information about your booking
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Status and Booking ID */}
          <div className="flex items-center justify-between">
            <Badge
              className={cn(
                'text-sm font-poppins font-medium px-3 py-1',
                getStatusColor(booking.status),
              )}
            >
              {getStatusText(booking.status)}
            </Badge>
            <div className="text-right">
              <p className="text-xs font-inter text-muted-foreground">Booking ID</p>
              <p className="text-sm font-mono font-medium text-charcoal">{booking.id}</p>
            </div>
          </div>
          {/* Healthcare Professional */}
          <div className="space-y-3">
            <h3 className="text-sm font-poppins font-semibold text-charcoal flex items-center gap-2">
              <User className="h-4 w-4" />
              Healthcare Professional
            </h3>
            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
              <Avatar className="h-14 w-14 border-2 border-primary/20">
                <AvatarFallback className="text-base font-poppins font-semibold bg-primary/10 text-primary">
                  {freelancer?.name?.charAt(0)?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h4 className="text-lg font-poppins font-semibold text-charcoal mb-1">
                  {freelancer?.name || 'Unknown'}
                </h4>
                {getFreelancerEmailElement()}
                {/* Ratings Display */}
                <div className="mt-2 space-y-2">
                  {/* Freelancer Overall Rating */}
                  {getFreelancerRatingElement()}
                  {/* Booking Specific Rating - Styled as a distinct badge */}
                  {getBookingRatingElement()}
                </div>
              </div>
            </div>
          </div>

          {/* Service Categories */}
          {getServiceCategoriesElement()}
          {/* Notes */}
          {notesString && (
            <div className="space-y-3">
              <h3 className="text-sm font-poppins font-semibold text-charcoal flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Notes
              </h3>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-inter text-muted-foreground">{notesString}</p>
              </div>
            </div>
          )}
          {/* Cancellation Reason */}
          {booking.cancelledReason && (
            <div className="space-y-3">
              <h3 className="text-sm font-poppins font-semibold text-red-600">
                Cancellation Reason
              </h3>
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <p className="text-sm font-inter text-red-700">{booking.cancelledReason}</p>
              </div>
            </div>
          )}
          {/* Booking Summary */}
          <div className="space-y-3 pt-2 border-t border-gray-200">
            <h3 className="text-sm font-poppins font-semibold text-charcoal">Booking Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="font-inter text-muted-foreground">Base Price</span>
                <span className="font-poppins font-medium text-charcoal">€{basePrice}</span>
              </div>
              {servicesTotal > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="font-inter text-muted-foreground">Services</span>
                  <span className="font-poppins font-medium text-charcoal">€{servicesTotal}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-base font-poppins font-semibold text-charcoal">Total</span>
                <span className="text-lg font-poppins font-bold text-primary">
                  €{totalAmount.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {(canMessage || canReschedule || canCancel || canReview) && (
          <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-4 border-t border-gray-200">
            {canReview && onReview && (
              <Button
                variant="outline"
                onClick={() => onReview(booking)}
                className="flex items-center gap-2"
              >
                <Star className="h-4 w-4" />
                Leave Review
              </Button>
            )}
            {canMessage && onMessage && (
              <Button
                variant="outline"
                onClick={() => onMessage(booking)}
                className="flex items-center gap-2"
              >
                <MessageCircle className="h-4 w-4" />
                Message
              </Button>
            )}
            {canReschedule && onReschedule && (
              <Button
                variant="outline"
                onClick={() => onReschedule(booking)}
                className="flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Reschedule
              </Button>
            )}
            {canCancel && onCancel && (
              <Button
                variant="destructive"
                onClick={() => onCancel(booking)}
                disabled={cancellingBookingId === booking.id}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                {cancellingBookingId === booking.id ? 'Cancelling...' : 'Cancel Booking'}
              </Button>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};
