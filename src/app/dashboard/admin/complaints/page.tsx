'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Eye, Shield } from 'lucide-react';
import { AlertTriangle, CheckCircle, FileText, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { DataTable } from '@/components/common/DataTable/data-table';
import { FilterBar } from '@/components/core/Dashboard/AdminSide/Components/FilterBar';
import { ProfileCard } from '@/components/core/Dashboard/AdminSide/Components/ProfileCard';
import { StatusBadge } from '@/components/core/Dashboard/AdminSide/Components/StatusBadge';
import { DashboardPageWrapper } from '@/components/core/Dashboard/DashboardPageWrapper';
import { Button } from '@/components/ui/button';
import { EnhancedStatCard } from '@/components/ui/enhanced-stat-card';
import adminComplaintService, {
  type ComplaintListResponse,
} from '@/services/adminComplaintService';
import { ComplaintCategory, ComplaintStatus } from '@/types/types';

interface ComplaintStats {
  total: number;
  pending: number;
  underReview: number;
  resolved: number;
  dismissed: number;
}

interface Complaint {
  id: string;
  reporter: {
    id: string;
    name: string;
    email: string;
  };
  reportedUser: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  category: ComplaintCategory;
  reason: string;
  description: string;
  status: ComplaintStatus;
  createdAt: string;
  updatedAt: string;
}

const ComplaintsPage = () => {
  const router = useRouter();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ComplaintStats>({
    total: 0,
    pending: 0,
    underReview: 0,
    resolved: 0,
    dismissed: 0,
  });
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const filters: any = {};
      if (selectedStatus !== 'all') filters.status = selectedStatus;
      if (selectedCategory !== 'all') filters.category = selectedCategory;

      const response = await adminComplaintService.getAll(undefined, filters);
      if (response.success) {
        const data = response.data || [];
        setComplaints(data);
        setStats({
          total: data.length,
          pending: data.filter((c) => c.status === 'PENDING').length,
          underReview: data.filter((c) => c.status === 'UNDER_REVIEW').length,
          resolved: data.filter((c) => c.status === 'RESOLVED').length,
          dismissed: data.filter((c) => c.status === 'DISMISSED').length,
        });
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch complaints');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [selectedStatus, selectedCategory]);

  const handleViewDetails = (complaintId: string) => {
    router.push(`/dashboard/admin/complaints/${complaintId}`);
  };

  const handleResetFilters = () => {
    setSelectedStatus('all');
    setSelectedCategory('all');
    setSearchQuery('');
  };

  const filteredComplaints = complaints.filter((complaint) => {
    const matchesSearch =
      searchQuery === '' ||
      complaint.reporter.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      complaint.reporter.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      complaint.reportedUser.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      complaint.reportedUser.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      complaint.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
      complaint.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  const statusOptions = [
    { label: 'All Statuses', value: 'all' },
    { label: 'Pending', value: 'PENDING' },
    { label: 'Under Review', value: 'UNDER_REVIEW' },
    { label: 'Resolved', value: 'RESOLVED' },
    { label: 'Dismissed', value: 'DISMISSED' },
  ];

  const categoryOptions = [
    { label: 'All Categories', value: 'all' },
    { label: 'Harassment', value: 'HARASSMENT' },
    { label: 'Unprofessional Behavior', value: 'UNPROFESSIONAL_BEHAVIOR' },
    { label: 'Safety Concern', value: 'SAFETY_CONCERN' },
    { label: 'No Show', value: 'NO_SHOW' },
    { label: 'Late Cancellation', value: 'LATE_CANCELLATION' },
    { label: 'Inappropriate Conduct', value: 'INAPPROPRIATE_CONDUCT' },
    { label: 'Poor Service Quality', value: 'POOR_SERVICE_QUALITY' },
    { label: 'Other', value: 'OTHER' },
  ];

  const columns: ColumnDef<Complaint>[] = [
    {
      accessorKey: 'reporter',
      header: 'Reporter',
      cell: ({ row }) => (
        <div>
          <div className="font-inter font-medium text-sm text-charcoal">
            {row.original.reporter.name}
          </div>
          <div className="font-inter text-xs text-muted-foreground">
            {row.original.reporter.email}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'reportedUser',
      header: 'Reported User',
      cell: ({ row }) => (
        <div>
          <div className="font-inter font-medium text-sm text-charcoal">
            {row.original.reportedUser.name}
          </div>
          <div className="font-inter text-xs text-muted-foreground">
            {row.original.reportedUser.email}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }) => (
        <div className="font-inter text-sm text-foreground capitalize">
          {row.original.category.replace(/_/g, ' ').toLowerCase()}
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.status} size="sm" />,
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ row }) => (
        <div className="font-inter text-xs text-muted-foreground">
          {new Date(row.original.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </div>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleViewDetails(row.original.id)}
          className="h-8 px-3 hover:bg-info/10 text-info font-inter"
        >
          <Eye className="h-4 w-4 mr-2" />
          View
        </Button>
      ),
    },
  ];

  return (
    <DashboardPageWrapper
      header={
        <div className="flex items-center justify-between w-full">
          <h1 className="font-poppins font-bold text-2xl text-charcoal">Complaints Center</h1>
        </div>
      }
    >
      <div className="space-y-6 lg:space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <EnhancedStatCard
            title="Total Complaints"
            value={stats.total.toString()}
            icon={FileText}
            iconColor="text-primary"
            iconBg="bg-primary/10"
          />
          <EnhancedStatCard
            title="Pending"
            value={stats.pending.toString()}
            icon={AlertTriangle}
            iconColor="text-warning"
            iconBg="bg-warning/10"
          />
          <EnhancedStatCard
            title="Under Review"
            value={stats.underReview.toString()}
            icon={Shield}
            iconColor="text-info"
            iconBg="bg-info/10"
          />
          <EnhancedStatCard
            title="Resolved"
            value={stats.resolved.toString()}
            icon={CheckCircle}
            iconColor="text-success"
            iconBg="bg-success/10"
          />
          <EnhancedStatCard
            title="Dismissed"
            value={stats.dismissed.toString()}
            icon={XCircle}
            iconColor="text-error"
            iconBg="bg-error/10"
          />
        </div>

        {/* Filters */}
        <FilterBar
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search by reporter, reported user, or reason..."
          filters={[
            {
              key: 'status',
              label: 'Status',
              value: selectedStatus,
              options: statusOptions,
              onValueChange: setSelectedStatus,
            },
            {
              key: 'category',
              label: 'Category',
              value: selectedCategory,
              options: categoryOptions,
              onValueChange: setSelectedCategory,
            },
          ]}
          onReset={handleResetFilters}
        />

        {/* Complaints Table */}
        <DataTable
          columns={columns}
          data={filteredComplaints}
          title="All Complaints"
          searchKey="reason"
          searchPlaceholder="Search complaints..."
          enableSorting
          enableFiltering
          enablePagination
          pageSize={10}
        />
      </div>
    </DashboardPageWrapper>
  );
};

export default ComplaintsPage;
