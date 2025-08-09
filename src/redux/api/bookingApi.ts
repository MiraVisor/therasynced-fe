import api from '@/services/api';
import { CancelBookingDto, CreateBookingDto, RescheduleBookingDto } from '@/types/types';

// Create booking
export const createBooking = async (data: CreateBookingDto) => {
  const response = await api.post('/booking/create', data);
  return response.data;
};

// Get patient bookings
export const getPatientBookings = async (date?: string) => {
  const params = date ? { date } : {};
  const response = await api.get('/booking/patient/all', { params });
  return response.data;
};

// Get patient booking history with pagination
export const getPatientBookingHistory = async (params?: {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) => {
  const response = await api.get('/booking/patient/history', { params });
  return response.data;
};

export const getBookingById = async (bookingId: string) => {
  const response = await api.get(`/booking/${bookingId}`);
  return response.data;
};

// Cancel booking
export const cancelBooking = async (data: CancelBookingDto) => {
  const response = await api.patch('/booking/cancel', data);
  return response.data;
};

// Reschedule booking
export const rescheduleBooking = async (data: RescheduleBookingDto) => {
  const response = await api.patch('/booking/reschedule', data);
  return response.data;
};

// Freelancer booking history
export const getFreelancerBookings = async (params?: {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) => {
  const response = await api.get('/booking/freelancer/all', { params });
  return response.data;
};

// Get freelancer future bookings
export const getFreelancerFutureBookings = async (params?: {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) => {
  const response = await api.get('/booking/freelancer/future', { params });
  return response.data;
};

// Get freelancer appointments by date
export const getFreelancerAppointmentsByDate = async (date: string) => {
  const response = await api.get('/booking/freelancer/appointments-by-date', {
    params: { date },
  });
  return response.data;
};

// Get today's bookings for freelancer
export const getTodayBookingsFreelancer = async () => {
  const response = await api.get('/booking/freelancer/today');
  return response.data;
};

// Admin booking history
export const getAdminBookingHistory = async (params?: {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) => {
  const response = await api.get('/booking/history/admin', { params });
  return response.data;
};

// Update booking notes
export const updateBookingNotes = async (bookingId: string, notes: string) => {
  const response = await api.patch(`/booking/${bookingId}/notes`, { notes });
  return response.data;
};
