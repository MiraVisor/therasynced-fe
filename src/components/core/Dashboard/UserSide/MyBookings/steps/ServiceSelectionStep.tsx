'use client';

import { Check } from 'lucide-react';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useBookingStore } from '@/stores/bookingStore';
import { ServiceCategory } from '@/types/common';
import { Slot } from '@/types/types';

interface ServiceSelectionStepProps {
  slot: Slot;
}

export const ServiceSelectionStep: React.FC<ServiceSelectionStepProps> = ({ slot }) => {
  const { selectedServiceIds, setSelectedServiceIds } = useBookingStore();

  // Get available service categories from slot
  const availableServices: ServiceCategory[] =
    ((slot.availableServiceCategories || slot.availableServices) as ServiceCategory[]) || [];

  const handleServiceToggle = (serviceId: string) => {
    const current = selectedServiceIds;
    if (current.includes(serviceId)) {
      setSelectedServiceIds(current.filter((id) => id !== serviceId));
    } else {
      setSelectedServiceIds([...current, serviceId]);
    }
  };

  if (availableServices.length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <h3 className="text-lg font-poppins font-semibold text-charcoal dark:text-white mb-2">
            No specific services required
          </h3>
          <p className="font-inter text-muted-foreground">
            You can discuss your needs directly with the freelancer during your session.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-poppins font-bold text-charcoal dark:text-white">
          Select Services
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-lg font-inter">
          Choose the services you need for this appointment (optional)
        </p>
      </div>

      {/* Services List */}
      <div className="space-y-3">
        {availableServices.map((service) => (
          <div
            key={service.id}
            className="flex items-start gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
          >
            <Checkbox
              id={service.id}
              checked={selectedServiceIds.includes(service.id)}
              onCheckedChange={() => handleServiceToggle(service.id)}
              className="mt-1"
            />
            <div className="flex-1">
              <Label
                htmlFor={service.id}
                className="font-medium text-gray-900 dark:text-white cursor-pointer"
              >
                {service.name}
              </Label>
              {service.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {service.description}
                </p>
              )}
              {service.jobTitle && (
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  {service.jobTitle.name}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {selectedServiceIds.length > 0 && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-900 dark:text-green-100">
              {selectedServiceIds.length} {selectedServiceIds.length === 1 ? 'service' : 'services'}{' '}
              selected
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
