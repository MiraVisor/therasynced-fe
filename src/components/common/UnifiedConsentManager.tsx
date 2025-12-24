'use client';

import Link from 'next/link';
import { useMemo } from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { useAuth } from '@/hooks/useAuthZustand';
import { useConsentManager } from '@/hooks/useConsentManager';
import { CONSENT_INFO, type ConsentType, getAllConsentsForRole } from '@/types/consent';

interface UnifiedConsentManagerProps {
  /**
   * Show only required consents (for signup flow)
   * @default false
   */
  requiredOnly?: boolean;
  /**
   * Show compact view (less spacing, smaller text)
   * @default false
   */
  compact?: boolean;
  /**
   * Callback when any consent changes
   */
  onConsentChange?: () => void;
  /**
   * Custom className
   */
  className?: string;
}

export function UnifiedConsentManager({
  requiredOnly = false,
  compact = false,
  onConsentChange,
  className = '',
}: UnifiedConsentManagerProps) {
  const { role } = useAuth();
  const { consents, isLoading, updateConsent, hasConsent } = useConsentManager();

  // Get consents relevant to current role
  const relevantConsents = useMemo(() => {
    if (!role) return [];
    const allConsents = getAllConsentsForRole(role as 'PATIENT' | 'FREELANCER');
    return allConsents
      .map((type) => ({
        type,
        info: CONSENT_INFO[type],
        status: consents.find((c) => c.consentType === type),
      }))
      .filter((item) => !requiredOnly || item.info.required);
  }, [role, consents, requiredOnly]);

  // Group consents by category
  const groupedConsents = useMemo(() => {
    const groups: Record<string, typeof relevantConsents> = {
      required: [],
      health: [],
      financial: [],
    };

    relevantConsents.forEach((item) => {
      const { category } = item.info;
      if (groups[category]) {
        groups[category].push(item);
      }
    });

    return groups;
  }, [relevantConsents]);

  const handleConsentChange = async (type: ConsentType, granted: boolean) => {
    await updateConsent(type, granted);
    onConsentChange?.();
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <LoadingSpinner size="md" />
      </div>
    );
  }

  if (relevantConsents.length === 0) {
    return null;
  }

  const spacingClass = compact ? 'space-y-3' : 'space-y-6';
  const cardSpacingClass = compact ? 'space-y-2' : 'space-y-3';
  const paddingClass = compact ? 'p-2' : 'p-3';

  return (
    <div className={`${spacingClass} ${className}`}>
      {/* Required Consents */}
      {groupedConsents['required'] && groupedConsents['required'].length > 0 && (
        <Card>
          <CardHeader className={compact ? 'pb-3' : ''}>
            <CardTitle className={compact ? 'text-base' : 'text-lg'}>Required Consents</CardTitle>
            {!compact && (
              <CardDescription>These consents are required to use the platform</CardDescription>
            )}
          </CardHeader>
          <CardContent className={cardSpacingClass}>
            {groupedConsents['required'].map(({ type, info, status }) => {
              const isGranted = hasConsent(type);
              return (
                <div
                  key={type}
                  className={`flex items-start space-x-3 rounded-lg border ${paddingClass}`}
                >
                  <Checkbox
                    id={`consent-${type}`}
                    checked={isGranted}
                    onCheckedChange={(checked) => handleConsentChange(type, checked === true)}
                    className="mt-0.5"
                    disabled={isLoading}
                  />
                  <Label
                    htmlFor={`consent-${type}`}
                    className={`${compact ? 'text-xs' : 'text-sm'} font-medium cursor-pointer flex-1 leading-tight`}
                  >
                    {info.type === 'TERMS_OF_SERVICE' ? (
                      <>
                        I agree to the{' '}
                        <Link
                          href="/terms"
                          target="_blank"
                          className="text-primary hover:underline"
                        >
                          Terms of Service
                        </Link>
                      </>
                    ) : info.type === 'PRIVACY_POLICY' ? (
                      <>
                        I have read and agree to the{' '}
                        <Link
                          href="/privacy"
                          target="_blank"
                          className="text-primary hover:underline"
                        >
                          Privacy Policy
                        </Link>
                      </>
                    ) : (
                      info.description
                    )}
                  </Label>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Health Data Consents (Freelancers only) */}
      {groupedConsents['health'] && groupedConsents['health'].length > 0 && (
        <Card>
          <CardHeader className={compact ? 'pb-3' : ''}>
            <CardTitle className={compact ? 'text-base' : 'text-lg'}>
              Health Data Consents
            </CardTitle>
            {!compact && (
              <CardDescription>
                Special category data requiring explicit consent under GDPR Article 9
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className={cardSpacingClass}>
            {groupedConsents['health'].map(({ type, info, status }) => {
              const isGranted = hasConsent(type);
              return (
                <div
                  key={type}
                  className={`flex items-start space-x-3 rounded-lg border ${paddingClass}`}
                >
                  <Checkbox
                    id={`consent-${type}`}
                    checked={isGranted}
                    onCheckedChange={(checked) => handleConsentChange(type, checked === true)}
                    className="mt-0.5"
                    disabled={isLoading}
                  />
                  <div className="flex-1">
                    <Label
                      htmlFor={`consent-${type}`}
                      className={`${compact ? 'text-xs' : 'text-sm'} font-medium cursor-pointer`}
                    >
                      {info.title}
                    </Label>
                    {!compact && (
                      <p
                        className={`${compact ? 'text-xs' : 'text-sm'} text-muted-foreground mt-1`}
                      >
                        {info.description}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Financial Consents (Freelancers only) */}
      {groupedConsents['financial'] && groupedConsents['financial'].length > 0 && (
        <Card>
          <CardHeader className={compact ? 'pb-3' : ''}>
            <CardTitle className={compact ? 'text-base' : 'text-lg'}>
              Payment Data Consent
            </CardTitle>
            {!compact && (
              <CardDescription>Consent for processing payment information</CardDescription>
            )}
          </CardHeader>
          <CardContent className={cardSpacingClass}>
            {groupedConsents['financial'].map(({ type, info, status }) => {
              const isGranted = hasConsent(type);
              return (
                <div
                  key={type}
                  className={`flex items-start space-x-3 rounded-lg border ${paddingClass}`}
                >
                  <Checkbox
                    id={`consent-${type}`}
                    checked={isGranted}
                    onCheckedChange={(checked) => handleConsentChange(type, checked === true)}
                    className="mt-0.5"
                    disabled={isLoading}
                  />
                  <div className="flex-1">
                    <Label
                      htmlFor={`consent-${type}`}
                      className={`${compact ? 'text-xs' : 'text-sm'} font-medium cursor-pointer`}
                    >
                      {info.title}
                    </Label>
                    {!compact && (
                      <p
                        className={`${compact ? 'text-xs' : 'text-sm'} text-muted-foreground mt-1`}
                      >
                        {info.description}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
