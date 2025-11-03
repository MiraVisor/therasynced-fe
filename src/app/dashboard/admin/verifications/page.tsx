'use client';

import { ColumnDef } from '@tanstack/react-table';
import { CheckCircle, Clock, ExternalLink, FileText, Shield, XCircle } from 'lucide-react';
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
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [isCertificateApproveDialogOpen, setIsCertificateApproveDialogOpen] = useState(false);
  const [isCertificateRejectDialogOpen, setIsCertificateRejectDialogOpen] = useState(false);
  const [selectedFreelancer, setSelectedFreelancer] = useState<PendingVerificationResponse | null>(
    null,
  );
  const [rejectionReason, setRejectionReason] = useState('');
  const [certificateRejectionReason, setCertificateRejectionReason] = useState('');
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
  const { verifications, loading, initialLoading, error, pagination } = useVerifications({
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

  // Handle approve verification
  const handleApproveVerification = async () => {
    if (!selectedFreelancer) return;
    try {
      setIsSubmitting(true);
      const response = await adminVerificationService.approve({
        freelancerId: selectedFreelancer.id || selectedFreelancer.freelancerId || '',
      });
      if (response.success) {
        toast.success('Verification approved successfully');
        setIsApproveDialogOpen(false);
        setSelectedFreelancer(null);
        // Refresh data
        window.location.reload();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to approve verification');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle reject verification
  const handleRejectVerification = async () => {
    if (!selectedFreelancer || !rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }
    try {
      setIsSubmitting(true);
      const response = await adminVerificationService.reject({
        freelancerId: selectedFreelancer.id || selectedFreelancer.freelancerId || '',
        rejectionReason: rejectionReason.trim(),
      });
      if (response.success) {
        toast.success('Verification rejected successfully');
        setIsRejectDialogOpen(false);
        setRejectionReason('');
        setSelectedFreelancer(null);
        // Refresh data
        window.location.reload();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to reject verification');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle approve certificate
  const handleApproveCertificate = async () => {
    if (!selectedFreelancer) return;
    try {
      setIsSubmitting(true);
      const response = await adminVerificationService.approveCertificate({
        freelancerId: selectedFreelancer.id || selectedFreelancer.freelancerId || '',
      });
      if (response.success) {
        toast.success('First Aid Certificate approved successfully');
        setIsCertificateApproveDialogOpen(false);
        setSelectedFreelancer(null);
        // Refresh data
        window.location.reload();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to approve certificate');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle reject certificate
  const handleRejectCertificate = async () => {
    if (!selectedFreelancer || !certificateRejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }
    try {
      setIsSubmitting(true);
      const response = await adminVerificationService.rejectCertificate({
        freelancerId: selectedFreelancer.id || selectedFreelancer.freelancerId || '',
        rejectionReason: certificateRejectionReason.trim(),
      });
      if (response.success) {
        toast.success('First Aid Certificate rejected successfully');
        setIsCertificateRejectDialogOpen(false);
        setCertificateRejectionReason('');
        setSelectedFreelancer(null);
        // Refresh data
        window.location.reload();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to reject certificate');
    } finally {
      setIsSubmitting(false);
    }
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

        return (
          <div className="flex items-center gap-2">
            {/* Verification Status Actions */}
            {verificationStatus === 'PENDING' && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 border-success text-success hover:bg-success/10 font-inter"
                  onClick={() => {
                    setSelectedFreelancer(freelancer);
                    setIsApproveDialogOpen(true);
                  }}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 border-error text-error hover:bg-error/10 font-inter"
                  onClick={() => {
                    setSelectedFreelancer(freelancer);
                    setIsRejectDialogOpen(true);
                  }}
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Reject
                </Button>
              </>
            )}
            {/* First Aid Certificate Actions */}
            {freelancer.firstAidCertificateUrl && certificateStatus === 'PENDING' && (
              <>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 text-success hover:bg-success/10 font-inter"
                  onClick={() => {
                    setSelectedFreelancer(freelancer);
                    setIsCertificateApproveDialogOpen(true);
                  }}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Cert
                </Button>
              </>
            )}
          </div>
        );
      },
    },
  ];

  if (error) {
    return (
      <DashboardPageWrapper
        header={
          <h1 className="font-poppins font-bold text-2xl text-charcoal">Verification Queue</h1>
        }
      >
        <div className="flex items-center justify-center h-64">
          <div className="font-open-sans text-lg text-error">Error: {error}</div>
        </div>
      </DashboardPageWrapper>
    );
  }

  return (
    <DashboardPageWrapper
      header={<h1 className="font-poppins font-bold text-2xl text-charcoal">Verification Queue</h1>}
    >
      <div className="space-y-6 lg:space-y-8">
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

      {/* Approve Verification Dialog */}
      <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Verification</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve the verification for {selectedFreelancer?.name}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsApproveDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={handleApproveVerification} disabled={isSubmitting}>
              {isSubmitting ? 'Approving...' : 'Approve'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Verification Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Verification</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting the verification for {selectedFreelancer?.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Enter rejection reason..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRejectDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectVerification}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Rejecting...' : 'Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve Certificate Dialog */}
      <Dialog
        open={isCertificateApproveDialogOpen}
        onOpenChange={setIsCertificateApproveDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve First Aid Certificate</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve the first aid certificate for{' '}
              {selectedFreelancer?.name}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCertificateApproveDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={handleApproveCertificate} disabled={isSubmitting}>
              {isSubmitting ? 'Approving...' : 'Approve'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Certificate Dialog */}
      <Dialog open={isCertificateRejectDialogOpen} onOpenChange={setIsCertificateRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject First Aid Certificate</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting the first aid certificate for{' '}
              {selectedFreelancer?.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Enter rejection reason..."
              value={certificateRejectionReason}
              onChange={(e) => setCertificateRejectionReason(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCertificateRejectDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRejectCertificate} disabled={isSubmitting}>
              {isSubmitting ? 'Rejecting...' : 'Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardPageWrapper>
  );
};

export default VerificationsPage;
