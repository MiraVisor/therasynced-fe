'use client';

import { AlertTriangle, Download, FileText, Info, Lock, Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { UserSearchSelect } from '@/components/common/UserSearchSelect';
import { DashboardPageWrapper } from '@/components/core/Dashboard/DashboardPageWrapper';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import {
  type AdminExportFormData,
  adminExportUserData,
  checkIfEncrypted,
  downloadFile,
} from '@/services/exportService';
import { useAuthStore } from '@/stores/authStore';
import { ROLES } from '@/types/types';

export default function AdminExportsPage() {
  const router = useRouter();
  const { isAuthenticated, role } = useAuthStore();
  const [isExporting, setIsExporting] = useState(false);
  const [showEncryptionInfo, setShowEncryptionInfo] = useState(false);
  const [encryptedExportInfo, setEncryptedExportInfo] = useState<{
    exportKey: string;
    keyId: string;
    requestReference: string;
  } | null>(null);
  const [formData, setFormData] = useState<AdminExportFormData>({
    userId: undefined,
    email: undefined,
    exportAll: false,
    format: 'json',
    requestReference: '',
    purpose: '',
    encrypt: true,
  });

  // Check admin access
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/authentication/sign-in');
      return;
    }
    if (role && role !== ROLES.ADMIN) {
      toast.error('Access denied. Admin privileges required.');
      router.push('/dashboard');
    }
  }, [isAuthenticated, role, router]);

  const handleInputChange = (
    field: keyof AdminExportFormData,
    value: string | boolean | undefined,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleExport = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation - at least one identifier must be provided (or exportAll checked)
    if (!formData.exportAll && !formData.userId && !formData.email?.trim()) {
      toast.error(
        'Please provide either a User ID, Email, or check "Export All Users". The system can also find users from previous exports using the Request Reference.',
      );
      return;
    }

    if (!formData.requestReference.trim()) {
      toast.error('DPC Request Reference is required');
      return;
    }

    if (!formData.purpose.trim()) {
      toast.error('Purpose is required');
      return;
    }

    setIsExporting(true);
    try {
      // Get file download response (blob)
      const fileResponse = await adminExportUserData(formData);

      // Download the file
      downloadFile(fileResponse.blob, fileResponse.filename);

      // Check if the file is encrypted by reading its content
      const encryptionCheck = await checkIfEncrypted(fileResponse.blob);

      if (encryptionCheck.isEncrypted && encryptionCheck.encryptedData) {
        // Handle encrypted export
        const { encryptedData } = encryptionCheck;

        // Store encryption info to show in dialog
        setEncryptedExportInfo({
          exportKey: encryptedData.exportKey || '',
          keyId: encryptedData.keyId,
          requestReference: encryptedData.metadata.requestReference,
        });
        setShowEncryptionInfo(true);

        toast.success('Encrypted export downloaded successfully');
      } else {
        // Handle unencrypted export
        toast.success('Export downloaded successfully');
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to export data. Please try again.';
      console.error('Export error:', error);
      toast.error(errorMessage);
    } finally {
      setIsExporting(false);
    }
  };

  if (role !== ROLES.ADMIN) {
    return null;
  }

  return (
    <DashboardPageWrapper
      header={
        <div className="flex items-center gap-3">
          <Shield className="h-6 w-6 text-charcoal" />
          <h1 className="font-poppins font-bold text-2xl text-charcoal">DPC Data Exports</h1>
        </div>
      }
    >
      <div className="space-y-6 lg:space-y-8">
        {/* Security Warning */}
        <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              <CardTitle className="font-poppins font-semibold text-amber-900 dark:text-amber-100">
                Important Security Notice
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="font-inter text-sm text-amber-800 dark:text-amber-200">
              This feature allows you to export user data for DPC (Data Protection Commission)
              requests. All exports are logged for audit purposes. Encrypted exports are recommended
              for sensitive data. Ensure you have proper authorization before exporting.
            </p>
          </CardContent>
        </Card>

        {/* Export Form */}
        <Card>
          <CardHeader>
            <CardTitle className="font-poppins font-semibold flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Export User Data
            </CardTitle>
            <CardDescription className="font-inter">
              Export user data for DPC investigation or data subject access requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleExport} className="space-y-6">
              {/* User Identification */}
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium mb-3 block">
                    User Identification <span className="text-muted-foreground">(Optional)</span>
                  </Label>
                  <p className="text-xs text-muted-foreground mb-4">
                    Provide either User ID, Email, or check Export All. For DPC requests, the system
                    can also find users from previous exports using the Request Reference.
                  </p>
                </div>

                {/* User ID Selection */}
                <div className="space-y-2">
                  <Label htmlFor="userId" className="text-sm font-medium">
                    User ID
                  </Label>
                  <UserSearchSelect
                    value={formData.userId}
                    onValueChange={(userId) => {
                      handleInputChange('userId', userId);
                      // Clear email and exportAll when user is selected
                      if (userId) {
                        handleInputChange('email', undefined);
                        handleInputChange('exportAll', false);
                      }
                    }}
                    placeholder="Search and select a user..."
                    searchPlaceholder="Search by name or email..."
                    emptyMessage="No user found. Type at least 2 characters to search."
                  />
                </div>

                {/* Email Input */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Or Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => {
                      const email = e.target.value.trim() || undefined;
                      handleInputChange('email', email);
                      // Clear userId and exportAll when email is entered
                      if (email) {
                        handleInputChange('userId', undefined);
                        handleInputChange('exportAll', false);
                      }
                    }}
                    placeholder="user@example.com"
                    className="font-inter"
                    disabled={!!formData.userId || formData.exportAll}
                  />
                </div>

                {/* Export All Checkbox */}
                <div className="flex items-start space-x-3 rounded-lg border p-4">
                  <Checkbox
                    id="exportAll"
                    checked={formData.exportAll}
                    onCheckedChange={(checked) => {
                      handleInputChange('exportAll', checked);
                      // Clear userId and email when exportAll is checked
                      if (checked) {
                        handleInputChange('userId', undefined);
                        handleInputChange('email', undefined);
                      }
                    }}
                    className="mt-1"
                  />
                  <div className="space-y-1">
                    <Label
                      htmlFor="exportAll"
                      className="text-sm font-medium cursor-pointer flex items-center gap-2"
                    >
                      Export All Users
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Export data for all active, non-anonymised users. Use with caution.
                    </p>
                  </div>
                </div>
              </div>

              {/* Export Format */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  Export Format <span className="text-destructive">*</span>
                </Label>
                <RadioGroup
                  value={formData.format}
                  onValueChange={(value) => handleInputChange('format', value as 'json' | 'csv')}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="json" id="format-json" />
                    <Label htmlFor="format-json" className="font-normal cursor-pointer">
                      JSON
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="csv" id="format-csv" />
                    <Label htmlFor="format-csv" className="font-normal cursor-pointer">
                      CSV
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* DPC Request Reference */}
              <div className="space-y-2">
                <Label htmlFor="requestReference" className="text-sm font-medium">
                  DPC Request Reference <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="requestReference"
                  value={formData.requestReference}
                  onChange={(e) => handleInputChange('requestReference', e.target.value)}
                  placeholder="DPC-2025-001234"
                  required
                  className="font-inter"
                />
                <p className="text-xs text-muted-foreground">
                  Reference number from the DPC request or investigation
                </p>
              </div>

              {/* Purpose */}
              <div className="space-y-2">
                <Label htmlFor="purpose" className="text-sm font-medium">
                  Purpose <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="purpose"
                  value={formData.purpose}
                  onChange={(e) => handleInputChange('purpose', e.target.value)}
                  placeholder="DPC Investigation - Data Subject Access Request"
                  rows={3}
                  required
                  className="font-inter"
                />
                <p className="text-xs text-muted-foreground">
                  Describe the purpose of this export (e.g., DPC investigation, data subject
                  request)
                </p>
              </div>

              {/* Encryption */}
              <div className="flex items-start space-x-3 rounded-lg border p-4">
                <Checkbox
                  id="encrypt"
                  checked={formData.encrypt}
                  onCheckedChange={(checked) => handleInputChange('encrypt', checked)}
                  className="mt-1"
                />
                <div className="space-y-1">
                  <Label
                    htmlFor="encrypt"
                    className="text-sm font-medium cursor-pointer flex items-center gap-2"
                  >
                    <Lock className="h-4 w-4" />
                    Encrypt Export (Recommended)
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Encrypt the export file for additional security. Encrypted exports require a
                    decryption key to access.
                  </p>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/dashboard/admin/audit')}
                >
                  View Export Logs
                </Button>
                <Button type="submit" disabled={isExporting} className="font-inter">
                  {isExporting ? (
                    <>
                      <Download className="mr-2 h-4 w-4 animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Export Data
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

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
                This is the decryption key for this export. Share this key with DPC to allow them to
                decrypt the file.
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
                file. Share it securely with DPC.
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
              <AlertDescription className="text-green-800 dark:text-amber-200 space-y-2">
                <p>
                  The export key above is the decryption key for this specific export. It is
                  included in the downloaded file.
                </p>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>
                    The <strong>Export Key</strong> is stored in the downloaded JSON file under the{' '}
                    <code>exportKey</code> field
                  </li>
                  <li>Share the Export Key with DPC to allow them to decrypt the file offline</li>
                  <li>
                    Each export has its own unique key - this key only works for this specific
                    export
                  </li>
                  <li>
                    The key should be kept secure and only shared with authorised personnel (e.g.,
                    DPC)
                  </li>
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
    </DashboardPageWrapper>
  );
}
