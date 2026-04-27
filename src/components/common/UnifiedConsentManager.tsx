'use client';

import { AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { toast } from 'react-toastify';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { useAuth } from '@/hooks/useAuthZustand';
import { useConsentManager } from '@/hooks/useConsentManager';
import {
  CONSENT_INFO,
  type ConsentType,
  getAllConsentsForRole,
  isNonWithdrawableRequiredConsent,
} from '@/types/consent';
import { formatDate } from '@/utils/dateUtils';

import { Alert, AlertDescription } from '../ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
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

  // Confirmation dialog state for consent withdrawal
  const [withdrawalDialog, setWithdrawalDialog] = useState<{
    open: boolean;
    type: ConsentType | null;
    pendingGranted: boolean;
  }>({
    open: false,
    type: null,
    pendingGranted: false,
  });

  // Confirmation checkbox state for withdrawal dialogs
  const [withdrawalConfirmed, setWithdrawalConfirmed] = useState(false);

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
    // Prevent withdrawal of required, non-withdrawable consents
    // Check both the helper function and the API response
    const consentStatus = consents.find((c) => c.consentType === type);
    const isReadOnly = consentStatus?.isReadOnly ?? isNonWithdrawableRequiredConsent(type);

    if (isReadOnly && !granted) {
      // This should not happen in UI (read-only), but protect against API calls
      toast.error(
        'Required agreements cannot be withdrawn without closing the account. If you wish to withdraw this agreement, you will need to delete your account.',
        { autoClose: 6000 },
      );
      return;
    }

    // Show confirmation dialog for withdrawing specific consents
    if (!granted && (type === 'VERIFICATION_DOCUMENTS' || type === 'FIRST_AID_CERTIFICATE')) {
      handleOpenWithdrawalDialog(type, granted);
      return;
    }

    // Proceed with consent change
    await proceedWithConsentChange(type, granted);
  };

  const proceedWithConsentChange = async (type: ConsentType, granted: boolean) => {
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

  const handleConfirmWithdrawal = async () => {
    if (!withdrawalDialog.type || !withdrawalConfirmed) return;

    try {
      await proceedWithConsentChange(withdrawalDialog.type, withdrawalDialog.pendingGranted);

      // Show success message based on consent type
      if (withdrawalDialog.type === 'FIRST_AID_CERTIFICATE') {
        toast.success(
          'Certificate has been permanently deleted. Your verification status may have been updated.',
        );
      } else if (withdrawalDialog.type === 'VERIFICATION_DOCUMENTS') {
        toast.success('Verification status revoked. Documents retained for audit.');
      }

      setWithdrawalDialog({ open: false, type: null, pendingGranted: false });
      setWithdrawalConfirmed(false);
      onConsentChange?.();
    } catch (error) {
      // Error is already handled by proceedWithConsentChange/updateConsent
      // Just reset the dialog state
      setWithdrawalDialog({ open: false, type: null, pendingGranted: false });
      setWithdrawalConfirmed(false);
    }
  };

  const handleOpenWithdrawalDialog = (type: ConsentType, granted: boolean) => {
    setWithdrawalDialog({
      open: true,
      type,
      pendingGranted: granted,
    });
    setWithdrawalConfirmed(false); // Reset confirmation when opening dialog
  };

  const handleCloseWithdrawalDialog = () => {
    setWithdrawalDialog({ open: false, type: null, pendingGranted: false });
    setWithdrawalConfirmed(false);
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
              Required Agreements
            </h4>
            {!compact && (
              <p className="text-sm text-gray-600 mt-1">
                These agreements are necessary to provide the service
              </p>
            )}
          </div>
          <div className={cardSpacingClass}>
            {groupedConsents['required'].map(({ type, info, status }) => {
              const isGranted = getEffectiveConsent(type);
              // Use isReadOnly from API if available, otherwise fall back to helper function
              const isReadOnly = status?.isReadOnly ?? isNonWithdrawableRequiredConsent(type);
              const grantedDate = status?.grantedAt
                ? formatDate(new Date(status.grantedAt), 'short')
                : null;

              // Show read-only for non-withdrawable required consents (Terms, Privacy, GDPR Data Processing)
              if (isReadOnly) {
                return (
                  <div
                    key={type}
                    className={`flex items-start space-x-3 rounded-lg border ${paddingClass} bg-gray-50
                  >
                    <div className="flex items-center justify-center mt-0.5 w-5 h-5">
                      <CheckCircle2 className="h-5 w-5 text-green-600 />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Label
                          htmlFor={`consent-${type}`}
                          className={`${compact ? 'text-xs' : 'text-sm'} font-medium flex-1`}
                        >
                          {info.type === 'TERMS_OF_SERVICE' ? (
                            <>
                              Terms of Service —{' '}
                              <Link
                                href="/terms"
                                target="_blank"
                                className="text-primary hover:underline"
                              >
                                View Terms
                              </Link>
                            </>
                          ) : info.type === 'PRIVACY_POLICY' ? (
                            <>
                              Privacy Policy —{' '}
                              <Link
                                href="/privacy"
                                target="_blank"
                                className="text-primary hover:underline"
                              >
                                View Policy
                              </Link>
                            </>
                          ) : (
                            info.title
                          )}
                        </Label>
                      </div>
                      {grantedDate && (
                        <p
                          className={`${compact ? 'text-xs' : 'text-sm'} text-muted-foreground mt-1`}
                        >
                          Accepted on {grantedDate}
                        </p>
                      )}
                    </div>
                  </div>
                );
              }

              // Show toggle for optional required consents (e.g., Verification Documents)
              const isSavingThis = savingConsentTypes.has(type);
              const isLoadingThis = isLoading && !status;
              const isDisabled = isSavingThis || isLoadingThis;
              return (
                <div
                  key={type}
                  onClick={() => !isDisabled && handleConsentChange(type, !isGranted)}
                  className={`flex items-start space-x-3 rounded-lg border ${paddingClass} relative cursor-pointer transition-all hover:bg-gray-50 ${
                    isDisabled ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
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
                      className="mt-0.5 pointer-events-none"
                      disabled={isDisabled}
                    />
                  </div>
                  <div className="flex-1">
                    <Label
                      htmlFor={`consent-${type}`}
                      className={`${compact ? 'text-xs' : 'text-sm'} font-medium cursor-pointer pointer-events-none`}
                    >
                      {info.title}
                    </Label>
                    {!compact && (
                      <p
                        className={`${compact ? 'text-xs' : 'text-sm'} text-muted-foreground mt-1 pointer-events-none`}
                      >
                        {info.description}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Info box explaining withdrawal = account deletion */}
          {!requiredOnly && (
            <Alert className="border-blue-500 bg-blue-50
              <Info className="h-4 w-4 text-blue-600 />
              <AlertDescription className="text-blue-800
                <div>
                  <p className="font-medium">Withdrawing Required Agreements</p>
                  <p className="text-sm mt-1">
                    These agreements (Terms of Service, Privacy Policy, and Data Processing) are
                    necessary to provide the service. If you wish to withdraw them, you will need to
                    delete your account. See below for the delete account option.
                  </p>
                </div>
              </AlertDescription>
            </Alert>
          )}
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
              const isDisabled = isSavingThis || isLoadingThis;
              return (
                <div
                  key={type}
                  onClick={() => !isDisabled && handleConsentChange(type, !isGranted)}
                  className={`flex items-start space-x-3 rounded-lg border ${paddingClass} relative cursor-pointer transition-all hover:bg-gray-50 ${
                    isDisabled ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
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
                      className="mt-0.5 pointer-events-none"
                      disabled={isDisabled}
                    />
                  </div>
                  <div className="flex-1">
                    <Label
                      htmlFor={`consent-${type}`}
                      className={`${compact ? 'text-xs' : 'text-sm'} font-medium cursor-pointer pointer-events-none`}
                    >
                      {info.title}
                    </Label>
                    {!compact && (
                      <p
                        className={`${compact ? 'text-xs' : 'text-sm'} text-muted-foreground mt-1 pointer-events-none`}
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

      {/* Financial Authorizations (Freelancers only) - NOT GDPR Consents */}
      {groupedConsents['financial'] && groupedConsents['financial'].length > 0 && (
        <div className="space-y-4">
          <div>
            <h4
              className={`${compact ? 'text-base' : 'text-lg'} font-poppins font-semibold text-gray-900`}
            >
              Payment Authorization
            </h4>
            {!compact && (
              <p className="text-sm text-gray-600 mt-1">
                Contractual authorization for payment processing (not a GDPR consent). Authorization
                ends when subscription is cancelled.
              </p>
            )}
          </div>
          <div className={cardSpacingClass}>
            {groupedConsents['financial'].map(({ type, info, status }) => {
              const isGranted = getEffectiveConsent(type);
              const isSavingThis = savingConsentTypes.has(type);
              const isLoadingThis = isLoading && !status;
              const isDisabled = isSavingThis || isLoadingThis;
              return (
                <div
                  key={type}
                  onClick={() => !isDisabled && handleConsentChange(type, !isGranted)}
                  className={`flex items-start space-x-3 rounded-lg border ${paddingClass} relative cursor-pointer transition-all hover:bg-gray-50 ${
                    isDisabled ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
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
                      className="mt-0.5 pointer-events-none"
                      disabled={isDisabled}
                    />
                  </div>
                  <div className="flex-1">
                    <Label
                      htmlFor={`consent-${type}`}
                      className={`${compact ? 'text-xs' : 'text-sm'} font-medium cursor-pointer pointer-events-none`}
                    >
                      {info.title}
                    </Label>
                    {!compact && (
                      <p
                        className={`${compact ? 'text-xs' : 'text-sm'} text-muted-foreground mt-1 pointer-events-none`}
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

      {/* Withdrawal Confirmation Dialog */}
      <AlertDialog
        open={withdrawalDialog.open}
        onOpenChange={(open) => {
          if (!open) {
            handleCloseWithdrawalDialog();
          }
        }}
      >
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              {withdrawalDialog.type === 'FIRST_AID_CERTIFICATE'
                ? 'Withdraw First Aid Certificate Consent'
                : 'Withdraw Verification Documents Consent'}
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3 pt-2">
              {withdrawalDialog.type === 'FIRST_AID_CERTIFICATE' ? (
                <>
                  <p className="text-sm font-medium text-red-600
                    Withdrawing this consent will permanently delete your uploaded first aid
                    certificate and revoke any verification based on it. This action cannot be
                    undone.
                  </p>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 space-y-2">
                    <p className="text-sm font-semibold text-red-800
                      What will happen:
                    </p>
                    <ul className="list-disc pl-5 space-y-1 text-xs text-red-700
                      <li>Your first aid certificate will be permanently deleted</li>
                      <li>Any verification based on this certificate will be revoked</li>
                      <li>Your verified status may change to REJECTED</li>
                      <li>This action cannot be undone</li>
                    </ul>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-sm font-medium text-amber-600
                    Withdrawing this consent will remove your verified status and may limit your
                    ability to receive bookings. Your documents will be retained for audit purposes
                    but will no longer be used for verification.
                  </p>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 space-y-2">
                    <p className="text-sm font-semibold text-amber-800
                      What will happen:
                    </p>
                    <ul className="list-disc pl-5 space-y-1 text-xs text-amber-700
                      <li>Your verification status will change to REJECTED</li>
                      <li>You will lose your verified status</li>
                      <li>You may not be able to accept new bookings</li>
                      <li>Your documents will be archived (retained for audit, not deleted)</li>
                    </ul>
                  </div>
                </>
              )}

              {/* Confirmation Checkbox */}
              <div className="flex items-start space-x-2 pt-2 border-t">
                <Checkbox
                  id="withdrawal-confirmation"
                  checked={withdrawalConfirmed}
                  onCheckedChange={(checked) => setWithdrawalConfirmed(checked === true)}
                  className="mt-1"
                />
                <Label
                  htmlFor="withdrawal-confirmation"
                  className="text-sm cursor-pointer leading-tight"
                >
                  {withdrawalDialog.type === 'FIRST_AID_CERTIFICATE'
                    ? 'I understand this will permanently delete my certificate'
                    : 'I understand this will revoke my verification'}
                </Label>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCloseWithdrawalDialog}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmWithdrawal}
              disabled={!withdrawalConfirmed}
              className={
                withdrawalDialog.type === 'FIRST_AID_CERTIFICATE'
                  ? 'bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed'
                  : 'disabled:opacity-50 disabled:cursor-not-allowed'
              }
            >
              {withdrawalDialog.type === 'FIRST_AID_CERTIFICATE'
                ? 'Yes, delete my certificate'
                : 'Yes, revoke my verification'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
