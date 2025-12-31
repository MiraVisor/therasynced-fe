/**
 * Unified Consent Service
 *
 * This service handles all consent operations through a unified API.
 * It replaces the scattered consent implementations with a single source of truth.
 */
import type {
  AllConsentsResponse,
  ConsentType,
  ConsentUpdateRequest,
  ConsentUpdateResponse,
} from '@/types/consent';

import api from './api';
import { ENDPOINTS } from './endpoints';

/**
 * Get all consents for the current user
 * @returns Promise with all consent statuses
 */
export const getAllConsents = async (): Promise<AllConsentsResponse> => {
  const response = await api.get<AllConsentsResponse>(ENDPOINTS.consent.all);
  return response.data;
};

/**
 * Update a single consent
 * @param consentType - The type of consent to update
 * @param granted - Whether consent is granted
 * @returns Promise with updated consent
 */
export const updateConsent = async (
  consentType: ConsentType,
  granted: boolean,
): Promise<ConsentUpdateResponse> => {
  const request: ConsentUpdateRequest = { consentType, granted };
  const response = await api.post<ConsentUpdateResponse>(ENDPOINTS.consent.all, request);
  return response.data;
};

/**
 * Update multiple consents at once
 * @param consents - Array of consent updates
 * @returns Promise with updated consents
 */
export const updateMultipleConsents = async (
  consents: ConsentUpdateRequest[],
): Promise<AllConsentsResponse> => {
  const response = await api.post<AllConsentsResponse>(ENDPOINTS.consent.all, { consents });
  return response.data;
};

/**
 * Check if user has granted a specific consent
 * @param consents - Array of consent statuses
 * @param consentType - The consent type to check
 * @returns true if consent is granted and not withdrawn
 */
export const hasConsent = (
  consents: Array<{ consentType: string; granted: boolean; withdrawnAt: string | null }>,
  consentType: ConsentType,
): boolean => {
  const consent = consents.find((c) => c.consentType === consentType);
  return consent ? consent.granted && !consent.withdrawnAt : false;
};
