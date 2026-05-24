'use client';

import { useQueryClient } from '@tanstack/react-query';
import { AlertCircle, Download, Edit, Info, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { toast } from 'react-toastify';

import { UnifiedConsentManager } from '@/components/common/UnifiedConsentManager';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

export function PrivacyConsentSection() {
  const router = useRouter();
  const { logout, role: _role } = useAuth();
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

  const handleHealthDataConsentChange = useCallback(async () => {
    // Invalidate consent queries when consent changes
    await queryClient.invalidateQueries({ queryKey: ['consents'] });
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

  return (
    <div className="space-y-6">
      {/* Consent Management */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-poppins font-semibold text-gray-900 mb-6">
          Consent Management
        </h3>
        <UnifiedConsentManager
          requiredOnly={false}
          compact={false}
          batchMode={false}
          onConsentChange={handleHealthDataConsentChange}
        />
      </div>

      {/* Data Rights Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">Your Data Rights</CardTitle>
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

          <div className="flex items-center justify-between p-3 border border-red-200 rounded-lg bg-red-50">
            <div>
              <h4 className="font-semibold text-sm text-red-800">Delete Account</h4>
              <p className="text-xs text-red-600">Permanently delete your account</p>
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
            <p className="text-sm text-gray-600 mb-4">The export will include:</p>
            <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600 mb-6">
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
                <p className="text-xs text-gray-600">
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
              Deleting your account will withdraw your agreement to the Terms of Service, Privacy
              Policy, and data processing. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-3">
            <Alert className="border-blue-200 bg-blue-50">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertTitle className="text-blue-800">
                What happens when you delete your account:
              </AlertTitle>
              <AlertDescription className="text-blue-700">
                <ul className="list-disc pl-5 mt-2 space-y-1 text-sm">
                  <li>Your account will be immediately logged out</li>
                  <li>We will stop processing your data except where legally required</li>
                  <li>
                    Healthcare records (completed bookings) retained for 7 years as required by law
                  </li>
                  <li>
                    Financial records (subscriptions, payments) retained for 7 years as required by
                    law
                  </li>
                  <li>Messages older than 2 years may be deleted immediately</li>
                </ul>
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
              <p className="text-xs text-amber-600 font-medium">
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
