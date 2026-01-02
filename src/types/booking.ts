/**
 * Booking-related types
 */
import type { CardInfo } from './common';
import type { BookingRating } from './rating';

export interface Booking {
  id: string;
  slotId: string;
  clientId: string;
  status: 'CONFIRMED' | 'CANCELLED' | 'RESCHEDULED' | 'COMPLETED';
  totalAmount: number;
  createdById: string;
  createdByRole: string;
  cancelledById?: string;
  cancelledReason?: string;
  rescheduledFromId?: string;
  canBeRated?: boolean; // From backend API - indicates if booking can be rated
  hasRating?: boolean; // From backend API - indicates if booking already has a rating
  rating?: BookingRating | null; // The rating object if the booking has been rated
  formData?: Record<string, unknown> | null;
  slot: {
    id: string;
    startTime: string;
    endTime: string;
    duration: number;
    basePrice: number;
    locationType: string;
    freelancer: {
      id: string;
      name: string;
      email: string;
      profilePicture?: string;
      averageRating?: number; // Overall average rating from ratings
      cardInfo?: CardInfo;
    };
    location?: {
      id: string;
      name: string;
      address: string;
      type: string;
    };
  };
  services?: Array<{
    id: string;
    name: string;
    description: string;
    additionalPrice: number;
    duration: number;
  }>; // Legacy: Services for backward compatibility
  serviceCategories?: Array<{
    id: string;
    jobTitleId: string;
    name: string;
    description?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  }>; // Service categories booked for this appointment
  client: {
    id: string;
    name: string;
    email: string;
    profilePicture?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface BookingStats {
  totalBookings: number;
  upcomingBookings: number;
  completedBookings: number;
  cancelledBookings: number;
}

export interface CreateBookingDto {
  slotId: string;
  serviceCategoryIds?: string[];
  locationType?: 'HOME' | 'CLINIC';
  clientAddress?: string;
  notes?: string;
}

export interface RescheduleBookingDto {
  bookingId: string;
  newSlotId: string;
  serviceCategoryIds?: string[];
  locationType?: 'HOME' | 'CLINIC';
  clientAddress?: string;
  notes?: string;
  cancellationReason?: string;
}

export interface CancelBookingDto {
  bookingId: string;
  reason?: string;
}

export interface CompleteBookingDto {
  bookingId: string;
  completionNotes?: string;
}
