'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Edit, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { DataTable } from '@/components/common/DataTable/data-table';
import { DashboardPageWrapper } from '@/components/core/Dashboard/DashboardPageWrapper';
import { StatusSwitch } from '@/components/ui';
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
import { StatsCardsSkeleton } from '@/components/ui/skeletons/StatsCardsSkeleton';
import { Textarea } from '@/components/ui/textarea';
import {
  useCreateServiceCategory,
  useServiceCategories,
  useServiceCategoriesStats,
  useUpdateServiceCategory,
} from '@/hooks/queries/useAdmin';
import adminJobTitleService, { type JobTitleResponse } from '@/services/adminJobTitleService';
import {
  CreateServiceCategoryDto,
  ServiceCategoryResponse,
  UpdateServiceCategoryDto,
} from '@/services/adminServiceCategoryService';

const ServiceCategoriesPage = () => {
  const [jobTitles, setJobTitles] = useState<JobTitleResponse[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategoryResponse | null>(null);
  const [formData, setFormData] = useState<CreateServiceCategoryDto>({
    name: '',
    description: '',
    jobTitleId: '',
  });
  const [updatingCategories, setUpdatingCategories] = useState<Set<string>>(new Set());

  const {
    data: categoriesResponse,
    isLoading: categoriesLoading,
    isFetching: _isFetching,
    error: categoriesError,
  } = useServiceCategories({
    page,
    limit: pageSize,
    name: debouncedSearch || undefined,
  });
  const serviceCategories = categoriesResponse?.data || [];
  const pagination = categoriesResponse?.pagination || null;
  const categoriesInitialLoading = categoriesLoading && !categoriesResponse;

  const {
    data: statsResponse,
    isLoading: statsLoading,
    error: statsError,
  } = useServiceCategoriesStats();
  const stats = statsResponse?.data || null;

  // Show error toast only when no cached data exists
  useEffect(() => {
    if (categoriesError && !categoriesResponse) {
      const errorMessage =
        categoriesError instanceof Error
          ? categoriesError.message
          : 'Failed to load service categories';
      toast.error(errorMessage);
    }
  }, [categoriesError, categoriesResponse]);

  useEffect(() => {
    if (statsError && !statsResponse) {
      const errorMessage =
        statsError instanceof Error ? statsError.message : 'Failed to load category stats';
      toast.error(errorMessage);
    }
  }, [statsError, statsResponse]);

  const createMutation = useCreateServiceCategory();
  const updateMutation = useUpdateServiceCategory();

  // Fetch job titles
  useEffect(() => {
    const fetchData = async () => {
      try {
        const jobTitlesResponse = await adminJobTitleService.getActive();
        if (jobTitlesResponse.success) {
          setJobTitles(jobTitlesResponse.data || []);
        }
      } catch (error) {
        // Handle error silently or show toast
      }
    };

    fetchData();
  }, []);

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
      await createMutation.mutateAsync(formData);
      setIsCreateDialogOpen(false);
      setFormData({ name: '', description: '', jobTitleId: '' });
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleUpdate = async () => {
    if (!selectedCategory) return;
    try {
      const updateData: UpdateServiceCategoryDto = {
        name: formData.name,
        description: formData.description,
        jobTitleId: formData.jobTitleId,
      };
      await updateMutation.mutateAsync({ id: selectedCategory.id, data: updateData });
      setIsEditDialogOpen(false);
      setSelectedCategory(null);
      setFormData({ name: '', description: '', jobTitleId: '' });
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleToggleActive = async (category: ServiceCategoryResponse) => {
    try {
      setUpdatingCategories((prev) => new Set(prev).add(category.id));
      const updateData: UpdateServiceCategoryDto = {
        isActive: !category.isActive,
      };
      await updateMutation.mutateAsync({ id: category.id, data: updateData });
    } catch (error) {
      // Error handled by mutation
    } finally {
      setUpdatingCategories((prev) => {
        const newSet = new Set(prev);
        newSet.delete(category.id);
        return newSet;
      });
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
      cell: ({ row }) => {
        const category = row.original;
        return (
          <StatusSwitch
            checked={category.isActive}
            onCheckedChange={() => handleToggleActive(category)}
            disabled={updatingCategories.has(category.id)}
          />
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const category = row.original;
        return (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit(category)}
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
      title: 'Total Categories',
      value: stats?.totalServiceCategories?.toString() || '0',
    },
    {
      title: 'Active',
      value: stats?.activeServiceCategories?.toString() || '0',
    },
    {
      title: 'Inactive',
      value: stats?.inactiveServiceCategories?.toString() || '0',
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
        {statsLoading && !statsResponse ? (
          <StatsCardsSkeleton count={4} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.map((card) => (
              <EnhancedStatCard key={card.title} title={card.title} value={card.value} />
            ))}
          </div>
        )}

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
          loading={categoriesLoading || updatingCategories.size > 0}
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
              <DialogDescription className="font-inter">
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
                  className="font-inter mt-2"
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
                  className="font-inter mt-2"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
                disabled={createMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreate}
                disabled={createMutation.isPending || !formData.name || !formData.jobTitleId}
              >
                {createMutation.isPending ? 'Creating...' : 'Create'}
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
              <DialogDescription className="font-inter">
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
                  className="font-inter mt-2"
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
                  className="font-inter mt-2"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                disabled={updateMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdate}
                disabled={updateMutation.isPending || !formData.name || !formData.jobTitleId}
              >
                {updateMutation.isPending ? 'Updating...' : 'Update'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardPageWrapper>
  );
};

export default ServiceCategoriesPage;
