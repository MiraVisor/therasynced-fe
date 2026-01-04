'use client';

import { ColumnDef } from '@tanstack/react-table';
import { CheckCircle, ChevronDown, MoreHorizontal, XCircle } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';

import { DataTable } from '@/components/common/DataTable/data-table';
import { StatusBadge } from '@/components/core/Dashboard/AdminSide/Components/StatusBadge';
import { DashboardPageWrapper } from '@/components/core/Dashboard/DashboardPageWrapper';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { EnhancedStatCard } from '@/components/ui/enhanced-stat-card';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { StatsCardsSkeleton } from '@/components/ui/skeletons/StatsCardsSkeleton';
import { useAdminVerifications, useAdminVerificationStats } from '@/hooks/queries/useAdmin';
import { useAdminGetFileSignedUrl } from '@/hooks/queries/useFreelancerFiles';
import adminVerificationService, {
  type PendingVerificationResponse,
} from '@/services/adminVerificationService';

interface VerificationStats {
  pending: number;
  approved: number;
  rejected: number;
  total: number;
}

const statsConfig = [
  {
    key: 'total' as keyof VerificationStats,
    title: 'Total Verifications',
  },
  {
    key: 'pending' as keyof VerificationStats,
    title: 'Pending',
  },
  {
    key: 'approved' as keyof VerificationStats,
    title: 'Approved',
  },
  {
    key: 'rejected' as keyof VerificationStats,
    title: 'Rejected',
  },
];

const VerificationsPage = () => {
  // Dialog states
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);
  const [selectedFreelancer, setSelectedFreelancer] = useState<PendingVerificationResponse | null>(
    null,
  );
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dialogType, setDialogType] = useState<'verification' | 'certificate'>('verification');
  const [pendingAction, setPendingAction] = useState<{
    type: 'verification' | 'certificate';
    action: 'approve' | 'reject';
  } | null>(null);

  // Fetch verifications with pagination and status filter
  const {
    data: verificationsData,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useAdminVerifications({
    page: 1,
    limit: 100, // Maximum allowed by API
  });

  const allVerifications = verificationsData?.verifications || [];

  // Separate verifications and first aid certificates
  const verificationItems = useMemo(() => {
    return allVerifications.filter((item) => {
      const freelancerFiles = item.freelancerFiles || [];
      const hasVerificationFiles = freelancerFiles.some((file) => file.category === 'VERIFICATION');
      const hasLegacyVerificationDocs =
        item.verificationDocuments && item.verificationDocuments.length > 0;
      return hasVerificationFiles || hasLegacyVerificationDocs;
    });
  }, [allVerifications]);

  const firstAidItems = useMemo(() => {
    return allVerifications.filter((item) => {
      const freelancerFiles = item.freelancerFiles || [];
      const hasFirstAidFiles = freelancerFiles.some(
        (file) => file.category === 'FIRST_AID_CERTIFICATE',
      );
      const hasLegacyCertificate = !!item.firstAidCertificateUrl;
      return hasFirstAidFiles || hasLegacyCertificate;
    });
  }, [allVerifications]);

  // Fetch stats
  const {
    data: statsData,
    isLoading: statsLoading,
    error: statsError,
    refetch: refetchStats,
  } = useAdminVerificationStats();

  const stats: VerificationStats = statsData?.data
    ? {
        total: statsData.data.total || 0,
        pending: statsData.data.pending || 0,
        approved: statsData.data.approved || 0,
        rejected: statsData.data.rejected || 0,
      }
    : {
        pending: 0,
        approved: 0,
        rejected: 0,
        total: 0,
      };

  // Show error toast only when no cached data exists
  useEffect(() => {
    if (error && !verificationsData) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load verifications';
      toast.error(errorMessage);
    }
  }, [error, verificationsData]);

  useEffect(() => {
    if (statsError && !statsData) {
      const errorMessage =
        statsError instanceof Error ? statsError.message : 'Failed to load verification stats';
      toast.error(errorMessage);
    }
  }, [statsError, statsData]);

  // Handle action submission - admins can approve/reject at any time
  // Backend handles clearing opposite status fields automatically
  const handleActionSubmit = async () => {
    if (!selectedFreelancer || !pendingAction) return;

    if (pendingAction.action === 'reject' && !rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    try {
      setIsSubmitting(true);
      let response;

      if (pendingAction.type === 'verification') {
        if (pendingAction.action === 'approve') {
          response = await adminVerificationService.approve({
            freelancerId: selectedFreelancer.id || selectedFreelancer.freelancerId || '',
          });
        } else {
          response = await adminVerificationService.reject({
            freelancerId: selectedFreelancer.id || selectedFreelancer.freelancerId || '',
            rejectionReason: rejectionReason.trim(),
          });
        }
      } else {
        if (pendingAction.action === 'approve') {
          response = await adminVerificationService.approveCertificate({
            freelancerId: selectedFreelancer.id || selectedFreelancer.freelancerId || '',
          });
        } else {
          response = await adminVerificationService.rejectCertificate({
            freelancerId: selectedFreelancer.id || selectedFreelancer.freelancerId || '',
            rejectionReason: rejectionReason.trim(),
          });
        }
      }

      if (response.success) {
        const actionText = pendingAction.action === 'approve' ? 'approved' : 'rejected';
        const typeText =
          pendingAction.type === 'verification' ? 'verification' : 'first aid certificate';
        toast.success(`${typeText} ${actionText} successfully`);
        handleCloseActionDialog();

        // Refresh data with a small delay to prevent overwhelming the server
        setTimeout(() => {
          refetch();
          refetchStats();
        }, 500);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message || `Failed to ${pendingAction.action} ${pendingAction.type}`);
      } else {
        toast.error(`Failed to ${pendingAction.action} ${pendingAction.type}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle opening verification action dialog
  const handleOpenVerificationActionDialog = (freelancer: PendingVerificationResponse) => {
    setSelectedFreelancer(freelancer);
    setDialogType('verification');
    setPendingAction(null); // Reset to show options
    setRejectionReason('');
    setIsActionDialogOpen(true);
  };

  // Handle opening first aid action dialog
  const handleOpenFirstAidActionDialog = (freelancer: PendingVerificationResponse) => {
    setSelectedFreelancer(freelancer);
    setDialogType('certificate');
    setPendingAction(null); // Reset to show options
    setRejectionReason('');
    setIsActionDialogOpen(true);
  };

  // Handle closing action dialog
  const handleCloseActionDialog = () => {
    setIsActionDialogOpen(false);
    setSelectedFreelancer(null);
    setPendingAction(null);
    setRejectionReason('');
    setDialogType('verification');
  };

  // Helper function to get status text
  const getStatusText = (status: string | undefined) => {
    if (status === 'APPROVED') return 'Yes';
    if (status === 'REJECTED') return 'No';
    return 'Pending';
  };

  // Helper function to extract document name from URL
  const getDocumentName = (url: string, index: number) => {
    try {
      const urlParts = url.split('/');
      const filename = urlParts[urlParts.length - 1];
      if (!filename) {
        return `Document ${index + 1}`;
      }
      const cleanName = filename.split('?')[0];
      if (!cleanName) {
        return `Document ${index + 1}`;
      }
      const decoded = decodeURIComponent(cleanName);
      if (decoded.length < 3 || decoded.includes('%')) {
        return `Document ${index + 1}`;
      }
      return decoded.length > 40 ? `${decoded.substring(0, 40)}...` : decoded;
    } catch {
      return `Document ${index + 1}`;
    }
  };

  const signedUrlMutation = useAdminGetFileSignedUrl();

  const handleFileView = async (fileId: string) => {
    try {
      const data = await signedUrlMutation.mutateAsync(fileId);

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
    } catch (error) {
      console.error('Error loading PDF:', error);
      toast.error('Failed to load PDF. Please try again.');
    }
  };

  // Verification columns - only shows verification-related data
  const verificationColumns: ColumnDef<PendingVerificationResponse>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <div>
          <div className="font-inter font-medium text-charcoal">{row.original.name}</div>
          <div className="font-inter text-xs text-muted-foreground">{row.original.email}</div>
        </div>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const freelancerFiles = row.original.freelancerFiles || [];
        const { verificationStatus } = row.original;
        const legacyDocuments = row.original.verificationDocuments || [];

        // Check if verification files exist
        const hasVerificationFiles = freelancerFiles.some(
          (file) => file.category === 'VERIFICATION',
        );
        const hasLegacyVerificationDocs = legacyDocuments.length > 0;

        // Determine verification status based on files
        const verificationFileStatus =
          hasVerificationFiles || hasLegacyVerificationDocs
            ? verificationStatus || 'PENDING'
            : null;

        return (
          <div className="flex items-center gap-2">
            {verificationFileStatus ? (
              <span
                className={`font-inter text-sm font-medium ${
                  verificationFileStatus === 'APPROVED'
                    ? 'text-green-600'
                    : verificationFileStatus === 'REJECTED'
                      ? 'text-red-600'
                      : 'text-yellow-600'
                }`}
              >
                {getStatusText(verificationFileStatus)}
              </span>
            ) : (
              <span className="font-inter text-sm font-medium text-muted-foreground">
                Not uploaded
              </span>
            )}
          </div>
        );
      },
    },
    {
      id: 'docs',
      header: 'Documents',
      cell: ({ row }) => {
        const freelancerFiles = row.original.freelancerFiles || [];
        const legacyDocuments = row.original.verificationDocuments || [];

        // Filter only verification documents
        const verificationDocs: Array<{ url: string; name: string; id?: string }> = [];

        // Add files from freelancerFiles array (new API) - only VERIFICATION category
        const verificationFiles = freelancerFiles.filter(
          (file) => file.category === 'VERIFICATION',
        );
        if (verificationFiles.length > 0) {
          verificationFiles.forEach((file) => {
            verificationDocs.push({
              url: file.fileUrl,
              name: file.title || file.fileName || 'Untitled',
              id: file.id,
            });
          });
        } else if (legacyDocuments.length > 0) {
          // Fallback to legacy verificationDocuments
          legacyDocuments.forEach((docUrl: string, index: number) => {
            verificationDocs.push({
              url: docUrl,
              name: getDocumentName(docUrl, index),
            });
          });
        }

        if (verificationDocs.length === 0) {
          return <span className="font-inter text-sm text-muted-foreground">No documents</span>;
        }

        const visibleDocs = verificationDocs.slice(0, 3);
        const remainingDocs = verificationDocs.slice(3);

        return (
          <div className="flex flex-col gap-1 max-w-xs">
            {visibleDocs.map((doc, index) =>
              doc.id ? (
                <div key={index} className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleFileView(doc.id!)}
                    className="font-inter text-xs text-primary hover:underline truncate text-left flex-1"
                    title={doc.name}
                  >
                    {doc.name}
                  </button>
                </div>
              ) : (
                <div key={index} className="flex items-center gap-1.5">
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-inter text-xs text-primary hover:underline truncate flex-1"
                    title={doc.name}
                  >
                    {doc.name}
                  </a>
                </div>
              ),
            )}
            {remainingDocs.length > 0 && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-3 text-xs font-semibold border-dashed border-primary/50 text-primary flex items-center gap-1"
                  >
                    <ChevronDown className="h-3 w-3 mr-1" />
                    Show all {verificationDocs.length} docs
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-3" align="start">
                  <div className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                    <span>Verification Documents</span>
                    <span className="bg-accent text-accent-foreground rounded-full px-2 py-0.5 text-[11px] font-bold">
                      {verificationDocs.length}
                    </span>
                  </div>
                  <div className="max-h-[320px] overflow-y-auto bg-muted/40 rounded p-1">
                    <ol className="pl-4 list-decimal text-xs space-y-1">
                      {verificationDocs.map((doc, index) => (
                        <li key={index} className="flex items-center gap-1.5">
                          {doc.id ? (
                            <button
                              onClick={() => handleFileView(doc.id!)}
                              className="text-primary hover:underline truncate text-left w-full"
                              title={doc.name}
                            >
                              {doc.name}
                            </button>
                          ) : (
                            <a
                              href={doc.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline truncate"
                              title={doc.name}
                            >
                              {doc.name}
                            </a>
                          )}
                        </li>
                      ))}
                    </ol>
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </div>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        return (
          <Button
            size="sm"
            variant="outline"
            className="h-8"
            onClick={() => handleOpenVerificationActionDialog(row.original)}
          >
            <MoreHorizontal className="h-4 w-4 mr-1" />
            Actions
          </Button>
        );
      },
    },
  ];

  // First Aid Certificate columns - only shows certificate-related data
  const firstAidColumns: ColumnDef<PendingVerificationResponse>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <div>
          <div className="font-inter font-medium text-charcoal">{row.original.name}</div>
          <div className="font-inter text-xs text-muted-foreground">{row.original.email}</div>
        </div>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const freelancerFiles = row.original.freelancerFiles || [];
        const certificateStatus = row.original.firstAidCertificateStatus;
        const certificateUrl = row.original.firstAidCertificateUrl;

        // Check if first aid certificate files exist
        const hasFirstAidFiles = freelancerFiles.some(
          (file) => file.category === 'FIRST_AID_CERTIFICATE',
        );
        const hasLegacyCertificate = !!certificateUrl;

        // Determine first aid status based on files
        const firstAidFileStatus =
          hasFirstAidFiles || hasLegacyCertificate ? certificateStatus || 'PENDING' : null;

        return (
          <div className="flex items-center gap-2">
            {firstAidFileStatus ? (
              <span
                className={`font-inter text-sm font-medium ${
                  firstAidFileStatus === 'APPROVED'
                    ? 'text-green-600'
                    : firstAidFileStatus === 'REJECTED'
                      ? 'text-red-600'
                      : 'text-yellow-600'
                }`}
              >
                {getStatusText(firstAidFileStatus)}
              </span>
            ) : (
              <span className="font-inter text-sm font-medium text-muted-foreground">
                Not uploaded
              </span>
            )}
          </div>
        );
      },
    },
    {
      id: 'docs',
      header: 'Certificate',
      cell: ({ row }) => {
        const freelancerFiles = row.original.freelancerFiles || [];
        const certificateUrl = row.original.firstAidCertificateUrl;

        // Filter only first aid certificate documents
        const certificateDocs: Array<{ url: string; name: string; id?: string }> = [];

        // Add files from freelancerFiles array (new API) - only FIRST_AID_CERTIFICATE category
        const firstAidFiles = freelancerFiles.filter(
          (file) => file.category === 'FIRST_AID_CERTIFICATE',
        );
        if (firstAidFiles.length > 0) {
          firstAidFiles.forEach((file) => {
            certificateDocs.push({
              url: file.fileUrl,
              name: file.title || file.fileName || 'First Aid Certificate',
              id: file.id,
            });
          });
        } else if (certificateUrl) {
          // Fallback to legacy certificate URL
          certificateDocs.push({
            url: certificateUrl,
            name: 'First Aid Certificate',
          });
        }

        if (certificateDocs.length === 0) {
          return <span className="font-inter text-sm text-muted-foreground">No certificate</span>;
        }

        return (
          <div className="flex flex-col gap-1 max-w-xs">
            {certificateDocs.map((doc, index) =>
              doc.id ? (
                <div key={index} className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleFileView(doc.id!)}
                    className="font-inter text-xs text-primary hover:underline truncate text-left flex-1"
                    title={doc.name}
                  >
                    {doc.name}
                  </button>
                </div>
              ) : (
                <div key={index} className="flex items-center gap-1.5">
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-inter text-xs text-primary hover:underline truncate flex-1"
                    title={doc.name}
                  >
                    {doc.name}
                  </a>
                </div>
              ),
            )}
          </div>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        return (
          <Button
            size="sm"
            variant="outline"
            className="h-8"
            onClick={() => handleOpenFirstAidActionDialog(row.original)}
          >
            <MoreHorizontal className="h-4 w-4 mr-1" />
            Actions
          </Button>
        );
      },
    },
  ];

  return (
    <DashboardPageWrapper
      header={<h1 className="font-poppins font-bold text-2xl text-charcoal">Verification Queue</h1>}
    >
      <div className="space-y-6 lg:space-y-8">
        {/* Stats Cards */}
        {statsLoading && !statsData ? (
          <StatsCardsSkeleton count={4} />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {statsConfig.map((config) => (
              <EnhancedStatCard
                key={config.key}
                title={config.title}
                value={stats[config.key].toString()}
              />
            ))}
          </div>
        )}

        {/* Verification Documents Table */}
        <DataTable
          columns={verificationColumns}
          data={verificationItems}
          title="Verification Documents"
          searchKey="name"
          searchPlaceholder="Search by Freelancer..."
          enableSorting={false}
          enableFiltering={true}
          enableColumnVisibility={true}
          enablePagination={true}
          showSearch={false}
          showSorting={false}
          initialLoading={isLoading && !verificationItems.length}
          loading={isFetching}
          pageSize={10}
        />

        {/* First Aid Certificate Table */}
        <DataTable
          columns={firstAidColumns}
          data={firstAidItems}
          title="First Aid Certificates"
          searchKey="name"
          searchPlaceholder="Search by Freelancer..."
          enableSorting={false}
          enableFiltering={true}
          enableColumnVisibility={true}
          enablePagination={true}
          showSearch={false}
          showSorting={false}
          initialLoading={isLoading && !firstAidItems.length}
          loading={isFetching}
          pageSize={10}
        />
      </div>

      {/* Action Dialog */}
      <Dialog open={isActionDialogOpen} onOpenChange={handleCloseActionDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Take Action</DialogTitle>
            <DialogDescription>Select an action for {selectedFreelancer?.name}</DialogDescription>
          </DialogHeader>

          {!pendingAction ? (
            // Show action options - use dialogType to determine which type
            <div className="space-y-4">
              <div className="text-sm font-medium text-muted-foreground mb-4">
                {dialogType === 'verification' ? 'Verification Documents' : 'First Aid Certificate'}
              </div>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start text-success border-success hover:bg-success/10"
                  onClick={() => {
                    setPendingAction({
                      type: dialogType,
                      action: 'approve',
                    });
                  }}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                  <StatusBadge
                    status={
                      dialogType === 'verification'
                        ? selectedFreelancer?.verificationStatus || 'PENDING'
                        : selectedFreelancer?.firstAidCertificateStatus || 'PENDING'
                    }
                    size="sm"
                    className="ml-auto"
                  />
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start text-error border-error hover:bg-error/10"
                  onClick={() => {
                    setPendingAction({
                      type: dialogType,
                      action: 'reject',
                    });
                  }}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                  <StatusBadge
                    status={
                      dialogType === 'verification'
                        ? selectedFreelancer?.verificationStatus || 'PENDING'
                        : selectedFreelancer?.firstAidCertificateStatus || 'PENDING'
                    }
                    size="sm"
                    className="ml-auto"
                  />
                </Button>
              </div>
            </div>
          ) : (
            // Confirmation and rejection reason if needed
            <div className="space-y-4">
              <div className="text-sm">
                You are about to{' '}
                <span
                  className={`font-medium ${pendingAction.action === 'approve' ? 'text-success' : 'text-error'}`}
                >
                  {pendingAction.action}
                </span>{' '}
                the{' '}
                <span className="font-medium">
                  {pendingAction.type === 'verification'
                    ? 'freelancer verification'
                    : 'first aid certificate'}
                </span>{' '}
                for {selectedFreelancer?.name}.
              </div>

              {pendingAction.action === 'reject' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Rejection Reason</label>
                  <Input
                    placeholder="Enter rejection reason..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
              )}
            </div>
          )}

          {pendingAction && (
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setPendingAction(null)}
                disabled={isSubmitting}
              >
                Back
              </Button>
              <Button variant="outline" onClick={handleCloseActionDialog} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                onClick={handleActionSubmit}
                disabled={
                  isSubmitting || (pendingAction.action === 'reject' && !rejectionReason.trim())
                }
                variant={pendingAction.action === 'reject' ? 'destructive' : 'default'}
              >
                {isSubmitting
                  ? `${pendingAction.action === 'approve' ? 'Approving' : 'Rejecting'}...`
                  : `${pendingAction.action === 'approve' ? 'Approve' : 'Reject'}`}
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </DashboardPageWrapper>
  );
};

export default VerificationsPage;
