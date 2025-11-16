// Main admin service - re-exports all admin services
export { default as adminJobTitleService } from './adminJobTitleService';
export { default as adminServiceCategoryService } from './adminServiceCategoryService';
export { default as adminVerificationService } from './adminVerificationService';
export { default as adminComplaintService } from './adminComplaintService';
export { default as adminSubscriptionService } from './adminSubscriptionService';

// Export all types
export type {
  CreateJobTitleDto,
  UpdateJobTitleDto,
  JobTitleResponse,
  JobTitlesListResponse,
} from './adminJobTitleService';

export type {
  CreateServiceCategoryDto,
  UpdateServiceCategoryDto,
  ServiceCategoryResponse,
  GroupedServiceCategoriesResponse,
} from './adminServiceCategoryService';

export type {
  ApproveVerificationDto,
  RejectVerificationDto,
  ApproveCertificateDto,
  RejectCertificateDto,
  VerificationDetailsResponse,
  PendingVerificationResponse,
} from './adminVerificationService';

export type {
  UpdateComplaintStatusDto,
  TakeActionDto,
  ComplaintListResponse,
} from './adminComplaintService';

export type {
  OverrideAccessDto,
  SubscriptionResponse,
  SubscriptionStatsResponse,
  UpdateSubscriptionPlanDto,
} from './adminSubscriptionService';
