'use client';

import { Home } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useBookingStore } from '@/stores/bookingStore';
import type { Slot } from '@/types/slot';

interface ServiceFormData {
  serviceCategoryIds?: string[];
}

interface DetailsFormData {
  notes?: string;
  clientAddress?: string;
}

interface DetailsStepProps {
  therapistName?: string;
  slotsByDate: { [date: string]: Slot[] };
  serviceForm: UseFormReturn<ServiceFormData>;
  detailsForm: UseFormReturn<DetailsFormData>;
}

export const DetailsStep: React.FC<DetailsStepProps> = ({
  therapistName,
  slotsByDate,
  serviceForm,
  detailsForm,
}) => {
  const { selectedDate, selectedTime, availableServices } = useBookingStore();
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <h2 className="text-2xl font-poppins font-bold text-charcoal">
          Tell us about your session
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-lg font-inter">
          Help {therapistName} prepare for your appointment (optional)
        </p>
      </div>

      {/* Session Details Form */}
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Services Selection */}
        {availableServices && availableServices.length > 0 ? (
          <div className="space-y-4">
            <Label className="text-lg font-poppins font-semibold text-charcoal">
              Available Services for This Slot
            </Label>
            <p className="text-sm font-inter text-gray-600 dark:text-gray-400">
              Select from services available for your selected time slot
            </p>
            <div className="grid gap-3">
              {availableServices.map((service: ServiceCategory) => (
                <div key={service.id} className="relative">
                  <label className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      className="mt-1 w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                      checked={
                        serviceForm.watch('serviceCategoryIds')?.includes(service.id) || false
                      }
                      onChange={(e) => {
                        const currentServiceIds = serviceForm.watch('serviceCategoryIds') || [];
                        if (e.target.checked) {
                          serviceForm.setValue('serviceCategoryIds', [
                            ...currentServiceIds,
                            service.id,
                          ]);
                        } else {
                          serviceForm.setValue(
                            'serviceCategoryIds',
                            currentServiceIds.filter((id) => id !== service.id),
                          );
                        }
                      }}
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {service.name}
                      </div>
                      {service.description && (
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {service.description}
                        </div>
                      )}
                    </div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        ) : selectedTime ? (
          <div className="space-y-4">
            <Label className="text-lg font-poppins font-semibold text-charcoal">Services</Label>
            <div className="text-sm text-gray-600 dark:text-gray-400 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              No specific services are configured for this time slot. You can discuss your needs
              directly with the therapist during your session.
            </div>
          </div>
        ) : null}

        {/* Additional Notes */}
        <div className="space-y-4">
          <Label htmlFor="notes" className="text-lg font-poppins font-semibold text-charcoal">
            Additional Notes (Optional)
          </Label>
          <p className="text-sm font-inter text-gray-600 dark:text-gray-400">
            Share any specific concerns, goals, or preferences for your session
          </p>
          <Textarea
            id="notes"
            placeholder="e.g., I'd like to focus on anxiety management techniques..."
            className="min-h-[120px] resize-none"
            {...detailsForm.register('notes')}
          />
        </div>

        {/* Address for Home Sessions */}
        {selectedTime &&
          slotsByDate[selectedDate]?.find((s) => s.id === selectedTime)?.locationType ===
            'HOME' && (
            <div className="space-y-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-center gap-2">
                <Home className="w-5 h-5 text-blue-600" />
                <Label
                  htmlFor="clientAddress"
                  className="text-lg font-poppins font-semibold text-blue-900 dark:text-blue-100"
                >
                  Home Address
                </Label>
              </div>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Please provide your address for home visit sessions
              </p>
              <Input
                id="clientAddress"
                placeholder="Enter your full address"
                className="bg-white dark:bg-gray-800 border-blue-200 dark:border-blue-700"
                {...detailsForm.register('clientAddress')}
              />
            </div>
          )}
      </div>
    </div>
  );
};
