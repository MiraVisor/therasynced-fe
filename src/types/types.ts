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
  experience: string;
  rating: number;
  description: string;
  isFavorite?: boolean;
  // Additional properties for profile dialog
  profilePicture?: string;
  services?: any[];
  location?: string;
  languages?: string[];
  education?: any[];
  certifications?: any[];
  sessionTypes?: string[];
  pricing?: {
    online: { min: number; max: number };
    office: { min: number; max: number };
    home: { min: number; max: number };
  };
  // Additional data from API
  email?: string;
  gender?: string;
  city?: string;
  isEmailVerified?: boolean;
  isActive?: boolean;
  authProvider?: string;
  // Slot information
  slots?: any[];
  slotSummary?: any;
  // Favorites information
  favoritedBy?: any[];
  // Card info
  cardInfo?: any;
  // Available slots count
  availableSlots?: number;
  totalSlots?: number;
  nextAvailableSlot?: any;
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
  selectedDate: string; // Store as ISO string for Redux serialization
}

export interface AppointmentState {
  appointments: Appointment[];
  filters: AppointmentFilters;
  selectedAppointment: Appointment | null;
  isLoading: boolean;
  error: string | null;
}

export type View = 'month' | 'week' | 'work_week' | 'day' | 'agenda';

// Booking Types
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

// Freelancer Types
export interface Freelancer {
  id: string;
  name: string;
  email: string;
  profilePicture?: string;
  city: string;
  isActive: boolean;
  isFavorite?: boolean;
  // Remove favoritedAt as it's not returned by the backend
  cardInfo: {
    name: string;
    title: string;
    mainService: string;
    yearsOfExperience: string;
    country: string;
    averageRating: number;
    patientStories: number;
    initials: string;
  };
  slotSummary?: {
    nextAvailable: {
      id: string;
      startTime: string;
      endTime: string;
      status: string;
    } | null;
    totalSlots: number;
    availableSlots: number;
  };
  slots: Array<{
    id: string;
    startTime: string;
    endTime: string;
    status: string;
  }>;
  services: Array<{
    id: string;
    name: string;
    description?: string;
    additionalPrice: number;
    duration?: number;
    tags: string[];
    isActive: boolean;
    locationTypes: string[];
    requiresEquipment: boolean;
  }>;
  locations: Array<{
    id: string;
    name: string;
    address: string;
    type: string;
    additionalFee: number;
    isActive: boolean;
  }>;
  createdAt: string;
  updatedAt: string;
}

// Slot Types
export interface Slot {
  id: string;
  freelancerId: string;
  locationType: string;
  startTime: string;
  endTime: string;
  duration: number;
  basePrice: number;
  notes?: string;
  status: 'AVAILABLE' | 'RESERVED' | 'BOOKED';
  reservedUntil?: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  meta?: {
    code: number;
    status: string;
    timestamp: string;
    path: string;
    [key: string]: any;
  };
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  meta?: {
    code: number;
    status: string;
    timestamp: string;
    path: string;
    [key: string]: any;
  };
}

// Pagination Types
export interface PaginationDto {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Booking Action Types
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
