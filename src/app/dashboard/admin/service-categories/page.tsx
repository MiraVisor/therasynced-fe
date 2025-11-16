'use client';

import { ColumnDef } from '@tanstack/react-table';
import { CheckCircle, FileText, XCircle } from 'lucide-react';
import { Edit, Plus, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';

import { DataTable } from '@/components/common/DataTable/data-table';
import { ConfirmationDialog } from '@/components/core/Dashboard/AdminSide/Components/ConfirmationDialog';
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
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useServiceCategories } from '@/hooks/useServiceCategories';
import adminJobTitleService, { type JobTitleResponse } from '@/services/adminJobTitleService';
import adminServiceCategoryService, {
  type CreateServiceCategoryDto,
  type ServiceCategoryResponse,
  type UpdateServiceCategoryDto,
} from '@/services/adminServiceCategoryService';

const ServiceCategoriesPage = () => {
  const [jobTitles, setJobTitles] = useState<JobTitleResponse[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategoryResponse | null>(null);
  const [formData, setFormData] = useState<CreateServiceCategoryDto>({
    name: '',
    description: '',
    jobTitleId: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Stats state
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
  });

  // Memoize the params to prevent infinite re-renders
  const serviceCategoriesParams = useMemo(
    () => ({
      page,
      limit: pageSize,
      name: debouncedSearch || undefined,
    }),
    [page, pageSize, debouncedSearch],
  );

  // Use the service categories hook for pagination
  const {
    serviceCategories,
    loading: categoriesLoading,
    initialLoading: categoriesInitialLoading,
    error,
    pagination,
    refetch,
  } = useServiceCategories(serviceCategoriesParams);

  // Fetch job titles and stats
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jobTitlesResponse, statsResponse] = await Promise.all([
          adminJobTitleService.getActive(),
          adminServiceCategoryService.getStats(),
        ]);

        if (jobTitlesResponse.success) {
          setJobTitles(jobTitlesResponse.data || []);
        }

        if (statsResponse.success) {
          const statsData = statsResponse.data;
          setStats({
            total: statsData.totalServiceCategories,
            active: statsData.activeServiceCategories,
            inactive: statsData.inactiveServiceCategories,
          });
        }
      } catch (error) {
        // Handle error silently or show toast
      }
    };

    fetchData();
  }, []);

  // Show error as toast when it occurs
  useEffect(() => {
    if (error) {
      toast.error(`Failed to load service categories: ${error}`);
    }
  }, [error]);

  // Debounce search query
  useEffect(() => {
    // 500ms debounce delay
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      // Reset to page 1 when search changes
      if (searchQuery !== debouncedSearch) {
        setPage(1);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, debouncedSearch]);

  const handleCreate = async () => {
    if (!formData.jobTitleId) {
      toast.error('Please select a job title');
      return;
    }
    try {
      setIsSubmitting(true);
      const response = await adminServiceCategoryService.create(formData);
      if (response.success) {
        toast.success('Service category created successfully');
        setIsCreateDialogOpen(false);
        setFormData({ name: '', description: '', jobTitleId: '' });
        refetch();
      }
    } catch (error: unknown) {
      const err = error as Error;
      toast.error(err.message || 'Failed to create service category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedCategory) return;
    try {
      setIsSubmitting(true);
      const updateData: UpdateServiceCategoryDto = {
        name: formData.name,
        description: formData.description,
        jobTitleId: formData.jobTitleId,
      };
      const response = await adminServiceCategoryService.update(selectedCategory.id, updateData);
      if (response.success) {
        toast.success('Service category updated successfully');
        setIsEditDialogOpen(false);
        setSelectedCategory(null);
        setFormData({ name: '', description: '', jobTitleId: '' });
        refetch();
      }
    } catch (error: unknown) {
      const err = error as Error;
      toast.error(err.message || 'Failed to update service category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedCategory) return;
    try {
      setIsSubmitting(true);
      const response = await adminServiceCategoryService.delete(selectedCategory.id);
      if (response.success) {
        toast.success('Service category deleted successfully');
        setIsDeleteDialogOpen(false);
        setSelectedCategory(null);
        refetch();
      }
    } catch (error: unknown) {
      const err = error as Error;
      toast.error(err.message || 'Failed to delete service category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (category: ServiceCategoryResponse) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      jobTitleId: category.jobTitle.id,
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (category: ServiceCategoryResponse) => {
    setSelectedCategory(category);
    setIsDeleteDialogOpen(true);
  };

  const columns: ColumnDef<ServiceCategoryResponse>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <div className="font-inter font-medium text-charcoal">{row.original.name}</div>
      ),
    },
    {
      accessorKey: 'jobTitle',
      header: 'Job Title',
      cell: ({ row }) => (
        <div className="font-inter text-sm text-foreground">{row.original.jobTitle.name}</div>
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
        const category = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEdit(category)}
              className="h-8 w-8 p-0 hover:bg-info/10"
            >
              <Edit className="h-4 w-4 text-info" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDeleteClick(category)}
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
      title: 'Total Categories',
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
  ];

  return (
    <DashboardPageWrapper
      header={
        <div className="flex items-center justify-between w-full">
          <h1 className="font-poppins font-bold text-2xl text-charcoal">Service Categories</h1>
          <Button
            onClick={() => {
              setFormData({ name: '', description: '', jobTitleId: '' });
              setIsCreateDialogOpen(true);
            }}
            className="font-inter"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Category
          </Button>
        </div>
      }
    >
      <div className="space-y-6 lg:space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {statCards.map((card) => (
            <EnhancedStatCard
              key={card.title}
              title={card.title}
              value={card.value}
              icon={card.icon}
              iconColor={card.iconColor}
              iconBg={card.iconBg}
              loading={categoriesInitialLoading}
            />
          ))}
        </div>

        {/* Service Categories Table */}
        <DataTable
          columns={columns}
          data={serviceCategories}
          title="Service Categories"
          searchKey="name"
          searchPlaceholder="Search categories..."
          enableSorting
          enableFiltering
          enablePagination={true}
          showSearch={true}
          showSorting={false}
          initialLoading={categoriesInitialLoading}
          loading={categoriesLoading}
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
              <DialogTitle className="font-poppins font-semibold">
                Create Service Category
              </DialogTitle>
              <DialogDescription className="font-open-sans">
                Add a new service category to the platform
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
                  placeholder="e.g., Sports massage"
                  className="font-open-sans mt-2"
                  required
                />
              </div>
              <div>
                <Label htmlFor="jobTitleId" className="font-inter font-medium">
                  Job Title *
                </Label>
                <Select
                  value={formData.jobTitleId}
                  onValueChange={(value) => setFormData({ ...formData, jobTitleId: value })}
                >
                  <SelectTrigger className="font-open-sans mt-2">
                    <SelectValue placeholder="Select job title" />
                  </SelectTrigger>
                  <SelectContent>
                    {jobTitles.map((jt) => (
                      <SelectItem key={jt.id} value={jt.id}>
                        {jt.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="description" className="font-inter font-medium">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Category description..."
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
              <Button
                onClick={handleCreate}
                disabled={isSubmitting || !formData.name || !formData.jobTitleId}
              >
                {isSubmitting ? 'Creating...' : 'Create'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-poppins font-semibold">
                Edit Service Category
              </DialogTitle>
              <DialogDescription className="font-open-sans">
                Update service category information
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
                  placeholder="e.g., Sports massage"
                  className="font-open-sans mt-2"
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-jobTitleId" className="font-inter font-medium">
                  Job Title *
                </Label>
                <Select
                  value={formData.jobTitleId}
                  onValueChange={(value) => setFormData({ ...formData, jobTitleId: value })}
                >
                  <SelectTrigger className="font-open-sans mt-2">
                    <SelectValue placeholder="Select job title" />
                  </SelectTrigger>
                  <SelectContent>
                    {jobTitles.map((jt) => (
                      <SelectItem key={jt.id} value={jt.id}>
                        {jt.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-description" className="font-inter font-medium">
                  Description
                </Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Category description..."
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
              <Button
                onClick={handleUpdate}
                disabled={isSubmitting || !formData.name || !formData.jobTitleId}
              >
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
          title="Delete Service Category"
          description={`Are you sure you want to delete "${selectedCategory?.name}"? This action cannot be undone.`}
          confirmLabel="Delete"
          cancelLabel="Cancel"
          variant="destructive"
          isLoading={isSubmitting}
        />
      </div>
    </DashboardPageWrapper>
  );
};

export default ServiceCategoriesPage;
