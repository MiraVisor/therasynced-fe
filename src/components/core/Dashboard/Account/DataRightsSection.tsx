'use client';

import { AlertCircle, Download, Edit, FileText, Info, Lock, Shield, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-toastify';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { useAuth } from '@/hooks/useAuthZustand';
import api from '@/services/api';
import { ENDPOINTS } from '@/services/endpoints';

export function DataRightsSection() {
  const router = useRouter();
  const { logout, role: _role } = useAuth();
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

  // Unused function removed - was: const _handleDataAccess = async () => { ... }

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
        // Check if encrypted
        const responseData = response.data as { encrypted?: boolean; data?: unknown };
        if ('encrypted' in responseData && responseData.encrypted) {
          // Handle encrypted export
          const encryptedData = responseData as any;
          downloadEncryptedExport(encryptedData);

          // Store encryption info to show in dialog
          setEncryptedExportInfo({
            exportKey: encryptedData.exportKey || '',
            keyId: encryptedData.keyId,
            requestReference:
              encryptedData.metadata?.requestReference || exportRequestReference || 'N/A',
          });
          setShowEncryptionInfo(true);

          toast.success('Encrypted export downloaded successfully');
        } else {
          // Handle unencrypted export
          downloadUnencryptedExport(
            response.data,
            exportFormat,
            exportRequestReference || undefined,
          );
          toast.success('Export downloaded successfully');
        }
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
      const response = await api.delete(ENDPOINTS.dataRights?.deleteAccount || '/user/account');

      toast.success(
        (response.data as { message?: string })?.message ||
          'Account deleted successfully. Healthcare and financial records retained for 7 years as required by law.',
      );

      setShowDeleteDialog(false);
      setDeleteConfirmation('');

      setTimeout(() => {
        logout();
        router.push('/');
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

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h3 className="text-lg font-poppins font-semibold text-gray-900 dark:text-white mb-2">
          Your Data Protection Rights
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Under GDPR, you have several rights regarding your personal data. Use the options below to
          exercise these rights.
        </p>
      </div>

      <Alert className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Response Time</AlertTitle>
        <AlertDescription>
          We will respond to your requests within 30 days as required by GDPR Article 12(3). Some
          requests may be processed immediately, while others may require verification.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6">
        {/* Right of Access */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Right of Access (Article 15)
            </CardTitle>
            <CardDescription>Request a copy of all personal data we hold about you</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              You have the right to know what personal data we process about you and to receive a
              copy of that data.
            </p>
            <Button
              onClick={() => setShowExportDialog(true)}
              disabled={loading !== null}
              variant="outline"
            >
              <Download className="w-4 h-4 mr-2" />
              {loading === 'access' ? 'Exporting...' : 'Request Data Export'}
            </Button>
          </CardContent>
        </Card>

        {/* Right to Rectification */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5" />
              Right to Rectification (Article 16)
            </CardTitle>
            <CardDescription>Correct inaccurate or incomplete personal data</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              You can update your personal information through your account settings.
            </p>
            <Button onClick={handleDataRectification} variant="outline">
              <Edit className="w-4 h-4 mr-2" />
              Go to Profile Settings
            </Button>
          </CardContent>
        </Card>

        {/* Right to Data Portability */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="w-5 h-5" />
              Right to Data Portability (Article 20)
            </CardTitle>
            <CardDescription>
              Receive your data in a structured, machine-readable format
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              You can download your data in JSON format for transfer to another service.
            </p>
            <Button onClick={handleDataPortability} disabled={loading !== null} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              {loading === 'portability' ? 'Exporting...' : 'Download My Data'}
            </Button>
          </CardContent>
        </Card>

        {/* Right to Erasure */}
        <Card className="border-red-200 dark:border-red-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <Trash2 className="w-5 h-5" />
              Right to Erasure (Article 17) - &quot;Right to be Forgotten&quot;
            </CardTitle>
            <CardDescription>Request deletion of your personal data and account</CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="mb-4 border-red-200 dark:border-red-900">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertTitle className="text-red-600 dark:text-red-400">Warning</AlertTitle>
              <AlertDescription>
                This action cannot be undone. All your data, including bookings, messages, and
                profile information, will be permanently deleted. We may retain certain data for
                legal compliance (e.g., healthcare records for 7 years as required by Irish law).
              </AlertDescription>
            </Alert>
            <Button
              onClick={() => setShowDeleteDialog(true)}
              disabled={loading !== null}
              variant="destructive"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Request Account Deletion
            </Button>
          </CardContent>
        </Card>

        {/* Note: Consent management has been moved to Privacy & Consent section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Consent Management
            </CardTitle>
            <CardDescription>
              Consent management has been consolidated into a unified system. Please manage your
              consents in the Privacy & Consent section of your account settings.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Consent Management Moved</AlertTitle>
              <AlertDescription>
                All consent management, including health data consents, is now available in the
                Privacy & Consent tab. This provides a simpler, unified interface for managing all
                your consents in one place.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Information */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Right to Restrict Processing (Article 18)</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                To restrict processing of your data, please contact us at privacy@therasynced.com
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Right to Object (Article 21)</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                You can object to processing based on legitimate interests. Manage this through your
                account settings or contact us.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Right to Withdraw Consent</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                You can withdraw consent for health data processing at any time through your account
                settings.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Complaints</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                If you have concerns about how we handle your data, you can lodge a complaint with
                the Irish Data Protection Commission at{' '}
                <a
                  href="https://www.dataprotection.ie"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  www.dataprotection.ie
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

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
              <p className="text-xs text-gray-500 dark:text-gray-400">
                This action cannot be undone. Please type the confirmation text above.
              </p>
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

            {/* Export Format */}
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

            {/* Optional Fields */}
            <div className="space-y-2">
              <Label htmlFor="requestReference" className="text-sm font-medium">
                Request Reference (Optional)
              </Label>
              <Input
                id="requestReference"
                value={exportRequestReference}
                onChange={(e) => setExportRequestReference(e.target.value)}
                placeholder="e.g., DPC-2025-001234"
                className="font-inter"
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
                className="font-inter"
              />
            </div>

            {/* Encryption */}
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

      {/* Encryption Info Dialog */}
      <Dialog open={showEncryptionInfo} onOpenChange={setShowEncryptionInfo}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
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
              <p className="text-xs text-muted-foreground mb-2">
                This is the decryption key for this export. Keep this key safe - you&apos;ll need it
                to decrypt the file.
              </p>
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
                ⚠️ Important: This key is unique to this export and is included in the downloaded
                file. Keep it secure.
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Key ID (Reference)</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={encryptedExportInfo?.keyId || ''}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (encryptedExportInfo?.keyId) {
                      navigator.clipboard.writeText(encryptedExportInfo.keyId);
                      toast.success('Key ID copied to clipboard');
                    }
                  }}
                >
                  Copy
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                This Key ID is included in the downloaded file for reference purposes.
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Request Reference</Label>
              <Input
                value={encryptedExportInfo?.requestReference || ''}
                readOnly
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Keep this reference for tracking and when requesting the decryption key.
              </p>
            </div>

            <Alert className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950">
              <Info className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertTitle className="text-green-900 dark:text-green-100">
                Decryption Information
              </AlertTitle>
              <AlertDescription className="text-green-800 dark:text-green-200 space-y-2">
                <p>
                  The export key above is the decryption key for this specific export. It is
                  included in the downloaded file.
                </p>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>
                    The <strong>Export Key</strong> is stored in the downloaded JSON file under the{' '}
                    <code>exportKey</code> field
                  </li>
                  <li>You can use this key to decrypt the file offline using decryption tools</li>
                  <li>
                    Each export has its own unique key - this key only works for this specific
                    export
                  </li>
                  <li>The key should be kept secure and not shared with unauthorized parties</li>
                </ul>
              </AlertDescription>
            </Alert>

            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <p className="text-sm font-medium mb-2">Downloaded File Contains:</p>
              <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                <li>
                  <code>data</code> - Base64 encoded encrypted data
                </li>
                <li>
                  <code>iv</code> - Initialization vector used for encryption
                </li>
                <li>
                  <code>exportKey</code> -{' '}
                  <strong>Hex-encoded decryption key for this export</strong> (shown above)
                </li>
                <li>
                  <code>keyId</code> - Key identifier for reference
                </li>
                <li>
                  <code>algorithm</code> - Encryption algorithm used (AES-256-GCM)
                </li>
                <li>
                  <code>metadata</code> - Export metadata including request reference
                </li>
              </ul>
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
