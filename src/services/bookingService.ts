import {
  CancelBookingDto,
  CreateBookingDto,
  PaginationDto,
  RescheduleBookingDto,
} from '@/types/types';

import api from './api';
import { ENDPOINTS } from './endpoints';

// API Functions
export const bookingService = {
  // Create a new booking
  createBooking: async (data: CreateBookingDto) => {
    const response = await api.post(ENDPOINTS.bookings.create, data);
    return response.data;
  },

  // Cancel a booking
  cancelBooking: async (data: CancelBookingDto) => {
    const response = await api.post(ENDPOINTS.bookings.cancel, data);
    return response.data;
  },

  // Reschedule a booking
  rescheduleBooking: async (data: RescheduleBookingDto) => {
    const response = await api.post(ENDPOINTS.bookings.reschedule, data);
    return response.data;
  },

  // Get patient bookings (future only by default)
  getPatientBookings: async (date?: string, includePast: boolean = false) => {
    const params: any = {};
    if (date) params.date = date;
    if (includePast) params.includePast = includePast;

    const response = await api.get(ENDPOINTS.bookings.patientAll, { params });
    return response.data;
  },

  // Get complete patient booking history
  getPatientBookingHistory: async (pagination?: PaginationDto) => {
    const response = await api.get(ENDPOINTS.bookings.patientHistory, { params: pagination });
    return response.data;
  },

  // Get freelancer future bookings
  getFreelancerFutureBookings: async (pagination?: PaginationDto) => {
    const response = await api.get(ENDPOINTS.bookings.freelancerFuture, { params: pagination });
    return response.data;
  },

  // Get freelancer complete history
  getFreelancerHistory: async (pagination?: PaginationDto, includePast: boolean = true) => {
    const params: any = { ...pagination };
    if (!includePast) params.includePast = false;

    const response = await api.get(ENDPOINTS.bookings.freelancerHistory, { params });
    return response.data;
  },

  // Get freelancer today's bookings
  getFreelancerTodayBookings: async () => {
    const response = await api.get(ENDPOINTS.bookings.freelancerToday);
    return response.data;
  },

  // Get freelancer appointments by date
  getFreelancerAppointmentsByDate: async (date: string) => {
    const response = await api.get(ENDPOINTS.bookings.freelancerByDate, { params: { date } });
    return response.data;
  },

  // Get admin booking history
  getAdminBookingHistory: async (pagination?: PaginationDto) => {
    const response = await api.get(ENDPOINTS.bookings.adminHistory, { params: pagination });
    return response.data;
  },
};

export default bookingService;
