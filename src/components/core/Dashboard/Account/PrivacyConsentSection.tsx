'use client';

import { useQueryClient } from '@tanstack/react-query';
import { AlertCircle, Download, Edit, FileText, Info, Shield, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'react-toastify';

import { HealthDataConsent } from '@/components/common/HealthDataConsent';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useHealthDataConsent } from '@/hooks/queries/useDataRights';
import { useAuth } from '@/hooks/useAuthZustand';
import api from '@/services/api';
import { ENDPOINTS } from '@/services/endpoints';
import { ROLES } from '@/types/types';

export function PrivacyConsentSection() {
  const router = useRouter();
  const { logout, role } = useAuth();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showEncryptionInfo, setShowEncryptionInfo] = useState(false);
  const [encryptedExportInfo, setEncryptedExportInfo] = useState<{
    exportKey: string;
    keyId: string;
    requestReference: string;
  } | null>(null);
  const [exportFormat, setExportFormat] = useState<'json' | 'csv'>('json');
  const [exportEncrypt, setExportEncrypt] = useState(false);
  const [exportRequestReference, setExportRequestReference] = useState('');
  const [exportPurpose, setExportPurpose] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState('');

  // Consent states
  const [termsConsent, setTermsConsent] = useState(false);
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [gdprConsent, setGdprConsent] = useState(false);

  // Use the specific health data consent endpoint that returns ALL consent types
  // No userId parameter = gets the current logged-in user's own consent
  // This works for both FREELANCER (their own consent) and PATIENT (their own consent)
  const { data: healthDataConsentData, isLoading: isLoadingConsentsQuery } = useHealthDataConsent(
    undefined, // undefined = current user's own consent (from JWT token)
    true, // enabled
  );

  // Extract consent statuses - this will include ALL types (even with granted: false)
  const healthDataConsents = healthDataConsentData?.data?.consents;
  const consentStatuses = useMemo(() => {
    return healthDataConsents || [];
  }, [healthDataConsents]);

  const handleConsentUpdate = async (
    consentType: 'terms' | 'privacy' | 'gdpr',
    granted: boolean,
  ) => {
    try {
      // TODO: Replace with actual API endpoint when backend is ready
      // await api.post(ENDPOINTS.consents?.update || '/user/consents/update', {
      //   consentType,
      //   granted,
      // });

      if (consentType === 'terms') setTermsConsent(granted);
      if (consentType === 'privacy') setPrivacyConsent(granted);
      if (consentType === 'gdpr') setGdprConsent(granted);

      toast.success(`Consent ${granted ? 'granted' : 'withdrawn'} successfully`);
    } catch (error) {
      console.error('Error updating consent:', error);
      toast.error('Failed to update consent');
    }
  };

  const handleHealthDataConsentChange = useCallback(async () => {
    // Invalidate both queries when consent changes
    await queryClient.invalidateQueries({ queryKey: ['healthDataConsent'] });
    // Also invalidate data rights status if it's used elsewhere
    await queryClient.invalidateQueries({ queryKey: ['dataRights', 'status'] });
  }, [queryClient]);

  const handleDataPortability = async () => {
    setLoading('portability');
    try {
      const { exportMyData, downloadEncryptedExport, downloadUnencryptedExport } =
        await import('@/services/exportService');
      const response = await exportMyData({
        format: exportFormat,
        encrypt: exportEncrypt,
        requestReference: exportRequestReference || undefined,
        purpose: exportPurpose || undefined,
      });

      if (response.success) {
        const responseData = response.data as { encrypted?: boolean; [key: string]: unknown };
        if ('encrypted' in responseData && responseData.encrypted) {
          const encryptedData = responseData as any;
          downloadEncryptedExport(encryptedData);
          setEncryptedExportInfo({
            exportKey: encryptedData.exportKey || '',
            keyId: encryptedData.keyId,
            requestReference:
              encryptedData.metadata?.requestReference || exportRequestReference || 'N/A',
          });
          setShowEncryptionInfo(true);
          toast.success('Encrypted export downloaded successfully');
        } else {
          downloadUnencryptedExport(
            response.data,
            exportFormat,
            exportRequestReference || undefined,
          );
          toast.success('Export downloaded successfully');
        }
        setShowExportDialog(false);
      } else {
        toast.error(response.message || 'Failed to export data');
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to export data. Please try again.';
      toast.error(errorMessage);
    } finally {
      setLoading(null);
    }
  };

  const handleDataErasure = async () => {
    if (deleteConfirmation.toLowerCase().trim() !== 'delete my account') {
      toast.error('Please type "delete my account" to confirm');
      return;
    }

    setLoading('erasure');
    try {
      await api.delete(ENDPOINTS.dataRights?.deleteAccount || '/user/account');

      toast.success(
        'Account deleted successfully. Healthcare and financial records retained for 7 years as required by law.',
      );

      setShowDeleteDialog(false);
      setDeleteConfirmation('');

      setTimeout(() => {
        logout();
        router.push('/authentication/sign-in');
      }, 2000);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to delete account. Please contact support.';
      toast.error(errorMessage);
    } finally {
      setLoading(null);
    }
  };

  const handleDataRectification = () => {
    router.push('/dashboard/account?tab=profile');
  };

  // Update the useMemo hooks to use consentStatuses directly
  const soapNotesStatus = useMemo(
    () => consentStatuses.find((c) => c.consentType === 'SOAP_NOTES'),
    [consentStatuses],
  );
  const complaintsStatus = useMemo(
    () => consentStatuses.find((c) => c.consentType === 'COMPLAINTS'),
    [consentStatuses],
  );
  const firstAidStatus = useMemo(
    () => consentStatuses.find((c) => c.consentType === 'FIRST_AID_CERTIFICATE'),
    [consentStatuses],
  );

  const shouldShowConsent = (consentType: string) => {
    // Medical History forms are not stored/processed (PDFs only), so no consent needed
    if (consentType === 'MEDICAL_HISTORY') {
      return false;
    }
    if (role === ROLES.FREELANCER) {
      return consentType === 'FIRST_AID_CERTIFICATE' || consentType === 'COMPLAINTS';
    }
    // For patients: show SOAP_NOTES and COMPLAINTS
    return consentType === 'SOAP_NOTES' || consentType === 'COMPLAINTS';
  };

  return (
    <div className="space-y-6">
      {/* Consent Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Consent Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Terms of Service */}
          <div className="flex items-start space-x-3 rounded-lg border p-3">
            <Checkbox
              id="terms-consent"
              checked={termsConsent}
              onCheckedChange={(checked) => handleConsentUpdate('terms', checked === true)}
              className="mt-0.5"
            />
            <Label htmlFor="terms-consent" className="text-sm font-medium cursor-pointer flex-1">
              I agree to the{' '}
              <Link href="/terms" target="_blank" className="text-primary hover:underline">
                Terms of Service
              </Link>
            </Label>
          </div>

          {/* Privacy Policy */}
          <div className="flex items-start space-x-3 rounded-lg border p-3">
            <Checkbox
              id="privacy-consent"
              checked={privacyConsent}
              onCheckedChange={(checked) => handleConsentUpdate('privacy', checked === true)}
              className="mt-0.5"
            />
            <Label htmlFor="privacy-consent" className="text-sm font-medium cursor-pointer flex-1">
              I agree to the{' '}
              <Link href="/privacy" target="_blank" className="text-primary hover:underline">
                Privacy Policy
              </Link>
            </Label>
          </div>

          {/* GDPR Data Processing Consent */}
          <div className="flex items-start space-x-3 rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/20 p-3">
            <Checkbox
              id="gdpr-consent"
              checked={gdprConsent}
              onCheckedChange={(checked) => handleConsentUpdate('gdpr', checked === true)}
              className="mt-0.5"
            />
            <Label htmlFor="gdpr-consent" className="text-sm font-medium cursor-pointer flex-1">
              I consent to GDPR data processing
            </Label>
          </div>

          {/* Health Data Consents */}
          {(shouldShowConsent('SOAP_NOTES') ||
            shouldShowConsent('COMPLAINTS') ||
            shouldShowConsent('FIRST_AID_CERTIFICATE')) && (
            <div className="space-y-3 pt-4 border-t">
              {shouldShowConsent('SOAP_NOTES') && (
                <div className="border rounded-lg p-3">
                  <h5 className="font-semibold text-sm mb-2">SOAP Notes</h5>
                  <HealthDataConsent
                    consentType="SOAP_NOTES"
                    onConsentChange={handleHealthDataConsentChange}
                    required={false}
                    showDisclaimer={false}
                    initialConsentStatus={soapNotesStatus}
                    compact={true}
                    showTitle={false}
                    disableApiCall={true}
                    isLoading={isLoadingConsentsQuery}
                  />
                </div>
              )}

              {shouldShowConsent('COMPLAINTS') && (
                <div className="border rounded-lg p-3">
                  <h5 className="font-semibold text-sm mb-2">Health-Related Complaints</h5>
                  <HealthDataConsent
                    consentType="COMPLAINTS"
                    onConsentChange={handleHealthDataConsentChange}
                    required={false}
                    showDisclaimer={false}
                    initialConsentStatus={complaintsStatus}
                    compact={true}
                    showTitle={false}
                    disableApiCall={true}
                    isLoading={isLoadingConsentsQuery}
                  />
                </div>
              )}

              {shouldShowConsent('FIRST_AID_CERTIFICATE') && (
                <div className="border rounded-lg p-3">
                  <h5 className="font-semibold text-sm mb-2">First Aid Certificate</h5>
                  <HealthDataConsent
                    consentType="FIRST_AID_CERTIFICATE"
                    onConsentChange={handleHealthDataConsentChange}
                    required={false}
                    showDisclaimer={false}
                    initialConsentStatus={firstAidStatus}
                    compact={true}
                    showTitle={false}
                    disableApiCall={true}
                    isLoading={isLoadingConsentsQuery}
                  />
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Data Rights Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Your Data Rights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <h4 className="font-semibold text-sm">Download My Data</h4>
              <p className="text-xs text-muted-foreground">Export your personal data</p>
            </div>
            <Button onClick={() => setShowExportDialog(true)} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <h4 className="font-semibold text-sm">Update My Information</h4>
              <p className="text-xs text-muted-foreground">Edit your profile data</p>
            </div>
            <Button onClick={handleDataRectification} variant="outline" size="sm">
              <Edit className="w-4 h-4 mr-2" />
              Update
            </Button>
          </div>

          <div className="flex items-center justify-between p-3 border border-red-200 rounded-lg bg-red-50 dark:bg-red-950/20">
            <div>
              <h4 className="font-semibold text-sm text-red-800 dark:text-red-200">
                Delete Account
              </h4>
              <p className="text-xs text-red-600 dark:text-red-300">
                Permanently delete your account
              </p>
            </div>
            <Button
              onClick={() => setShowDeleteDialog(true)}
              variant="destructive"
              size="sm"
              disabled={loading !== null}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Export Data Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Export Your Data</DialogTitle>
            <DialogDescription>
              Export your data in a portable format. You can choose the format and optionally
              encrypt the export.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              The export will include:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600 dark:text-gray-400 mb-6">
              <li>Profile information</li>
              <li>Booking history</li>
              <li>Messages and communications</li>
              <li>Payment records</li>
              <li>Preferences and settings</li>
            </ul>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Export Format</Label>
              <div className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="format-json"
                    name="format"
                    value="json"
                    checked={exportFormat === 'json'}
                    onChange={(e) => setExportFormat(e.target.value as 'json' | 'csv')}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="format-json" className="font-normal cursor-pointer">
                    JSON
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="format-csv"
                    name="format"
                    value="csv"
                    checked={exportFormat === 'csv'}
                    onChange={(e) => setExportFormat(e.target.value as 'json' | 'csv')}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="format-csv" className="font-normal cursor-pointer">
                    CSV
                  </Label>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="requestReference" className="text-sm font-medium">
                Request Reference (Optional)
              </Label>
              <Input
                id="requestReference"
                value={exportRequestReference}
                onChange={(e) => setExportRequestReference(e.target.value)}
                placeholder="e.g., DPC-2025-001234"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="purpose" className="text-sm font-medium">
                Purpose (Optional)
              </Label>
              <Textarea
                id="purpose"
                value={exportPurpose}
                onChange={(e) => setExportPurpose(e.target.value)}
                placeholder="e.g., Personal backup"
                rows={2}
              />
            </div>

            <div className="flex items-start space-x-3 rounded-lg border p-4">
              <input
                type="checkbox"
                id="encrypt"
                checked={exportEncrypt}
                onChange={(e) => setExportEncrypt(e.target.checked)}
                className="mt-1 h-4 w-4"
              />
              <div className="space-y-1">
                <Label htmlFor="encrypt" className="text-sm font-medium cursor-pointer">
                  Encrypt Export (Optional)
                </Label>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Encrypt the export file for additional security. Encrypted exports require a
                  decryption key to access.
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExportDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleDataPortability} disabled={loading !== null}>
              {loading === 'portability' ? 'Exporting...' : 'Export Data'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Account Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Your Account</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete your account? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Alert className="border-red-200 dark:border-red-900">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertTitle className="text-red-600 dark:text-red-400">Permanent Deletion</AlertTitle>
              <AlertDescription>
                All your data will be permanently deleted, including:
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>Your profile and account information</li>
                  <li>All bookings and appointments</li>
                  <li>Messages and communications</li>
                  <li>Payment history</li>
                </ul>
                <p className="mt-2">
                  Note: We may retain certain data for legal compliance (e.g., healthcare records
                  for 7 years as required by Irish law).
                </p>
              </AlertDescription>
            </Alert>
            <div className="mt-4 space-y-2">
              <Label htmlFor="delete-confirmation" className="text-sm">
                Type &quot;delete my account&quot; to confirm
              </Label>
              <Input
                id="delete-confirmation"
                type="text"
                placeholder="delete my account"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                disabled={loading !== null}
                className="w-full"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteDialog(false);
                setDeleteConfirmation('');
              }}
              disabled={loading !== null}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDataErasure}
              disabled={
                loading !== null || deleteConfirmation.toLowerCase().trim() !== 'delete my account'
              }
            >
              {loading === 'erasure' ? 'Processing...' : 'Delete My Account'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Encryption Info Dialog */}
      <Dialog open={showEncryptionInfo} onOpenChange={setShowEncryptionInfo}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Encrypted Export Information
            </DialogTitle>
            <DialogDescription>
              Your export has been downloaded and encrypted for security.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>What is Encryption?</AlertTitle>
              <AlertDescription>
                The exported file is encrypted to protect sensitive user data. The file contains
                encrypted data that can only be decrypted using the export key below.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Export Key <span className="text-destructive">*</span>
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  value={encryptedExportInfo?.exportKey || ''}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (encryptedExportInfo?.exportKey) {
                      navigator.clipboard.writeText(encryptedExportInfo.exportKey);
                      toast.success('Export key copied to clipboard');
                    }
                  }}
                >
                  Copy
                </Button>
              </div>
              <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                ⚠️ Important: This key is unique to this export. Keep it secure.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowEncryptionInfo(false)}>Got it</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
