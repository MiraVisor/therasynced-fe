'use client';

import type { ColumnDef } from '@tanstack/react-table';
import {
  AlertCircle,
  Award,
  CheckCircle,
  Clock,
  ExternalLink,
  Shield,
  Trash2,
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
import {
  useDeleteFile,
  useFreelancerFilesList,
  useGetFileSignedUrl,
  useUploadFiles,
} from '@/hooks/queries/useFreelancerFiles';
import { useRequestVerification, useVerificationStatus } from '@/hooks/queries/useVerification';
import { useAuth } from '@/hooks/useAuthZustand';
import { FileMetadata } from '@/services/freelancerFileService';
import { ROLES } from '@/types/types';
import { formatFileSize } from '@/utils/fileUpload';

// Dynamically import DataTable to ensure it's client-only
const DataTable = dynamic(
  () =>
    import('@/components/common/DataTable/data-table').then((mod) => ({ default: mod.DataTable })),
  { ssr: false },
);

export default function VerificationPage() {
  const { role } = useAuth();

  // State for file upload
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [fileTitles, setFileTitles] = useState<string[]>([]);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<FileMetadata | null>(null);

  // React Query hooks
  const { data: verificationStatusData, isLoading: isLoadingVerificationStatus } =
    useVerificationStatus();
  const { data: filesData, isLoading: isLoadingFiles } = useFreelancerFilesList();
  const { data: certificateStatusData, isLoading: isLoadingCertificate } =
    useFirstAidCertificateStatus();

  // Ensure files is always an array
  const files: FileMetadata[] = Array.isArray(filesData) ? filesData : [];

  const uploadMutation = useUploadFiles();
  const deleteMutation = useDeleteFile();
  const signedUrlMutation = useGetFileSignedUrl();
  const { mutate: requestVerificationMutation } = useRequestVerification();

  const isLoading = isLoadingVerificationStatus || isLoadingFiles || isLoadingCertificate;

  // Redirect if not freelancer
  useEffect(() => {
    if (role && role !== ROLES.FREELANCER) {
      window.location.href = '/dashboard';
    }
  }, [role]);

  if (role !== ROLES.FREELANCER) {
    return null;
  }

  // Get verification status
  const verificationStatus =
    verificationStatusData?.verificationStatus === 'NOT_SUBMITTED'
      ? 'UNVERIFIED'
      : verificationStatusData?.verificationStatus || 'UNVERIFIED';

  // Get certificate status
  const certificateStatus = certificateStatusData?.firstAidCertificateStatus || 'PENDING';

  // Filter files by category
  const verificationFiles = files.filter((f) => f.category === 'VERIFICATION');

  // Handle upload
  const handleUpload = () => {
    if (selectedFiles.length === 0) {
      toast.error('Please select at least one file');
      return;
    }

    if (selectedFiles.length !== fileTitles.length) {
      toast.error('Please provide a title for each file');
      return;
    }

    // Validate all titles are filled
    for (let i = 0; i < fileTitles.length; i++) {
      if (!fileTitles[i]?.trim()) {
        toast.error(`Please provide a title for file ${i + 1}`);
        return;
      }
    }

    uploadMutation.mutate(
      {
        files: selectedFiles,
        titles: fileTitles.map((t) => t.trim()),
        category: 'VERIFICATION',
      },
      {
        onSuccess: () => {
          setSelectedFiles([]);
          setFileTitles([]);
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
              {verificationStatus === 'UNVERIFIED' && verificationFiles.length > 0 && (
                <Button
                  onClick={handleRequestVerification}
                  size="sm"
                  className="mt-4 w-full"
                  disabled={uploadMutation.isPending}
                >
                  Request Verification
                </Button>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Award className="h-4 w-4" />
                First Aid Certificate Status
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

        {/* File Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle>Upload Files</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* File Upload Component */}
            <FileUpload
              maxFiles={5}
              maxSize={10 * 1024 * 1024} // 10MB
              value={selectedFiles}
              onValueChange={setSelectedFiles}
              fileTitles={fileTitles}
              onTitlesChange={setFileTitles}
              showTitles={true}
              accept=".jpg,.jpeg,.png,.pdf"
              disabled={uploadMutation.isPending}
            />

            {/* Upload Button */}
            <Button
              onClick={handleUpload}
              disabled={
                uploadMutation.isPending ||
                selectedFiles.length === 0 ||
                selectedFiles.length !== fileTitles.length ||
                fileTitles.some((t) => !t?.trim())
              }
              className="w-full"
            >
              {uploadMutation.isPending ? 'Uploading...' : 'Upload Files'}
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
