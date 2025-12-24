'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuthZustand';
import type { ConsentType } from '@/types/consent';
import { CONSENT_INFO, getRequiredConsentsForRole } from '@/types/consent';

import { SignupFormData } from '../MultiStepSignup';

export function ConsentStep() {
  const { setValue, watch: _watch } = useFormContext<SignupFormData>();
  const { role } = useAuth();

  // Local state for consents during signup (user not authenticated yet)
  const [localConsents, setLocalConsents] = useState<Record<ConsentType, boolean>>({
    TERMS_OF_SERVICE: false,
    PRIVACY_POLICY: false,
    GDPR_DATA_PROCESSING: false,
    FIRST_AID_CERTIFICATE: false,
    PAYMENT_DATA: false,
    VERIFICATION_DOCUMENTS: false,
  });

  // Get required consents based on role (default to PATIENT if no role yet)
  const requiredConsents = getRequiredConsentsForRole(
    (role as 'PATIENT' | 'FREELANCER') || 'PATIENT',
  );

  // Sync local consent state with form state
  useEffect(() => {
    setValue('termsConsent', localConsents.TERMS_OF_SERVICE, { shouldValidate: true });
    setValue('privacyConsent', localConsents.PRIVACY_POLICY, { shouldValidate: true });
    setValue('gdprConsent', localConsents.GDPR_DATA_PROCESSING, { shouldValidate: true });
  }, [localConsents, setValue]);

  // Handle consent changes (local state only during signup)
  const handleConsentChange = (type: ConsentType, granted: boolean) => {
    setLocalConsents((prev) => ({
      ...prev,
      [type]: granted,
    }));
  };

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="text-center space-y-1 mb-6">
        <h3 className="text-xl font-poppins font-bold text-charcoal">Consent & Agreements</h3>
        <p className="text-xs font-inter text-gray-600">
          Please review and accept the following to complete your registration
        </p>
      </div>

      {/* Required Consents - using local state for signup */}
      <div className="space-y-4">
        {requiredConsents.map((type) => {
          const info = CONSENT_INFO[type];
          const isGranted = localConsents[type] || false;

          return (
            <div key={type} className="flex items-start space-x-3 rounded-lg border p-3">
              <Checkbox
                id={`consent-${type}`}
                checked={isGranted}
                onCheckedChange={(checked) => handleConsentChange(type, checked === true)}
                className="mt-0.5"
              />
              <Label
                htmlFor={`consent-${type}`}
                className="text-sm font-medium cursor-pointer flex-1 leading-tight"
              >
                {type === 'TERMS_OF_SERVICE' ? (
                  <>
                    I agree to the{' '}
                    <Link href="/terms" target="_blank" className="text-primary hover:underline">
                      Terms of Service <span className="text-red-500">*</span>
                    </Link>
                  </>
                ) : type === 'PRIVACY_POLICY' ? (
                  <>
                    I have read and agree to the{' '}
                    <Link href="/privacy" target="_blank" className="text-primary hover:underline">
                      Privacy Policy <span className="text-red-500">*</span>
                    </Link>
                  </>
                ) : (
                  <>
                    {info.description} <span className="text-red-500">*</span>
                  </>
                )}
              </Label>
            </div>
          );
        })}
      </div>
    </div>
  );
}
