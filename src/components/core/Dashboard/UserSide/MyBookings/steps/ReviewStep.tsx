'use client';

import { format } from 'date-fns';
import { CheckCircle, Clock, MapPin } from 'lucide-react';
import { useMemo } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import { useBookingStore } from '@/stores/bookingStore';
import { LocationType } from '@/types/enums';
import { Expert, Slot } from '@/types/types';

interface ReviewStepProps {
  freelancer: Expert;
  slot: Slot;
  onConfirm: () => void;
  isCreating: boolean;
}

export const ReviewStep: React.FC<ReviewStepProps> = ({
  freelancer,
  slot,
  onConfirm,
  isCreating,
}) => {
  const { selectedServiceIds, selectedLocationType, clientAddress } = useBookingStore();

  // Get selected services
  const selectedServices = useMemo(() => {
    const availableServices = slot.availableServiceCategories || slot.availableServices || [];
    return availableServices.filter((service) => selectedServiceIds.includes(service.id));
  }, [slot, selectedServiceIds]);

  // Calculate total price
  const totalPrice = useMemo(() => {
    let total = slot.basePrice;
    if (
      slot.location &&
      selectedLocationType === LocationType.CLINIC &&
      slot.location.additionalFee
    ) {
      total += slot.location.additionalFee;
    }
    // Add service prices if they have additional prices
    selectedServices.forEach((service) => {
      if ('additionalPrice' in service && service.additionalPrice) {
        total += Number(service.additionalPrice);
      }
    });
    return total;
  }, [slot, selectedLocationType, selectedServices]);

  const canConfirm =
    selectedLocationType !== null &&
    (selectedLocationType !== LocationType.HOME || clientAddress.trim() !== '');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-3xl font-poppins font-bold text-charcoal dark:text-white">
          Review Your Booking
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-lg font-inter">
          Please review your booking details before confirming
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-4">
          {/* Freelancer Info */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={freelancer.profilePicture || undefined} />
                  <AvatarFallback className="bg-primary text-white text-lg">
                    {freelancer.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-poppins font-semibold text-lg text-charcoal dark:text-white">
                    {freelancer.name}
                  </h3>
                  {freelancer.specialty && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {freelancer.specialty}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Date & Time */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Calendar className="w-5 h-5 text-primary" />
                <h4 className="font-semibold text-charcoal dark:text-white">Date & Time</h4>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <Calendar className="w-4 h-4" />
                  <span>{format(new Date(slot.startTime), 'EEEE, MMMM d, yyyy')}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <Clock className="w-4 h-4" />
                  <span>
                    {format(new Date(slot.startTime), 'h:mm a')} -{' '}
                    {format(new Date(slot.endTime), 'h:mm a')}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Services */}
          {selectedServices.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <h4 className="font-semibold text-charcoal dark:text-white mb-4">
                  Selected Services
                </h4>
                <div className="space-y-2">
                  {selectedServices.map((service) => (
                    <div key={service.id} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-gray-700 dark:text-gray-300">{service.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Location */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <MapPin className="w-5 h-5 text-primary" />
                <h4 className="font-semibold text-charcoal dark:text-white">Location</h4>
              </div>
              {selectedLocationType === LocationType.HOME ? (
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    At Home
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{clientAddress}</p>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    At Clinic
                  </p>
                  {slot.location && (
                    <>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {slot.location.name}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {slot.location.address}
                      </p>
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Price Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardContent className="p-6">
              <h4 className="font-semibold text-charcoal dark:text-white mb-4">Price Summary</h4>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Base Price</span>
                  <span className="font-medium">€{slot.basePrice.toFixed(2)}</span>
                </div>
                {slot.location &&
                  selectedLocationType === LocationType.CLINIC &&
                  slot.location.additionalFee > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Location Fee</span>
                      <span className="font-medium">€{slot.location.additionalFee.toFixed(2)}</span>
                    </div>
                  )}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
                  <div className="flex justify-between">
                    <span className="font-semibold text-lg text-charcoal dark:text-white">
                      Total
                    </span>
                    <span className="font-bold text-lg text-primary">€{totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <Button
                onClick={onConfirm}
                disabled={!canConfirm || isCreating}
                className="w-full mt-6 bg-primary hover:bg-primary/90 text-white py-6 text-lg font-semibold"
                size="lg"
              >
                {isCreating ? 'Confirming...' : 'Confirm Booking'}
              </Button>

              {!canConfirm && (
                <p className="text-sm text-red-500 mt-2 text-center">
                  {selectedLocationType === null
                    ? 'Please select a location'
                    : 'Please provide your address'}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
