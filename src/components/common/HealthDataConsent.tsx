'use client';

import { AlertCircle, Info, Shield } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import LoadingSpinner from '@/components/ui/loading-spinner';
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
}

const CONSENT_TYPE_INFO: Record<
  ConsentType,
  { title: string; description: string; dataTypes: string[] }
> = {
  MEDICAL_HISTORY: {
    title: 'Medical History Data Consent',
    description:
      'By consenting, you allow us to collect and process your medical history information for healthcare service delivery.',
    dataTypes: ['Medical history forms', 'Health questionnaires', 'Pre-appointment information'],
  },
  SOAP_NOTES: {
    title: 'SOAP Notes Data Consent',
    description:
      'By consenting, you allow healthcare professionals to create and store SOAP (Subjective, Objective, Assessment, Plan) notes documenting your appointments.',
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
      'By consenting, you allow us to store and process your first aid certificate for professional verification purposes.',
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
}: HealthDataConsentProps) {
  const [consentGranted, setConsentGranted] = useState(initialConsentStatus?.granted || false);
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
    // Only run once on mount or when consentType changes
    if (hasInitializedRef.current) {
      return;
    }

    // Only fetch if initialConsentStatus not provided
    if (!initialConsentStatus) {
      checkExistingConsent();
    } else {
      // Initialize from prop (only once)
      setConsentGranted(initialConsentStatus.granted);
      setConsentTimestamp(initialConsentStatus.grantedAt);
      setIsLoading(false);
      onConsentChange?.(initialConsentStatus.granted);
      // Store a reference to prevent re-initialization
      lastConsentStatusRef.current = `${initialConsentStatus.granted}-${initialConsentStatus.grantedAt}`;
    }
    hasInitializedRef.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [consentType]); // Only depend on consentType

  // Separate effect to sync when initialConsentStatus prop actually changes (value changes, not reference)
  useEffect(() => {
    if (!initialConsentStatus || !hasInitializedRef.current) {
      return;
    }

    const statusKey = `${initialConsentStatus.granted}-${initialConsentStatus.grantedAt}`;
    // Only update if the actual values changed (not just the object reference)
    if (lastConsentStatusRef.current !== statusKey) {
      setConsentGranted(initialConsentStatus.granted);
      setConsentTimestamp(initialConsentStatus.grantedAt);
      lastConsentStatusRef.current = statusKey;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialConsentStatus?.granted, initialConsentStatus?.grantedAt]); // Only depend on actual values, not the object

  const checkExistingConsent = async () => {
    try {
      setIsLoading(true);
      const response = await getHealthDataConsent();
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

  return (
    <div className={`space-y-4 ${className}`}>
      <Alert className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950">
        <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <AlertTitle className="text-blue-900 dark:text-blue-100">{consentInfo.title}</AlertTitle>
        <AlertDescription className="text-blue-800 dark:text-blue-200">
          <p className="mb-2">{consentInfo.description}</p>
          <div className="mt-3 space-y-1">
            <p className="font-semibold">This consent covers:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              {consentInfo.dataTypes.map((type, index) => (
                <li key={index}>{type}</li>
              ))}
            </ul>
          </div>
        </AlertDescription>
      </Alert>

      {showDisclaimer && (
        <Alert className="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950">
          <Info className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <AlertTitle className="text-amber-900 dark:text-amber-100">
            Platform Disclaimer
          </AlertTitle>
          <AlertDescription className="text-amber-800 dark:text-amber-200">
            <p>
              TheraSynced is a booking platform connecting you with healthcare professionals. We do
              not provide medical services, advice, diagnosis, or treatment. All healthcare services
              are provided by independent practitioners.
            </p>
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-4">
        <div className="space-y-2">
          <div className="flex items-start space-x-3">
            <Checkbox
              id={`consent-${consentType}`}
              checked={consentGranted}
              onCheckedChange={handleConsentChange}
              disabled={isSaving}
              aria-required={required}
              className="mt-1"
            />
            <div className="flex-1 space-y-1">
              <Label
                htmlFor={`consent-${consentType}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                I explicitly consent to the processing of my health data as described above
                {required && <span className="text-red-600 dark:text-red-400 ml-1">*</span>}
              </Label>
              <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                <p>
                  <strong>Data Retention:</strong> Health data will be retained for 7 years as
                  required by Irish law for medical records.
                </p>
                <p>
                  <strong>Your Rights:</strong> You can withdraw this consent at any time through
                  your{' '}
                  <a
                    href="/dashboard/data-rights"
                    className="text-primary hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Data Rights
                  </a>{' '}
                  page or by contacting us at privacy@therasynced.com.
                </p>
                <p>
                  <strong>Legal Basis:</strong> GDPR Article 9(2)(a) - Explicit Consent for Special
                  Category Data (Health Data)
                </p>
                <p>
                  For more information, see our{' '}
                  <a
                    href="/privacy"
                    className="text-primary hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Privacy Policy
                  </a>
                  .
                </p>
              </div>
            </div>
          </div>
        </div>

        {consentGranted && consentTimestamp && (
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              <strong>Consent granted:</strong> {new Date(consentTimestamp).toLocaleString()}
            </p>
          </div>
        )}

        {!consentGranted && required && (
          <Alert variant="destructive" className="mt-3">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Consent Required</AlertTitle>
            <AlertDescription>
              You must grant explicit consent to proceed with this action involving health data.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}
