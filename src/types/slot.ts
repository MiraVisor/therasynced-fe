/**
 * Slot-related types
 */
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
  availableServiceCategories?: Array<{
    id: string;
    name: string;
    description?: string;
    jobTitle: {
      id: string;
      name: string;
    };
    locationTypes: ('HOME' | 'CLINIC')[]; // REQUIRED: Location types this service supports (always present in slot responses)
  }>; // Service categories available for this slot (matches API response structure)
  booking?: {
    id: string;
    status: 'CONFIRMED' | 'CANCELLED' | 'RESCHEDULED' | 'COMPLETED';
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
    serviceCategories: Array<{
      id: string;
      name: string;
      description?: string;
    }>; // Service categories booked for this appointment (required in API response)
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
  subscriptionInfo: SubscriptionInfo;
}

export interface CreateSlotDto {
  locationType?: LocationType; // Optional - acts as default fallback for slots without explicit locationType
  locationId?: string;
  basePrice?: number; // Optional - default price used when slots don't specify their own
  duration: number;
  slots: Array<{
    startTime: string;
    endTime: string;
    basePrice?: number; // Optional - per-slot price, falls back to parent basePrice if not specified
    locationType?: LocationType; // Optional - defaults to CLINIC if not provided
    serviceCategoryIds?: string[]; // Optional - per-slot service categories
    breakFrom?: string; // Optional: ISO 8601 datetime string for per-slot break start time
    breakTill?: string; // Optional: ISO 8601 datetime string for per-slot break end time
  }>;
  serviceCategoryIds?: string[]; // Default fallback - Array of service category IDs
  notes?: string;
}

// Backend DTOs matching the controller structure
export interface CreateSlotsDto {
  locationType?: LocationType; // Optional - acts as default fallback for slots without explicit locationType
  locationId?: string; // Added to support location selection
  basePrice?: number; // Optional - default price used when slots don't specify their own
  duration: number;
  breakFrom?: string; // Optional: ISO 8601 datetime string for break start time
  breakTill?: string; // Optional: ISO 8601 datetime string for break end time
  slots: Array<{
    startTime: string;
    endTime: string;
    basePrice?: number; // Optional - per-slot price, falls back to parent basePrice if not specified
    locationType?: LocationType; // Optional - defaults to CLINIC if not provided
    serviceCategoryIds?: string[]; // Optional - per-slot service categories
    breakFrom?: string; // Optional: ISO 8601 datetime string for per-slot break start time
    breakTill?: string; // Optional: ISO 8601 datetime string for per-slot break end time
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
  reservedUntil?: string; // Optional: ISO 8601 datetime (defaults to 5 minutes)
}

export interface DayConfiguration {
  enabled: boolean;
  startTime: string; // Format: "HH:mm"
  endTime: string; // Format: "HH:mm"
}

export interface BlockedPeriod {
  id: string;
  date: Date;
  startTime: string; // Format: "HH:mm"
  endTime: string; // Format: "HH:mm"
}

export interface DaySlotConfiguration {
  day: string; // Day name: "monday", "tuesday", etc.
  startTime: string; // Format: "HH:mm"
  endTime: string; // Format: "HH:mm"
  slotDuration: number; // minutes
  breakFrom: string; // Format: "HH:mm"
  breakTill: string; // Format: "HH:mm"
}

export interface WeeklyAvailabilityTemplate {
  days: {
    monday: DayConfiguration;
    tuesday: DayConfiguration;
    wednesday: DayConfiguration;
    thursday: DayConfiguration;
    friday: DayConfiguration;
    saturday: DayConfiguration;
    sunday: DayConfiguration;
  };
  slotDuration: number; // minutes
  breakDuration: number; // minutes
  blockedPeriods: BlockedPeriod[];
}

/**
 * Slot pattern recognition types
 */
export interface DaySlotPattern {
  enabled: boolean;
  slots: Array<{
    startTime: string; // Format: "HH:mm"
    endTime: string; // Format: "HH:mm"
    slotDuration: number; // minutes
    breakDuration: number; // minutes
    locationType: LocationType;
  }>;
}

export interface SlotPatternResponse {
  success: boolean;
  data: {
    hasPattern: boolean;
    weekStart: string; // ISO date string
    weekEnd: string; // ISO date string
    pattern: {
      monday: DaySlotPattern;
      tuesday: DaySlotPattern;
      wednesday: DaySlotPattern;
      thursday: DaySlotPattern;
      friday: DaySlotPattern;
      saturday: DaySlotPattern;
      sunday: DaySlotPattern;
    };
    mostCommonDuration: number; // minutes
    mostCommonStartTime: string; // Format: "HH:mm"
    mostCommonEndTime: string; // Format: "HH:mm"
    mostCommonLocationType: LocationType;
    confidence: number; // 0-1, indicates how consistent the pattern is
  };
}
