'use client';

import { ColumnDef } from '@tanstack/react-table';
import { CheckCircle, FileText, Folder, Users, XCircle } from 'lucide-react';
import { Edit, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { DataTable } from '@/components/common/DataTable/data-table';
import { ConfirmationDialog } from '@/components/core/Dashboard/AdminSide/Components/ConfirmationDialog';
import { StatusBadge } from '@/components/core/Dashboard/AdminSide/Components/StatusBadge';
import { DashboardPageWrapper } from '@/components/core/Dashboard/DashboardPageWrapper';
import { Badge } from '@/components/ui/badge';
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useJobTitles } from '@/hooks/useJobTitles';
import adminJobTitleService, {
  type CreateJobTitleDto,
  type JobTitleResponse,
  type UpdateJobTitleDto,
} from '@/services/adminJobTitleService';

const JobTitlesPage = () => {
  // State for pagination and search
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // State for dialogs and forms
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedJobTitle, setSelectedJobTitle] = useState<JobTitleResponse | null>(null);
  const [formData, setFormData] = useState<CreateJobTitleDto>({ name: '', description: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Stats state
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    totalFreelancers: 0,
    totalServiceCategories: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);

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

  // Fetch job titles with pagination and search
  const { jobTitles, loading, initialLoading, error, pagination } = useJobTitles({
    page,
    limit: pageSize,
    name: debouncedSearch || undefined,
  });

  // Fetch stats separately
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setStatsLoading(true);
        const response = await adminJobTitleService.getAll();
        if (response.success) {
          const allJobTitles = response.data || [];
          console.log('allJobTitles:', allJobTitles);
          const total = allJobTitles.length;
          const active = allJobTitles.filter((jt) => jt.isActive).length;
          const inactive = allJobTitles.filter((jt) => !jt.isActive).length;
          const totalFreelancers = allJobTitles.reduce(
            (sum, jt) => sum + (jt._count?.users || 0),
            0,
          );
          const totalServiceCategories = allJobTitles.reduce(
            (sum, jt) => sum + (jt._count?.serviceCategories || 0),
            0,
          );
          setStats({ total, active, inactive, totalFreelancers, totalServiceCategories });
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setStatsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const handleCreate = async () => {
    try {
      setIsSubmitting(true);
      const response = await adminJobTitleService.create(formData);
      if (response.success) {
        toast.success('Job title created successfully');
        setIsCreateDialogOpen(false);
        setFormData({ name: '', description: '' });
        // Data will be refetched automatically by the hook
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to create job title');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedJobTitle) return;
    try {
      setIsSubmitting(true);
      const updateData: UpdateJobTitleDto = {
        name: formData.name,
        description: formData.description,
      };
      const response = await adminJobTitleService.update(selectedJobTitle.id, updateData);
      if (response.success) {
        toast.success('Job title updated successfully');
        setIsEditDialogOpen(false);
        setSelectedJobTitle(null);
        setFormData({ name: '', description: '' });
        // Data will be refetched automatically by the hook
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update job title');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedJobTitle) return;
    try {
      setIsSubmitting(true);
      const response = await adminJobTitleService.delete(selectedJobTitle.id);
      if (response.success) {
        toast.success('Job title deleted successfully');
        setIsDeleteDialogOpen(false);
        setSelectedJobTitle(null);
        // Data will be refetched automatically by the hook
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete job title');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (jobTitle: JobTitleResponse) => {
    setSelectedJobTitle(jobTitle);
    setFormData({
      name: jobTitle.name,
      description: jobTitle.description || '',
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (jobTitle: JobTitleResponse) => {
    setSelectedJobTitle(jobTitle);
    setIsDeleteDialogOpen(true);
  };

  const columns: ColumnDef<JobTitleResponse>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <div className="font-inter font-medium text-charcoal">{row.original.name}</div>
      ),
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }) => (
        <div className="font-inter text-sm text-muted-foreground max-w-xs truncate">
          {row.original.description || '-'}
        </div>
      ),
    },
    {
      accessorKey: 'freelancerCount',
      header: 'Freelancers',
      cell: ({ row }) => (
        <Badge
          variant="outline"
          className="font-inter text-xs px-2 py-1 bg-info/10 text-info border-info/20"
        >
          {row.original._count?.users || 0}
        </Badge>
      ),
    },
    {
      accessorKey: 'serviceCategoryCount',
      header: 'Service Categories',
      cell: ({ row }) => (
        <Badge
          variant="outline"
          className="font-inter text-xs px-2 py-1 bg-primary/10 text-primary border-primary/20"
        >
          {row.original._count?.serviceCategories || 0}
        </Badge>
      ),
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => (
        <StatusBadge status={row.original.isActive ? 'ACTIVE' : 'INACTIVE'} size="sm" />
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const jobTitle = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEdit(jobTitle)}
              className="h-8 w-8 p-0 hover:bg-info/10"
            >
              <Edit className="h-4 w-4 text-info" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDeleteClick(jobTitle)}
              className="h-8 w-8 p-0 text-error hover:bg-error/10"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  // Define stat cards configuration
  const statCards = [
    {
      title: 'Total Job Titles',
      value: stats.total.toString(),
      icon: FileText,
      iconColor: 'text-primary',
      iconBg: 'bg-primary/10',
    },
    {
      title: 'Active',
      value: stats.active.toString(),
      icon: CheckCircle,
      iconColor: 'text-success',
      iconBg: 'bg-success/10',
    },
    {
      title: 'Inactive',
      value: stats.inactive.toString(),
      icon: XCircle,
      iconColor: 'text-error',
      iconBg: 'bg-error/10',
    },
    {
      title: 'Total Freelancers',
      value: stats.totalFreelancers.toString(),
      icon: Users,
      iconColor: 'text-info',
      iconBg: 'bg-info/10',
    },
    {
      title: 'Total Service Categories',
      value: stats.totalServiceCategories.toString(),
      icon: Folder,
      iconColor: 'text-warning',
      iconBg: 'bg-warning/10',
    },
  ];

  if (error) {
    return (
      <DashboardPageWrapper
        header={
          <div className="flex items-center justify-between w-full">
            <h1 className="font-poppins font-bold text-2xl text-charcoal">Job Titles</h1>
            <Button
              onClick={() => {
                setFormData({ name: '', description: '' });
                setIsCreateDialogOpen(true);
              }}
              className="font-inter"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Job Title
            </Button>
          </div>
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
      header={
        <div className="flex items-center justify-between w-full">
          <h1 className="font-poppins font-bold text-2xl text-charcoal">Job Titles</h1>
          <Button
            onClick={() => {
              setFormData({ name: '', description: '' });
              setIsCreateDialogOpen(true);
            }}
            className="font-inter"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Job Title
          </Button>
        </div>
      }
    >
      <div className="space-y-6 lg:space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {statCards.map((card) => (
            <EnhancedStatCard
              key={card.title}
              title={card.title}
              value={card.value}
              icon={card.icon}
              iconColor={card.iconColor}
              iconBg={card.iconBg}
              loading={statsLoading}
            />
          ))}
        </div>

        {/* Job Titles Table */}
        <DataTable
          columns={columns}
          data={jobTitles}
          title="All Job Titles"
          searchKey="name"
          searchPlaceholder="Search job titles..."
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

        {/* Create Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-poppins font-semibold">Create Job Title</DialogTitle>
              <DialogDescription className="font-open-sans">
                Add a new job title to the platform
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="font-inter font-medium">
                  Name *
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Physiotherapy"
                  className="font-open-sans mt-2"
                  required
                />
              </div>
              <div>
                <Label htmlFor="description" className="font-inter font-medium">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Job title description..."
                  className="font-open-sans mt-2"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={isSubmitting || !formData.name}>
                {isSubmitting ? 'Creating...' : 'Create'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-poppins font-semibold">Edit Job Title</DialogTitle>
              <DialogDescription className="font-open-sans">
                Update job title information
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name" className="font-inter font-medium">
                  Name *
                </Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Physiotherapy"
                  className="font-open-sans mt-2"
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-description" className="font-inter font-medium">
                  Description
                </Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Job title description..."
                  className="font-open-sans mt-2"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button onClick={handleUpdate} disabled={isSubmitting || !formData.name}>
                {isSubmitting ? 'Updating...' : 'Update'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <ConfirmationDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          onConfirm={handleDelete}
          title="Delete Job Title"
          description={`Are you sure you want to delete "${selectedJobTitle?.name}"? This action cannot be undone.`}
          confirmLabel="Delete"
          cancelLabel="Cancel"
          variant="destructive"
          isLoading={isSubmitting}
        />
      </div>
    </DashboardPageWrapper>
  );
};

export default JobTitlesPage;
