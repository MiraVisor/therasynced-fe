// Re-export data rights types
export * from './dataRights';

// Re-export from organized domain files
export * from './analytics';
export * from './api';
export * from './appointment';
export * from './auth';
export * from './availability';
export * from './booking';
export * from './chat';
export * from './common';
export * from './complaint';
export * from './enums';
export * from './formTemplate';
export * from './freelancer';
export * from './location';
export * from './loyalty';
export * from './notification';
export * from './pricing';
export * from './rating';
export * from './service';
export * from './slot';
export * from './subscription';
export * from './user';

// Job Title interface for freelancers
export interface JobTitle {
  id: string;
  name: string;
  description: string;
}

// Job Title enum for service categories
export enum JobTitleEnum {
  PHYSIOTHERAPY = 'PHYSIOTHERAPY',
  ATHLETIC_THERAPY = 'ATHLETIC_THERAPY',
  MASSAGE_THERAPY = 'MASSAGE_THERAPY',
  STRENGTH_AND_CONDITIONING_COACHING = 'STRENGTH_AND_CONDITIONING_COACHING',
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
  jobTitle?: {
    id: string;
    name: string;
  };
}

/**
 * Category type as returned by the API.
 */
export interface Category {
  id: string;
  name: string;
  description: string;
  jobTitle: {
    id: string;
    name: string;
  };
}

/**
 * Card info structure for freelancer display
 * Used in freelancer search results, cards, and listings
 */
export interface CardInfo {
  name: string;
  title?: string;
  mainService?: string;
  yearsOfExperience?: string;
  country?: string;
  averageRating?: number; // Can be undefined if no ratings
  totalRatings: number; // Always present (0 if no ratings) - backend returns 0 if no ratings
  patientStories?: number; // Legacy field, use totalRatings instead
  initials?: string;
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
  mainJobTitleId?: string;
  clinicAddress?: string;
  firstAidCertificateUrl?: string;
  verificationDocuments?: string[];
  // Consent fields (for signup)
  termsConsent?: boolean;
  privacyConsent?: boolean;
  gdprConsent?: boolean;
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
  mainJobTitleId?: string;
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
  description?: string; // Bio/description field
  // New fields for freelancers
  mainJobTitleId?: string | null; // Allow null to clear selection
  clinicAddress?: string;
}

// Backend response types
export interface BackendResponse<T> {
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
    freelancerData?: Record<string, unknown>;
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
  rating?: number;
  reviews: number;
  description: string;
  isFavorite?: boolean;
  // Additional properties for profile dialog
  profilePicture?: string;
  services?: Array<{
    id: string;
    name: string;
    description?: string;
    additionalPrice?: number;
    duration?: number;
  }>;
  location?: string;
  sessionTypes?: string[];
  pricing?: {
    // New pricing structure
    lowestPrice?: number;
    highestPrice?: number;
    currency?: string;
    hasPriceRange?: boolean;
    // Legacy pricing structure (for backward compatibility)
    online?: { min: number; max: number };
    office?: { min: number; max: number };
    home?: { min: number; max: number };
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
  slots?: Array<{ id: string; startTime: string; endTime: string; status: string }>;
  slotSummary?: {
    nextAvailable: { id: string; startTime: string; endTime: string; status: string } | null;
    totalSlots: number;
    availableSlots: number;
  };
  // Favorites information
  favoritedBy?: Array<{ id: string; name: string; email: string }>;
  // Card info
  cardInfo?: CardInfo;
  // Available slots count
  availableSlots?: number;
  totalSlots?: number;
  // Tier information
  planFeatures?: PlanFeatures | null;
  tier?: SubscriptionPlanType | null;
  // Subscription status (included in tier endpoint responses)
  subscriptionStatus?: {
    isTrial: boolean; // true if active trial freelancer
    isExpiredTrial: boolean; // true if trial expired (shouldn't appear in results)
    trialEndsAt: string | null; // ISO date string or null
    canAcceptBookings: boolean; // true for active trial or subscribed freelancers
    message: string | null; // Status message or null
  };
  // Stamp information (included in freelancer API responses when user is authenticated)
  stampInfo?: {
    currentStampCount: number;
    stampTarget: number;
    stampsRemaining: number;
    rewardReady: boolean;
    rewardReserved: boolean;
    discountPercentage: number;
    customConfigApplied: boolean;
  } | null;
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

export type View = 'month' | 'week' | 'work_week' | 'day' | 'agenda';

// Slot-related types
export interface SubscriptionInfo {
  planName: 'Bronze' | 'Silver' | 'Gold' | 'Trial' | null;
  maxSlots: number | null; // null = unlimited (Gold plan)
  activeSlotsCount: number; // Count of AVAILABLE + RESERVED + BOOKED slots
  remainingSlots: number | null; // null if unlimited, otherwise maxSlots - activeSlotsCount
  isUnlimited: boolean; // true for Gold plan
}

export interface SlotStats {
  totalSlots: number;
  bookedSlots: number;
  availableSlots: number;
  revenue: number;
  subscriptionInfo?: SubscriptionInfo;
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
  action?: 'created' | 'updated'; // Optional: indicates if slot was created or updated
  availableServices?: Service[]; // Legacy: Services available for this slot
  availableServiceCategories?: ServiceCategory[]; // Service categories available for this slot
  booking?: {
    id: string;
    status: string;
    totalAmount: number;
    subtotalAmount?: number;
    clientAddress?: string | null;
    notes?: string | null;
    client: {
      id: string;
      name: string;
      email: string;
      profilePicture?: string | null;
    };
    discountAmount?: number;
    discountPercentage?: number;
    services?: Array<{
      id: string;
      name: string;
      description?: string;
      additionalPrice?: number;
      duration?: number;
    }>; // Legacy: Services for backward compatibility
    serviceCategories?: Array<{
      id: string;
      name: string;
      description?: string;
      jobTitle?: {
        id: string;
        name: string;
      };
    }>; // Service categories booked for this appointment
    rating?: BookingRating | null; // The rating object if the booking has been rated
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
  locationType?: LocationType; // Optional - acts as default fallback for slots without explicit locationType
  locationId?: string;
  basePrice: number;
  duration: number;
  slots: Array<{
    startTime: string;
    endTime: string;
    locationType?: LocationType; // Optional - defaults to CLINIC if not provided
    serviceCategoryIds?: string[]; // Optional - per-slot service categories
  }>;
  serviceCategoryIds?: string[]; // Default fallback - Array of service category IDs
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
  serviceCategoryIds?: string[];
  locationType?: 'HOME' | 'CLINIC';
  clientAddress?: string;
  notes?: string;
}

// Backend DTOs matching the controller structure
export interface CreateSlotsDto {
  locationType?: LocationType; // Optional - acts as default fallback for slots without explicit locationType
  locationId?: string; // Added to support location selection
  basePrice?: number; // Optional - default price used when slots don't specify their own
  duration: number;
  slots: Array<{
    startTime: string;
    endTime: string;
    basePrice?: number; // Optional - per-slot price, falls back to parent basePrice if not specified
    locationType?: LocationType; // Optional - defaults to CLINIC if not provided
    serviceCategoryIds?: string[]; // Optional - per-slot service categories
  }>;
  serviceCategoryIds?: string[]; // Default fallback - Array of service category IDs
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
  name?: string;
}

export interface ApiResponse<T = unknown> {
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
export interface BackendApiResponse<T = unknown> {
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
  serviceCategoryIds?: string[];
  locationType?: 'HOME' | 'CLINIC';
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

export interface CompleteBookingDto {
  bookingId: string;
  completionNotes?: string;
}

// ============================================
// Core Rating Types
// ============================================

/**
 * Base rating object structure
 */
export interface Rating {
  id: string;
  bookingId: string;
  freelancerId: string;
  patientId: string;
  rating: number; // 1-5 stars
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

/**
 * Rating with patient information (used in freelancer ratings list)
 */
export interface RatingWithPatient extends Rating {
  patient: {
    id: string;
    name: string;
    email: string;
  };
  booking?: {
    id: string;
    slotId: string;
    status: string;
  };
}

/**
 * Rating with freelancer information (used in patient's ratings list)
 */
export interface RatingWithFreelancer extends Rating {
  freelancer: {
    id: string;
    name: string;
    email: string;
  };
  booking?: {
    id: string;
    slotId: string;
    status: string;
  };
}

/**
 * Legacy alias for RatingWithPatient (for backward compatibility)
 * @deprecated Use RatingWithPatient instead
 */
export interface RatingWithDetails extends RatingWithPatient {}

// ============================================
// Booking Rating Types
// ============================================

/**
 * Rating object as it appears in booking responses
 * (from /api/v1/booking/patient/all and /api/v1/slot/list)
 */
export interface BookingRating extends Rating {
  // Same as base Rating - no additional fields
}

/**
 * Booking rating eligibility response
 * (from GET /api/v1/ratings/booking/:bookingId)
 */
export interface BookingRatingEligibility {
  canBeRated: boolean;
  hasRating: boolean;
  rating: BookingRating | null;
  reason: string | null; // Reason why it can't be rated (if applicable)
}

/**
 * Legacy alias for BookingRatingEligibility (for backward compatibility)
 * @deprecated Use BookingRatingEligibility instead
 */
export interface RatingEligibility extends BookingRatingEligibility {}

/**
 * Create rating request
 * (for POST /api/v1/ratings)
 */
export interface CreateRatingRequest {
  bookingId: string;
  rating: number; // 1-5
}

/**
 * Legacy alias for CreateRatingRequest (for backward compatibility)
 * @deprecated Use CreateRatingRequest instead
 */
export interface CreateRatingDto extends CreateRatingRequest {}

/**
 * Create rating response
 * (from POST /api/v1/ratings)
 */
export interface CreateRatingResponse {
  success: true;
  message: 'Rating submitted successfully';
  data: Rating;
}

/**
 * Legacy alias for CreateRatingResponse (for backward compatibility)
 * @deprecated Use CreateRatingResponse instead
 */
export interface RatingResponse extends CreateRatingResponse {}

// ============================================
// Freelancer Rating Types
// ============================================

/**
 * Freelancer rating summary (used in freelancer card/list responses)
 * (from /api/v1/freelancer/search, /api/v1/freelancer/all, etc.)
 */
export interface FreelancerRatingSummary {
  averageRating: number | null; // Overall average rating (1-5)
  totalRatings: number; // Total number of ratings received
}

/**
 * Freelancer ratings list response
 * (from GET /api/v1/ratings/freelancer/:freelancerId)
 */
export interface FreelancerRatingsResponse {
  data: RatingWithPatient[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * Patient's ratings list response
 * (from GET /api/v1/ratings/my-ratings)
 */
export interface MyRatingsResponse {
  data: RatingWithFreelancer[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// ============================================
// API Query Parameters
// ============================================

/**
 * Query parameters for getting ratings
 */
export interface GetRatingsQuery {
  page?: number;
  limit?: number;
  minRating?: number; // Filter by minimum rating (1-5)
  maxRating?: number; // Filter by maximum rating (1-5)
}

/**
 * Legacy alias for GetRatingsQuery (for backward compatibility)
 * @deprecated Use GetRatingsQuery instead
 */
export interface GetRatingsParams extends GetRatingsQuery {}

// ============================================
// Type Guards & Helpers
// ============================================

/**
 * Type guard to check if a rating exists
 */
export function hasRating(rating: BookingRating | null | undefined): rating is BookingRating {
  return rating !== null && rating !== undefined;
}

/**
 * Type guard to check if freelancer has ratings
 */
export function hasFreelancerRatings(
  summary: FreelancerRatingSummary,
): summary is Required<FreelancerRatingSummary> {
  return summary.averageRating !== null && summary.totalRatings > 0;
}

/**
 * Helper to format rating display
 */
export function formatRating(rating: number | null | undefined): string {
  if (rating === null || rating === undefined) {
    return 'No ratings';
  }
  return `${rating.toFixed(1)} ⭐`;
}

/**
 * Helper to get rating percentage for display
 */
export function getRatingPercentage(rating: number | null): number {
  if (rating === null) return 0;
  return (rating / 5) * 100; // Convert 1-5 scale to 0-100%
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
  status: 'CONFIRMED' | 'CANCELLED' | 'RESCHEDULED' | 'COMPLETED';
  totalAmount: number;
  createdById: string;
  createdByRole: string;
  cancelledById?: string;
  cancelledReason?: string;
  rescheduledFromId?: string;
  canBeRated?: boolean; // From backend API - indicates if booking can be rated
  hasRating?: boolean; // From backend API - indicates if booking already has a rating
  rating?: BookingRating | null; // The rating object if the booking has been rated
  formData?: Record<string, unknown> | null;
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
      averageRating?: number; // Overall average rating from ratings
      cardInfo?: CardInfo;
    };
    location?: {
      id: string;
      name: string;
      address: string;
      type: string;
    };
  };
  services?: Array<{
    id: string;
    name: string;
    description: string;
    additionalPrice: number;
    duration: number;
  }>; // Legacy: Services for backward compatibility
  serviceCategories?: Array<{
    id: string;
    jobTitleId: string;
    name: string;
    description?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  }>; // Service categories booked for this appointment
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
  cardInfo: CardInfo;
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
  planFeatures?: PlanFeatures | null;
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
    [key: string]: unknown;
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

// Therapist Stamp System Types
export interface TherapistStampSummary {
  therapist: {
    id: string;
    name: string;
    profilePicture: string | null;
  };
  currentStampCount: number;
  stampTarget: number;
  stampsRemaining: number;
  rewardReady: boolean;
  rewardReserved: boolean;
  rewardCyclesCompleted: number;
  lastStampIssuedAt: string | null;
  rewardReadySince: string | null;
  discountPercentage: number;
  customConfigApplied: boolean;
}

export interface TherapistStampDetail {
  therapist: {
    id: string;
    name: string;
    profilePicture: string | null;
  };
  currentStampCount: number;
  stampTarget: number;
  stampsRemaining: number;
  rewardReady: boolean;
  rewardReserved: boolean;
  rewardReadySince: string | null;
  totalStampsEarned: number;
  rewardCyclesCompleted: number;
  lastStampIssuedAt: string | null;
  lastResetAt: string | null;
  histories: StampHistory[];
  discountPercentage: number;
  customConfigApplied: boolean;
}

export interface StampHistory {
  id: string;
  eventType:
    | 'STAMP_AWARDED'
    | 'REWARD_READY'
    | 'REWARD_RESERVED'
    | 'REWARD_CONSUMED'
    | 'REWARD_RELEASED'
    | 'STAMP_RESET';
  notes: string | null;
  bookingId: string | null;
  stampNumber: number | null;
  createdAt: string;
}

export interface TherapistStampConfig {
  therapistId: string;
  stampTarget: number | null;
  discountPercentage: number | null;
  isActive: boolean;
  customConfigApplied: boolean;
  createdAt: string;
  updatedAt: string;
  therapist?: {
    id: string;
    name: string;
    email: string;
    isActive: boolean;
  };
}

export interface CreateTherapistStampConfigDto {
  therapistId: string;
  stampTarget?: number;
  discountPercentage?: number;
  isActive?: boolean;
}

export interface UpdateTherapistStampConfigDto {
  stampTarget?: number;
  discountPercentage?: number;
  isActive?: boolean;
}

export interface BulkTherapistStampConfigDto {
  stampTarget: number;
  discountPercentage: number;
  isActive?: boolean;
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
  actionTaken?: 'WARNED' | 'SUSPENDED' | null;
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
export type PlanType = 'BRONZE' | 'SILVER' | 'GOLD';
export type SubscriptionPlanType = 'BRONZE' | 'SILVER' | 'GOLD';

export interface PlanFeatures {
  planType: SubscriptionPlanType;
  planDisplayName: string;
  searchPriority: number;
  canToggleReviews: boolean;
  analyticsAccess: boolean;
  monthlyReportEnabled: boolean;
  reminderClientEnabled: boolean;
  reminderFreelancerEnabled: boolean;
  notifyOnBooking: boolean;
  notifyOnCancellation: boolean;
  notifyOnReminder: boolean;
}

export type SubscriptionStatus =
  | 'TRIALING'
  | 'TRIAL_EXPIRED'
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
  userId?: string;
  planId?: string;
  plan?: SubscriptionPlan;
  status: SubscriptionStatus;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
  trialStart?: string;
  trialEnd?: string;
  trialEndsAt: string | null; // Required field from API
  canceledAt?: string | null;
  createdAt?: string;
  subscription?: Subscription | null; // Nested subscription details if active
  isInTrial?: boolean;
  trialExpired?: boolean; // true if trial has expired
  canCreateSlots: boolean; // Required field from API
  canAcceptBookings: boolean; // Required field from API
  slotsUsed: number; // Required field from API - Current active slots count
  slotsLimit: number | null; // Required field from API - Slot limit (null = unlimited)
  message: string; // Required field from API - Status message
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

// Tier Rotation Types
export type TierType = 'gold' | 'silver' | 'bronze';

export interface RotationInfo {
  method: 'daily';
  nextRotation: string; // ISO timestamp (UTC)
}

export interface TierFreelancerResponse {
  success: boolean;
  message: string;
  data: Expert[]; // Freelancer objects
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  featuredTier?: TierType;
  rotationInfo?: RotationInfo;
  meta: {
    timestamp: string;
    path: string;
  };
}

// Search filters interface
export interface SearchFilters {
  query: string;
  specialty: string[];
  serviceCategories: string[];
  location: string;
  priceMin?: number;
  priceMax?: number;
  sessionType: ('HOME' | 'CLINIC')[];
  availableThisWeek: boolean;
  verificationStatus: ('PENDING' | 'APPROVED' | 'REJECTED')[];
  minRating?: number;
  tier?: ('GOLD' | 'SILVER' | 'BRONZE')[];
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

// Freelancer Dashboard Types
export interface TrendData {
  value: number;
  trendPercentage: number;
  trendDirection: 'up' | 'down';
  sparklineData: number[];
}

export interface WeeklyAppointments {
  monday: number;
  tuesday: number;
  wednesday: number;
  thursday: number;
  friday: number;
  saturday: number;
  sunday: number;
}

export interface FreelancerDashboardOverview {
  todayBookings: number;
  todayRevenue: number; // Revenue in cents/base currency
  unreadMessages: number;
  growthPercentage: number;
  totalAppointments: TrendData;
  clientRating: TrendData;
  newClients: TrendData;
  weeklyRevenue: TrendData;
  weeklyAppointments: {
    currentWeek: WeeklyAppointments;
    lastWeek: WeeklyAppointments;
  };
}

export interface FreelancerDashboardOverviewResponse {
  success: boolean;
  message?: string;
  data: FreelancerDashboardOverview;
  meta?: {
    timestamp?: string;
    path?: string;
  };
}
