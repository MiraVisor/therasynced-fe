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

// New DTOs to match backend
export interface SignUpDto {
  name: string;
  email: string;
  role: string;
  password: string;
  profilePicture?: string;
  gender: string;
  dob: string;
  city: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  newPassword: string;
}

export interface VerifyEmailLinkDto {
  token: string;
}

export interface GoogleSignInDto {
  idToken: string;
}

export interface ChangeEmailDto {
  newEmail: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateProfileDto {
  name?: string;
  city?: string;
  gender?: string;
  dob?: string;
}

// Backend response types
export interface BackendResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  meta: {
    timestamp: string;
    path: string;
  };
}

export interface BackendProfileResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      email: string;
      name: string;
      gender: string;
      profilePicture?: string;
      role: string;
      dob: string;
      city: string;
      isEmailVerified: boolean;
      authProvider: string;
      createdAt: string;
      updatedAt: string;
    };
    freelancerData?: any;
  };
  meta: {
    timestamp: string;
    path: string;
  };
}

export interface BackendAuthResponse {
  success: boolean;
  message: string;
  data: {
    success: boolean;
    message: string;
    data: {
      token: string;
      user: {
        id: string;
        email: string;
        name: string;
        role: string;
        authProvider?: string;
      };
    };
    meta: {
      code: number;
      status: string;
    };
  };
  meta: {
    timestamp: string;
    path: string;
  };
}

export interface Expert {
  id: string;
  name: string;
  specialty: string;
  yearsOfExperience: string;
  rating: number;
  reviews: number;
  description: string;
  isFavorite?: boolean;
  // Additional properties for profile dialog
  profilePicture?: string;
  services?: any[];
  location?: string;
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
  verificationStatus?:
    | 'verified'
    | 'pending'
    | 'rejected'
    | 'unverified'
    | 'APPROVED'
    | 'PENDING'
    | 'REJECTED'
    | 'UNVERIFIED';
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

export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

export enum LocationType {
  HOME = 'HOME',
  OFFICE = 'OFFICE',
  VIRTUAL = 'VIRTUAL',
  CLINIC = 'CLINIC',
}

export interface Appointment {
  id: string;
  title: string;
  start: string;
  end: string;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  clientName: string;
  description?: string;
  location: LocationType;
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

// Slot-related types
export interface Slot {
  id: string;
  freelancerId: string;
  freelancerName?: string;
  profilePicture?: string | null;
  averageRating?: number;
  numberOfRatings?: number;
  locationType: LocationType;
  location?: {
    id: string;
    name: string;
    address: string;
    type: 'OFFICE' | 'CLINIC';
    additionalFee: number;
  } | null;
  startTime: string;
  endTime: string;
  duration: number;
  basePrice: number;
  status: 'AVAILABLE' | 'RESERVED' | 'BOOKED' | 'CANCELLED';
  reservedUntil?: string;
  notes?: string;
  availableServices?: Service[]; // NEW: Services available for this slot
  booking?: {
    id: string;
    status: string;
    totalAmount: number;
    clientAddress?: string | null;
    notes?: string | null;
    client: {
      id: string;
      name: string;
      email: string;
      profilePicture?: string | null;
    };
    services: any[];
    createdAt: string;
    updatedAt: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface Service {
  id: string;
  name: string;
  description?: string;
  duration?: number;
  tags?: string[];
  isActive: boolean;
  locationTypes: LocationType[];
  requiresEquipment?: boolean;
  freelancerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSlotDto {
  locationType: LocationType;
  locationId?: string;
  basePrice: number;
  duration: number;
  slots: Array<{
    startTime: string;
    endTime: string;
  }>;
  serviceIds?: string[]; // NEW: Optional array of service IDs
  notes?: string;
}

export interface CreateServiceDto {
  name: string;
  description?: string;
  duration?: number;
  locationTypes: LocationType[];
  tags?: string[];
  requiresEquipment?: boolean;
}

export interface CreateBookingDto {
  slotId: string;
  serviceIds?: string[];
  clientAddress?: string;
  notes?: string;
}

// Backend DTOs matching the controller structure
export interface CreateSlotsDto {
  locationType: LocationType;
  locationId?: string; // Added to support location selection
  basePrice: number;
  duration: number;
  slots: Array<{
    startTime: string;
    endTime: string;
  }>;
  serviceIds?: string[]; // NEW: Optional array of service IDs
  notes?: string;
}

export interface UpdateSlotDto {
  id: string;
  locationType?: LocationType;
  startTime?: string;
  endTime?: string;
  status?: string;
  additionalFee?: boolean;
  feeAmount?: string;
  feeName?: string;
}

export interface ReserveSlotDto {
  slotId: string;
  reservedUntil: string;
}

export interface PaginationDto {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  meta: {
    timestamp: string;
    path: string;
  };
}

// Updated to match backend response structure
export interface BackendApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  meta: {
    timestamp: string;
    path: string;
  };
}

// Booking DTOs to match backend
export interface CreateBookingDto {
  slotId: string;
  serviceIds?: string[];
  clientAddress?: string;
  notes?: string;
}

export interface RescheduleBookingDto {
  bookingId: string;
  newSlotId: string;
  reason?: string;
}

export interface CancelBookingDto {
  bookingId: string;
  reason?: string;
}

// Location types to match backend
export interface Location {
  id: string;
  name: string;
  address: string;
  type: 'OFFICE' | 'CLINIC';
  additionalFee: number;
  freelancerId: string;
  createdAt: string;
  updatedAt: string;
}

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

export interface Freelancer {
  id: string;
  name: string;
  email: string;
  profilePicture?: string;
  city: string;
  isActive: boolean;
  isFavorite?: boolean;
  favoritedAt?: string;
  verificationStatus?:
    | 'verified'
    | 'pending'
    | 'rejected'
    | 'unverified'
    | 'APPROVED'
    | 'PENDING'
    | 'REJECTED'
    | 'UNVERIFIED';
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
    description: string;
    additionalPrice: number;
    duration: number;
  }>;
  locations: Array<{
    id: string;
    name: string;
    address: string;
    type: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

// Notification types
export type NotificationType =
  | 'APPOINTMENT'
  | 'BOOKING'
  | 'BOOKING_CREATED'
  | 'BOOKING_CANCELLED'
  | 'BOOKING_RESCHEDULED'
  | 'PAYMENT'
  | 'LOYALTY_POINTS_AWARDED'
  | 'LOYALTY_REWARD_REDEEMED'
  | 'SYSTEM'
  | 'MESSAGE'
  | 'REVIEW';

export type NotificationPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface Notification {
  id: string;
  userId?: string;
  type: NotificationType;
  priority?: NotificationPriority;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  updatedAt?: string;
  actionUrl?: string;
  actionText?: string;
  metadata?: {
    appointmentId?: string;
    bookingId?: string;
    freelancerId?: string;
    clientId?: string;
    slotId?: string;
    startTime?: string;
    amount?: number;
    [key: string]: any;
  };
}

export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
}

export interface NotificationFilters {
  page?: number;
  limit?: number;
  type?: string;
  isRead?: boolean;
}

// Chat/Message types
export interface Conversation {
  id: string;
  participant1Id: string;
  participant2Id: string;
  createdAt: string;
  updatedAt: string;
}
