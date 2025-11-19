import { PaginationDto } from '@/types/types';

import api from './api';
import { ENDPOINTS } from './endpoints';

// DTOs matching the backend structure
export interface AdminBookingDto {
  id: string;
  patientId: string;
  patientName: string;
  therapistId: string;
  therapistName: string;
  date: string; // YYYY-MM-DD
  startTime: string; // ISO timestamp
  endTime: string; // ISO timestamp
  price: number; // Booking total amount
  duration: number; // Minutes
  location: {
    name: string;
    address: string;
    type: string;
  } | null; // null for HOME locations
  locationType: string; // 'CLINIC' | 'HOME'
  createdAt: string; // ISO timestamp
  status: string; // Booking status
}

export interface AdminBookingsStatsDto {
  todaysAppointments: number;
  canceledAppointments: number;
  therapistsOnline: number;
  totalBookingsThisMonth: number;
  completedBookingsThisMonth: number;
  pendingBookings: number;
  totalBookingsAllTime: number;
}

export interface AdminBookingsStatsResponse {
  success: boolean;
  data: AdminBookingsStatsDto;
  message?: string;
}

export interface AdminBookingsListResponse {
  success: boolean;
  data: {
    bookings: AdminBookingDto[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  message?: string;
}

export interface AdminBookingsQueryParams extends PaginationDto {
  search?: string;
}

const adminBookingsService = {
  // Get booking stats
  getStats: async (): Promise<AdminBookingsStatsDto> => {
    const response = await api.get<AdminBookingsStatsResponse>(ENDPOINTS.admin.bookings.getStats);
    return response.data.data;
  },
  // Get admin bookings list (paginated)
  getAll: async (params?: AdminBookingsQueryParams): Promise<AdminBookingsListResponse['data']> => {
    const response = await api.get<AdminBookingsListResponse>(ENDPOINTS.admin.bookings.getAll, {
      params,
    });
    return response.data.data;
  },
};

export default adminBookingsService;
