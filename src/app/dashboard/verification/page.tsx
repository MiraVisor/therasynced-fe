'use client';

import {
  AlertCircle,
  Award,
  Calendar,
  CheckCircle,
  Clock,
  Download,
  FileText,
  Plus,
  Shield,
  Trash2,
  Upload,
  User,
  XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import { DataTable } from '@/components/common/DataTable/data-table';
import { createFilesColumns } from '@/components/common/DataTable/files-columns';
import { FileUpload } from '@/components/common/input/FileUpload';
import { DashboardPageWrapper } from '@/components/core/Dashboard/DashboardPageWrapper';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  deleteCertificate,
  getFirstAidCertificateStatus,
  uploadFirstAidCertificate,
} from '@/redux/api/certificateApi';
import {
  deleteVerificationDocument,
  getFreelancerFiles,
  getVerificationDocuments,
  getVerificationStatus,
  requestVerification,
  uploadVerificationDocument,
} from '@/redux/api/verificationApi';
import { useAuth } from '@/redux/hooks/useAppHooks';
import {
  selectAllFiles,
  selectFilesError,
  selectFilesLoading,
} from '@/redux/slices/verificationSlice';
import { RootState } from '@/redux/store';
import { FreelancerFile, ROLES } from '@/types/types';

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
  const dispatch = useDispatch();

  // Get data from Redux store
  const verificationState = useSelector((state: RootState) => state.verification);
  const certificateState = useSelector((state: RootState) => state.certificate);
  const allFiles = useSelector(selectAllFiles);
  const filesLoading = useSelector(selectFilesLoading);
  const filesError = useSelector(selectFilesError);

  // Local state
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        await Promise.all([
          dispatch(getVerificationStatus() as any),
          dispatch(getFirstAidCertificateStatus() as any),
          dispatch(getVerificationDocuments() as any),
          dispatch(getFreelancerFiles() as any),
        ]);
      } catch (error) {
        console.error('Error fetching verification data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [dispatch]);

  // Redirect if not freelancer
  useEffect(() => {
    if (role && role !== ROLES.FREELANCER) {
      window.location.href = '/dashboard';
    }
  }, [role]);

  if (role !== ROLES.FREELANCER) {
    return null;
  }

  // Get certificate status from files data if available, otherwise from certificate state
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

    // Fallback to certificate state
    return {
      status: certificateState?.certificate?.firstAidCertificateStatus || 'PENDING',
      url: certificateState?.certificate?.firstAidCertificateUrl,
      uploadedAt: certificateState?.certificate?.firstAidCertificateUrl
        ? new Date().toISOString()
        : undefined,
      approvedAt: certificateState?.certificate?.firstAidCertificateApprovedAt?.toString(),
      rejectedAt: certificateState?.certificate?.firstAidCertificateRejectedAt?.toString(),
      rejectionReason:
        certificateState?.certificate?.firstAidCertificateRejectionReason || undefined,
    };
  };

  const certificateStatus: CertificateStatus = getCertificateStatus();

  const verificationStatus: VerificationStatus = {
    status:
      verificationState?.verificationStatus === 'NOT_SUBMITTED'
        ? 'UNVERIFIED'
        : verificationState?.verificationStatus || 'UNVERIFIED',
    documents: verificationState?.documents || [],
  };

  const documents: VerificationDocument[] = verificationState?.documents || [];

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

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    try {
      await dispatch(uploadVerificationDocument(file) as any);
      toast.success('Document uploaded successfully');
      // Refetch files data after successful upload
      await dispatch(getFreelancerFiles() as any);
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to upload document');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCertificateUpload = async (file: File) => {
    try {
      await dispatch(uploadFirstAidCertificate(file) as any);
      toast.success('Certificate uploaded successfully');
      // Refetch files data after successful upload
      await dispatch(getFreelancerFiles() as any);
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to upload certificate');
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    try {
      await dispatch(deleteVerificationDocument(documentId) as any);
      toast.success('Document deleted successfully');
      // Refetch files data after successful deletion
      await dispatch(getFreelancerFiles() as any);
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to delete document');
    }
  };

  const handleDeleteFile = async (fileId: string, fileType: string) => {
    try {
      if (fileType === 'CERTIFICATE') {
        // Delete first aid certificate
        await dispatch(deleteCertificate() as any);
        toast.success('First aid certificate deleted successfully');
      } else if (fileType === 'VERIFICATION_DOCUMENT') {
        // Delete verification document
        await dispatch(deleteVerificationDocument(fileId) as any);
        toast.success('Verification document deleted successfully');
      }
      // Refetch files data after successful deletion
      await dispatch(getFreelancerFiles() as any);
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to delete file');
    }
  };

  const handleRequestVerification = async () => {
    try {
      await dispatch(requestVerification() as any);
      toast.success('Verification request submitted successfully');
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to submit verification request');
    }
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
          <h1 className="text-3xl font-bold text-gray-900">Verification Center</h1>
          <p className="text-gray-600 mt-2">
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

              {certificateStatus.rejectionReason && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
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
                    if (e.target.files && e.target.files[0]) {
                      handleCertificateUpload(e.target.files[0]);
                    }
                  }}
                  disabled={isUploading}
                  className="hidden"
                  id="certificate-upload"
                />
                <label htmlFor="certificate-upload" className="cursor-pointer block">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm font-medium text-gray-900">
                    Upload First Aid Certificate
                  </p>
                  <p className="text-xs text-gray-500 mt-1">.jpg, .jpeg, .png, .pdf up to 5MB</p>
                </label>
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

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  multiple
                  onChange={(e) => {
                    if (e.target.files) {
                      for (const file of Array.from(e.target.files)) {
                        handleFileUpload(file);
                      }
                    }
                  }}
                  disabled={isUploading}
                  className="hidden"
                  id="documents-upload"
                />
                <label htmlFor="documents-upload" className="cursor-pointer block">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm font-medium text-gray-900">
                    Upload Verification Documents
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    .jpg, .jpeg, .png, .pdf up to 5MB each (multiple allowed)
                  </p>
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* All Uploaded Files Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              All Uploaded Files
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filesError && (
              <Alert className="border-red-200 bg-red-50 mb-4">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  Error loading files: {filesError}
                </AlertDescription>
              </Alert>
            )}

            {filesLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-sm text-gray-600">Loading files...</span>
              </div>
            ) : allFiles && allFiles.length > 0 ? (
              <DataTable
                columns={createFilesColumns(handleDeleteFile)}
                data={allFiles}
                searchKey="fileName"
                searchPlaceholder="Search files..."
                enablePagination={true}
                pageSize={10}
                enableSorting={false}
              />
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No files uploaded yet</p>
                <p className="text-sm">Upload documents and certificates to see them here</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardPageWrapper>
  );
}
