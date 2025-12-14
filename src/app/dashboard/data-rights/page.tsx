'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DataRightsPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to account settings with data-rights tab
    router.replace('/dashboard/account?tab=data-rights');
  }, [router]);

  return null;
  const { logout } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [consentStatuses, setConsentStatuses] = useState<
    Array<{ consentType: string; granted: boolean; grantedAt: string | null }>
  >([]);
  const [isLoadingConsents, setIsLoadingConsents] = useState(true);

  const handleDataAccess = async () => {
    setLoading('access');
    try {
      const response = await exportUserData();

      if (response.anonymized) {
        toast.info('User data has been anonymized');
        setShowExportDialog(false);
        return;
      }

      // Create download link
      const blob = new Blob([JSON.stringify(response.data, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `therasynced-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Your data has been exported successfully');
      setShowExportDialog(false);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to export data. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  const handleDataPortability = async () => {
    setLoading('portability');
    try {
      const response = await exportDataPortable('json');

      if (typeof response === 'string') {
        // CSV format
        const blob = new Blob([response], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `therasynced-data-portable-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        // JSON format
        if (response.anonymized) {
          toast.info('User data has been anonymized');
          return;
        }

        const blob = new Blob([JSON.stringify(response.data, null, 2)], {
          type: 'application/json',
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `therasynced-data-portable-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }

      toast.success('Your data has been exported successfully');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to export data. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  const handleDataErasure = async () => {
    // Validate confirmation text
    if (deleteConfirmation.toLowerCase().trim() !== 'delete my account') {
      toast.error('Please type "delete my account" to confirm');
      return;
    }

    setLoading('erasure');
    try {
      const response = await deleteAccount();

      toast.success(
        response.message ||
          'Account deleted successfully. Healthcare and financial records retained for 7 years as required by law.',
      );

      setShowDeleteDialog(false);
      setDeleteConfirmation('');

      // Log out user immediately after account deletion
      setTimeout(() => {
        logout();
        router.push('/authentication/sign-in');
      }, 2000);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to delete account. Please contact support.');
    } finally {
      setLoading(null);
    }
  };

  const handleDataRectification = () => {
    // Redirect to account settings where users can edit their data
    window.location.href = '/dashboard/account';
  };

  useEffect(() => {
    const loadConsentStatuses = async () => {
      try {
        setIsLoadingConsents(true);
        const statuses = await getConsentStatus();
        setConsentStatuses(statuses);
      } catch (error) {
        console.error('Error loading consent statuses:', error);
        toast.error('Failed to load consent statuses');
      } finally {
        setIsLoadingConsents(false);
      }
    };
    loadConsentStatuses();
  }, []);

  const handleConsentChange = async () => {
    // Reload consent statuses after change
    try {
      const statuses = await getConsentStatus();
      setConsentStatuses(statuses);
    } catch (error) {
      console.error('Error reloading consent statuses:', error);
    }
  };

  const getConsentTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      MEDICAL_HISTORY: 'Medical History',
      SOAP_NOTES: 'SOAP Notes',
      COMPLAINTS: 'Health-Related Complaints',
      FIRST_AID_CERTIFICATE: 'First Aid Certificate',
    };
    return labels[type] || type;
  };

  // Memoize consent status objects to prevent new references on every render
  const medicalHistoryStatus = useMemo(
    () => consentStatuses.find((c) => c.consentType === 'MEDICAL_HISTORY'),
    [consentStatuses],
  );
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

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Your Data Protection Rights
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Under GDPR, you have several rights regarding your personal data. Use the options below
            to exercise these rights.
          </p>
        </div>

          <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Response Time</AlertTitle>
          <AlertDescription>
            We will respond to your requests within 30 days as required by GDPR Article 12(3). Some requests may
            be processed immediately, while others may require verification.
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
              <CardDescription>
                Request a copy of all personal data we hold about you
              </CardDescription>
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
                Go to Account Settings
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
                  legal compliance (e.g., healthcare records for 7 years as required by law).
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

          {/* Health Data Consent Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Health Data Consent Management (GDPR Article 9)
              </CardTitle>
              <CardDescription>
                Manage your explicit consent for health data processing. Health data is special
                category data under GDPR and requires explicit consent.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isLoadingConsents ? (
                <div className="flex items-center justify-center py-8">
                  <LoadingSpinner size="sm" />
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-3 text-sm">Current Consent Status</h4>
                      <div className="space-y-2">
                        {consentStatuses.map((consent) => (
                          <div
                            key={consent.consentType}
                            className="flex items-center justify-between p-3 border rounded-lg"
                          >
                            <div className="flex-1">
                              <p className="font-medium text-sm">
                                {getConsentTypeLabel(consent.consentType)}
                              </p>
                              {consent.granted && consent.grantedAt && (
                                <p className="text-xs text-gray-500 mt-1">
                                  Granted: {new Date(consent.grantedAt).toLocaleString()}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {consent.granted ? (
                                <CheckCircle2 className="w-5 h-5 text-green-600" />
                              ) : (
                                <AlertCircle className="w-5 h-5 text-gray-400" />
                              )}
                              <span className="text-sm">
                                {consent.granted ? 'Granted' : 'Not Granted'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <h4 className="font-semibold mb-3 text-sm">Manage Consents</h4>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            <strong>Medical History:</strong> Consent for processing medical history
                            forms, ROM Assessment forms, and health questionnaires. Data will be retained for 7 years as required by Irish law for medical records.
                          </p>
                          <HealthDataConsent
                            consentType="MEDICAL_HISTORY"
                            onConsentChange={handleConsentChange}
                            required={false}
                            showDisclaimer={false}
                            initialConsentStatus={medicalHistoryStatus}
                          />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            <strong>SOAP Notes:</strong> Consent for healthcare professionals to
                            create and store clinical notes during appointments. Data will be retained for 7 years as required by Irish law for medical records.
                          </p>
                          <HealthDataConsent
                            consentType="SOAP_NOTES"
                            onConsentChange={handleConsentChange}
                            required={false}
                            showDisclaimer={false}
                            initialConsentStatus={soapNotesStatus}
                          />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            <strong>Health-Related Complaints:</strong> Consent for processing
                            health-related information in complaints for service quality and safety purposes. Data will be retained for 7 years as required by Irish law.
                          </p>
                          <HealthDataConsent
                            consentType="COMPLAINTS"
                            onConsentChange={handleConsentChange}
                            required={false}
                            showDisclaimer={false}
                            initialConsentStatus={complaintsStatus}
                          />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            <strong>First Aid Certificate:</strong> Consent for storing and
                            processing first aid certificates for professional verification (healthcare professionals only). Data will be retained until account deletion + 7 years for professional verification records.
                          </p>
                          <HealthDataConsent
                            consentType="FIRST_AID_CERTIFICATE"
                            onConsentChange={handleConsentChange}
                            required={false}
                            showDisclaimer={false}
                            initialConsentStatus={firstAidStatus}
                          />
                        </div>
                      </div>
                    </div>

                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertTitle>About Health Data Consent</AlertTitle>
                      <AlertDescription>
                        <p className="mb-2">
                          Health data is classified as &quot;special category data&quot; under GDPR
                          Article 9. Processing requires explicit consent, which must be:
                        </p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                          <li>Freely given and specific</li>
                          <li>Informed and unambiguous</li>
                          <li>Separate from other consents</li>
                          <li>Easily withdrawable at any time</li>
                        </ul>
                        <p className="mt-2">
                          You can withdraw any consent at any time. Withdrawal does not affect the
                          lawfulness of processing before withdrawal.
                        </p>
                      </AlertDescription>
                    </Alert>
                  </div>
                </>
              )}
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
                  You can object to processing based on legitimate interests. Manage this through
                  your account settings or contact us.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Right to Withdraw Consent</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  You can withdraw consent for health data processing at any time through your
                  account settings.
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export Your Data</DialogTitle>
            <DialogDescription>
              Your data will be exported in JSON format. This may take a few moments.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              The export will include:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600 dark:text-gray-400">
              <li>Profile information</li>
              <li>Booking history</li>
              <li>Messages and communications</li>
              <li>Payment records</li>
              <li>Preferences and settings</li>
            </ul>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExportDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleDataAccess} disabled={loading !== null}>
              {loading === 'access' ? 'Exporting...' : 'Export Data'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
