'use client';

import {
  AlertCircle,
  Award,
  CheckCircle,
  Clock,
  FileText,
  Shield,
  Upload,
  XCircle,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-toastify';

import { DataTable } from '@/components/common/DataTable/data-table';
import { createFilesColumns } from '@/components/common/DataTable/files-columns';
import { HealthDataConsent } from '@/components/common/HealthDataConsent';
import { DashboardPageWrapper } from '@/components/core/Dashboard/DashboardPageWrapper';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { Progress } from '@/components/ui/progress';
import {
  useDeleteCertificate,
  useFirstAidCertificateStatus,
  useUploadFirstAidCertificate,
} from '@/hooks/queries/useCertificate';
import {
  useDeleteVerificationDocument,
  useFreelancerFiles,
  useRequestVerification,
  useUploadVerificationDocument,
  useVerificationDocuments,
  useVerificationStatus,
} from '@/hooks/queries/useVerification';
import { useAuth } from '@/hooks/useAuthZustand';
import { ROLES } from '@/types/types';

// Verification Timeline Component
interface VerificationTimelineProps {
  verificationStatus: string;
  verificationRequestedAt?: string;
  verificationApprovedAt?: string;
  verificationRejectedAt?: string;
  verificationRejectionReason?: string;
  documentsCount: number;
}

const VerificationTimeline: React.FC<VerificationTimelineProps> = ({
  verificationStatus,
  verificationRequestedAt,
  verificationApprovedAt,
  verificationRejectedAt,
  verificationRejectionReason,
  documentsCount,
}) => {
  const timeline = [
    {
      status: 'uploaded',
      title: 'Documents Uploaded',
      date: verificationRequestedAt,
      description: 'Your verification documents have been uploaded',
      completed: documentsCount > 0,
      current: documentsCount > 0 && verificationStatus === 'UNVERIFIED',
    },
    {
      status: 'review',
      title: 'Under Review',
      date: verificationRequestedAt,
      description: 'Admin is reviewing your documents',
      completed: verificationStatus === 'APPROVED' || verificationStatus === 'REJECTED',
      current: verificationStatus === 'PENDING',
    },
    {
      status: 'approved',
      title: 'Verification Approved',
      date: verificationApprovedAt,
      description: 'Your verification has been approved',
      completed: verificationStatus === 'APPROVED',
      current: verificationStatus === 'APPROVED',
    },
  ];

  // If no documents uploaded, show upload prompt
  if (documentsCount === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Shield className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <p className="text-lg font-medium mb-2">Upload documents to get started</p>
        <p className="text-sm">
          Upload your verification documents to begin the verification process
        </p>
      </div>
    );
  }

  // If rejected, show rejection info
  if (verificationStatus === 'REJECTED') {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-4 rounded-lg bg-red-50 border border-red-200">
          <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800">Verification Rejected</p>
            <p className="text-xs text-red-600 mt-1">
              {verificationRejectedAt && new Date(verificationRejectedAt).toLocaleString()}
            </p>
            {verificationRejectionReason && (
              <p className="text-xs text-red-700 mt-2 font-medium">
                Reason: {verificationRejectionReason}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {timeline.map((step, index) => (
        <div key={step.status} className="flex items-start gap-4">
          {/* Timeline line */}
          <div className="flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                step.completed
                  ? 'bg-green-500 border-green-500 text-white'
                  : step.current
                    ? 'bg-blue-500 border-blue-500 text-white'
                    : 'bg-gray-100 border-gray-300 text-gray-400'
              }`}
            >
              {step.completed ? (
                <CheckCircle className="w-4 h-4" />
              ) : step.current ? (
                <Clock className="w-4 h-4" />
              ) : (
                <div className="w-2 h-2 rounded-full bg-gray-400" />
              )}
            </div>
            {index < timeline.length - 1 && (
              <div
                className={`w-0.5 h-8 mt-2 ${step.completed ? 'bg-green-500' : 'bg-gray-200'}`}
              />
            )}
          </div>

          {/* Timeline content */}
          <div className="flex-1 pb-4">
            <div
              className={`p-4 rounded-lg border ${
                step.completed
                  ? 'bg-green-50 border-green-200'
                  : step.current
                    ? 'bg-blue-50 border-blue-200'
                    : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <h4
                  className={`text-sm font-medium ${
                    step.completed
                      ? 'text-green-800'
                      : step.current
                        ? 'text-blue-800'
                        : 'text-gray-600'
                  }`}
                >
                  {step.title}
                </h4>
                {step.date && (
                  <span
                    className={`text-xs ${
                      step.completed
                        ? 'text-green-600'
                        : step.current
                          ? 'text-blue-600'
                          : 'text-gray-500'
                    }`}
                  >
                    {new Date(step.date).toLocaleString()}
                  </span>
                )}
              </div>
              <p
                className={`text-xs mt-1 ${
                  step.completed
                    ? 'text-green-700'
                    : step.current
                      ? 'text-blue-700'
                      : 'text-gray-500'
                }`}
              >
                {step.description}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

interface VerificationDocument {
  id: string;
  fileName: string;
  url: string;
  uploadedAt: string;
  fileSize: number;
}

interface VerificationStatus {
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'UNVERIFIED';
  requestedAt?: string;
  approvedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  documents: VerificationDocument[];
}

interface CertificateStatus {
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  url?: string;
  uploadedAt?: string;
  approvedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
}

export default function VerificationPage() {
  const { role } = useAuth();

  // Use React Query hooks
  const { data: verificationStatusData, isLoading: isLoadingVerificationStatus } =
    useVerificationStatus();
  const { data: verificationDocuments = [], isLoading: isLoadingDocuments } =
    useVerificationDocuments();
  const {
    data: allFiles = [],
    isLoading: isLoadingFiles,
    error: filesError,
  } = useFreelancerFiles();
  const { data: certificateStatusData, isLoading: isLoadingCertificate } =
    useFirstAidCertificateStatus();

  const { mutate: uploadDocument, isPending: isUploading } = useUploadVerificationDocument();
  const { mutate: deleteDocument } = useDeleteVerificationDocument();
  const { mutate: requestVerificationMutation } = useRequestVerification();
  const { mutate: uploadCertificate, isPending: isUploadingCertificate } =
    useUploadFirstAidCertificate();
  const { mutate: deleteCertificateMutation } = useDeleteCertificate();

  // Local state
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [hasCertificateConsent, setHasCertificateConsent] = useState(false);
  const MAX_FILES_PER_UPLOAD = 10;

  const isLoading =
    isLoadingVerificationStatus || isLoadingDocuments || isLoadingFiles || isLoadingCertificate;

  // Redirect if not freelancer
  useEffect(() => {
    if (role && role !== ROLES.FREELANCER) {
      window.location.href = '/dashboard';
    }
  }, [role]);

  if (role !== ROLES.FREELANCER) {
    return null;
  }

  // Get certificate status from files data if available, otherwise from certificate query
  const getCertificateStatus = (): CertificateStatus => {
    // First, try to get status from files data (more up-to-date)
    const certificateFile = allFiles?.find((file) => file.fileType === 'CERTIFICATE');
    if (certificateFile?.status) {
      return {
        status: certificateFile.status as 'PENDING' | 'APPROVED' | 'REJECTED',
        url: certificateFile.url,
        uploadedAt: certificateFile.uploadedAt,
        approvedAt: certificateFile.approvedAt ?? undefined,
        rejectedAt: certificateFile.rejectedAt ?? undefined,
        rejectionReason: certificateFile.rejectionReason || undefined,
      };
    }

    // Fallback to certificate query data
    if (certificateStatusData) {
      return {
        status: certificateStatusData.firstAidCertificateStatus || 'PENDING',
        url: certificateStatusData.firstAidCertificateUrl,
        uploadedAt: certificateStatusData.firstAidCertificateUrl
          ? new Date().toISOString()
          : undefined,
        approvedAt: certificateStatusData.firstAidCertificateApprovedAt?.toString(),
        rejectedAt: certificateStatusData.firstAidCertificateRejectedAt?.toString(),
        rejectionReason: certificateStatusData.firstAidCertificateRejectionReason || undefined,
      };
    }

    return {
      status: 'PENDING',
    };
  };

  const certificateStatus: CertificateStatus = getCertificateStatus();

  const verificationStatus: VerificationStatus = {
    status:
      verificationStatusData?.verificationStatus === 'NOT_SUBMITTED'
        ? 'UNVERIFIED'
        : verificationStatusData?.verificationStatus || 'UNVERIFIED',
    documents: verificationDocuments || [],
  };

  const documents: VerificationDocument[] = verificationDocuments || [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        );
      case 'PENDING':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case 'REJECTED':
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800 border-gray-200">
            <AlertCircle className="w-3 h-3 mr-1" />
            Not Submitted
          </Badge>
        );
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'text-green-600';
      case 'PENDING':
        return 'text-yellow-600';
      case 'REJECTED':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const handleFileUpload = (files: File[]) => {
    if (files.length === 0) return;

    if (files.length > MAX_FILES_PER_UPLOAD) {
      setUploadError(`You can only upload up to ${MAX_FILES_PER_UPLOAD} files at a time.`);
      toast.error(`Please select no more than ${MAX_FILES_PER_UPLOAD} files per upload.`);
      return;
    }

    setUploadError(null);

    // Upload files one by one (React Query mutation handles one file at a time)
    files.forEach((file) => {
      uploadDocument(file, {
        onError: (error: unknown) => {
          const errorMessage = error instanceof Error ? error.message : 'Failed to upload document';
          setUploadError(errorMessage);
        },
      });
    });
  };

  const handleCertificateUpload = (file: File) => {
    if (!hasCertificateConsent) {
      toast.error(
        'You must grant explicit consent for health data processing before uploading a first aid certificate.',
      );
      return;
    }

    uploadCertificate(file);
  };

  const handleDeleteDocument = (documentUrl: string) => {
    deleteDocument(documentUrl);
  };

  const handleDeleteFile = (fileUrl: string, fileType: string) => {
    if (fileType === 'CERTIFICATE') {
      deleteCertificateMutation();
    } else if (fileType === 'VERIFICATION_DOCUMENT') {
      deleteDocument(fileUrl);
    }
  };

  const handleRequestVerification = () => {
    requestVerificationMutation(undefined, {
      onSuccess: () => {
        toast.success('Verification request submitted successfully');
      },
    });
  };

  const canRequestVerification = () => {
    return documents.length > 0 && verificationStatus.status === 'UNVERIFIED';
  };

  const getVerificationProgress = () => {
    let completed = 0;
    const total = 2; // Certificate + Documents

    if (certificateStatus.status === 'APPROVED') completed++;
    if (documents.length > 0) completed++;

    return (completed / total) * 100;
  };

  const isVerificationComplete = () => {
    return certificateStatus.status === 'APPROVED' && verificationStatus.status === 'APPROVED';
  };

  return (
    <DashboardPageWrapper
      header={
        <div>
          <h1 className="font-poppins text-3xl font-bold text-charcoal">Verification Center</h1>
          <p className="font-inter text-muted-foreground mt-2">
            Upload your professional documents and track your verification status
          </p>
        </div>
      }
      showNotifications={true}
      userRole={role}
    >
      <div className="space-y-8">
        {/* Progress Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Verification Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Overall Progress</span>
                <span className="text-sm text-gray-600">
                  {Math.round(getVerificationProgress())}% Complete
                </span>
              </div>
              <Progress value={getVerificationProgress()} className="h-2" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="flex items-center gap-3 p-3 rounded-lg border">
                  <div
                    className={`p-2 rounded-full ${certificateStatus.status === 'APPROVED' ? 'bg-green-100' : 'bg-gray-100'}`}
                  >
                    <FileText
                      className={`h-4 w-4 ${certificateStatus.status === 'APPROVED' ? 'text-green-600' : 'text-gray-600'}`}
                    />
                  </div>
                  <div>
                    <p className="font-medium text-sm">First Aid Certificate</p>
                    <p className={`text-xs ${getStatusColor(certificateStatus.status)}`}>
                      {certificateStatus.status || 'Not Uploaded'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg border">
                  <div
                    className={`p-2 rounded-full ${documents.length > 0 ? 'bg-green-100' : 'bg-gray-100'}`}
                  >
                    <Shield
                      className={`h-4 w-4 ${documents.length > 0 ? 'text-green-600' : 'text-gray-600'}`}
                    />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Verification Documents</p>
                    <p
                      className={`text-xs ${getStatusColor(documents.length > 0 ? 'APPROVED' : 'UNVERIFIED')}`}
                    >
                      {documents.length} document{documents.length !== 1 ? 's' : ''} uploaded
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* First Aid Certificate Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              First Aid Certificate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">
                    Upload your valid first aid certificate (PDF or Image)
                  </p>
                </div>
                {/* {getStatusBadge(certificateStatus.status)} */}
              </div>

              {/* Health Data Consent */}
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-1">
                      Data Processing Consent Required
                    </h4>
                    <p className="text-xs text-gray-600">
                      To upload your first aid certificate, you must grant consent for us to store
                      and process this document for professional verification purposes.
                    </p>
                  </div>
                  <div className="pt-2 border-t border-gray-200">
                    <HealthDataConsent
                      consentType="FIRST_AID_CERTIFICATE"
                      onConsentChange={setHasCertificateConsent}
                      required={true}
                      showDisclaimer={true}
                    />
                  </div>
                </div>
              </div>

              {certificateStatus.rejectionReason && (
                <Alert className="border-red-200 bg-red-50" role="alert">
                  <AlertCircle className="h-4 w-4 text-red-600" aria-hidden="true" />
                  <AlertDescription className="text-red-800">
                    <strong>Rejection Reason:</strong> {certificateStatus.rejectionReason}
                  </AlertDescription>
                </Alert>
              )}

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      handleCertificateUpload(e.target.files[0]);
                    }
                  }}
                  disabled={isUploadingCertificate || !hasCertificateConsent}
                  className="hidden"
                  id="certificate-upload"
                  aria-label="Upload first aid certificate"
                  aria-describedby="certificate-upload-instructions"
                  aria-required="true"
                  aria-invalid={!hasCertificateConsent}
                />
                <label
                  htmlFor="certificate-upload"
                  className={`cursor-pointer block ${!hasCertificateConsent ? 'opacity-50 cursor-not-allowed' : ''}`}
                  role="button"
                  aria-disabled={!hasCertificateConsent}
                >
                  {isUploadingCertificate ? (
                    <LoadingSpinner size="lg" />
                  ) : (
                    <Upload className="mx-auto h-12 w-12 text-gray-400" aria-hidden="true" />
                  )}
                  <p className="mt-2 text-sm font-medium text-gray-900">
                    {isUploadingCertificate
                      ? 'Uploading...'
                      : !hasCertificateConsent
                        ? 'Upload disabled - Consent required'
                        : 'Click to upload your certificate'}
                  </p>
                  <p id="certificate-upload-instructions" className="text-xs text-gray-500 mt-1">
                    .jpg, .jpeg, .png, .pdf up to 5MB
                  </p>
                </label>
                {!hasCertificateConsent && (
                  <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-md">
                    <p
                      className="text-xs text-amber-800 font-medium"
                      role="alert"
                      aria-live="polite"
                    >
                      <AlertCircle className="inline h-3 w-3 mr-1" />
                      Please grant consent in the section above to enable file upload.
                    </p>
                  </div>
                )}
              </div>

              {certificateStatus.uploadedAt && (
                <div className="text-xs text-gray-500">
                  Uploaded on {new Date(certificateStatus.uploadedAt).toLocaleDateString()}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Verification Documents Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Verification Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Professional Documents</p>
                  <p className="text-sm text-gray-600">
                    Upload your professional licenses, certifications, and identification documents
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {/* {getStatusBadge(verificationStatus.status)} */}
                  {canRequestVerification() && (
                    <Button onClick={handleRequestVerification} disabled={isUploading} size="sm">
                      {isUploading ? 'Submitting...' : 'Request Verification'}
                    </Button>
                  )}
                </div>
              </div>

              {verificationStatus.rejectionReason && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    <strong>Rejection Reason:</strong> {verificationStatus.rejectionReason}
                  </AlertDescription>
                </Alert>
              )}

              {/* Info message about file limit */}
              <Alert className="border-blue-200 bg-blue-50">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800 text-sm">
                  <strong>Upload Limit:</strong> You can upload up to {MAX_FILES_PER_UPLOAD} files
                  at a time. You can add more files after this upload.
                </AlertDescription>
              </Alert>

              {uploadError && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">{uploadError}</AlertDescription>
                </Alert>
              )}

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  multiple
                  onChange={(e) => {
                    if (e.target.files) {
                      const files = Array.from(e.target.files);

                      // Validate file count
                      if (files.length > MAX_FILES_PER_UPLOAD) {
                        setUploadError(
                          `Please select no more than ${MAX_FILES_PER_UPLOAD} files. You selected ${files.length} files.`,
                        );
                        toast.error(
                          `Maximum ${MAX_FILES_PER_UPLOAD} files allowed per upload. Please select fewer files.`,
                        );
                        // Reset the input
                        e.target.value = '';
                        return;
                      }

                      // Clear any previous errors
                      setUploadError(null);

                      // Store selected files for display
                      setSelectedFiles(files);

                      // Upload the batch of files
                      handleFileUpload(files).finally(() => {
                        // Clear selected files after upload completes
                        setSelectedFiles([]);
                      });

                      // Reset the input to allow selecting more files later
                      e.target.value = '';
                    }
                  }}
                  disabled={isUploading}
                  className="hidden"
                  id="documents-upload"
                />
                <label htmlFor="documents-upload" className="cursor-pointer block">
                  {isUploading ? (
                    <LoadingSpinner size="lg" />
                  ) : (
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  )}
                  <p className="mt-2 text-sm font-medium text-gray-900">
                    {isUploading ? 'Uploading files...' : 'Upload Verification Documents'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    .jpg, .jpeg, .png, .pdf up to 5MB each
                  </p>
                  <p className="text-xs text-primary mt-1 font-medium">
                    Maximum {MAX_FILES_PER_UPLOAD} files per upload
                  </p>
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        <DataTable
          title="All Uploaded Files"
          columns={createFilesColumns(handleDeleteFile)}
          data={allFiles}
          searchKey="fileName"
          searchPlaceholder="Search files..."
          enablePagination={true}
          pageSize={10}
          initialLoading={isLoading}
          enableSorting={false}
        />
      </div>
    </DashboardPageWrapper>
  );
}
