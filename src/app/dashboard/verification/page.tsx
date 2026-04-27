'use client';

import type { ColumnDef } from '@tanstack/react-table';
import {
  AlertCircle,
  Award,
  CheckCircle,
  Circle,
  Clock,
  ExternalLink,
  FileCheck,
  Shield,
  Trash2,
  Upload,
  XCircle,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { DashboardPageWrapper } from '@/components/core/Dashboard/DashboardPageWrapper';
import { Badge } from '@/components/ui/badge';
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
import { FileUpload } from '@/components/ui/file-upload';
import { useFirstAidCertificateStatus } from '@/hooks/queries/useCertificate';
import { useMyDocumentRequirementsStatus } from '@/hooks/queries/useDocumentRequirements';
import {
  useDeleteFile,
  useFreelancerFilesList,
  useGetFileSignedUrl,
  useUploadFiles,
} from '@/hooks/queries/useFreelancerFiles';
import { useRequestVerification, useVerificationStatus } from '@/hooks/queries/useVerification';
import { useAuth } from '@/hooks/useAuthZustand';
import { FreelancerRequirementStatus } from '@/services/documentRequirementService';
import { FileMetadata } from '@/services/freelancerFileService';
import { ROLES } from '@/types/types';
import { formatFileSize } from '@/utils/fileUpload';

// Dynamically import DataTable to ensure it's client-only
const DataTable = dynamic(
  () =>
    import('@/components/common/DataTable/data-table').then((mod) => ({ default: mod.DataTable })),
  { ssr: false },
);

function getExpiryBadge(expiryDate: string) {
  const now = new Date();
  const expiry = new Date(expiryDate);
  const diffMs = expiry.getTime() - now.getTime();
  const diffMonths = diffMs / (1000 * 60 * 60 * 24 * 30);
  const formatted = expiry.toLocaleDateString('en-IE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  if (diffMs < 0) {
    return { text: `Expired ${formatted}`, className: 'text-red-600 font-medium' };
  }
  if (diffMonths <= 6) {
    return { text: `Expires ${formatted}`, className: 'text-amber-600 font-medium' };
  }
  return { text: `Expires ${formatted}`, className: 'text-muted-foreground' };
}

export default function VerificationPage() {
  const { role } = useAuth();

  // State for requirement upload modal
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedRequirement, setSelectedRequirement] =
    useState<FreelancerRequirementStatus | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  // State for first aid certificate upload
  const [selectedCertificateFiles, setSelectedCertificateFiles] = useState<File[]>([]);
  const [certificateFileTitles, setCertificateFileTitles] = useState<string[]>([]);

  // Common state
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<FileMetadata | null>(null);

  // React Query hooks
  const { data: verificationStatusData, isLoading: isLoadingVerificationStatus } =
    useVerificationStatus();
  const { data: filesData, isLoading: isLoadingFiles } = useFreelancerFilesList();
  const { data: certificateStatusData, isLoading: isLoadingCertificate } =
    useFirstAidCertificateStatus();
  const { data: requirementsStatus, isLoading: isLoadingRequirements } =
    useMyDocumentRequirementsStatus();

  // Ensure files is always an array
  const files: FileMetadata[] = Array.isArray(filesData) ? filesData : [];

  // Calculate requirements completion stats
  const totalRequirements = requirementsStatus?.length || 0;
  const completedRequirements = requirementsStatus?.filter((r) => r.uploaded).length || 0;
  const mandatoryRequirements = requirementsStatus?.filter((r) => r.requirement.isMandatory) || [];
  const mandatoryCompleted = mandatoryRequirements.filter((r) => r.uploaded).length;
  const allMandatoryComplete =
    mandatoryRequirements.length === 0 || mandatoryCompleted === mandatoryRequirements.length;

  const uploadMutation = useUploadFiles();
  const deleteMutation = useDeleteFile();
  const signedUrlMutation = useGetFileSignedUrl();
  const { mutate: requestVerificationMutation } = useRequestVerification();

  const isLoading =
    isLoadingVerificationStatus || isLoadingFiles || isLoadingCertificate || isLoadingRequirements;

  // Redirect if not freelancer
  useEffect(() => {
    if (role && role !== ROLES.FREELANCER) {
      window.location.href = '/dashboard';
    }
  }, [role]);

  if (role !== ROLES.FREELANCER) {
    return null;
  }

  // Derive effective verification status:
  // – REJECTED always surfaces (freelancer must re-upload)
  // – APPROVED only when the admin approved AND every mandatory doc is uploaded
  // – PENDING when docs are submitted but awaiting admin review
  // – UNVERIFIED otherwise
  const backendStatus =
    verificationStatusData?.verificationStatus === 'NOT_SUBMITTED'
      ? 'UNVERIFIED'
      : verificationStatusData?.verificationStatus || 'UNVERIFIED';

  let verificationStatus = backendStatus;
  if (backendStatus === 'APPROVED' && !allMandatoryComplete) {
    // Admin approved previously but mandatory docs are now missing - downgrade
    verificationStatus = 'PENDING';
  }

  // Get certificate status
  const certificateStatus = certificateStatusData?.firstAidCertificateStatus || 'PENDING';

  // Filter files by category
  const verificationFiles = files.filter((f) => f.category === 'VERIFICATION');

  // Handle requirement document upload (from modal)
  const handleRequirementUpload = () => {
    if (!uploadFile || !selectedRequirement) return;

    uploadMutation.mutate(
      {
        files: [uploadFile],
        titles: [selectedRequirement.requirement.name], // Auto-fill title from requirement name
        category: 'VERIFICATION',
        requirementId: selectedRequirement.requirement.id,
      },
      {
        onSuccess: () => {
          setUploadModalOpen(false);
          setUploadFile(null);
          setSelectedRequirement(null);
        },
      },
    );
  };

  // Handle first aid certificate upload
  const handleCertificateUpload = () => {
    if (selectedCertificateFiles.length === 0) {
      toast.error('Please select at least one file');
      return;
    }

    if (selectedCertificateFiles.length !== certificateFileTitles.length) {
      toast.error('Please provide a title for each file');
      return;
    }

    // Validate all titles are filled
    for (let i = 0; i < certificateFileTitles.length; i++) {
      if (!certificateFileTitles[i]?.trim()) {
        toast.error(`Please provide a title for file ${i + 1}`);
        return;
      }
    }

    uploadMutation.mutate(
      {
        files: selectedCertificateFiles,
        titles: certificateFileTitles.map((t) => t.trim()),
        category: 'FIRST_AID_CERTIFICATE',
      },
      {
        onSuccess: () => {
          setSelectedCertificateFiles([]);
          setCertificateFileTitles([]);
        },
      },
    );
  };

  // Handle download - opens file in new tab using signed URL
  const handleDownload = async (file: FileMetadata) => {
    setDownloadingId(file.id);
    try {
      const data = await signedUrlMutation.mutateAsync(file.id);

      // Fetch the PDF as a blob to avoid CORS issues
      const response = await fetch(data.signedUrl, {
        method: 'GET',
        headers: {
          Accept: 'application/pdf',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch PDF');
      }

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      // Open the blob URL in a new tab
      window.open(blobUrl, '_blank');

      // Clean up the blob URL after a delay
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);

      setDownloadingId(null);
    } catch (error) {
      console.error('Error loading PDF:', error);
      toast.error('Failed to load PDF. Please try again.');
      setDownloadingId(null);
    }
  };

  // Handle delete
  const handleDelete = (file: FileMetadata) => {
    setFileToDelete(file);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!fileToDelete) return;

    deleteMutation.mutate(fileToDelete.id, {
      onSuccess: () => {
        setDeleteDialogOpen(false);
        setFileToDelete(null);
      },
    });
  };

  // Handle request verification
  const handleRequestVerification = () => {
    requestVerificationMutation(undefined, {
      onSuccess: () => {
        toast.success('Verification request submitted successfully');
      },
    });
  };

  // Table columns
  const columns: ColumnDef<FileMetadata>[] = [
    {
      accessorKey: 'title',
      header: 'Title',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="font-medium">{row.original.title}</span>
        </div>
      ),
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }) => {
        const { category } = row.original;
        return (
          <Badge
            variant="outline"
            className={
              category === 'FIRST_AID_CERTIFICATE'
                ? 'bg-red-50 text-red-700 border-red-200  '
                : 'bg-blue-50 text-blue-700 border-blue-200  '
            }
          >
            {category === 'FIRST_AID_CERTIFICATE' ? 'EFR Certificate' : 'Verification'}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'fileName',
      header: 'File Name',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">{row.original.fileName}</span>
      ),
    },
    {
      accessorKey: 'fileSize',
      header: 'Size',
      cell: ({ row }) => <span className="text-sm">{formatFileSize(row.original.fileSize)}</span>,
    },
    {
      accessorKey: 'createdAt',
      header: 'Uploaded',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.createdAt && (
            <>
              {new Date(row.original.createdAt).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
              })}
            </>
          )}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const file = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDownload(file)}
              disabled={downloadingId === file.id}
            >
              {downloadingId === file.id ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
              ) : (
                <ExternalLink className="h-4 w-4" />
              )}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => handleDelete(file)}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        );
      },
    },
  ];

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

  return (
    <DashboardPageWrapper
      header={
        <div>
          <h1 className="font-poppins font-bold text-2xl text-charcoal">Verification Center</h1>
          <p className="font-inter text-muted-foreground mt-2">
            Upload your professional documents and track your verification status
          </p>
        </div>
      }
      showNotifications={true}
      userRole={role}
    >
      <div className="space-y-6 lg:space-y-8">
        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Verification Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                {getStatusBadge(verificationStatus)}
              </div>
              {verificationStatus === 'UNVERIFIED' &&
                allMandatoryComplete &&
                verificationFiles.length > 0 && (
                  <Button
                    onClick={handleRequestVerification}
                    size="sm"
                    className="mt-4 w-full"
                    disabled={uploadMutation.isPending}
                  >
                    Request Verification
                  </Button>
                )}
              {verificationStatus === 'UNVERIFIED' &&
                !allMandatoryComplete &&
                mandatoryRequirements.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-3">
                    Upload all mandatory documents before requesting verification.
                  </p>
                )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Award className="h-4 w-4" />
                EFR Certificate Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                {getStatusBadge(certificateStatus)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Document Requirements Checklist */}
        {requirementsStatus && requirementsStatus.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCheck className="h-5 w-5" />
                Document Requirements Checklist
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Complete the required documents for your job title.{' '}
                {mandatoryRequirements.length > 0 && (
                  <span className="font-medium text-destructive">
                    Mandatory documents must be uploaded before you can create slots.
                  </span>
                )}
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Progress Summary */}
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="text-sm font-medium">Progress</span>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">
                    {completedRequirements} of {totalRequirements} uploaded
                  </span>
                  {allMandatoryComplete ? (
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Ready to Create Slots
                    </Badge>
                  ) : (
                    <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {mandatoryRequirements.length - mandatoryCompleted} Mandatory Missing
                    </Badge>
                  )}
                </div>
              </div>

              {/* Requirements List */}
              <div className="space-y-2">
                {requirementsStatus.map((item) => (
                  <div
                    key={item.requirement.id}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      item.uploaded
                        ? 'bg-green-50/50 border-green-200 '
                        : item.requirement.isMandatory
                          ? 'bg-amber-50/50 border-amber-200 '
                          : 'bg-muted/30 border-border'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {item.uploaded ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground" />
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{item.requirement.name}</span>
                          {item.requirement.isMandatory && (
                            <Badge variant="destructive" className="text-xs py-0 h-5">
                              Required
                            </Badge>
                          )}
                        </div>
                        {item.requirement.description && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {item.requirement.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.uploaded && item.uploadedFile ? (
                        <div className="flex items-center gap-3">
                          <div className="text-xs text-muted-foreground text-right">
                            <span className="font-medium text-foreground">
                              {item.uploadedFile.fileName}
                            </span>
                            <br />
                            {new Date(item.uploadedFile.createdAt).toLocaleDateString()}
                            {item.uploadedFile.expiryDate && (
                              <>
                                <br />
                                <span
                                  className={getExpiryBadge(item.uploadedFile.expiryDate).className}
                                >
                                  {getExpiryBadge(item.uploadedFile.expiryDate).text}
                                </span>
                              </>
                            )}
                          </div>
                          {item.uploadedFile.expiryDate &&
                          new Date(item.uploadedFile.expiryDate) < new Date() ? (
                            <>
                              <Badge variant="outline" className="text-red-600 border-red-300">
                                <AlertCircle className="w-3 h-3 mr-1" />
                                Expired
                              </Badge>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 border-red-300 hover:bg-red-50"
                                onClick={() => {
                                  setSelectedRequirement(item);
                                  setUploadModalOpen(true);
                                }}
                              >
                                <Upload className="h-4 w-4 mr-1" />
                                Re-upload
                              </Button>
                            </>
                          ) : item.uploadedFile.expiryDate &&
                            (() => {
                              const diffMs =
                                new Date(item.uploadedFile.expiryDate).getTime() - Date.now();
                              return diffMs / (1000 * 60 * 60 * 24 * 30) <= 6;
                            })() ? (
                            <>
                              <Badge variant="outline" className="text-amber-600 border-amber-300">
                                <Clock className="w-3 h-3 mr-1" />
                                Expiring
                              </Badge>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-amber-600 border-amber-300 hover:bg-amber-50"
                                onClick={() => {
                                  setSelectedRequirement(item);
                                  setUploadModalOpen(true);
                                }}
                              >
                                <Upload className="h-4 w-4 mr-1" />
                                Re-upload
                              </Button>
                            </>
                          ) : (
                            <Badge variant="outline" className="text-green-600 border-green-300">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Uploaded
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedRequirement(item);
                            setUploadModalOpen(true);
                          }}
                        >
                          <Upload className="h-4 w-4 mr-1" />
                          Upload
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* First Aid Certificate Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Upload EFR Certificate
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Upload your Emergency First Responder (EFR) certificate for professional verification
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* File Upload Component */}
            <FileUpload
              maxFiles={1}
              maxSize={10 * 1024 * 1024} // 10MB
              value={selectedCertificateFiles}
              onValueChange={setSelectedCertificateFiles}
              fileTitles={certificateFileTitles}
              onTitlesChange={setCertificateFileTitles}
              showTitles={true}
              accept=".jpg,.jpeg,.png,.pdf"
              disabled={uploadMutation.isPending}
            />

            {/* Upload Button */}
            <Button
              onClick={handleCertificateUpload}
              disabled={
                uploadMutation.isPending ||
                selectedCertificateFiles.length === 0 ||
                selectedCertificateFiles.length !== certificateFileTitles.length ||
                certificateFileTitles.some((t) => !t?.trim())
              }
              className="w-full"
            >
              {uploadMutation.isPending ? 'Uploading...' : 'Upload EFR Certificate'}
            </Button>
          </CardContent>
        </Card>

        {/* Files Table */}

        <DataTable
          columns={columns as any}
          data={files}
          title="All Files"
          searchKey="title"
          searchPlaceholder="Search by title or filename..."
          enableSorting={true}
          enableFiltering={true}
          enableColumnVisibility={true}
          enablePagination={true}
          showSearch={true}
          showSorting={false}
          initialLoading={isLoading && files.length > 0}
          loading={isLoading}
        />

        {/* Requirement Upload Modal */}
        <Dialog
          open={uploadModalOpen}
          onOpenChange={(open) => {
            setUploadModalOpen(open);
            if (!open) {
              setUploadFile(null);
              setSelectedRequirement(null);
            }
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedRequirement?.uploaded ? 'Re-upload' : 'Upload'}:{' '}
                {selectedRequirement?.requirement.name}
              </DialogTitle>
              <DialogDescription>
                {selectedRequirement?.uploaded
                  ? 'Upload a new version to replace the existing document. The old file will be removed automatically.'
                  : selectedRequirement?.requirement.description || 'Select a file to upload.'}
              </DialogDescription>
            </DialogHeader>

            <FileUpload
              maxFiles={1}
              maxSize={10 * 1024 * 1024}
              value={uploadFile ? [uploadFile] : []}
              onValueChange={(files) => setUploadFile(files[0] || null)}
              accept=".jpg,.jpeg,.png,.pdf"
              disabled={uploadMutation.isPending}
            />

            <DialogFooter>
              <Button variant="outline" onClick={() => setUploadModalOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleRequirementUpload}
                disabled={!uploadFile || uploadMutation.isPending}
              >
                {uploadMutation.isPending ? 'Uploading...' : 'Upload'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Delete File</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete &quot;{fileToDelete?.title}&quot;? This action
                cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
                disabled={deleteMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardPageWrapper>
  );
}
