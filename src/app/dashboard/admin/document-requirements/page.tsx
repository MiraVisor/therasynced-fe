'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Edit, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { DataTable } from '@/components/common/DataTable/data-table';
import { DashboardPageWrapper } from '@/components/core/Dashboard/DashboardPageWrapper';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import {
  useCreateDocumentRequirement,
  useDeleteDocumentRequirement,
  useDocumentRequirements,
  useUpdateDocumentRequirement,
} from '@/hooks/queries/useDocumentRequirements';
import adminJobTitleService, { JobTitleResponse } from '@/services/adminJobTitleService';
import type {
  CreateDocumentRequirementDto,
  DocumentRequirement,
  UpdateDocumentRequirementDto,
} from '@/services/documentRequirementService';

interface FormData {
  jobTitleId: string;
  name: string;
  description: string;
  isMandatory: boolean;
  isActive: boolean;
}

const initialFormData: FormData = {
  jobTitleId: '',
  name: '',
  description: '',
  isMandatory: false,
  isActive: true,
};

const DocumentRequirementsPage = () => {
  // State
  const [jobTitles, setJobTitles] = useState<JobTitleResponse[]>([]);
  const [loadingJobTitles, setLoadingJobTitles] = useState(true);
  const [selectedJobTitle, setSelectedJobTitle] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedRequirement, setSelectedRequirement] = useState<DocumentRequirement | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);

  // Queries
  const { data: requirementsData, isLoading: loadingRequirements } = useDocumentRequirements();
  const createMutation = useCreateDocumentRequirement();
  const updateMutation = useUpdateDocumentRequirement();
  const deleteMutation = useDeleteDocumentRequirement();

  // Fetch job titles on mount
  useEffect(() => {
    const fetchJobTitles = async () => {
      try {
        const response = await adminJobTitleService.getActive();
        setJobTitles(response.data || []);
      } catch (error) {
        toast.error('Failed to load job titles');
      } finally {
        setLoadingJobTitles(false);
      }
    };
    fetchJobTitles();
  }, []);

  // Flatten requirements for table display
  const flattenedRequirements: DocumentRequirement[] = (requirementsData || []).flatMap(
    (group) => group.requirements,
  );

  // Filter by selected job title
  const filteredRequirements =
    selectedJobTitle === 'all'
      ? flattenedRequirements
      : flattenedRequirements.filter((req) => req.jobTitleId === selectedJobTitle);

  // Handlers
  const handleCreate = async () => {
    if (!formData.jobTitleId || !formData.name) {
      toast.error('Please fill in all required fields');
      return;
    }

    const createData: CreateDocumentRequirementDto = {
      jobTitleId: formData.jobTitleId,
      name: formData.name,
      description: formData.description || undefined,
      isMandatory: formData.isMandatory,
      isActive: formData.isActive,
    };

    try {
      await createMutation.mutateAsync(createData);
      setIsCreateDialogOpen(false);
      setFormData(initialFormData);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleUpdate = async () => {
    if (!selectedRequirement || !formData.name) {
      toast.error('Please fill in all required fields');
      return;
    }

    const updateData: UpdateDocumentRequirementDto = {
      name: formData.name,
      description: formData.description || undefined,
      isMandatory: formData.isMandatory,
      isActive: formData.isActive,
    };

    try {
      await updateMutation.mutateAsync({ id: selectedRequirement.id, data: updateData });
      setIsEditDialogOpen(false);
      setSelectedRequirement(null);
      setFormData(initialFormData);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleDelete = async () => {
    if (!selectedRequirement) return;

    try {
      await deleteMutation.mutateAsync(selectedRequirement.id);
      setIsDeleteDialogOpen(false);
      setSelectedRequirement(null);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleEdit = (requirement: DocumentRequirement) => {
    setSelectedRequirement(requirement);
    setFormData({
      jobTitleId: requirement.jobTitleId,
      name: requirement.name,
      description: requirement.description || '',
      isMandatory: requirement.isMandatory,
      isActive: requirement.isActive,
    });
    setIsEditDialogOpen(true);
  };

  const handleOpenDelete = (requirement: DocumentRequirement) => {
    setSelectedRequirement(requirement);
    setIsDeleteDialogOpen(true);
  };

  const columns: ColumnDef<DocumentRequirement>[] = [
    {
      accessorKey: 'name',
      header: 'Document Name',
      cell: ({ row }) => (
        <div className="font-inter font-medium text-charcoal">{row.original.name}</div>
      ),
    },
    {
      accessorKey: 'jobTitle.name',
      header: 'Job Title',
      cell: ({ row }) => (
        <Badge
          variant="outline"
          className="font-inter text-xs px-2 py-1 bg-primary/10 text-primary border-primary/20"
        >
          {row.original.jobTitle?.name || 'N/A'}
        </Badge>
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
      accessorKey: 'isMandatory',
      header: 'Mandatory',
      cell: ({ row }) => (
        <Badge
          variant={row.original.isMandatory ? 'default' : 'secondary'}
          className={`font-inter text-xs ${
            row.original.isMandatory
              ? 'bg-destructive/10 text-destructive border-destructive/20'
              : 'bg-muted text-muted-foreground'
          }`}
        >
          {row.original.isMandatory ? 'Required' : 'Optional'}
        </Badge>
      ),
    },
    {
      accessorKey: 'sortOrder',
      header: 'Order',
      cell: ({ row }) => (
        <div className="font-inter text-sm text-center">{row.original.sortOrder}</div>
      ),
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => (
        <Badge
          variant={row.original.isActive ? 'default' : 'secondary'}
          className={`font-inter text-xs ${
            row.original.isActive
              ? 'bg-success/10 text-success border-success/20'
              : 'bg-muted text-muted-foreground'
          }`}
        >
          {row.original.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const requirement = row.original;
        return (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEdit(requirement)}
              className="h-8 w-8 p-0 hover:bg-info/10"
            >
              <Edit className="h-4 w-4 text-info" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleOpenDelete(requirement)}
              className="h-8 w-8 p-0 hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        );
      },
    },
  ];

  const isLoading = loadingRequirements || loadingJobTitles;

  return (
    <DashboardPageWrapper
      header={
        <div className="flex items-center justify-between w-full">
          <h1 className="font-poppins font-bold text-2xl text-charcoal">Document Requirements</h1>
          <Button
            onClick={() => {
              setFormData(initialFormData);
              setIsCreateDialogOpen(true);
            }}
            className="font-inter"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Requirement
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Filter by Job Title */}
        <div className="flex items-center gap-4">
          <Label className="font-inter text-sm text-muted-foreground">Filter by Job Title:</Label>
          <Select value={selectedJobTitle} onValueChange={setSelectedJobTitle}>
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="All Job Titles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Job Titles</SelectItem>
              {jobTitles.map((jt) => (
                <SelectItem key={jt.id} value={jt.id}>
                  {jt.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Info Card */}
        <div className="p-4 bg-info/10 border border-info/20 rounded-lg">
          <p className="text-sm text-info font-inter">
            Document requirements define what documents freelancers must upload for each job title.
            Mark documents as <strong>mandatory</strong> to block slot creation until they are
            uploaded.
          </p>
        </div>

        {/* Requirements Table */}
        <DataTable
          columns={columns}
          data={filteredRequirements}
          title="Document Requirements"
          searchKey="name"
          searchPlaceholder="Search documents..."
          enableSorting={true}
          enableFiltering={true}
          enableColumnVisibility={true}
          enablePagination={true}
          showSearch={true}
          initialLoading={isLoading}
          loading={isLoading}
        />

        {/* Create Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="font-poppins font-semibold">
                Add Document Requirement
              </DialogTitle>
              <DialogDescription className="font-inter">
                Create a new document requirement for a job title
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="jobTitleId" className="font-inter font-medium">
                  Job Title *
                </Label>
                <Select
                  value={formData.jobTitleId}
                  onValueChange={(value) => setFormData({ ...formData, jobTitleId: value })}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select a job title" />
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
                <Label htmlFor="name" className="font-inter font-medium">
                  Document Name *
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., CORU Registration"
                  className="font-inter mt-2"
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
                  placeholder="Help text for freelancers..."
                  className="font-inter mt-2"
                  rows={3}
                />
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isMandatory"
                    checked={formData.isMandatory}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, isMandatory: checked as boolean })
                    }
                  />
                  <Label htmlFor="isMandatory" className="font-inter text-sm">
                    Mandatory (blocks slot creation)
                  </Label>
                </div>
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
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="font-poppins font-semibold">
                Edit Document Requirement
              </DialogTitle>
              <DialogDescription className="font-inter">
                Update document requirement details
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="font-inter font-medium">Job Title</Label>
                <div className="mt-2 p-2 bg-muted rounded-md">
                  <Badge variant="secondary">{selectedRequirement?.jobTitle?.name || 'N/A'}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Job title cannot be changed. Create a new requirement if needed.
                </p>
              </div>
              <div>
                <Label htmlFor="edit-name" className="font-inter font-medium">
                  Document Name *
                </Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., CORU Registration"
                  className="font-inter mt-2"
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
                  placeholder="Help text for freelancers..."
                  className="font-inter mt-2"
                  rows={3}
                />
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="edit-isMandatory"
                    checked={formData.isMandatory}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, isMandatory: checked as boolean })
                    }
                  />
                  <Label htmlFor="edit-isMandatory" className="font-inter text-sm">
                    Mandatory (blocks slot creation)
                  </Label>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="edit-isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, isActive: checked as boolean })
                    }
                  />
                  <Label htmlFor="edit-isActive" className="font-inter text-sm">
                    Active
                  </Label>
                </div>
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
              <Button onClick={handleUpdate} disabled={updateMutation.isPending || !formData.name}>
                {updateMutation.isPending ? 'Updating...' : 'Update'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="font-poppins font-semibold">
                Delete Document Requirement
              </DialogTitle>
              <DialogDescription className="font-inter">
                Are you sure you want to delete the document requirement &quot;
                {selectedRequirement?.name}&quot;? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
                disabled={deleteMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardPageWrapper>
  );
};

export default DocumentRequirementsPage;
