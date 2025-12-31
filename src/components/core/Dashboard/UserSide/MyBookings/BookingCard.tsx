import { format } from 'date-fns';
import { Calendar, MapPin, MessageCircle, RotateCcw, Star, X } from 'lucide-react';

import { RatingDisplay } from '@/components/core/Dashboard/UserSide/Ratings/RatingDisplay';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { cn } from '@/lib/utils';
import { hasRating } from '@/types/rating';
import { Booking } from '@/types/types';

interface BookingCardProps {
  booking: Booking;
  onMessage?: (booking: Booking) => void;
  onReschedule?: (booking: Booking) => void;
  onCancel?: (booking: Booking) => void;
  onRate?: (booking: Booking) => void;
  cancellingBookingId?: string | null;
  onClick?: () => void;
}

export const BookingCard: React.FC<BookingCardProps> = ({
  booking,
  onMessage,
  onReschedule,
  onCancel,
  onRate,
  cancellingBookingId,
  onClick,
}) => {
  const bookingDate = new Date(booking.slot.startTime);
  const { freelancer } = booking.slot;

  const getStatusColor = (status: string) => {
    const isUpcoming = status === 'CONFIRMED' && new Date(booking.slot.startTime) > new Date();
    if (isUpcoming) return 'bg-info/10 text-info border border-info/20';
    if (status === 'CANCELLED') return 'bg-error/10 text-error border border-error/20';
    return 'bg-success/10 text-success border border-success/20';
  };

  const getStatusText = (status: string) => {
    if (status === 'CONFIRMED') {
      return new Date(booking.slot.startTime) > new Date() ? 'Upcoming' : 'Confirmed';
    }
    if (status === 'RESCHEDULED') return 'Rescheduled';
    if (status === 'CANCELLED') return 'Cancelled';
    return status.charAt(0) + status.slice(1).toLowerCase();
  };

  const getLocationText = () => {
    if (booking.slot.locationType === 'ONLINE') return 'Online';
    if (booking.slot.locationType === 'CLINIC') return 'Clinic';
    if (booking.slot.locationType === 'HOME') return 'Home Visit';
    return 'Office';
  };

  const isUpcoming =
    booking.status === 'CONFIRMED' && new Date(booking.slot.startTime) > new Date();

  // Show message button for all bookings
  // User side: Show for CONFIRMED, COMPLETED, CANCELLED
  const canMessage = onMessage;
  const canReschedule = isUpcoming && onReschedule;
  const canCancel = isUpcoming && onCancel;
  const canRate = booking.canBeRated === true && booking.hasRating === false && onRate;
  const hasExistingRating = booking.hasRating === true && hasRating(booking.rating);

  return (
    <EnhancedCard variant="default" interactive onClick={onClick}>
      <div className="p-5">
        {/* Header with status badge and price */}
        <div className="flex items-center justify-between mb-4">
          <Badge
            className={cn(
              'text-xs font-poppins font-medium px-2.5 py-1',
              getStatusColor(booking.status),
            )}
          >
            {getStatusText(booking.status)}
          </Badge>
          <div className="text-right">
            <div className="flex items-center gap-1">
              <span className="text-xl font-poppins font-bold text-primary">
                EUR {booking.totalAmount.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Date and Time */}
        <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span className="font-inter">{format(bookingDate, 'EEEE, MMMM d, yyyy')}</span>
        </div>

        {/* Main content */}
        <div className="flex items-start gap-3 mb-4">
          {/* Time badge */}
          <div className="flex flex-col items-center justify-center bg-primary/5 rounded-lg p-3 min-w-[60px] border border-primary/10">
            <div className="text-xl font-poppins font-bold text-primary">
              {format(bookingDate, 'h:mm')}
            </div>
            <div className="text-[10px] font-inter text-muted-foreground mt-0.5">
              {booking.slot.duration}min
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-3">
              <Avatar className="h-12 w-12 border-2 border-primary/20 flex-shrink-0 shadow-sm">
                <AvatarFallback className="text-base font-poppins font-semibold bg-primary/10 text-primary">
                  {freelancer.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="font-poppins font-semibold text-base text-charcoal mb-1">
                  {freelancer.name}
                </div>
                <div className="flex items-center gap-2 text-xs font-inter text-muted-foreground mb-2">
                  <MapPin className="h-3.5 w-3.5" />
                  <span className="truncate">{getLocationText()}</span>
                </div>
                {/* Ratings Display */}
                <div className="mb-2 space-y-2">
                  {/* Freelancer Overall Rating */}
                  {(freelancer?.averageRating || freelancer?.cardInfo?.averageRating) && (
                    <RatingDisplay
                      rating={freelancer?.cardInfo?.averageRating ?? freelancer?.averageRating ?? 0}
                      size="sm"
                      showCount={true}
                      reviewCount={freelancer?.cardInfo?.totalRatings ?? 0}
                    />
                  )}
                  {/* Booking Specific Rating */}
                  {hasExistingRating && booking.rating && (
                    <div className="flex items-center gap-2 px-2 py-1 bg-primary/5 border border-primary/20 rounded-md">
                      <span className="text-xs font-poppins font-medium text-primary">
                        Your rating:
                      </span>
                      <RatingDisplay rating={booking.rating.rating} size="sm" showCount={false} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {(canMessage || canReschedule || canCancel || canRate) && (
          <div className="flex flex-col sm:flex-row gap-2 pt-3 border-t border-gray-200">
            {canRate && (
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-xs font-medium border-yellow-300 text-yellow-700 hover:bg-yellow-50"
                onClick={(e) => {
                  e.stopPropagation();
                  onRate(booking);
                }}
              >
                <Star className="h-3 w-3 mr-1" />
                Rate Booking
              </Button>
            )}
            {canMessage && (
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-xs font-medium"
                onClick={(e) => {
                  e.stopPropagation();
                  onMessage(booking);
                }}
              >
                <MessageCircle className="h-3 w-3 mr-1" />
                Message Freelancer
              </Button>
            )}
            {canReschedule && (
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-xs font-medium border-blue-300 text-blue-700 hover:bg-blue-50"
                onClick={(e) => {
                  e.stopPropagation();
                  onReschedule(booking);
                }}
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Reschedule
              </Button>
            )}
            {canCancel && (
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300"
                onClick={(e) => {
                  e.stopPropagation();
                  onCancel(booking);
                }}
                disabled={cancellingBookingId === booking.id}
              >
                {cancellingBookingId === booking.id ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600 mr-1" />
                    Cancelling...
                  </>
                ) : (
                  <>
                    <X className="h-3 w-3 mr-1" />
                    Cancel
                  </>
                )}
              </Button>
            )}
          </div>
        )}
      </div>
    </EnhancedCard>
  );
};
