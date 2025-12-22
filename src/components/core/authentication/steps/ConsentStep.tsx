'use client';

import Link from 'next/link';
import { useFormContext } from 'react-hook-form';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

import { SignupFormData } from '../MultiStepSignup';

export function ConsentStep() {
  const {
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<SignupFormData>();

  const termsConsent = watch('termsConsent') || false;
  const privacyConsent = watch('privacyConsent') || false;
  const gdprConsent = watch('gdprConsent') || false;

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="text-center space-y-1 mb-6">
        <h3 className="text-xl font-poppins font-bold text-charcoal">Consent & Agreements</h3>
        <p className="text-xs font-inter text-gray-600">
          Please review and accept the following to complete your registration
        </p>
      </div>

      {/* Terms of Service */}
      <div className="flex items-start space-x-3 rounded-lg border p-3">
        <Checkbox
          id="terms-consent"
          checked={termsConsent}
          onCheckedChange={(checked) =>
            setValue('termsConsent', checked === true, { shouldValidate: true })
          }
          className="mt-0.5"
        />
        <Label
          htmlFor="terms-consent"
          className="text-sm font-medium cursor-pointer flex-1 leading-tight"
        >
          I agree to the{' '}
          <Link href="/terms" target="_blank" className="text-primary hover:underline">
            Terms of Service
          </Link>
        </Label>
      </div>
      {errors.termsConsent && (
        <p className="text-red-500 text-xs font-inter mt-0.5" role="alert">
          {errors.termsConsent.message}
        </p>
      )}

      {/* Privacy Policy */}
      <div className="flex items-start space-x-3 rounded-lg border p-3">
        <Checkbox
          id="privacy-consent"
          checked={privacyConsent}
          onCheckedChange={(checked) =>
            setValue('privacyConsent', checked === true, { shouldValidate: true })
          }
          className="mt-0.5"
        />
        <Label
          htmlFor="privacy-consent"
          className="text-sm font-medium cursor-pointer flex-1 leading-tight"
        >
          I have read and agree to the{' '}
          <Link href="/privacy" target="_blank" className="text-primary hover:underline">
            Privacy Policy
          </Link>
        </Label>
      </div>
      {errors.privacyConsent && (
        <p className="text-red-500 text-xs font-inter mt-0.5" role="alert">
          {errors.privacyConsent.message}
        </p>
      )}

      {/* GDPR Data Processing Consent */}
      <div className="flex items-start space-x-3 rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/20 p-3">
        <Checkbox
          id="gdpr-consent"
          checked={gdprConsent}
          onCheckedChange={(checked) =>
            setValue('gdprConsent', checked === true, { shouldValidate: true })
          }
          className="mt-0.5"
        />
        <Label
          htmlFor="gdpr-consent"
          className="text-sm font-medium cursor-pointer flex-1 leading-tight"
        >
          I consent to the processing of my personal data in accordance with GDPR
        </Label>
      </div>
      {errors.gdprConsent && (
        <p className="text-red-500 text-xs font-inter mt-0.5" role="alert">
          {errors.gdprConsent.message}
        </p>
      )}
    </div>
  );
}
