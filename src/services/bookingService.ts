import api from './api';
import { ENDPOINTS } from './endpoints';

// Types
export interface Booking {
  id: string;
  slotId: string;
  clientId: string;
  status: 'CONFIRMED' | 'CANCELLED' | 'RESCHEDULED';
  totalAmount: number;
  createdById: string;
  createdByRole: string;
  cancelledById?: string;
  cancelledReason?: string;
  rescheduledFromId?: string;
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
    };
    location?: {
      id: string;
      name: string;
      address: string;
      type: string;
    };
  };
  services: Array<{
    id: string;
    name: string;
    description: string;
    additionalPrice: number;
    duration: number;
  }>;
  client: {
    id: string;
    name: string;
    email: string;
    profilePicture?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateBookingDto {
  slotId: string;
  serviceIds?: string[];
  clientAddress?: string;
  notes?: string;
}

export interface CancelBookingDto {
  bookingId: string;
  reason: string;
}

export interface RescheduleBookingDto {
  bookingId: string;
  newSlotId: string;
}

export interface PaginationDto {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// API Functions
export const bookingService = {
  // Create a new booking
  createBooking: async (data: CreateBookingDto) => {
    const response = await api.post(ENDPOINTS.booking.create, data);
    return response.data;
  },

  // Cancel a booking
  cancelBooking: async (data: CancelBookingDto) => {
    const response = await api.post(ENDPOINTS.booking.cancel, data);
    return response.data;
  },

  // Reschedule a booking
  rescheduleBooking: async (data: RescheduleBookingDto) => {
    const response = await api.post(ENDPOINTS.booking.reschedule, data);
    return response.data;
  },

  // Get patient bookings (future only by default)
  getPatientBookings: async (date?: string, includePast: boolean = false) => {
    const params: any = {};
    if (date) params.date = date;
    if (includePast) params.includePast = includePast;

    const response = await api.get(ENDPOINTS.booking.patientAll, { params });
    return response.data;
  },

  // Get complete patient booking history
  getPatientBookingHistory: async (pagination?: PaginationDto) => {
    const response = await api.get(ENDPOINTS.booking.patientHistory, { params: pagination });
    return response.data;
  },

  // Get freelancer future bookings
  getFreelancerFutureBookings: async (pagination?: PaginationDto) => {
    const response = await api.get(ENDPOINTS.booking.freelancerFuture, { params: pagination });
    return response.data;
  },

  // Get freelancer complete history
  getFreelancerHistory: async (pagination?: PaginationDto, includePast: boolean = true) => {
    const params: any = { ...pagination };
    if (!includePast) params.includePast = false;

    const response = await api.get(ENDPOINTS.booking.freelancerHistory, { params });
    return response.data;
  },

  // Get freelancer today's bookings
  getFreelancerTodayBookings: async () => {
    const response = await api.get(ENDPOINTS.booking.freelancerToday);
    return response.data;
  },

  // Get freelancer appointments by date
  getFreelancerAppointmentsByDate: async (date: string) => {
    const response = await api.get(ENDPOINTS.booking.freelancerByDate, { params: { date } });
    return response.data;
  },

  // Get admin booking history
  getAdminBookingHistory: async (pagination?: PaginationDto) => {
    const response = await api.get(ENDPOINTS.booking.adminHistory, { params: pagination });
    return response.data;
  },
};

export default bookingService;
