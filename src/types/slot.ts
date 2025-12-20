/**
 * Slot-related types
 */
import type { ServiceCategory } from './common';
import type { LocationType } from './enums';
import type { BookingRating } from './rating';
import type { Service } from './service';
import type { SubscriptionInfo } from './subscription';

export interface Slot {
  id: string;
  freelancerId: string;
  freelancerName?: string;
  profilePicture?: string | null;
  averageRating?: number;
  numberOfRatings?: number;
  locationType: LocationType;
  location?: {
    id: string;
    name: string;
    address: string;
    type: 'OFFICE' | 'CLINIC';
    additionalFee: number;
  } | null;
  startTime: string;
  endTime: string;
  duration: number;
  basePrice: number;
  status: 'AVAILABLE' | 'RESERVED' | 'BOOKED' | 'CANCELLED';
  reservedUntil?: string;
  notes?: string;
  availableServices?: Service[]; // Legacy: Services available for this slot
  availableServiceCategories?: ServiceCategory[]; // Service categories available for this slot
  booking?: {
    id: string;
    status: string;
    totalAmount: number;
    subtotalAmount?: number;
    clientAddress?: string | null;
    notes?: string | null;
    client: {
      id: string;
      name: string;
      email: string;
      profilePicture?: string | null;
    };
    discountAmount?: number;
    discountPercentage?: number;
    services?: unknown[]; // Legacy: Services for backward compatibility
    serviceCategories?: Array<{
      id: string;
      name: string;
      description?: string;
      jobTitle?: {
        id: string;
        name: string;
      };
    }>; // Service categories booked for this appointment
    rating?: BookingRating | null; // The rating object if the booking has been rated
    createdAt: string;
    updatedAt: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface SlotStats {
  totalSlots: number;
  bookedSlots: number;
  availableSlots: number;
  revenue: number;
  subscriptionInfo?: SubscriptionInfo;
}

export interface CreateSlotDto {
  locationType?: LocationType; // Optional - acts as default fallback
  locationId?: string;
  basePrice: number;
  duration: number;
  slots: Array<{
    startTime: string;
    endTime: string;
    locationType?: LocationType; // Optional - per-slot location override
    serviceCategoryIds?: string[]; // Optional - per-slot service categories
  }>;
  serviceCategoryIds?: string[]; // Default fallback - Array of service category IDs
  notes?: string;
}

// Backend DTOs matching the controller structure
export interface CreateSlotsDto {
  locationType?: LocationType; // Optional - acts as default fallback
  locationId?: string; // Added to support location selection
  basePrice: number;
  duration: number;
  slots: Array<{
    startTime: string;
    endTime: string;
    locationType?: LocationType; // Optional - per-slot location override
    serviceCategoryIds?: string[]; // Optional - per-slot service categories
  }>;
  serviceCategoryIds?: string[]; // Default fallback - Array of service category IDs
  notes?: string;
}

export interface UpdateSlotDto {
  id: string;
  locationType?: LocationType;
  startTime?: string;
  endTime?: string;
  status?: string;
  additionalFee?: boolean;
  feeAmount?: string;
  feeName?: string;
}

export interface ReserveSlotDto {
  slotId: string;
  reservedUntil: string;
}
