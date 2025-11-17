'use client';

import { ColumnDef } from '@tanstack/react-table';
import { CheckCircle, FileText, XCircle } from 'lucide-react';
import { Edit, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import { DataTable } from '@/components/common/DataTable/data-table';
import { DashboardPageWrapper } from '@/components/core/Dashboard/DashboardPageWrapper';
import { StatusSwitch } from '@/components/ui';
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
import {
  createJobTitle,
  fetchJobTitles,
  fetchJobTitlesStats,
  updateJobTitle,
} from '@/redux/slices';
import type { AppDispatch, RootState } from '@/redux/store';
import {
  CreateJobTitleDto,
  JobTitleResponse,
  UpdateJobTitleDto,
} from '@/services/adminJobTitleService';

const JobTitlesPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { jobTitles, loading, initialLoading, error, pagination, stats, statsLoading } =
    useSelector((state: RootState) => state.jobTitles);

  // State for pagination and search
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // State for dialogs and forms
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedJobTitle, setSelectedJobTitle] = useState<JobTitleResponse | null>(null);
  const [formData, setFormData] = useState<CreateJobTitleDto>({ name: '', description: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updatingJobTitles, setUpdatingJobTitles] = useState<Set<string>>(new Set());

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
  useEffect(() => {
    dispatch(
      fetchJobTitles({
        page,
        limit: pageSize,
        name: debouncedSearch || undefined,
      }),
    );
  }, [dispatch, page, pageSize, debouncedSearch]);

  // Fetch stats separately
  useEffect(() => {
    dispatch(fetchJobTitlesStats());
  }, [dispatch]);

  const handleCreate = async () => {
    try {
      setIsSubmitting(true);
      await dispatch(createJobTitle(formData)).unwrap();
      toast.success('Job title created successfully');
      setIsCreateDialogOpen(false);
      setFormData({ name: '', description: '' });
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
      await dispatch(updateJobTitle({ id: selectedJobTitle.id, data: updateData })).unwrap();
      toast.success('Job title updated successfully');
      setIsEditDialogOpen(false);
      setSelectedJobTitle(null);
      setFormData({ name: '', description: '' });
    } catch (error: any) {
      toast.error(error.message || 'Failed to update job title');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (jobTitle: JobTitleResponse) => {
    try {
      setUpdatingJobTitles((prev) => new Set(prev).add(jobTitle.id));
      await dispatch(
        updateJobTitle({
          id: jobTitle.id,
          data: { isActive: !jobTitle.isActive },
        }),
      ).unwrap();
      toast.success(`Job title ${!jobTitle.isActive ? 'activated' : 'deactivated'} successfully`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update job title status');
    } finally {
      setUpdatingJobTitles((prev) => {
        const newSet = new Set(prev);
        newSet.delete(jobTitle.id);
        return newSet;
      });
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
      cell: ({ row }) => {
        const jobTitle = row.original;
        return (
          <StatusSwitch
            checked={jobTitle.isActive}
            onCheckedChange={() => handleToggleActive(jobTitle)}
            disabled={updatingJobTitles.has(jobTitle.id)}
          />
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const jobTitle = row.original;
        return (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit(jobTitle)}
            className="h-8 w-8 p-0 hover:bg-info/10"
          >
            <Edit className="h-4 w-4 text-info" />
          </Button>
        );
      },
    },
  ];

  // Define stat cards configuration
  const statCards = [
    {
      title: 'Total Job Titles',
      value: stats?.totalJobTitles.toString() ?? '0',
      icon: FileText,
      iconColor: 'text-primary',
      iconBg: 'bg-primary/10',
    },
    {
      title: 'Active',
      value: stats?.activeJobTitles.toString() ?? '0',
      icon: CheckCircle,
      iconColor: 'text-success',
      iconBg: 'bg-success/10',
    },
    {
      title: 'Inactive',
      value: stats?.inactiveJobTitles.toString() ?? '0',
      icon: XCircle,
      iconColor: 'text-error',
      iconBg: 'bg-error/10',
    },

    {
      title: 'Most Popular',
      value: stats?.mostPopularJobTitle?.name ?? 'N/A',
      icon: FileText,
      iconColor: 'text-primary',
      iconBg: 'bg-primary/10',
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
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
          loading={loading || updatingJobTitles.size > 0}
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
      </div>
    </DashboardPageWrapper>
  );
};

export default JobTitlesPage;
