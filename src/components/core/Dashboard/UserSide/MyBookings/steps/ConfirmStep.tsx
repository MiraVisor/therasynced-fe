'use client';

import { Avatar, AvatarImage } from '@radix-ui/react-avatar';
import { AlertCircle, Calendar, FileText, Star } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';

import { Card, CardContent } from '@/components/ui/card';
import { useBookingStore } from '@/stores/bookingStore';
import type { Slot } from '@/types/types';

interface ServiceFormData {
  serviceCategoryIds?: string[];
}

interface DetailsFormData {
  notes?: string;
  clientAddress?: string;
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

interface ConfirmStepProps {
  therapist: TherapistInfo | null;
  slotsByDate: Record<string, Slot[]>;
  serviceForm: UseFormReturn<ServiceFormData>;
  detailsForm: UseFormReturn<DetailsFormData>;
}

export const ConfirmStep: React.FC<ConfirmStepProps> = ({
  therapist,
  slotsByDate,
  serviceForm,
  detailsForm,
}) => {
  const { selectedDate, selectedTime } = useBookingStore();
  const selectedSlot = slotsByDate[selectedDate]?.find((s) => s.id === selectedTime);
  const basePrice = selectedSlot?.basePrice || 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <h2 className="text-2xl font-poppins font-bold text-charcoal">Confirm your booking</h2>
        <p className="text-gray-600 text-lg font-inter">
          Review your appointment details and complete your booking
        </p>
      </div>

      <div className="max-w-3xl mx-auto space-y-6">
        {/* Appointment Summary Card */}
        <Card className="border-2 border-primary bg-gradient-to-br from-white to-green-50/30"
          <CardContent className="p-8">
            {/* Therapist Info */}
            <div className="flex items-center gap-4 mb-6">
              <Avatar className="w-16 h-16 border-3 border-primary">
                <AvatarImage src={therapist?.avatar || undefined} />
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                  {therapist?.name?.charAt(0) || 'T'}
                </div>
              </Avatar>
              <div className="flex-1">
                <h3 className="text-xl font-poppins font-bold text-charcoal">{therapist?.name}</h3>
                <p className="text-gray-600 font-inter font-medium">
                  {therapist?.specialty}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < (therapist?.rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    {therapist?.rating?.toFixed(1)} ({therapist?.reviews} reviews)
                  </span>
                </div>
              </div>
            </div>

            {/* Appointment Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Date & Time */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  <h4 className="font-poppins font-semibold text-charcoal">Date & Time</h4>
                </div>
                <div className="pl-7">
                  <p className="font-medium text-gray-900"
                    {selectedDate &&
                      new Date(selectedDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                  </p>
                  <p className="text-primary font-semibold">
                    {selectedTime &&
                      slotsByDate[selectedDate]?.find((s) => s.id === selectedTime) &&
                      new Date(
                        slotsByDate[selectedDate].find((s) => s.id === selectedTime)!.startTime,
                      ).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true,
                      })}
                  </p>
                </div>
              </div>

              {/* Services */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  <h4 className="font-poppins font-semibold text-charcoal">Services</h4>
                </div>
                <div className="pl-7">
                  {(serviceForm?.watch('serviceCategoryIds')?.length ?? 0) > 0 ? (
                    <div className="space-y-1">
                      {serviceForm.watch('serviceCategoryIds')?.map((id: string) => {
                        const service = therapist?.services?.find((s) => s.id === id);
                        return (
                          <p key={id} className="text-gray-900 font-medium">
                            {service?.name || 'Unknown Service'}
                          </p>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-gray-600 therapy session</p>"
                  )}
                </div>
              </div>
            </div>

            {/* Additional Details */}
            {(detailsForm.watch('notes') || detailsForm.watch('clientAddress')) && (
              <div className="mt-6 pt-6 border-t border-gray-200"
                <h4 className="font-poppins font-semibold text-charcoal mb-3">
                  Additional Details
                </h4>
                <div className="space-y-3">
                  {detailsForm.watch('notes') && (
                    <div>
                      <span className="text-sm font-medium text-gray-600"
                        Notes:
                      </span>
                      <p className="text-gray-900 mt-1">
                        {detailsForm.watch('notes')}
                      </p>
                    </div>
                  )}
                  {detailsForm.watch('clientAddress') && (
                    <div>
                      <span className="text-sm font-medium text-gray-600"
                        Address:
                      </span>
                      <p className="text-gray-900 mt-1">
                        {detailsForm.watch('clientAddress')}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Price */}
            <div className="mt-6 pt-6 border-t border-gray-200"
              <div className="space-y-2">
                <div className="flex items-center justify-between pt-2">
                  <span className="text-lg font-poppins font-semibold text-charcoal">
                    Total Price:
                  </span>
                  <span className="text-2xl font-poppins font-bold text-primary">
                    EUR {basePrice.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Important Information */}
        <Card className="bg-blue-50 border border-blue-200"
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-900 mb-2">
                  Important Information
                </h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Your slot is reserved for 5 minutes. Complete your booking to confirm.</li>
                  <li>• You&apos;ll receive a confirmation email with session details.</li>
                  <li>• Cancellation is free up to 24 hours before your appointment.</li>
                  <li>• Please arrive 5 minutes early for your session.</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
