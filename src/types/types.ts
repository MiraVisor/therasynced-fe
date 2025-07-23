export interface registerUserTypes {
  name: string;
  email: string;
  role: string;
  password: string;
  profilePicture?: string;
  gender: string;
  dob: string;
  city: string;
}
export interface Expert {
  id: string;
  name: string;
  specialty: string;
  yearsOfExperience: string;
  rating: number;
  description: string;
  isFavorite?: boolean;
}
export type RoleType = 'PATIENT' | 'FREELANCER' | 'ADMIN';

export enum ROLES {
  PATIENT = 'PATIENT',
  FREELANCER = 'FREELANCER',
  TEAM = 'TEAM',
  ADMIN = 'ADMIN',
}

export type FreelancerStatCardType = {
  id: number;
  title: string;
  number: number;
  icon: JSX.Element;
  percentage: 'up' | 'down';
  percentageNumber: number;
};

export type AppointmentStatus = 'PENDING' | 'COMPLETED' | 'CANCELLED';

export interface Appointment {
  id: string;
  title: string;
  start: string;
  end: string;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  clientName: string;
  description?: string;
  location: string;
  notes: string;
}

export interface AppointmentFilters {
  hideCompleted: boolean;
  hideCancelled: boolean;
  showOnlyUpcoming: boolean;
  showOnlyPast: boolean;
  selectedDate: Date;
}

export interface AppointmentState {
  appointments: Appointment[];
  filters: AppointmentFilters;
  selectedAppointment: Appointment | null;
  isLoading: boolean;
  error: string | null;
}

export type View = 'month' | 'week' | 'work_week' | 'day' | 'agenda';
