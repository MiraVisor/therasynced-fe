'use client';

import { ColumnDef } from '@tanstack/react-table';
import { CheckCircle, Clock, ExternalLink, FileText, Shield, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { DataTable } from '@/components/common/DataTable/data-table';
import { FilterBar } from '@/components/core/Dashboard/AdminSide/Components/FilterBar';
import { StatusBadge } from '@/components/core/Dashboard/AdminSide/Components/StatusBadge';
import { DashboardPageWrapper } from '@/components/core/Dashboard/DashboardPageWrapper';
import { EnhancedStatCard } from '@/components/ui/enhanced-stat-card';
import LoadingSpinner from '@/components/ui/loading-spinner';
import adminVerificationService, {
  type PendingVerificationResponse,
} from '@/services/adminVerificationService';

interface VerificationStats {
  pending: number;
  approved: number;
  rejected: number;
  total: number;
}

const VerificationsPage = () => {
  const [verifications, setVerifications] = useState<PendingVerificationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<VerificationStats>({
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0,
  });
  const [statusFilter, setStatusFilter] = useState<'PENDING' | 'APPROVED' | 'REJECTED' | 'all'>(
    'PENDING',
  );
  const [searchQuery, setSearchQuery] = useState('');

  const fetchVerifications = async () => {
    try {
      setLoading(true);
      const status = statusFilter === 'all' ? undefined : statusFilter;
      const response = status
        ? await adminVerificationService.getByStatus(status)
        : await adminVerificationService.getPending();

      if (response.success) {
        const data = response.data || [];
        setVerifications(data);
      }

      // Calculate stats from all statuses
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
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch verifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVerifications();
  }, [statusFilter]);

  const filteredVerifications = verifications.filter((verification) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      verification.name.toLowerCase().includes(query) ||
      verification.email.toLowerCase().includes(query)
    );
  });

  const handleResetFilters = () => {
    setStatusFilter('PENDING');
    setSearchQuery('');
  };

  const columns: ColumnDef<PendingVerificationResponse>[] = [
    {
      accessorKey: 'name',
      header: 'Freelancer',
      cell: ({ row }) => (
        <div>
          <div className="font-inter font-medium text-foreground">{row.original.name}</div>
          <div className="font-open-sans text-xs text-muted-foreground">{row.original.email}</div>
        </div>
      ),
    },
    {
      accessorKey: 'verificationStatus',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.verificationStatus} size="sm" />,
    },
    {
      id: 'firstAidCertificate',
      header: 'First Aid Certificate',
      cell: ({ row }) => {
        const certificateUrl = row.original.firstAidCertificateUrl;
        if (!certificateUrl) {
          return <span className="font-open-sans text-sm text-muted-foreground">Not uploaded</span>;
        }
        return (
          <a
            href={certificateUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-inter text-sm text-primary hover:underline flex items-center gap-1"
          >
            <FileText className="h-4 w-4" />
            View Certificate
            <ExternalLink className="h-3 w-3" />
          </a>
        );
      },
    },
    {
      id: 'verificationDocuments',
      header: 'Verification Documents',
      cell: ({ row }) => {
        const documents = row.original.verificationDocuments || [];
        if (documents.length === 0) {
          return <span className="font-open-sans text-sm text-muted-foreground">No documents</span>;
        }
        return (
          <div className="flex flex-col gap-1">
            {documents.map((url, index) => (
              <a
                key={index}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-inter text-sm text-primary hover:underline flex items-center gap-1"
              >
                <FileText className="h-3 w-3" />
                doc_{index + 1}
                <ExternalLink className="h-3 w-3" />
              </a>
            ))}
          </div>
        );
      },
    },
  ];

  if (loading && verifications.length === 0) {
    return (
      <DashboardPageWrapper
        header={
          <h1 className="font-poppins font-bold text-2xl text-charcoal">Verification Queue</h1>
        }
      >
        <div className="flex items-center justify-center h-96">
          <LoadingSpinner size="lg" />
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
          <EnhancedStatCard
            title="Total Verifications"
            value={stats.total.toString()}
            icon={Shield}
            iconColor="text-primary"
            iconBg="bg-primary/10"
            sparklineData={Array.from({ length: 7 }, () => stats.total)}
          />
          <EnhancedStatCard
            title="Pending"
            value={stats.pending.toString()}
            icon={Clock}
            iconColor="text-warning"
            iconBg="bg-warning/10"
            sparklineData={Array.from({ length: 7 }, () => stats.pending)}
          />
          <EnhancedStatCard
            title="Approved"
            value={stats.approved.toString()}
            icon={CheckCircle}
            iconColor="text-success"
            iconBg="bg-success/10"
            sparklineData={Array.from({ length: 7 }, () => stats.approved)}
          />
          <EnhancedStatCard
            title="Rejected"
            value={stats.rejected.toString()}
            icon={XCircle}
            iconColor="text-error"
            iconBg="bg-error/10"
            sparklineData={Array.from({ length: 7 }, () => stats.rejected)}
          />
        </div>

        {/* Filters */}
        <FilterBar
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search by freelancer name or email..."
          filters={[
            {
              key: 'status',
              label: 'Status',
              value: statusFilter,
              options: [
                { label: 'Pending', value: 'PENDING' },
                { label: 'Approved', value: 'APPROVED' },
                { label: 'Rejected', value: 'REJECTED' },
                { label: 'All', value: 'all' },
              ],
              onValueChange: (value) => setStatusFilter(value as typeof statusFilter),
            },
          ]}
          onReset={handleResetFilters}
        />

        {/* Verifications Table */}
        <DataTable
          columns={columns}
          data={filteredVerifications}
          title={`${statusFilter === 'all' ? 'All' : statusFilter} Verifications`}
          searchKey="name"
          searchPlaceholder="Search verifications..."
          enableSorting
          enableFiltering
          enablePagination
          pageSize={10}
        />
      </div>
    </DashboardPageWrapper>
  );
};

export default VerificationsPage;
