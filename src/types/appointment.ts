/**
 * Appointment-related types (for calendar/UI display)
 */
import type { AppointmentStatus, LocationType } from './enums';

export interface Appointment {
  id: string;
  title: string;
  start: string;
  end: string;
  status: AppointmentStatus;
  clientName: string;
  clientId?: string;
  description?: string;
  location: LocationType;
  notes: string;
  // Additional fields for address display
  locationType?: 'CLINIC' | 'HOME' | 'ONLINE';
  clientAddress?: string | null;
  freelancer?: {
    clinicAddress?: string | null;
    [key: string]: unknown;
  };
}

export interface AppointmentFilters {
  hideCompleted: boolean;
  hideCancelled: boolean;
  showOnlyUpcoming: boolean;
  showOnlyPast: boolean;
  selectedDate: string; // Store as ISO string for Redux serialization
}

export interface AppointmentState {
  appointments: Appointment[];
  filters: AppointmentFilters;
  selectedAppointment: Appointment | null;
  isLoading: boolean;
  error: string | null;
}
