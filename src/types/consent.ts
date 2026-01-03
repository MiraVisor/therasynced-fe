/**
 * Unified Consent Management Types
 *
 * This file defines all consent types used across the application.
 * Most data processing is covered by general GDPR consent.
 * Only special category data (health data) requires explicit separate consent.
 *
 * NOTE: PAYMENT_DATA has been removed - billing authorization is now handled
 * separately by the backend and is not part of the consent management system.
 */

// All consent types in the system
// NOTE: PAYMENT_DATA has been removed from the API - billing authorization is handled separately
export type ConsentType =
  // Required for all users
  | 'TERMS_OF_SERVICE'
  | 'PRIVACY_POLICY'
  | 'GDPR_DATA_PROCESSING'
  // Freelancer-specific
  | 'FIRST_AID_CERTIFICATE'
  | 'VERIFICATION_DOCUMENTS';

// Consent status for a single consent type
export interface ConsentStatus {
  consentType: ConsentType;
  granted: boolean;
  grantedAt: string | null;
  withdrawnAt: string | null;
  isRequired?: boolean; // Indicates if consent is required (from API)
  isReadOnly?: boolean; // Indicates if consent can be modified (from API)
}

// Request to update a consent
export interface ConsentUpdateRequest {
  consentType: ConsentType;
  granted: boolean;
}

// Request to update multiple consents at once
export interface BulkConsentUpdateRequest {
  consents: ConsentUpdateRequest[];
}

// Response from getting all consents
export interface AllConsentsResponse {
  success: boolean;
  message: string;
  data: {
    consents: ConsentStatus[];
  };
  meta?: {
    timestamp: string;
    path: string;
  };
}

// Response from updating a consent
export interface ConsentUpdateResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    userId: string;
    consentType: ConsentType;
    granted: boolean;
    grantedAt: string;
    withdrawnAt: string | null;
  };
  meta?: {
    timestamp: string;
    path: string;
  };
}

// Consent information for UI display
export interface ConsentInfo {
  type: ConsentType;
  title: string;
  description: string;
  required: boolean;
  roles: ('PATIENT' | 'FREELANCER')[]; // Which roles need this consent
  category: 'required' | 'health' | 'financial'; // Category for grouping
}

// Consent type metadata
export const CONSENT_INFO: Record<ConsentType, ConsentInfo> = {
  TERMS_OF_SERVICE: {
    type: 'TERMS_OF_SERVICE',
    title: 'Terms of Service',
    description: 'I agree to the Terms of Service',
    required: true,
    roles: ['PATIENT', 'FREELANCER'],
    category: 'required',
  },
  PRIVACY_POLICY: {
    type: 'PRIVACY_POLICY',
    title: 'Privacy Policy',
    description: 'I have read and agree to the Privacy Policy',
    required: true,
    roles: ['PATIENT', 'FREELANCER'],
    category: 'required',
  },
  GDPR_DATA_PROCESSING: {
    type: 'GDPR_DATA_PROCESSING',
    title: 'GDPR Data Processing',
    description:
      'I consent to the processing of my personal data in accordance with GDPR. This includes processing data for bookings, messages, appointments, and general service delivery.',
    required: true,
    roles: ['PATIENT', 'FREELANCER'],
    category: 'required',
  },
  FIRST_AID_CERTIFICATE: {
    type: 'FIRST_AID_CERTIFICATE',
    title: 'First Aid Certificate Data Consent',
    description:
      'I consent to the storage and processing of my first aid certificate for professional verification purposes. May include health-related information; processed only for professional verification. Processed as special category data under GDPR Article 9 where applicable.',
    required: false,
    roles: ['FREELANCER'],
    category: 'health',
  },
  VERIFICATION_DOCUMENTS: {
    type: 'VERIFICATION_DOCUMENTS',
    title: 'Verification Documents Consent',
    description:
      'I consent to the storage and processing of my professional verification documents (licenses, qualifications, certifications) for professional verification purposes. These documents will be reviewed by administrators.',
    required: false,
    roles: ['FREELANCER'],
    category: 'required',
  },
};

// Helper to get consents required for a role (GDPR consents only)
export function getRequiredConsentsForRole(role: 'PATIENT' | 'FREELANCER'): ConsentType[] {
  return Object.values(CONSENT_INFO)
    .filter((info) => info.roles.includes(role) && info.required)
    .map((info) => info.type);
}

// Helper to get all consents for a role (including optional)
export function getAllConsentsForRole(role: 'PATIENT' | 'FREELANCER'): ConsentType[] {
  return Object.values(CONSENT_INFO)
    .filter((info) => info.roles.includes(role))
    .map((info) => info.type);
}

// Helper to get only GDPR consents
export function getGDPRConsentsForRole(role: 'PATIENT' | 'FREELANCER'): ConsentType[] {
  return Object.values(CONSENT_INFO)
    .filter((info) => info.roles.includes(role))
    .map((info) => info.type);
}

// Helper to check if a consent type is a required, non-withdrawable consent
// These are contractual agreements that cannot be withdrawn without account deletion
export function isNonWithdrawableRequiredConsent(type: ConsentType): boolean {
  const requiredNonWithdrawable: ConsentType[] = [
    'TERMS_OF_SERVICE',
    'PRIVACY_POLICY',
    'GDPR_DATA_PROCESSING',
  ];
  return requiredNonWithdrawable.includes(type);
}
