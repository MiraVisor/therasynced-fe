'use client';

import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { useEffect } from 'react';
import { toast } from 'react-toastify';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { useHealthDataConsent, useUpdateHealthDataConsent } from '@/hooks/queries/useDataRights';
import type { HealthDataConsentRequest } from '@/types/types';

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
  isLoading?: boolean; // External loading state (e.g., when fetching consent statuses)
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
  isLoading: externalLoading = false,
}: HealthDataConsentProps) {
  const consentInfo = CONSENT_TYPE_INFO[consentType];

  const {
    data: consentResponse,
    isLoading: isLoadingConsent,
    error: consentError,
  } = useHealthDataConsent(userId, !disableApiCall && !initialConsentStatus);

  const updateConsentMutation = useUpdateHealthDataConsent();

  const consentFromApi = consentResponse?.data?.consents?.find(
    (c) => c.consentType === consentType,
  );
  const apiConsentGranted = consentFromApi?.granted && !consentFromApi?.withdrawnAt;

  const consentGranted =
    initialConsentStatus?.granted ?? (disableApiCall ? false : (apiConsentGranted ?? false));
  const consentTimestamp =
    initialConsentStatus?.grantedAt || (disableApiCall ? null : consentFromApi?.grantedAt || null);
  const isLoading =
    externalLoading || (!initialConsentStatus && !disableApiCall && isLoadingConsent);
  const isSaving = updateConsentMutation.isPending;

  // Sync consent status when it changes
  useEffect(() => {
    if (consentGranted !== null) {
      onConsentChange?.(consentGranted);
    }
  }, [consentGranted, onConsentChange]);

  const handleConsentChange = async (granted: boolean) => {
    if (isSaving) return;

    try {
      const request: HealthDataConsentRequest = {
        consentType,
        granted,
      };

      await updateConsentMutation.mutateAsync(request);

      if (granted) {
        toast.success('Consent granted successfully');
      } else {
        toast.info('Consent withdrawn');
      }

      onConsentChange?.(granted);
    } catch (error: unknown) {
      // Error handled by mutation
      console.error('Health data consent error:', error);
    }
  };

  // Don't show full loader - instead show disabled radio buttons with small loader

  // Simple banner view for freelancers checking client consent (userId provided)
  // Backend no longer requires booking verification - simplified endpoint
  if (userId) {
    // Handle any errors
    if (consentError) {
      return (
        <div className={className}>
          <Alert variant="destructive" role="alert">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Unable to Check Consent</AlertTitle>
            <AlertDescription>
              {consentError instanceof Error
                ? consentError.message
                : 'Failed to load consent information. Please try again.'}
            </AlertDescription>
          </Alert>
        </div>
      );
    }

    return (
      <div className={className}>
        {consentGranted ? (
          <Alert className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950">
            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertTitle className="text-green-900 dark:text-green-100">
              Client Consent Granted
            </AlertTitle>
            <AlertDescription className="text-green-800 dark:text-green-200">
              The client has granted consent for {consentType.replace(/_/g, ' ').toLowerCase()} data
              processing.
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
              The client must grant consent for {consentType.replace(/_/g, ' ').toLowerCase()} data
              processing before this form can be submitted. Please ask the client to grant consent
              in their account settings.
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
          <div className="relative">
            <input
              type="radio"
              id={`consent-allow-${consentType}`}
              name={`consent-${consentType}`}
              checked={consentGranted === true}
              onChange={() => handleConsentChange(true)}
              disabled={isSaving || isLoading}
              className="h-4 w-4 text-primary cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
            />
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-3 w-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
          <Label
            htmlFor={`consent-allow-${consentType}`}
            className={`text-sm font-medium ${
              isLoading || isSaving ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
            }`}
          >
            I consent to data processing
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              type="radio"
              id={`consent-deny-${consentType}`}
              name={`consent-${consentType}`}
              checked={consentGranted === false}
              onChange={() => handleConsentChange(false)}
              disabled={isSaving || isLoading}
              className="h-4 w-4 text-primary cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
            />
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-3 w-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
          <Label
            htmlFor={`consent-deny-${consentType}`}
            className={`text-sm font-medium ${
              isLoading || isSaving ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
            }`}
          >
            I do not consent
          </Label>
        </div>
        {isSaving && !isLoading && <LoadingSpinner size="sm" />}
      </div>
      {consentGranted && consentTimestamp && !isLoading && (
        <p className="text-xs text-gray-500 mt-2">
          Consent granted on {new Date(consentTimestamp).toLocaleDateString()}
        </p>
      )}
    </div>
  );
}
