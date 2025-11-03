'use client';

import { format } from 'date-fns';
import {
  Calendar,
  Clock,
  CreditCard,
  FileText,
  MapPin,
  MessageCircle,
  RotateCcw,
  Star,
  User,
  X,
} from 'lucide-react';

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
  if (!booking) return null;

  const freelancer = booking.slot?.freelancer;
  const slot = booking.slot;
  const location = slot?.location;
  const bookingDate = new Date(slot.startTime);
  const now = new Date();
  const isUpcoming = booking.status === 'CONFIRMED' && bookingDate > now;
  const isPast = bookingDate < now;
  // Consider completed if past appointment time (status is CONFIRMED but appointment has passed)
  // Note: Backend may update status to COMPLETED, but we also check past confirmed bookings
  const isCompleted = booking.status === 'COMPLETED' || (booking.status === 'CONFIRMED' && isPast);
  const isCancelled = booking.status === 'CANCELLED';
  const canCancel = booking.status === 'CONFIRMED' && isUpcoming;
  const canReschedule = booking.status === 'CONFIRMED' && isUpcoming;
  const canMessage = booking.status === 'CONFIRMED' && !isCancelled;
  const canReview = isCompleted && !isCancelled;

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

  const getLocationText = () => {
    if (slot.locationType === 'ONLINE') return 'Online';
    if (slot.locationType === 'CLINIC') return 'Clinic';
    if (slot.locationType === 'HOME') return 'Home Visit';
    return 'Office';
  };

  const getLocationDetails = () => {
    if (slot.locationType === 'ONLINE') {
      return { type: 'Online', address: 'Video call session' };
    }
    if (slot.locationType === 'CLINIC' && (freelancer as any)?.clinicAddress) {
      return { type: 'Clinic', address: (freelancer as any).clinicAddress };
    }
    if (slot.locationType === 'HOME') {
      return { type: 'Home Visit', address: (booking as any)?.clientAddress || 'Address provided' };
    }
    if (location) {
      return { type: location.name, address: location.address };
    }
    return { type: 'Office', address: 'Address to be confirmed' };
  };

  const locationDetails = getLocationDetails();

  // Calculate total services price
  const servicesTotal =
    booking.services?.reduce((sum, service) => sum + (service.additionalPrice || 0), 0) || 0;
  const basePrice = slot?.basePrice || 0;
  const totalAmount = booking.totalAmount || basePrice + servicesTotal;

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
                {freelancer?.email && (
                  <p className="text-sm font-inter text-muted-foreground">{freelancer.email}</p>
                )}
              </div>
            </div>
          </div>

          {/* Appointment Details */}
          <div className="space-y-3">
            <h3 className="text-sm font-poppins font-semibold text-charcoal flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Appointment Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <Calendar className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-inter text-muted-foreground mb-1">Date</p>
                  <p className="text-sm font-poppins font-medium text-charcoal">
                    {format(bookingDate, 'EEEE, MMMM d, yyyy')}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <Clock className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-inter text-muted-foreground mb-1">Time</p>
                  <p className="text-sm font-poppins font-medium text-charcoal">
                    {format(bookingDate, 'h:mm a')} - {format(new Date(slot.endTime), 'h:mm a')}
                  </p>
                  <p className="text-xs font-inter text-muted-foreground mt-1">
                    Duration: {slot.duration} minutes
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg md:col-span-2">
                <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs font-inter text-muted-foreground mb-1">Location</p>
                  <p className="text-sm font-poppins font-medium text-charcoal mb-1">
                    {locationDetails.type}
                  </p>
                  <p className="text-xs font-inter text-muted-foreground">
                    {locationDetails.address}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Services */}
          {booking.services && booking.services.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-poppins font-semibold text-charcoal flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Services
              </h3>
              <div className="space-y-2">
                {booking.services.map((service, index) => (
                  <div
                    key={service.id || index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-poppins font-medium text-charcoal">
                        {service.name}
                      </p>
                      {service.description && (
                        <p className="text-xs font-inter text-muted-foreground mt-1">
                          {service.description}
                        </p>
                      )}
                      {service.duration && (
                        <p className="text-xs font-inter text-muted-foreground mt-1">
                          Duration: {service.duration} minutes
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-poppins font-semibold text-primary">
                        €{service.additionalPrice || 0}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {(booking as any).notes && (
            <div className="space-y-3">
              <h3 className="text-sm font-poppins font-semibold text-charcoal flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Notes
              </h3>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-inter text-muted-foreground">{(booking as any).notes}</p>
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
                <span className="text-xl font-poppins font-bold text-primary">€{totalAmount}</span>
              </div>
            </div>
            <div className="pt-2">
              <p className="text-xs font-inter text-muted-foreground">
                Created on {format(new Date(booking.createdAt), 'MMM d, yyyy')}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {(canMessage || canReschedule || canCancel || canReview) && (
          <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-4 border-t border-gray-200">
            {canReview && onReview && (
              <Button
                variant="outline"
                className="flex-1 border-yellow-300 text-yellow-700 hover:bg-yellow-50"
                onClick={() => {
                  onReview(booking);
                  onOpenChange(false);
                }}
              >
                <Star className="h-4 w-4 mr-2" />
                Rate & Review
              </Button>
            )}
            {canMessage && onMessage && (
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  onMessage(booking);
                  onOpenChange(false);
                }}
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Message
              </Button>
            )}
            {canReschedule && onReschedule && (
              <Button
                variant="outline"
                className="flex-1 border-blue-300 text-blue-700 hover:bg-blue-50"
                onClick={() => {
                  onReschedule(booking);
                  onOpenChange(false);
                }}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reschedule
              </Button>
            )}
            {canCancel && onCancel && (
              <Button
                variant="outline"
                className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300"
                onClick={() => {
                  onCancel(booking);
                  onOpenChange(false);
                }}
                disabled={cancellingBookingId === booking.id}
              >
                {cancellingBookingId === booking.id ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-2" />
                    Cancelling...
                  </>
                ) : (
                  <>
                    <X className="h-4 w-4 mr-2" />
                    Cancel Booking
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};
