'use client';

import { format } from 'date-fns';
import { ArrowRight, Calendar, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useBookingStore } from '@/stores/bookingStore';
import { Booking } from '@/types/types';

interface BookingCompleteStepProps {
  booking: Booking;
}

export const BookingCompleteStep: React.FC<BookingCompleteStepProps> = ({ booking }) => {
  const router = useRouter();
  const { resetBooking } = useBookingStore();

  const handleViewBooking = () => {
    router.push(`/dashboard/my-bookings/${booking.id}`);
  };

  const handleBookAnother = () => {
    resetBooking();
    router.push('/dashboard/book');
  };

  return (
    <div className="space-y-6">
      {/* Success Message */}
      <div className="text-center space-y-4 py-8">
        <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>
        <div>
          <h2 className="text-3xl font-poppins font-bold text-charcoal mb-2">Booking Confirmed!</h2>
          <p className="text-gray-600 text-lg font-inter">
            Your appointment has been successfully booked
          </p>
        </div>
      </div>

      {/* Booking Details Card */}
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
              <Calendar className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-lg text-charcoal">Booking Details</h3>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Freelancer</p>
                <p className="font-medium text-charcoal">{booking.slot.freelancer.name}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Date & Time</p>
                <p className="font-medium text-charcoal">
                  {format(new Date(booking.slot.startTime), 'EEEE, MMMM d, yyyy')} at{' '}
                  {format(new Date(booking.slot.startTime), 'h:mm a')}
                </p>
              </div>

              {booking.serviceCategories && booking.serviceCategories.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600">Services</p>
                  <div className="mt-1">
                    {booking.serviceCategories.map((service, index) => (
                      <span key={service.id} className="font-medium text-charcoal">
                        {service.name}
                        {index < booking.serviceCategories!.length - 1 && ', '}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="font-bold text-lg text-primary">€{booking.totalAmount.toFixed(2)}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Booking ID</p>
                <p className="font-mono text-sm text-gray-700">{booking.id}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-2xl mx-auto">
        <Button
          onClick={handleViewBooking}
          className="flex-1 bg-primary hover:bg-primary/90 text-white py-6 text-lg font-semibold"
          size="lg"
        >
          View Booking Details
          <ArrowRight className="ml-2 w-5 h-5" />
        </Button>
        <Button
          onClick={handleBookAnother}
          variant="outline"
          className="flex-1 py-6 text-lg font-semibold"
          size="lg"
        >
          Book Another Appointment
        </Button>
      </div>

      {/* Info Message */}
      <div className="max-w-2xl mx-auto bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>What happens next?</strong> You'll receive a confirmation email shortly. You can
          view and manage your booking from the My Bookings page.
        </p>
      </div>
    </div>
  );
};
