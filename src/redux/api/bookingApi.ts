import { bookingService } from '@/services/bookingService';
import {
  ApiResponse,
  Booking,
  CancelBookingDto,
  CreateBookingDto,
  PaginationDto,
} from '@/types/types';

export const getPatientBookings = async (
  params: { includePast?: boolean; pagination?: PaginationDto } = {},
): Promise<ApiResponse<Booking[]>> => {
  const { includePast = false, pagination } = params;
  if (pagination) {
    return await bookingService.getPatientBookingHistory(pagination);
  }
  return await bookingService.getPatientBookings(undefined, includePast);
};

export const createBooking = async (data: CreateBookingDto): Promise<ApiResponse<Booking>> => {
  return await bookingService.createBooking(data);
};

export const cancelBooking = async (data: CancelBookingDto): Promise<ApiResponse<any>> => {
  return await bookingService.cancelBooking(data);
};

export const rescheduleBooking = async (data: {
  bookingId: string;
  newSlotId: string;
}): Promise<ApiResponse<Booking>> => {
  return await bookingService.rescheduleBooking(data);
};
