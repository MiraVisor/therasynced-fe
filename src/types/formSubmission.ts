import { FormType } from './formTypes';

/**
 * Form submission request payload
 */
export interface SubmitFormRequest {
  formType: 'SOAP_NOTE' | 'MEDICAL_HISTORY' | 'ROM_ASSESSMENT';
  formData: Record<string, any>;
  submittedAt?: string; // ISO date string, will be set by backend if not provided
}

/**
 * Complete form submission object returned from API
 */
export interface FormSubmission {
  id: string;
  bookingId: string;
  formType: 'SOAP_NOTE' | 'MEDICAL_HISTORY' | 'ROM_ASSESSMENT';
  formData: Record<string, any>;
  submittedAt: string; // ISO date string
  submittedBy: string; // User ID of the freelancer who submitted
  version: string | null; // Form version if applicable
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

/**
 * Lightweight form submission object for list views
 */
export interface FormSubmissionListItem {
  id: string;
  formType: string;
  submittedAt: string; // ISO date string
  submittedBy: string; // User ID
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

/**
 * Update form submission request payload
 */
export interface UpdateFormSubmissionRequest {
  formData: Record<string, any>;
}

/**
 * API response wrapper for form submissions
 */
export interface FormSubmissionResponse {
  data: FormSubmission;
  message?: string;
}

/**
 * API response wrapper for form submission list
 */
export interface FormSubmissionListResponse {
  data: FormSubmission[];
  message?: string;
}
