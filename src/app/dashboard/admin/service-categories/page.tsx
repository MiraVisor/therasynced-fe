'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Edit, FolderTree, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { DataTable } from '@/components/common/DataTable/data-table';
import { ConfirmationDialog } from '@/components/core/Dashboard/AdminSide/Components/ConfirmationDialog';
import { FilterBar } from '@/components/core/Dashboard/AdminSide/Components/FilterBar';
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
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import adminJobTitleService, { type JobTitleResponse } from '@/services/adminJobTitleService';
import adminServiceCategoryService, {
  type CreateServiceCategoryDto,
  type GroupedServiceCategoriesResponse,
  type ServiceCategoryResponse,
  type UpdateServiceCategoryDto,
} from '@/services/adminServiceCategoryService';

const ServiceCategoriesPage = () => {
  const [view, setView] = useState<'table' | 'hierarchy'>('table');
  const [serviceCategories, setServiceCategories] = useState<ServiceCategoryResponse[]>([]);
  const [groupedCategories, setGroupedCategories] = useState<GroupedServiceCategoriesResponse[]>(
    [],
  );
  const [jobTitles, setJobTitles] = useState<JobTitleResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJobTitle, setSelectedJobTitle] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
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

  const fetchServiceCategories = async () => {
    try {
      setLoading(true);
      const [categoriesResponse, groupedResponse, jobTitlesResponse] = await Promise.all([
        adminServiceCategoryService.getAll(),
        adminServiceCategoryService.getGrouped(),
        adminJobTitleService.getActive(),
      ]);

      if (categoriesResponse.success) {
        const data = categoriesResponse.data || [];
        setServiceCategories(data);
      }

      if (groupedResponse.success) {
        setGroupedCategories(groupedResponse.data || []);
      }

      if (jobTitlesResponse.success) {
        setJobTitles(jobTitlesResponse.data || []);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch service categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServiceCategories();
  }, []);

  const filteredCategories = serviceCategories.filter((category) => {
    const matchesSearch =
      category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesJobTitle = selectedJobTitle === 'all' || category.jobTitle.id === selectedJobTitle;
    return matchesSearch && matchesJobTitle;
  });

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
        fetchServiceCategories();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to create service category');
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
        fetchServiceCategories();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update service category');
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
        fetchServiceCategories();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete service category');
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

  const handleResetFilters = () => {
    setSelectedJobTitle('all');
    setSearchQuery('');
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
        {/* Filters */}
        <FilterBar
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search categories..."
          filters={[
            {
              key: 'jobTitle',
              label: 'Job Title',
              value: selectedJobTitle,
              options: [
                { label: 'All Job Titles', value: 'all' },
                ...jobTitles.map((jt) => ({ label: jt.name, value: jt.id })),
              ],
              onValueChange: setSelectedJobTitle,
            },
          ]}
          onReset={handleResetFilters}
        />

        {/* View Toggle */}
        <Tabs value={view} onValueChange={(v) => setView(v as 'table' | 'hierarchy')}>
          <TabsList className="grid w-full md:w-[400px] grid-cols-2">
            <TabsTrigger value="table" className="font-inter">
              Table View
            </TabsTrigger>
            <TabsTrigger value="hierarchy" className="font-inter">
              Hierarchical View
            </TabsTrigger>
          </TabsList>

          <TabsContent value="table" className="mt-4">
            <DataTable
              columns={columns}
              data={filteredCategories}
              title="All Service Categories"
              searchKey="name"
              searchPlaceholder="Search categories..."
              enableSorting
              enableFiltering
              enablePagination
              pageSize={10}
            />
          </TabsContent>

          <TabsContent value="hierarchy" className="mt-4">
            <div className="space-y-6">
              {groupedCategories.length > 0 ? (
                groupedCategories.map((group) => (
                  <EnhancedCard key={group.jobTitleId} variant="default" className="p-6">
                    <h3 className="font-poppins text-lg font-semibold text-foreground mb-4 border-b border-border pb-3">
                      {group.jobTitleName}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {group.categories.length > 0 ? (
                        group.categories.map((category) => (
                          <div
                            key={category.id}
                            className="flex flex-col gap-2 p-3 border border-border rounded-lg hover:bg-accent/50 transition-colors"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <div className="font-inter font-medium text-sm text-foreground truncate">
                                  {category.name}
                                </div>
                                {category.description && (
                                  <div className="font-open-sans text-xs text-muted-foreground mt-1 line-clamp-2">
                                    {category.description}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 mt-auto pt-2 border-t border-border">
                              <StatusBadge
                                status={category.isActive ? 'ACTIVE' : 'INACTIVE'}
                                size="sm"
                              />
                              <div className="flex items-center gap-1 ml-auto">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEdit(category)}
                                  className="font-inter h-7 w-7 p-0"
                                >
                                  <Edit className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteClick(category)}
                                  className="text-error hover:text-error font-inter h-7 w-7 p-0"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="font-open-sans text-sm text-muted-foreground col-span-full p-3">
                          No categories for this job title
                        </p>
                      )}
                    </div>
                  </EnhancedCard>
                ))
              ) : (
                <EnhancedCard variant="default" className="p-6 text-center">
                  <FolderTree className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="font-open-sans text-base text-muted-foreground">
                    No service categories found
                  </p>
                </EnhancedCard>
              )}
            </div>
          </TabsContent>
        </Tabs>

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
