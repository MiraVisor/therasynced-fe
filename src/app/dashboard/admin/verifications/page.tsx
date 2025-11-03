'use client';

import { ColumnDef } from '@tanstack/react-table';
import {
  CheckCircle,
  Clock,
  ExternalLink,
  FileText,
  MoreHorizontal,
  Shield,
  XCircle,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
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
import LoadingSpinner from '@/components/ui/loading-spinner';
import { useVerifications } from '@/hooks/useVerifications';
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
    icon: Shield,
    iconColor: 'text-primary',
    iconBg: 'bg-primary/10',
  },
  {
    key: 'pending' as keyof VerificationStats,
    title: 'Pending',
    icon: Clock,
    iconColor: 'text-warning',
    iconBg: 'bg-warning/10',
  },
  {
    key: 'approved' as keyof VerificationStats,
    title: 'Approved',
    icon: CheckCircle,
    iconColor: 'text-success',
    iconBg: 'bg-success/10',
  },
  {
    key: 'rejected' as keyof VerificationStats,
    title: 'Rejected',
    icon: XCircle,
    iconColor: 'text-error',
    iconBg: 'bg-error/10',
  },
];

const VerificationsPage = () => {
  const router = useRouter();
  // State for pagination and search
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'PENDING' | 'APPROVED' | 'REJECTED' | undefined>(
    undefined,
  );

  // Dialog states
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);
  const [selectedActionType, setSelectedActionType] = useState<
    'verification' | 'certificate' | null
  >(null);
  const [selectedAction, setSelectedAction] = useState<'approve' | 'reject' | null>(null);
  const [selectedFreelancer, setSelectedFreelancer] = useState<PendingVerificationResponse | null>(
    null,
  );
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      // Reset to page 1 when search changes
      if (searchQuery !== debouncedSearch) {
        setPage(1);
      }
    }, 500); // 500ms debounce delay

    return () => clearTimeout(timer);
  }, [searchQuery, debouncedSearch]);

  // Fetch verifications with pagination, search, and status filter
  const { verifications, loading, initialLoading, error, pagination, refetch } = useVerifications({
    page,
    limit: pageSize,
    name: debouncedSearch || undefined,
    status: statusFilter,
  });

  // Calculate stats - we'll need to fetch these separately or from the API
  const [stats, setStats] = useState<VerificationStats>({
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  // Fetch stats separately
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setStatsLoading(true);
        const [pendingResponse, approvedResponse, rejectedResponse] = await Promise.all([
          adminVerificationService.getByStatus('PENDING'),
          adminVerificationService.getByStatus('APPROVED'),
          adminVerificationService.getByStatus('REJECTED'),
        ]);

        const pending = pendingResponse.success ? (pendingResponse.data || []).length : 0;
        const approved = approvedResponse.success ? (approvedResponse.data || []).length : 0;
        const rejected = rejectedResponse.success ? (rejectedResponse.data || []).length : 0;

        setStats({
          pending,
          approved,
          rejected,
          total: pending + approved + rejected,
        });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setStatsLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Function to refetch stats
  const refetchStats = async () => {
    try {
      setStatsLoading(true);
      const [pendingResponse, approvedResponse, rejectedResponse] = await Promise.all([
        adminVerificationService.getByStatus('PENDING'),
        adminVerificationService.getByStatus('APPROVED'),
        adminVerificationService.getByStatus('REJECTED'),
      ]);

      const pending = pendingResponse.success ? (pendingResponse.data || []).length : 0;
      const approved = approvedResponse.success ? (approvedResponse.data || []).length : 0;
      const rejected = rejectedResponse.success ? (rejectedResponse.data || []).length : 0;

      setStats({
        pending,
        approved,
        rejected,
        total: pending + approved + rejected,
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  // Handle action submission
  const handleActionSubmit = async () => {
    if (!selectedFreelancer || !selectedActionType || !selectedAction) return;

    if (selectedAction === 'reject' && !rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    try {
      setIsSubmitting(true);
      let response;

      if (selectedActionType === 'verification') {
        if (selectedAction === 'approve') {
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
        if (selectedAction === 'approve') {
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
        const actionText = selectedAction === 'approve' ? 'approved' : 'rejected';
        const typeText =
          selectedActionType === 'verification' ? 'verification' : 'first aid certificate';
        toast.success(`${typeText} ${actionText} successfully`);
        handleCloseActionDialog();
        // Refresh data by triggering a re-fetch instead of full page reload
        refetch();
        refetchStats();
      }
    } catch (error: any) {
      toast.error(error.message || `Failed to ${selectedAction} ${selectedActionType}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle opening action dialog
  const handleOpenActionDialog = (freelancer: PendingVerificationResponse) => {
    setSelectedFreelancer(freelancer);
    setSelectedActionType(null);
    setSelectedAction(null);
    setRejectionReason('');
    setIsActionDialogOpen(true);
  };

  // Handle closing action dialog
  const handleCloseActionDialog = () => {
    setIsActionDialogOpen(false);
    setSelectedFreelancer(null);
    setSelectedActionType(null);
    setSelectedAction(null);
    setRejectionReason('');
  };

  const columns: ColumnDef<PendingVerificationResponse>[] = [
    {
      accessorKey: 'name',
      header: 'Freelancer',
      cell: ({ row }) => (
        <div>
          <div className="font-inter font-medium text-charcoal">{row.original.name}</div>
          <div className="font-inter text-xs text-muted-foreground">{row.original.email}</div>
        </div>
      ),
    },
    {
      accessorKey: 'verificationStatus',
      header: 'Verification Status',
      cell: ({ row }) => <StatusBadge status={row.original.verificationStatus} size="sm" />,
    },
    {
      id: 'firstAidCertificate',
      header: 'First Aid Certificate',
      cell: ({ row }) => {
        const certificateUrl = row.original.firstAidCertificateUrl;
        const certificateStatus = row.original.firstAidCertificateStatus;
        if (!certificateUrl) {
          return <span className="font-inter text-sm text-muted-foreground">Not uploaded</span>;
        }
        return (
          <div className="flex items-center gap-2">
            <StatusBadge status={certificateStatus || 'PENDING'} size="sm" />
            <a
              href={certificateUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-inter text-xs text-primary hover:underline flex items-center gap-1"
            >
              <FileText className="h-3 w-3" />
              View
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const freelancer = row.original;
        const verificationStatus = freelancer.verificationStatus;
        const certificateStatus = freelancer.firstAidCertificateStatus;

        // Show actions button if there are pending actions
        const hasPendingActions =
          verificationStatus === 'PENDING' ||
          (freelancer.firstAidCertificateUrl && certificateStatus === 'PENDING');

        if (!hasPendingActions) {
          return <span className="text-muted-foreground text-sm">No actions available</span>;
        }

        return (
          <Button
            size="sm"
            variant="outline"
            className="h-8"
            onClick={() => handleOpenActionDialog(freelancer)}
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
        {/* Error Alert */}
        {error && (
          <div className="bg-error/10 border border-error/20 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-error" />
              <span className="font-medium text-error">Error loading verifications</span>
            </div>
            <p className="text-sm text-error/80 mt-1">{error}</p>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {statsConfig.map((config) => (
            <EnhancedStatCard
              key={config.key}
              title={config.title}
              value={stats[config.key].toString()}
              icon={config.icon}
              iconColor={config.iconColor}
              iconBg={config.iconBg}
              loading={statsLoading}
            />
          ))}
        </div>

        {/* Status Filter */}
        <div className="flex gap-2">
          <button
            onClick={() => {
              setStatusFilter(undefined);
              setPage(1);
            }}
            className={`px-4 py-2 rounded-md font-medium ${
              statusFilter === undefined
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All ({stats.total})
          </button>
          <button
            onClick={() => {
              setStatusFilter('PENDING');
              setPage(1);
            }}
            className={`px-4 py-2 rounded-md font-medium ${
              statusFilter === 'PENDING'
                ? 'bg-warning text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Pending ({stats.pending})
          </button>
          <button
            onClick={() => {
              setStatusFilter('APPROVED');
              setPage(1);
            }}
            className={`px-4 py-2 rounded-md font-medium ${
              statusFilter === 'APPROVED'
                ? 'bg-success text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Approved ({stats.approved})
          </button>
          <button
            onClick={() => {
              setStatusFilter('REJECTED');
              setPage(1);
            }}
            className={`px-4 py-2 rounded-md font-medium ${
              statusFilter === 'REJECTED'
                ? 'bg-error text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Rejected ({stats.rejected})
          </button>
        </div>

        {/* Verifications Table */}
        <DataTable
          columns={columns}
          data={verifications}
          title={`${statusFilter || 'All'} Verifications`}
          searchKey="name"
          searchPlaceholder="Search verifications..."
          enableSorting={false}
          enableFiltering={true}
          enableColumnVisibility={true}
          enablePagination={true}
          showSearch={true}
          showSorting={false}
          initialLoading={initialLoading}
          loading={loading}
          externalSearchValue={searchQuery}
          onExternalSearchChange={(value) => setSearchQuery(value)}
          externalPageIndex={page - 1}
          externalPageSize={pageSize}
          totalPages={pagination?.totalPages}
          onExternalPageChange={(pageIndex) => setPage(pageIndex + 1)}
          onExternalPageSizeChange={(newPageSize) => {
            setPageSize(newPageSize);
            setPage(1);
          }}
        />

        {/* Summary */}
        <div className="mt-4 text-sm text-gray-500">
          Showing {verifications.length} of {pagination?.total || 0} verifications
          {debouncedSearch && ` (filtered by "${debouncedSearch}")`}
          {statusFilter && ` with status "${statusFilter}"`}
        </div>
      </div>

      {/* Action Dialog */}
      <Dialog open={isActionDialogOpen} onOpenChange={handleCloseActionDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Take Action</DialogTitle>
            <DialogDescription>
              Select the type of action you want to perform for {selectedFreelancer?.name}
            </DialogDescription>
          </DialogHeader>

          {!selectedActionType ? (
            // Step 1: Select action type
            <div className="space-y-4">
              <div className="text-sm font-medium text-muted-foreground mb-4">
                What would you like to act on?
              </div>
              <div className="space-y-2">
                {selectedFreelancer?.verificationStatus === 'PENDING' && (
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => setSelectedActionType('verification')}
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Freelancer Verification
                    <StatusBadge
                      status={selectedFreelancer.verificationStatus}
                      size="sm"
                      className="ml-auto"
                    />
                  </Button>
                )}
                {selectedFreelancer?.firstAidCertificateUrl &&
                  selectedFreelancer?.firstAidCertificateStatus === 'PENDING' && (
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => setSelectedActionType('certificate')}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      First Aid Certificate
                      <StatusBadge
                        status={selectedFreelancer.firstAidCertificateStatus || 'PENDING'}
                        size="sm"
                        className="ml-auto"
                      />
                    </Button>
                  )}
              </div>
            </div>
          ) : !selectedAction ? (
            // Step 2: Select action (approve/reject)
            <div className="space-y-4">
              <div className="text-sm font-medium text-muted-foreground mb-4">
                What action would you like to take for the{' '}
                {selectedActionType === 'verification' ? 'verification' : 'certificate'}?
              </div>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start text-success border-success hover:bg-success/10"
                  onClick={() => setSelectedAction('approve')}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start text-error border-error hover:bg-error/10"
                  onClick={() => setSelectedAction('reject')}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedActionType(null)}
                className="w-full"
              >
                ← Back to action type selection
              </Button>
            </div>
          ) : (
            // Step 3: Confirmation and rejection reason if needed
            <div className="space-y-4">
              <div className="text-sm">
                You are about to{' '}
                <span
                  className={`font-medium ${selectedAction === 'approve' ? 'text-success' : 'text-error'}`}
                >
                  {selectedAction}
                </span>{' '}
                the{' '}
                <span className="font-medium">
                  {selectedActionType === 'verification'
                    ? 'freelancer verification'
                    : 'first aid certificate'}
                </span>{' '}
                for {selectedFreelancer?.name}.
              </div>

              {selectedAction === 'reject' && (
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

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedAction(null)}
                className="w-full"
                disabled={isSubmitting}
              >
                ← Back to action selection
              </Button>
            </div>
          )}

          {selectedAction && (
            <DialogFooter>
              <Button variant="outline" onClick={handleCloseActionDialog} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                onClick={handleActionSubmit}
                disabled={isSubmitting || (selectedAction === 'reject' && !rejectionReason.trim())}
                variant={selectedAction === 'reject' ? 'destructive' : 'default'}
              >
                {isSubmitting
                  ? `${selectedAction === 'approve' ? 'Approving' : 'Rejecting'}...`
                  : `${selectedAction === 'approve' ? 'Approve' : 'Reject'}`}
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </DashboardPageWrapper>
  );
};

export default VerificationsPage;
