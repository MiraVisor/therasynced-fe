import api from '@/services/api';
import {
  ApiResponse,
  BookingStats,
  CancelBookingDto,
  CompleteBookingDto,
  CreateBookingDto,
  RescheduleBookingDto,
} from '@/types/types';

export const createBooking = async (data: CreateBookingDto) => {
  const response = await api.post('/booking/create', data);
  return response.data;
};

export const getPatientBookings = async (params?: {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  date?: string;
}) => {
  const response = await api.get('/booking/patient/all', { params });
  return response.data;
};

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

export const cancelBooking = async (data: CancelBookingDto) => {
  const response = await api.patch('/booking/cancel', data);
  return response.data;
};

export const completeBooking = async (data: CompleteBookingDto) => {
  const response = await api.patch('/booking/complete', data);
  return response.data;
};

export const rescheduleBooking = async (data: RescheduleBookingDto) => {
  const response = await api.post('/booking/reschedule-by-cancellation', data);
  return response.data;
};

export const getPatientBookingStats = async (): Promise<ApiResponse<BookingStats>> => {
  const response = await api.get('/booking/patient/stats');
  return response.data;
};

// Freelancer booking functions
export const getFreelancerBookings = async (params?: {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) => {
  const response = await api.get('/booking/freelancer/all', { params });
  return response.data;
};

export const getFreelancerFutureBookings = async (params?: {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) => {
  const response = await api.get('/booking/freelancer/future', { params });
  return response.data;
};

export const getFreelancerAppointmentsByDate = async (date: string) => {
  const response = await api.get('/booking/freelancer/appointments-by-date', {
    params: { date },
  });
  return response.data;
};

export const getTodayBookingsFreelancer = async () => {
  const response = await api.get('/booking/freelancer/today');
  return response.data;
};

export const updateBookingNotes = async (bookingId: string, notes: string) => {
  const response = await api.patch(`/booking/${bookingId}/notes`, { notes });
  return response.data;
};
