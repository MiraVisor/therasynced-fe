// Job Title interface for freelancers
export interface JobTitle {
  id: string;
  name: string;
  description: string;
}

export interface JobTitlesResponse {
  success: boolean;
  data: JobTitle[];
}

// First Aid Certificate Status
export type FirstAidCertificateStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

// Cloudinary Upload Response
export interface CloudinaryUploadResponse {
  url: string;
  publicId: string;
  success: boolean;
  error?: string;
}

// Freelancer File Type
export type FreelancerFileType =
  | 'CERTIFICATE'
  | 'VERIFICATION_DOCUMENT'
  | 'PROFILE_PICTURE'
  | 'OTHER';

// Individual File Structure (from backend)
export interface BackendFile {
  url: string;
  type: string;
  uploadedAt: string;
  fileSize: number;
  format: string;
  originalName: string;
  status?: string;
  approvedAt?: string | null;
  rejectedAt?: string | null;
  rejectionReason?: string | null;
}

// Backend Response Structure
export interface FreelancerFilesResponse {
  profilePicture?: BackendFile;
  firstAidCertificate?: BackendFile;
  verificationDocuments?: BackendFile[];
}

// Flattened File for DataTable
export interface FreelancerFile {
  id: string;
  fileName: string;
  fileType: FreelancerFileType;
  url: string;
  publicId?: string;
  fileSize: number;
  uploadedAt: string;
  status?: string;
  format?: string;
  approvedAt?: string | null;
  rejectedAt?: string | null;
  rejectionReason?: string | null;
}

// Service Category interface
export interface ServiceCategory {
  id: string;
  name: string;
  description?: string;
  icon?: string;
}

// First Aid Certificate Info
export interface FirstAidCertificateInfo {
  firstAidCertificateUrl: string;
  firstAidCertificateStatus: FirstAidCertificateStatus;
  firstAidCertificateApprovedAt: Date | null;
  firstAidCertificateRejectedAt: Date | null;
  firstAidCertificateRejectionReason: string | null;
}

export interface registerUserTypes {
  name: string;
  email: string;
  role: string;
  password: string;
  profilePicture?: string;
  gender?: string;
  dob?: string;
  city?: string;
  // New optional fields for freelancers
  mainJobTitle?: JobTitle;
  clinicAddress?: string;
  firstAidCertificateUrl?: string;
  verificationDocuments?: string[];
}

// New DTOs to match backend
export interface SignUpDto {
  name: string;
  email: string;
  role: string;
  password: string;
  profilePicture?: string;
  gender?: string;
  dob?: string;
  city?: string;
  // New optional fields for freelancers
  mainJobTitle?: JobTitle;
  clinicAddress?: string;
  firstAidCertificateUrl?: string;
  verificationDocuments?: string[];
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
  // New fields for freelancers
  mainJobTitleId?: string; // Updated to match backend DTO
  clinicAddress?: string;
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
      // New fields for enhanced user profile
      mainJobTitle?: JobTitle;
      clinicAddress?: string;
      verificationDocuments?: string[];
      verificationRequestedAt?: Date | null;
      verificationApprovedAt?: Date | null;
      verificationRejectedAt?: Date | null;
      verificationRejectionReason?: string | null;
      firstAidCertificateUrl?: string;
      firstAidCertificateStatus?: FirstAidCertificateStatus;
      firstAidCertificateApprovedAt?: Date | null;
      firstAidCertificateRejectedAt?: Date | null;
      firstAidCertificateRejectionReason?: string | null;
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
  jobTitle?: JobTitle; // Add job title field
  yearsOfExperience: string;
  rating?: number;
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
  // First aid certificate information
  firstAidCertificateStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
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
  // Additional fields for address display
  locationType?: 'CLINIC' | 'HOME' | 'ONLINE';
  clientAddress?: string | null;
  freelancer?: {
    clinicAddress?: string | null;
    [key: string]: any;
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

export type View = 'month' | 'week' | 'work_week' | 'day' | 'agenda';

// Slot-related types
export interface SlotStats {
  totalSlots: number;
  bookedSlots: number;
  availableSlots: number;
  revenue: number;
}

export interface BookingStats {
  totalBookings: number;
  upcomingBookings: number;
  completedBookings: number;
  cancelledBookings: number;
}

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
  weekStart?: string;
  weekEnd?: string;
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
  // New fields for enhanced freelancer profile
  mainJobTitle?: JobTitle;
  clinicAddress?: string;
  verificationDocuments?: string[];
  verificationRequestedAt?: Date | null;
  verificationApprovedAt?: Date | null;
  verificationRejectedAt?: Date | null;
  verificationRejectionReason?: string | null;
  firstAidCertificateUrl?: string;
  firstAidCertificateStatus?: FirstAidCertificateStatus;
  firstAidCertificateApprovedAt?: Date | null;
  firstAidCertificateRejectedAt?: Date | null;
  firstAidCertificateRejectionReason?: string | null;
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

// Loyalty System Types
export interface LoyaltyProfile {
  id: string;
  userId: string;
  totalPoints: number;
  availablePoints: number;
  tier: LoyaltyTier;
  tierBenefits: string[];
  nextTier: LoyaltyTier;
  pointsToNextTier: number;
  pointTransactions: PointTransaction[];
  redemptions: Redemption[];
}

export type LoyaltyTier = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';

export interface PointTransaction {
  id: string;
  loyaltyProfileId: string;
  points: number;
  type: 'EARNED' | 'SPENT' | 'EXPIRED';
  description: string;
  bookingId?: string;
  createdAt: string;
}

export interface LoyaltyReward {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
  category: string;
  isActive: boolean;
  imageUrl?: string;
  createdAt: string;
}

export interface Redemption {
  id: string;
  loyaltyProfileId: string;
  rewardId: string;
  reward: LoyaltyReward;
  pointsSpent: number;
  status: 'PENDING' | 'FULFILLED' | 'CANCELLED';
  fulfilledAt?: string;
  createdAt: string;
}

// Complaint System Types
export type ComplaintStatus = 'PENDING' | 'UNDER_REVIEW' | 'RESOLVED' | 'DISMISSED';

export type ComplaintCategory =
  | 'HARASSMENT'
  | 'UNPROFESSIONAL_BEHAVIOR'
  | 'SAFETY_CONCERN'
  | 'NO_SHOW'
  | 'LATE_CANCELLATION'
  | 'INAPPROPRIATE_CONDUCT'
  | 'POOR_SERVICE_QUALITY'
  | 'OTHER';

export interface Complaint {
  id: string;
  reporterId: string;
  reporter: {
    id: string;
    name: string;
    email: string;
  };
  reportedUserId: string;
  reportedUser: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  category: ComplaintCategory;
  reason: string;
  description: string;
  evidence: string[];
  status: ComplaintStatus;
  adminResponse?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateComplaintDto {
  reportedUserId: string;
  category: ComplaintCategory;
  reason: string;
  description: string;
  evidence?: string[];
}

// File Upload Types
export interface FileUploadResponse {
  success: boolean;
  data: {
    secureUrl: string;
    publicId: string;
    format: string;
    originalName: string;
  };
}

export interface UploadedFile {
  url: string;
  publicId: string;
  format: string;
  originalName: string;
}

// Subscription System Types
export type PlanType = 'BASIC' | 'STANDARD' | 'PREMIUM';

export type SubscriptionStatus =
  | 'TRIALING'
  | 'ACTIVE'
  | 'PAST_DUE'
  | 'CANCELED'
  | 'UNPAID'
  | 'INACTIVE';

export interface SubscriptionPlan {
  id: string;
  name: PlanType;
  displayName: string;
  description: string;
  price: number;
  billingInterval: string;
  stripePriceId: string;
  maxSlots: number | null; // null = unlimited
  commissionRate: number;
  features: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Subscription {
  id: string | null;
  userId: string;
  planId?: string;
  plan?: SubscriptionPlan;
  status: SubscriptionStatus;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
  trialStart?: string;
  trialEnd?: string;
  trialEndsAt?: string; // New field from API
  canceledAt?: string | null;
  createdAt?: string;
  subscription?: Subscription | null; // Nested subscription details if active
  isInTrial?: boolean;
  message?: string; // Message from API when inactive
}

export interface SubscriptionCreationData {
  subscription: Subscription;
  clientSecret: string;
}

export interface UpdateSubscriptionDto {
  planType: PlanType;
}

export interface CancelSubscriptionDto {
  reason?: string;
}

export interface SubscriptionPlansResponse {
  success: boolean;
  data: SubscriptionPlan[];
}

export interface SubscriptionResponse {
  success: boolean;
  data: Subscription;
}

export interface CreateSubscriptionResponseData {
  success: boolean;
  data: SubscriptionCreationData;
}

export interface BillingPortalResponse {
  success: boolean;
  data: {
    url: string;
  };
}
