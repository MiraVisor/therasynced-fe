'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { useAuth } from '@/hooks/useAuthZustand';
import { useConsentManager } from '@/hooks/useConsentManager';
import { CONSENT_INFO, type ConsentType, getAllConsentsForRole } from '@/types/consent';

import { Button } from '../ui/button';

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
  /**
   * Batch mode: store changes locally and save with a button
   * @default false
   */
  batchMode?: boolean;
}

export function UnifiedConsentManager({
  requiredOnly = false,
  compact = false,
  onConsentChange,
  className = '',
  batchMode = false,
}: UnifiedConsentManagerProps) {
  const { role } = useAuth();
  const { consents, isLoading, updateConsent, updateMultipleConsents, hasConsent, refetch } =
    useConsentManager();

  // Local state for batch mode - tracks pending changes
  const [pendingChanges, setPendingChanges] = useState<Record<ConsentType, boolean | null>>(
    {} as Record<ConsentType, boolean | null>,
  );
  const [isSaving, setIsSaving] = useState(false);
  const [savingConsentTypes, setSavingConsentTypes] = useState<Set<ConsentType>>(new Set());

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

  // Check if there are pending changes
  const hasPendingChanges = useMemo(() => {
    return Object.values(pendingChanges).some((value) => value !== null);
  }, [pendingChanges]);

  // Get the effective consent status (server value or pending change)
  const getEffectiveConsent = (type: ConsentType): boolean => {
    if (batchMode && pendingChanges[type] !== null) {
      return pendingChanges[type];
    }
    return hasConsent(type);
  };

  const handleConsentChange = async (type: ConsentType, granted: boolean) => {
    if (batchMode) {
      // Check if this matches the server value
      const serverValue = hasConsent(type);
      if (granted === serverValue) {
        // User changed it back to original value, remove from pending changes
        setPendingChanges((prev) => {
          const newChanges = { ...prev };
          delete newChanges[type];
          return newChanges;
        });
      } else {
        // Store change locally
        setPendingChanges((prev) => ({
          ...prev,
          [type]: granted,
        }));
      }
    } else {
      // Immediate update (original behavior)
      await updateConsent(type, granted);
      onConsentChange?.();
    }
  };

  const handleSave = async () => {
    if (!hasPendingChanges || isSaving) return;

    // Build array of updates from pending changes
    const updates = Object.entries(pendingChanges)
      .filter(([_, value]) => value !== null)
      .map(([type, value]) => {
        const granted = value as boolean; // Safe because we filtered out null
        return {
          consentType: type as ConsentType,
          granted,
        };
      });

    if (updates.length === 0) return;

    // Track which consents are being saved
    const consentTypesBeingSaved = new Set(updates.map((u) => u.consentType));
    setSavingConsentTypes(consentTypesBeingSaved);
    setIsSaving(true);

    try {
      await updateMultipleConsents(updates);
      // Clear pending changes
      setPendingChanges({} as Record<ConsentType, boolean | null>);
      // Refetch to get latest state
      refetch();
      onConsentChange?.();
    } catch (error) {
      // Error is already handled by the mutation in useConsentManager
      console.error('Failed to save consents:', error);
    } finally {
      setIsSaving(false);
      setSavingConsentTypes(new Set());
    }
  };

  if (relevantConsents.length === 0 && !isLoading) {
    return null;
  }

  const spacingClass = compact ? 'space-y-3' : 'space-y-6';
  const cardSpacingClass = compact ? 'space-y-2' : 'space-y-3';
  const paddingClass = compact ? 'p-2' : 'p-3';

  return (
    <div className={`${spacingClass} ${className}`}>
      {/* Required Consents */}
      {groupedConsents['required'] && groupedConsents['required'].length > 0 && (
        <div className="space-y-4">
          <div>
            <h4
              className={`${compact ? 'text-base' : 'text-lg'} font-poppins font-semibold text-gray-900`}
            >
              Required Consents
            </h4>
            {!compact && (
              <p className="text-sm text-gray-600 mt-1">
                These consents are required to use the platform
              </p>
            )}
          </div>
          <div className={cardSpacingClass}>
            {groupedConsents['required'].map(({ type, info, status }) => {
              const isGranted = getEffectiveConsent(type);
              const isSavingThis = savingConsentTypes.has(type);
              const isLoadingThis = isLoading && !status;
              return (
                <div
                  key={type}
                  className={`flex items-start space-x-3 rounded-lg border ${paddingClass} relative`}
                >
                  <div className="relative flex items-center justify-center mt-0.5 w-5 h-5">
                    {(isLoadingThis || isSavingThis) && (
                      <div className="absolute inset-0 flex items-center justify-center z-10 bg-white/80 rounded">
                        <LoadingSpinner size="sm" />
                      </div>
                    )}
                    <Checkbox
                      id={`consent-${type}`}
                      checked={isGranted}
                      onCheckedChange={(checked) => handleConsentChange(type, checked === true)}
                      className="mt-0.5"
                      disabled={isSavingThis || isLoadingThis}
                    />
                  </div>
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
          </div>
        </div>
      )}

      {/* Health Data Consents (Freelancers only) */}
      {groupedConsents['health'] && groupedConsents['health'].length > 0 && (
        <div className="space-y-4">
          <div>
            <h4
              className={`${compact ? 'text-base' : 'text-lg'} font-poppins font-semibold text-gray-900`}
            >
              Health Data Consents
            </h4>
            {!compact && (
              <p className="text-sm text-gray-600 mt-1">
                Special category data requiring explicit consent under GDPR Article 9
              </p>
            )}
          </div>
          <div className={cardSpacingClass}>
            {groupedConsents['health'].map(({ type, info, status }) => {
              const isGranted = getEffectiveConsent(type);
              const isSavingThis = savingConsentTypes.has(type);
              const isLoadingThis = isLoading && !status;
              return (
                <div
                  key={type}
                  className={`flex items-start space-x-3 rounded-lg border ${paddingClass} relative`}
                >
                  <div className="relative flex items-center justify-center mt-0.5 w-5 h-5">
                    {(isLoadingThis || isSavingThis) && (
                      <div className="absolute inset-0 flex items-center justify-center z-10 bg-white/80 rounded">
                        <LoadingSpinner size="sm" />
                      </div>
                    )}
                    <Checkbox
                      id={`consent-${type}`}
                      checked={isGranted}
                      onCheckedChange={(checked) => handleConsentChange(type, checked === true)}
                      className="mt-0.5"
                      disabled={isSavingThis || isLoadingThis}
                    />
                  </div>
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
          </div>
        </div>
      )}

      {/* Financial Consents (Freelancers only) */}
      {groupedConsents['financial'] && groupedConsents['financial'].length > 0 && (
        <div className="space-y-4">
          <div>
            <h4
              className={`${compact ? 'text-base' : 'text-lg'} font-poppins font-semibold text-gray-900`}
            >
              Payment Data Consent
            </h4>
            {!compact && (
              <p className="text-sm text-gray-600 mt-1">
                Consent for processing payment information
              </p>
            )}
          </div>
          <div className={cardSpacingClass}>
            {groupedConsents['financial'].map(({ type, info, status }) => {
              const isGranted = getEffectiveConsent(type);
              const isSavingThis = savingConsentTypes.has(type);
              const isLoadingThis = isLoading && !status;
              return (
                <div
                  key={type}
                  className={`flex items-start space-x-3 rounded-lg border ${paddingClass} relative`}
                >
                  <div className="relative flex items-center justify-center mt-0.5 w-5 h-5">
                    {(isLoadingThis || isSavingThis) && (
                      <div className="absolute inset-0 flex items-center justify-center z-10 bg-white/80 rounded">
                        <LoadingSpinner size="sm" />
                      </div>
                    )}
                    <Checkbox
                      id={`consent-${type}`}
                      checked={isGranted}
                      onCheckedChange={(checked) => handleConsentChange(type, checked === true)}
                      className="mt-0.5"
                      disabled={isSavingThis || isLoadingThis}
                    />
                  </div>
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
          </div>
        </div>
      )}

      {/* Save Button at bottom (only in batch mode when there are pending changes) */}
      {batchMode && hasPendingChanges && (
        <div className="flex flex-col sm:flex-row gap-3 pt-6">
          <Button
            onClick={handleSave}
            disabled={isSaving || isLoading}
            className="bg-primary hover:bg-primary/90 disabled:opacity-50 text-white h-11 px-6 w-full sm:w-auto text-sm font-inter font-medium"
            isLoading={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      )}
    </div>
  );
}
