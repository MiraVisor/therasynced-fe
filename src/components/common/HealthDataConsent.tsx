'use client';

import { AlertCircle, CheckCircle2, Info, Shield } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { getDecodedToken } from '@/lib/utils';
import {
  type HealthDataConsentRequest,
  getHealthDataConsent,
  updateHealthDataConsent,
} from '@/redux/api/dataRightsApi';

export type ConsentType = 'MEDICAL_HISTORY' | 'SOAP_NOTES' | 'COMPLAINTS' | 'FIRST_AID_CERTIFICATE';

interface HealthDataConsentProps {
  consentType: ConsentType;
  onConsentChange?: (granted: boolean) => void;
  required?: boolean;
  showDisclaimer?: boolean;
  className?: string;
  initialConsentStatus?: { granted: boolean; grantedAt: string | null };
  userId?: string; // To check another user's consent (for freelancers checking client consent)
  description?: string; // Custom description text
  compact?: boolean;
  showTitle?: boolean; // Add this prop
  disableApiCall?: boolean; // If true, never calls the API (for data rights page where data comes from status endpoint)
}

const CONSENT_TYPE_INFO: Record<
  ConsentType,
  { title: string; description: string; dataTypes: string[] }
> = {
  MEDICAL_HISTORY: {
    title: 'Medical History Data Consent',
    description:
      'By consenting, you allow us to collect and process your medical history information for healthcare service delivery.',
    dataTypes: [
      'Medical history forms',
      'ROM Assessment forms',
      'Health questionnaires',
      'Pre-appointment information',
    ],
  },
  SOAP_NOTES: {
    title: 'SOAP Notes Data Consent',
    description:
      'By consenting, you allow healthcare professionals to create and store SOAP (Subjective, Objective, Assessment, Plan) notes documenting your appointments. This includes clinical documentation created by healthcare professionals during appointments.',
    dataTypes: ['Clinical notes', 'Treatment plans', 'Assessment documentation'],
  },
  COMPLAINTS: {
    title: 'Health-Related Complaints Data Consent',
    description:
      'By consenting, you allow us to process health-related information included in complaints for service quality and safety purposes.',
    dataTypes: ['Complaint descriptions', 'Health-related concerns', 'Safety reports'],
  },
  FIRST_AID_CERTIFICATE: {
    title: 'First Aid Certificate Data Consent',
    description:
      'By consenting, you allow us to store and process your first aid certificate for professional verification purposes. This consent is for healthcare professionals only.',
    dataTypes: ['First aid certificates', 'Professional qualifications', 'Verification documents'],
  },
};

export function HealthDataConsent({
  consentType,
  onConsentChange,
  required = true,
  showDisclaimer = true,
  className,
  initialConsentStatus,
  userId,
  description,
  compact,
  showTitle,
  disableApiCall = false,
}: HealthDataConsentProps) {
  const [consentGranted, setConsentGranted] = useState<boolean | null>(
    initialConsentStatus?.granted ?? null,
  );
  const [isLoading, setIsLoading] = useState(!initialConsentStatus);
  const [isSaving, setIsSaving] = useState(false);
  const [consentTimestamp, setConsentTimestamp] = useState<string | null>(
    initialConsentStatus?.grantedAt || null,
  );

  const consentInfo = CONSENT_TYPE_INFO[consentType];

  // Use refs to track initialization and last values to prevent unnecessary re-runs
  const hasInitializedRef = useRef(false);
  const lastConsentStatusRef = useRef<string | null>(null);

  useEffect(() => {
    // Reset initialization when userId or consentType changes
    if (hasInitializedRef.current && userId !== undefined && !disableApiCall) {
      // If userId is provided and we've initialized, check consent again (only if API calls are enabled)
      checkExistingConsent();
      return;
    }

    // Only run once on mount or when consentType/userId changes
    if (hasInitializedRef.current) {
      return;
    }

    // Only fetch if initialConsentStatus not provided AND API calls are not disabled
    if (!initialConsentStatus && !disableApiCall) {
      checkExistingConsent();
    } else if (initialConsentStatus) {
      // Initialize from prop (only once)
      setConsentGranted(initialConsentStatus.granted);
      setConsentTimestamp(initialConsentStatus.grantedAt);
      setIsLoading(false);
      onConsentChange?.(initialConsentStatus.granted);
      lastConsentStatusRef.current = `${initialConsentStatus.granted}-${initialConsentStatus.grantedAt}`;
    } else if (disableApiCall) {
      // If API is disabled and no initial status, default to false
      setConsentGranted(false);
      setConsentTimestamp(null);
      setIsLoading(false);
      onConsentChange?.(false);
    }
    hasInitializedRef.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [consentType, userId]); // Add userId to dependencies

  // Separate effect to sync when initialConsentStatus prop actually changes (value changes, not reference)
  useEffect(() => {
    if (!initialConsentStatus || !hasInitializedRef.current) {
      return;
    }

    const statusKey = `${initialConsentStatus.granted}-${initialConsentStatus.grantedAt}`;
    // Only update if the actual values changed (not just the object reference)
    if (lastConsentStatusRef.current !== statusKey) {
      setConsentGranted(initialConsentStatus.granted ?? null);
      setConsentTimestamp(initialConsentStatus.grantedAt);
      lastConsentStatusRef.current = statusKey;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialConsentStatus?.granted, initialConsentStatus?.grantedAt]); // Only depend on actual values, not the object

  const checkExistingConsent = async () => {
    // Don't call API if disabled
    if (disableApiCall) {
      setIsLoading(false);
      setConsentGranted(false);
      onConsentChange?.(false);
      return;
    }

    try {
      setIsLoading(true);
      // Get current user ID if userId is not provided (for checking own consent)
      let targetUserId = userId;
      if (targetUserId === undefined) {
        const decodedToken = getDecodedToken();
        if (!decodedToken?.sub) {
          console.error('Unable to get current user ID');
          setConsentGranted(false);
          onConsentChange?.(false);
          setIsLoading(false);
          return;
        }
        targetUserId = decodedToken.sub;
      }

      const response = await getHealthDataConsent(targetUserId);
      const consent = response.data.consents.find((c) => c.consentType === consentType);
      if (consent && consent.granted && !consent.withdrawnAt) {
        setConsentGranted(true);
        setConsentTimestamp(consent.grantedAt);
        onConsentChange?.(true);
      } else {
        setConsentGranted(false);
        setConsentTimestamp(null);
        onConsentChange?.(false);
      }
    } catch (error) {
      console.error('Error checking consent:', error);
      // If API fails, default to no consent
      setConsentGranted(false);
      onConsentChange?.(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConsentChange = async (granted: boolean) => {
    if (isSaving) return;

    try {
      setIsSaving(true);
      const request: HealthDataConsentRequest = {
        consentType,
        granted,
      };

      await updateHealthDataConsent(request);

      setConsentGranted(granted);
      if (granted) {
        setConsentTimestamp(new Date().toISOString());
        toast.success('Consent granted successfully');
      } else {
        setConsentTimestamp(null);
        toast.info('Consent withdrawn');
      }

      onConsentChange?.(granted);
    } catch (error: any) {
      console.error('Error updating consent:', error);
      toast.error(error?.message || 'Failed to update consent. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center p-4 ${className}`}>
        <LoadingSpinner size="sm" />
      </div>
    );
  }

  // Simple banner view for freelancers checking client consent (userId provided)
  if (userId) {
    return (
      <div className={className}>
        {consentGranted ? (
          <Alert className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950">
            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertTitle className="text-green-900 dark:text-green-100">Client Consent Granted</AlertTitle>
            <AlertDescription className="text-green-800 dark:text-green-200">
              The client has granted consent for {consentType.replace(/_/g, ' ').toLowerCase()} data processing.
              {consentTimestamp && (
                <span className="block mt-1 text-xs">
                  Granted on: {new Date(consentTimestamp).toLocaleString()}
                </span>
              )}
            </AlertDescription>
          </Alert>
        ) : (
          <Alert variant="destructive" role="alert">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Client Consent Required</AlertTitle>
            <AlertDescription>
              The client must grant consent for {consentType.replace(/_/g, ' ').toLowerCase()} data processing before this form can be submitted. Please ask the client to grant consent in their account settings.
            </AlertDescription>
          </Alert>
        )}
      </div>
    );
  }

  // Full consent UI for users managing their own consent (no userId)
  return (
    <div className={`${className}`}>
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <input
            type="radio"
            id={`consent-allow-${consentType}`}
            name={`consent-${consentType}`}
            checked={consentGranted === true}
            onChange={() => handleConsentChange(true)}
            disabled={isSaving}
            className="h-4 w-4 text-primary cursor-pointer"
          />
          <Label
            htmlFor={`consent-allow-${consentType}`}
            className="text-sm font-medium cursor-pointer"
          >
            I consent to data processing
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="radio"
            id={`consent-deny-${consentType}`}
            name={`consent-${consentType}`}
            checked={consentGranted === false}
            onChange={() => handleConsentChange(false)}
            disabled={isSaving}
            className="h-4 w-4 text-primary cursor-pointer"
          />
          <Label
            htmlFor={`consent-deny-${consentType}`}
            className="text-sm font-medium cursor-pointer"
          >
            I do not consent
          </Label>
        </div>
        {isSaving && <LoadingSpinner size="sm" />}
      </div>
      {consentGranted && consentTimestamp && (
        <p className="text-xs text-gray-500 mt-2">
          Consent granted on {new Date(consentTimestamp).toLocaleDateString()}
        </p>
      )}
    </div>
  );
}
