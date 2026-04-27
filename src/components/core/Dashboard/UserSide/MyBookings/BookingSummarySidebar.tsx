'use client';

import { Avatar, AvatarImage } from '@radix-ui/react-avatar';
import { Calendar, FileText, Star } from 'lucide-react';
import { useMemo } from 'react';
import { UseFormReturn } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import type { FreelancerPricing, LocationType } from '@/types/pricing';
import type { Slot } from '@/types/types';

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
  slotsByDate: Record<string, Slot[]>;
  serviceForm: UseFormReturn<ServiceFormData>;
  isCreatingBooking: boolean;
  onCompleteBooking: () => void;
  pricing?: FreelancerPricing | null;
  selectedLocationType?: LocationType | null;
}

export const BookingSummarySidebar: React.FC<BookingSummarySidebarProps> = ({
  currentStep,
  totalSteps,
  therapist,
  selectedDate,
  selectedTime,
  slotsByDate,
  serviceForm,
  isCreatingBooking,
  onCompleteBooking,
  pricing,
  selectedLocationType,
}) => {
  const selectedSlot = slotsByDate[selectedDate]?.find((s) => s.id === selectedTime);
  const selectedCategoryIds = serviceForm.watch('serviceCategoryIds') || [];

  // Calculate base price (original price before discounts) based on location and service categories
  const basePrice = useMemo(() => {
    if (!selectedSlot) return 0;

    // If no service categories selected, use slot's basePrice
    if (selectedCategoryIds.length === 0) {
      return selectedSlot.basePrice || 0;
    }

    // If location type not selected yet, use slot's basePrice as fallback
    if (!selectedLocationType) {
      return selectedSlot.basePrice || 0;
    }

    // First, try to get pricing from slot's availableServiceCategories (use original price, not discounted)
    if (
      selectedSlot.availableServiceCategories &&
      selectedSlot.availableServiceCategories.length > 0
    ) {
      let totalPrice = 0;
      let hasCategoryPricing = false;

      selectedCategoryIds.forEach((categoryId) => {
        const category = selectedSlot.availableServiceCategories?.find(
          (cat) => cat.id === categoryId,
        );
        if (!category?.pricing) return;

        const locationPricing = category.pricing[selectedLocationType];
        if (locationPricing) {
          hasCategoryPricing = true;
          // Always use original price for basePrice calculation (discounts handled separately)
          totalPrice += locationPricing.price;
        }
      });

      if (hasCategoryPricing && totalPrice > 0) {
        return totalPrice;
      }
    }

    // Fallback to pricing from props (legacy pricing structure)
    if (pricing?.servicePricing) {
      let totalPrice = 0;
      selectedCategoryIds.forEach((categoryId) => {
        const servicePricing = pricing.servicePricing.find((sp) => sp.serviceId === categoryId);
        if (!servicePricing) return;

        // Use location-based pricing if available
        if (servicePricing.locations && servicePricing.locations.length > 0) {
          const locationPricing = servicePricing.locations.find(
            (loc) => loc.locationType === selectedLocationType,
          );
          if (locationPricing) {
            totalPrice += locationPricing.price;
            return;
          }
        }

        // Fallback to legacy price (assume CLINIC)
        if (servicePricing.price > 0) {
          totalPrice += servicePricing.price;
        }
      });

      if (totalPrice > 0) {
        return totalPrice;
      }
    }

    // Final fallback to slot's basePrice
    return selectedSlot.basePrice || 0;
  }, [selectedSlot, selectedCategoryIds, selectedLocationType, pricing]);

  // Check for service category-level discounts (when service categories are selected)
  const serviceCategoryDiscounts = useMemo(() => {
    if (
      !selectedSlot?.availableServiceCategories ||
      selectedCategoryIds.length === 0 ||
      !selectedLocationType
    ) {
      return null;
    }

    let totalOriginalPrice = 0;
    let totalDiscountedPrice = 0;
    let totalDiscountAmount = 0;
    let hasAnyDiscount = false;
    let discountPercentage = 0;

    selectedCategoryIds.forEach((categoryId) => {
      const category = selectedSlot.availableServiceCategories?.find(
        (cat) => cat.id === categoryId,
      );
      if (!category?.pricing) return;

      const locationPricing = category.pricing[selectedLocationType];
      if (locationPricing) {
        totalOriginalPrice += locationPricing.price;
        if (locationPricing.discount?.applicable) {
          hasAnyDiscount = true;
          totalDiscountedPrice += locationPricing.discount.finalAmount;
          totalDiscountAmount += locationPricing.discount.discountAmount;
        } else {
          totalDiscountedPrice += locationPricing.price;
        }
      }
    });

    if (hasAnyDiscount && totalOriginalPrice > 0) {
      discountPercentage = (totalDiscountAmount / totalOriginalPrice) * 100;
    }

    return hasAnyDiscount
      ? {
          applicable: true,
          discountPercentage,
          discountAmount: totalDiscountAmount,
          finalAmount: totalDiscountedPrice,
          originalAmount: totalOriginalPrice,
        }
      : null;
  }, [selectedSlot, selectedCategoryIds, selectedLocationType]);

  // Prefer discount from slot data (backend-calculated), fallback to manual calculation
  // Use service category discounts if available (when categories are selected)
  const slotDiscount = selectedSlot?.discount;
  const hasSlotDiscount = slotDiscount?.applicable === true && selectedCategoryIds.length === 0;
  const hasServiceCategoryDiscount = serviceCategoryDiscounts?.applicable === true;

  const hasDiscount = hasSlotDiscount || hasServiceCategoryDiscount;

  // Use service category discount if available, then slot discount
  const discountPercentage = hasServiceCategoryDiscount
    ? serviceCategoryDiscounts.discountPercentage
    : hasSlotDiscount
      ? slotDiscount.discountPercentage
      : 0;

  const discountAmount = hasServiceCategoryDiscount
    ? serviceCategoryDiscounts.discountAmount
    : hasSlotDiscount
      ? slotDiscount.discountAmount
      : 0;

  const finalPrice = hasServiceCategoryDiscount
    ? serviceCategoryDiscounts.finalAmount
    : hasSlotDiscount
      ? slotDiscount.finalAmount
      : basePrice - discountAmount;

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Therapist Info */}
        <div className="flex items-center gap-4">
          <Avatar className="w-14 h-14 border-2 border-gray-200 flex-shrink-0">
            <AvatarImage src={therapist?.avatar || undefined} />
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
              {therapist?.name?.charAt(0) || 'T'}
            </div>
          </Avatar>
          <div className="min-w-0">
            <h3 className="font-poppins font-bold text-base text-charcoal truncate">
              {therapist?.name}
            </h3>
            <p className="text-sm text-gray-600 truncate">
              {therapist?.specialty}
            </p>
            <div className="flex items-center gap-1 mt-0.5">
              <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-medium">{therapist?.rating?.toFixed(1)}</span>
              <span className="text-xs text-gray-500">({therapist?.reviews})</span>
            </div>
          </div>
        </div>

        {/* Booking Details */}
        {currentStep !== totalSteps && (
          <div className="space-y-3">
            <h4 className="font-poppins font-semibold text-charcoal text-sm">Booking Details</h4>

            {/* Date & Time */}
            {selectedDate && selectedTime && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <div className="min-w-0">
                  <div className="font-medium text-gray-900">
                    {new Date(selectedDate).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </div>
                  <div className="text-xs text-gray-500">
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
            )}

            {/* Services */}
            {(serviceForm?.watch('serviceCategoryIds')?.length ?? 0) > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <div className="min-w-0">
                  <div className="font-medium text-gray-900">Services</div>
                  <div className="text-xs text-gray-500 truncate">
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
            )}
          </div>
        )}

        {/* Price Breakdown */}
        {selectedTime && (
          <div className="space-y-2">
            <h4 className="font-poppins font-semibold text-charcoal text-sm">Price</h4>
            {hasDiscount ? (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">Base:</span>
                  <span className="font-medium text-primary">EUR {basePrice.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-green-600">Discount:</span>
                  <span className="font-medium text-green-600">
                    -EUR {discountAmount.toFixed(2)}
                  </span>
                </div>
                <div className="pt-1 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-charcoal">Total</span>
                    <div className="flex flex-col items-end">
                      <span className="text-xl font-bold text-green-600">
                        EUR {finalPrice.toFixed(2)}
                      </span>
                      <span className="text-xs text-gray-500 line-through">
                        EUR {basePrice.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="p-1.5 bg-green-50 rounded border border-green-200">
                  <p className="text-xs text-green-700 font-medium">
                    ✓ {discountPercentage}% discount applied
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-charcoal">Total</span>
                <span className="text-xl font-bold text-primary">EUR {basePrice.toFixed(2)}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Complete Booking Button */}
      {currentStep === totalSteps && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <Button
            onClick={onCompleteBooking}
            disabled={isCreatingBooking}
            className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 py-3 text-base font-semibold rounded-lg text-white"
          >
            {isCreatingBooking ? <>Confirming...</> : 'Confirm and book'}
          </Button>
        </div>
      )}
    </div>
  );
};
