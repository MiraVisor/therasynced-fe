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

  // Calculate base price and service prices
  // When service categories are selected: total = basePrice + sum of service prices
  // When no service categories: total = basePrice
  const { basePrice, servicePriceTotal, subtotal } = useMemo(() => {
    const slotBasePrice = slot.basePrice || 0;

    // If no service categories selected, use slot's basePrice only
    if (selectedServices.length === 0 || !selectedLocationType) {
      return {
        basePrice: slotBasePrice,
        servicePriceTotal: 0,
        subtotal: slotBasePrice,
      };
    }

    // Calculate service category prices
    let totalServicePrice = 0;
    let hasCategoryPricing = false;
    let hasNullPricing = false;

    if (slot.availableServiceCategories && slot.availableServiceCategories.length > 0) {
      selectedServices.forEach((service) => {
        const category = slot.availableServiceCategories?.find((cat) => cat.id === service.id);
        if (!category?.pricing) {
          hasNullPricing = true;
          return;
        }

        const locationPricing = category.pricing[selectedLocationType];
        if (
          locationPricing &&
          locationPricing.price !== null &&
          locationPricing.price !== undefined
        ) {
          hasCategoryPricing = true;
          totalServicePrice += locationPricing.price;
        } else {
          hasNullPricing = true;
        }
      });
    }

    // If any service has null pricing, fall back to slot's basePrice only
    if (hasNullPricing) {
      return {
        basePrice: slotBasePrice,
        servicePriceTotal: 0,
        subtotal: slotBasePrice,
      };
    }

    // If services have pricing, total = basePrice + service prices
    if (hasCategoryPricing) {
      return {
        basePrice: slotBasePrice,
        servicePriceTotal: totalServicePrice,
        subtotal: slotBasePrice + totalServicePrice,
      };
    }

    // Fallback
    return {
      basePrice: slotBasePrice,
      servicePriceTotal: 0,
      subtotal: slotBasePrice,
    };
  }, [slot, selectedServices, selectedLocationType]);

  // Check for service category-level discounts
  // Discount applies to subtotal (basePrice + sum of all selected service prices)
  const serviceCategoryDiscounts = useMemo(() => {
    if (
      !slot.availableServiceCategories ||
      selectedServices.length === 0 ||
      !selectedLocationType
    ) {
      return null;
    }

    // Check if all selected services have valid pricing
    let hasNullPricing = false;
    let hasAnyDiscount = false;
    let discountPercentage = 0;

    for (const service of selectedServices) {
      const category = slot.availableServiceCategories?.find((cat) => cat.id === service.id);
      if (!category?.pricing) {
        hasNullPricing = true;
        continue;
      }

      const locationPricing = category.pricing[selectedLocationType];
      if (
        !locationPricing ||
        locationPricing.price === null ||
        locationPricing.price === undefined
      ) {
        hasNullPricing = true;
        continue;
      }

      // Check if this service has a discount
      if (locationPricing.discount?.applicable) {
        hasAnyDiscount = true;
        // Use the discount percentage (should be the same for all services with discounts)
        discountPercentage = locationPricing.discount.discountPercentage;
      }
    }

    // If any service has null pricing, don't use service category discounts
    if (hasNullPricing) {
      return null;
    }

    // If we have discounts, calculate based on the total subtotal (basePrice + sum of all service prices)
    if (hasAnyDiscount && subtotal > 0) {
      const discountAmount = (subtotal * discountPercentage) / 100;
      const finalAmount = subtotal - discountAmount;

      return {
        applicable: true,
        subtotal: subtotal,
        discountPercentage: discountPercentage,
        discountAmount: discountAmount,
        finalAmount: finalAmount,
      };
    }

    return null;
  }, [slot, selectedServices, selectedLocationType, subtotal]);

  // Check if selected services have valid pricing
  const hasValidServicePricing = useMemo(() => {
    if (selectedServices.length === 0 || !selectedLocationType) return false;

    if (!slot.availableServiceCategories) return false;

    // Check if all selected services have valid pricing
    for (const service of selectedServices) {
      const category = slot.availableServiceCategories.find((cat) => cat.id === service.id);
      if (!category?.pricing) return false;

      const locationPricing = category.pricing[selectedLocationType];
      if (
        !locationPricing ||
        locationPricing.price === null ||
        locationPricing.price === undefined
      ) {
        return false;
      }
    }

    return true;
  }, [slot, selectedServices, selectedLocationType]);

  // Get slot-level discount
  const slotDiscount = slot.discount;
  // Use slot discount if: no services selected OR services selected but no valid pricing
  const hasSlotDiscount = slotDiscount?.applicable === true && !hasValidServicePricing;
  const hasServiceCategoryDiscount = serviceCategoryDiscounts?.applicable === true;

  // Calculate discount amounts
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

  // Calculate final price
  // For service category discounts, use finalAmount directly (already includes basePrice + service price - discount)
  // For slot discounts, use finalAmount directly (already includes basePrice - discount)
  const finalPrice = hasServiceCategoryDiscount
    ? serviceCategoryDiscounts.finalAmount
    : hasSlotDiscount
      ? slotDiscount.finalAmount
      : subtotal - discountAmount;

  // Add location fee if applicable
  const totalPrice = useMemo(() => {
    let total = finalPrice;
    if (
      slot.location &&
      selectedLocationType === LocationType.CLINIC &&
      slot.location.additionalFee
    ) {
      total += slot.location.additionalFee;
    }
    return total;
  }, [finalPrice, slot.location, selectedLocationType]);

  const hasDiscount = hasSlotDiscount || hasServiceCategoryDiscount;

  const canConfirm =
    selectedLocationType !== null &&
    (selectedLocationType !== LocationType.HOME || clientAddress.trim() !== '');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-3xl font-poppins font-bold text-charcoal">
          Review Your Booking
        </h2>
        <p className="text-gray-600 text-lg font-inter">
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
                  <h3 className="font-poppins font-semibold text-lg text-charcoal">
                    {freelancer.name}
                  </h3>
                  {freelancer.specialty && (
                    <p className="text-sm text-gray-600">
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
                <h4 className="font-semibold text-charcoal">Date & Time</h4>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-700">
                  <Calendar className="w-4 h-4" />
                  <span>{format(new Date(slot.startTime), 'EEEE, MMMM d, yyyy')}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
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
                <h4 className="font-semibold text-charcoal mb-4">
                  Selected Services
                </h4>
                <div className="space-y-2">
                  {selectedServices.map((service) => (
                    <div key={service.id} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-gray-700">{service.name}</span>
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
                <h4 className="font-semibold text-charcoal">Location</h4>
              </div>
              {selectedLocationType === LocationType.HOME ? (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    At Home
                  </p>
                  <p className="text-sm text-gray-600">{clientAddress}</p>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    At Clinic
                  </p>
                  {slot.location && (
                    <>
                      <p className="text-sm font-medium text-gray-900">
                        {slot.location.name}
                      </p>
                      <p className="text-sm text-gray-600">
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
              <h4 className="font-semibold text-charcoal mb-4">Price Summary</h4>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Base Price</span>
                  <span className="font-medium">€{basePrice.toFixed(2)}</span>
                </div>
                {servicePriceTotal > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Service Price</span>
                    <span className="font-medium">€{servicePriceTotal.toFixed(2)}</span>
                  </div>
                )}
                {hasDiscount && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600 font-medium">
                        Discount ({discountPercentage.toFixed(0)}%):
                      </span>
                      <span className="text-green-600 font-medium">
                        -€{discountAmount.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Price After Discount</span>
                      <span className="font-medium">€{finalPrice.toFixed(2)}</span>
                    </div>
                  </>
                )}
                {slot.location &&
                  selectedLocationType === LocationType.CLINIC &&
                  slot.location.additionalFee > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Location Fee</span>
                      <span className="font-medium">€{slot.location.additionalFee.toFixed(2)}</span>
                    </div>
                  )}
                <div className="border-t border-gray-200 pt-3 mt-3">
                  <div className="flex justify-between">
                    <span className="font-semibold text-lg text-charcoal">
                      Total
                    </span>
                    <div className="flex flex-col items-end">
                      <span className="font-bold text-lg text-primary">
                        €{totalPrice.toFixed(2)}
                      </span>
                      {hasDiscount && (
                        <span className="text-xs font-inter text-gray-500 line-through">
                          €{(subtotal + (slot.location?.additionalFee || 0)).toFixed(2)}
                        </span>
                      )}
                    </div>
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

          {/* Debug Information */}
          <Card className="mt-6 border-2 border-yellow-300 bg-yellow-50">
            <CardContent className="p-4">
              <h5 className="font-semibold text-sm mb-3 text-yellow-800">
                🔍 Debug Information
              </h5>
              <div className="space-y-2 text-xs font-mono">
                <div>
                  <strong>Selected Services:</strong>{' '}
                  {selectedServices.length > 0
                    ? selectedServices.map((s) => s.name).join(', ')
                    : 'None'}
                </div>
                <div>
                  <strong>Selected Location Type:</strong> {selectedLocationType || 'Not selected'}
                </div>
                <div className="border-t pt-2 mt-2">
                  <strong>Slot Data:</strong>
                  <div className="ml-4 mt-1">
                    <div>basePrice: {slot.basePrice}</div>
                    <div>
                      slot.discount:{' '}
                      {slot.discount ? JSON.stringify(slot.discount, null, 2) : 'null/undefined'}
                    </div>
                  </div>
                </div>
                <div className="border-t pt-2 mt-2">
                  <strong>Calculated Values:</strong>
                  <div className="ml-4 mt-1">
                    <div>basePrice: {basePrice}</div>
                    <div>servicePriceTotal: {servicePriceTotal}</div>
                    <div>subtotal: {subtotal}</div>
                    <div>hasValidServicePricing: {hasValidServicePricing ? 'true' : 'false'}</div>
                    <div>hasSlotDiscount: {hasSlotDiscount ? 'true' : 'false'}</div>
                    <div>
                      hasServiceCategoryDiscount: {hasServiceCategoryDiscount ? 'true' : 'false'}
                    </div>
                    <div>hasDiscount: {hasDiscount ? 'true' : 'false'}</div>
                    <div>discountPercentage: {discountPercentage}</div>
                    <div>discountAmount: {discountAmount}</div>
                    <div>finalPrice: {finalPrice}</div>
                    <div>totalPrice: {totalPrice}</div>
                  </div>
                </div>
                <div className="border-t pt-2 mt-2">
                  <strong>Service Category Discounts:</strong>
                  <div className="ml-4 mt-1">
                    {serviceCategoryDiscounts
                      ? JSON.stringify(serviceCategoryDiscounts, null, 2)
                      : 'null'}
                  </div>
                </div>
                <div className="border-t pt-2 mt-2">
                  <strong>Available Service Categories:</strong>
                  <div className="ml-4 mt-1 max-h-40 overflow-y-auto">
                    {slot.availableServiceCategories && slot.availableServiceCategories.length > 0
                      ? slot.availableServiceCategories.map((cat) => (
                          <div key={cat.id} className="mb-2">
                            <div>
                              <strong>{cat.name}</strong> (ID: {cat.id})
                            </div>
                            {cat.pricing && selectedLocationType && (
                              <div className="ml-4">
                                <div>
                                  Price:{' '}
                                  {cat.pricing[selectedLocationType]?.price ?? 'null/undefined'}
                                </div>
                                <div>
                                  Discount:{' '}
                                  {cat.pricing[selectedLocationType]?.discount
                                    ? JSON.stringify(
                                        cat.pricing[selectedLocationType]?.discount,
                                        null,
                                        2,
                                      )
                                    : 'null/undefined'}
                                </div>
                              </div>
                            )}
                          </div>
                        ))
                      : 'None'}
                  </div>
                </div>
                <div className="border-t pt-2 mt-2">
                  <strong>Full Slot Object (selected fields):</strong>
                  <div className="ml-4 mt-1 max-h-40 overflow-y-auto">
                    <pre className="whitespace-pre-wrap break-words">
                      {JSON.stringify(
                        {
                          id: slot.id,
                          basePrice: slot.basePrice,
                          discount: slot.discount,
                          availableServiceCategories: slot.availableServiceCategories?.map(
                            (cat) => ({
                              id: cat.id,
                              name: cat.name,
                              pricing: cat.pricing,
                            }),
                          ),
                        },
                        null,
                        2,
                      )}
                    </pre>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
