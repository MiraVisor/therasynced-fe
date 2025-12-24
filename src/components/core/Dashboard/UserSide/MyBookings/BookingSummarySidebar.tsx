'use client';

import { Avatar, AvatarImage } from '@radix-ui/react-avatar';
import { Calendar, FileText, Star } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import type { TherapistStampDetail } from '@/types/loyalty';
import type { Slot } from '@/types/slot';

interface ServiceFormData {
  serviceCategoryIds?: string[];
}

interface TherapistInfo {
  id?: string;
  name?: string;
  specialty?: string;
  rating?: number;
  reviews?: number;
  avatar?: string | null;
  services?: Array<{ id: string; name: string }>;
}

interface BookingSummarySidebarProps {
  currentStep: number;
  totalSteps: number;
  therapist: TherapistInfo | null;
  selectedDate: string;
  selectedTime: string;
  slotsByDate: { [date: string]: Slot[] };
  serviceForm: UseFormReturn<ServiceFormData>;
  stampDetail?: TherapistStampDetail | null;
  isCreatingBooking: boolean;
  onCompleteBooking: () => void;
}

export const BookingSummarySidebar: React.FC<BookingSummarySidebarProps> = ({
  currentStep,
  totalSteps,
  therapist,
  selectedDate,
  selectedTime,
  slotsByDate,
  serviceForm,
  stampDetail,
  isCreatingBooking,
  onCompleteBooking,
}) => {
  const selectedSlot = slotsByDate[selectedDate]?.find((s) => s.id === selectedTime);
  const basePrice = selectedSlot?.basePrice || 0;
  const hasDiscount =
    stampDetail?.rewardReady &&
    !stampDetail?.rewardReserved &&
    stampDetail?.therapist?.id === therapist?.id;
  const discountPercentage = hasDiscount ? stampDetail?.discountPercentage || 0 : 0;
  const discountAmount = hasDiscount ? (basePrice * discountPercentage) / 100 : 0;
  const finalPrice = basePrice - discountAmount;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
      {currentStep !== totalSteps && (
        <>
          {/* Therapist Info */}
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
            <Avatar className="w-16 h-16 border-2 border-gray-200">
              <AvatarImage src={therapist?.avatar || undefined} />
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                {therapist?.name?.charAt(0) || 'T'}
              </div>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-poppins font-bold text-lg text-charcoal">{therapist?.name}</h3>
              <p className="text-gray-600 dark:text-gray-400">{therapist?.specialty}</p>
              <div className="flex items-center gap-1 mt-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">{therapist?.rating?.toFixed(1)}</span>
                <span className="text-sm text-gray-500">({therapist?.reviews} reviews)</span>
              </div>
            </div>
          </div>

          {/* Booking Details */}
          <div className="space-y-4">
            <h4 className="font-poppins font-semibold text-charcoal">Your booking</h4>

            {/* Date & Time */}
            {selectedDate && selectedTime && (
              <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {new Date(selectedDate).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </div>
                    <div className="text-sm text-gray-500">
                      {slotsByDate[selectedDate]?.find((s) => s.id === selectedTime) &&
                        new Date(
                          slotsByDate[selectedDate].find((s) => s.id === selectedTime)!.startTime,
                        ).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true,
                        })}
                    </div>
                  </div>
                </div>
                {currentStep === 1 && (
                  <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/5">
                    Edit
                  </Button>
                )}
              </div>
            )}

            {/* Services */}
            {(serviceForm?.watch('serviceCategoryIds')?.length ?? 0) > 0 && (
              <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">Services</div>
                    <div className="text-sm text-gray-500">
                      {serviceForm
                        .watch('serviceCategoryIds')
                        ?.map((id: string) => {
                          const service = therapist?.services?.find((s) => s.id === id);
                          return service?.name;
                        })
                        .join(', ')}
                    </div>
                  </div>
                </div>
                {currentStep === 2 && (
                  <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/5">
                    Edit
                  </Button>
                )}
              </div>
            )}

            {/* Price Breakdown */}
            {selectedTime && (
              <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="space-y-2">
                  {hasDiscount && (
                    <>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400 font-inter">
                          Base Price:
                        </span>
                        <span className="font-poppins font-semibold text-primary">
                          EUR {basePrice.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-green-600 dark:text-green-400 font-medium">
                          Stamp Discount ({discountPercentage}%):
                        </span>
                        <span className="text-green-600 dark:text-green-400 font-medium">
                          -EUR {discountAmount.toFixed(2)}
                        </span>
                      </div>
                      <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-poppins font-semibold text-charcoal">
                            Total
                          </span>
                          <div className="flex flex-col items-end">
                            <span className="text-2xl font-poppins font-bold text-green-600 dark:text-green-400">
                              EUR {finalPrice.toFixed(2)}
                            </span>
                            <span className="text-xs font-inter text-gray-500 line-through">
                              EUR {basePrice.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                        <p className="text-xs text-green-700 dark:text-green-300 font-medium">
                          ✓ {discountPercentage}% stamp discount applied
                        </p>
                      </div>
                    </>
                  )}
                  {!hasDiscount && (
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-poppins font-semibold text-charcoal">
                        Total
                      </span>
                      <span className="text-2xl font-poppins font-bold text-primary">
                        EUR {basePrice.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Complete Booking Button */}
      {currentStep === totalSteps && (
        <Button
          onClick={onCompleteBooking}
          disabled={isCreatingBooking}
          className="w-full mt-6 bg-primary hover:bg-primary/90 disabled:opacity-50 py-3 text-base font-semibold rounded-lg text-white"
        >
          {isCreatingBooking ? <>Confirming...</> : 'Confirm and book'}
        </Button>
      )}

      {/* Policy Info */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="text-xs text-gray-500 space-y-2">
          <p>• Free cancellation up to 24 hours before</p>
          <p>• You&apos;ll receive confirmation details via email</p>
          <p>• This therapist typically responds within an hour</p>
        </div>
      </div>
    </div>
  );
};
