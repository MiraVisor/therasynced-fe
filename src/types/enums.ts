/**
 * Enums and type unions for the application
 */

export enum ROLES {
  PATIENT = 'PATIENT',
  FREELANCER = 'FREELANCER',
  TEAM = 'TEAM',
  ADMIN = 'ADMIN',
}

export enum JobTitleEnum {
  PHYSIOTHERAPY = 'PHYSIOTHERAPY',
  ATHLETIC_THERAPY = 'ATHLETIC_THERAPY',
  MASSAGE_THERAPY = 'MASSAGE_THERAPY',
  STRENGTH_AND_CONDITIONING_COACHING = 'STRENGTH_AND_CONDITIONING_COACHING',
}

export enum LocationType {
  HOME = 'HOME',
  CLINIC = 'CLINIC',
}

export type RoleType = 'PATIENT' | 'FREELANCER' | 'ADMIN';

export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

export type FirstAidCertificateStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type FreelancerFileType =
  | 'CERTIFICATE'
  | 'VERIFICATION_DOCUMENT'
  | 'PROFILE_PICTURE'
  | 'OTHER';

export type View = 'month' | 'week' | 'work_week' | 'day' | 'agenda';

export type PlanType = 'BRONZE' | 'SILVER' | 'GOLD';
export type SubscriptionPlanType = 'BRONZE' | 'SILVER' | 'GOLD';

export type SubscriptionStatus =
  | 'TRIALING'
  | 'TRIAL_EXPIRED'
  | 'ACTIVE'
  | 'PAST_DUE'
  | 'CANCELED'
  | 'UNPAID'
  | 'INACTIVE';

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

export type NotificationType =
  | 'APPOINTMENT'
  | 'BOOKING'
  | 'BOOKING_CREATED'
  | 'BOOKING_CANCELLED'
  | 'BOOKING_CONFIRMED'
  | 'BOOKING_RESCHEDULED'
  | 'SLOT_CREATED'
  | 'SLOT_UPDATED'
  | 'SLOT_DELETED'
  | 'MESSAGE'
  | 'RATING'
  | 'VERIFICATION'
  | 'SUBSCRIPTION'
  | 'PAYMENT'
  | 'SYSTEM'
  | 'OTHER';

export type NotificationPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type LoyaltyTier = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';

export type TierType = 'gold' | 'silver' | 'bronze';
