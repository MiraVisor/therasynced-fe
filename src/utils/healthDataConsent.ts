import {
  type HealthDataConsentRequest,
  getHealthDataConsent,
  updateHealthDataConsent,
} from '@/redux/api/dataRightsApi';

export type ConsentType = 'MEDICAL_HISTORY' | 'SOAP_NOTES' | 'COMPLAINTS' | 'FIRST_AID_CERTIFICATE';

export interface ConsentStatus {
  consentType: string;
  granted: boolean;
  grantedAt: string | null;
  withdrawnAt: string | null;
}

/**
 * Check if consent exists and is valid for a specific consent type
 * @param consentType - The type of consent to check
 * @returns Promise<boolean> - True if consent is granted and not withdrawn
 */
export async function checkHealthDataConsent(consentType: ConsentType): Promise<boolean> {
  try {
    const response = await getHealthDataConsent();
    const consent = response.data.consents.find((c) => c.consentType === consentType);
    return consent ? consent.granted && !consent.withdrawnAt : false;
  } catch (error) {
    console.error('Error checking health data consent:', error);
    return false;
  }
}

/**
 * Require consent before allowing an action
 * Throws an error if consent is not granted
 * @param consentType - The type of consent required
 * @throws Error if consent is not granted
 */
export async function requireHealthDataConsent(consentType: ConsentType): Promise<void> {
  const hasConsent = await checkHealthDataConsent(consentType);
  if (!hasConsent) {
    throw new Error(
      `Explicit consent for ${consentType} is required. Please grant consent before proceeding.`,
    );
  }
}

/**
 * Get all consent statuses
 * @returns Promise<ConsentStatus[]> - Array of all consent statuses
 */
export async function getConsentStatus(): Promise<ConsentStatus[]> {
  try {
    const response = await getHealthDataConsent();
    return response.data.consents;
  } catch (error) {
    console.error('Error getting consent status:', error);
    return [];
  }
}

/**
 * Grant consent for a specific type
 * @param consentType - The type of consent to grant
 * @returns Promise<boolean> - True if successful
 */
export async function grantConsent(consentType: ConsentType): Promise<boolean> {
  try {
    const request: HealthDataConsentRequest = {
      consentType,
      granted: true,
    };
    await updateHealthDataConsent(request);
    return true;
  } catch (error) {
    console.error('Error granting consent:', error);
    return false;
  }
}

/**
 * Withdraw consent for a specific type
 * @param consentType - The type of consent to withdraw
 * @returns Promise<boolean> - True if successful
 */
export async function withdrawConsent(consentType: ConsentType): Promise<boolean> {
  try {
    const request: HealthDataConsentRequest = {
      consentType,
      granted: false,
    };
    await updateHealthDataConsent(request);
    return true;
  } catch (error) {
    console.error('Error withdrawing consent:', error);
    return false;
  }
}
