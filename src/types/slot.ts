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
  discount?: {
    applicable: boolean;
    discountPercentage: number;
    discountAmount: number;
    finalAmount: number;
  };
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
    pricing?: {
      HOME?: {
        price: number;
        currency: string;
        discount?: {
          applicable: boolean;
          subtotal?: number; // basePrice + service price (total before discount)
          discountPercentage: number;
          discountAmount: number;
          finalAmount: number; // Final price after discount
        };
      };
      CLINIC?: {
        price: number;
        currency: string;
        discount?: {
          applicable: boolean;
          subtotal?: number; // basePrice + service price (total before discount)
          discountPercentage: number;
          discountAmount: number;
          finalAmount: number; // Final price after discount
        };
      };
    };
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
    breakdown?: {
      basePrice: number;
      servicePrice: number;
      discountAmount: number;
    };
    serviceCategories: Array<{
      id: string;
      name: string;
      description?: string;
      jobTitle?: {
        id: string;
        name: string;
      };
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

/**
 * Simplified slot creation DTO
 * Designed for the streamlined availability management flow
 */
export interface CreateSlotsDto {
  /** Array of specific dates in YYYY-MM-DD format */
  days: string[];
  /** Start time in HH:mm format (24-hour), e.g., "09:00" */
  startTime: string;
  /** End time in HH:mm format (24-hour), e.g., "17:00" */
  endTime: string;
  /** Session duration in minutes (30, 45, 60, 90, 120) */
  duration: number;
}

/**
 * Legacy slot creation DTO for backward compatibility
 * @deprecated Use the simplified CreateSlotsDto instead
 */
export interface LegacyCreateSlotsDto {
  locationType?: LocationType;
  locationId?: string;
  basePrice?: number;
  duration: number;
  breakFrom?: string;
  breakTill?: string;
  slots: Array<{
    startTime: string;
    endTime: string;
    basePrice?: number;
    locationType?: LocationType;
    serviceCategoryIds?: string[];
    breakFrom?: string;
    breakTill?: string;
  }>;
  serviceCategoryIds?: string[];
  notes?: string;
}

/** @deprecated Use CreateSlotsDto instead */
export type CreateSlotDto = LegacyCreateSlotsDto;

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
