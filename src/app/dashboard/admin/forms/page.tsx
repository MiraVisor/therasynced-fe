'use client';

// Import ColumnDef type separately (types don't need to be dynamic)
import type { ColumnDef } from '@tanstack/react-table';
import { Download, Edit, Eye, EyeOff, FileText, Plus, Trash2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import { toast } from 'react-toastify';

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
import { StatsCardsSkeleton } from '@/components/ui/skeletons/StatsCardsSkeleton';
import { Switch } from '@/components/ui/switch';
import {
  useDeleteFormTemplate,
  useFormTemplates,
  useGetAdminFormTemplateSignedUrl,
  useUpdateFormTemplate,
  useUploadFormTemplate,
} from '@/hooks/queries/useFormTemplates';
import { formatFileSize } from '@/services/formTemplateService';
import type { FormTemplate } from '@/types/formTemplate';

// Dynamically import DataTable to ensure it's client-only
const DataTable = dynamic(
  () =>
    import('@/components/common/DataTable/data-table').then((mod) => ({ default: mod.DataTable })),
  { ssr: false },
);

const AdminFormsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<FormTemplate | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editIsVisible, setEditIsVisible] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<FormTemplate | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const { data: templates, isLoading, isFetching } = useFormTemplates();
  const uploadMutation = useUploadFormTemplate();
  const updateMutation = useUpdateFormTemplate();
  const deleteMutation = useDeleteFormTemplate();
  const signedUrlMutation = useGetAdminFormTemplateSignedUrl();

  // Filter templates based on search query
  const filteredTemplates =
    templates?.filter(
      (template) =>
        template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.fileName.toLowerCase().includes(searchQuery.toLowerCase()),
    ) || [];

  // Calculate stats
  const stats = {
    total: templates?.length || 0,
    visible: templates?.filter((t) => t.isVisible).length || 0,
    hidden: templates?.filter((t) => !t.isVisible).length || 0,
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (file.type !== 'application/pdf') {
      alert('Only PDF files are allowed');
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    setUploadFile(file);
    if (!uploadTitle) {
      // Auto-fill title from filename (remove .pdf extension)
      setUploadTitle(file.name.replace(/\.pdf$/i, ''));
    }
  };

  const handleUpload = () => {
    if (!uploadFile || !uploadTitle.trim()) {
      alert('Please select a file and enter a title');
      return;
    }

    uploadMutation.mutate(
      {
        data: {
          file: uploadFile,
          title: uploadTitle.trim(),
        },
        onProgress: (progress) => {
          setUploadProgress(progress.percentage);
        },
      },
      {
        onSuccess: () => {
          setIsUploadDialogOpen(false);
          setUploadFile(null);
          setUploadTitle('');
          setUploadProgress(0);
        },
      },
    );
  };

  const handleEdit = (template: FormTemplate) => {
    setSelectedTemplate(template);
    setEditTitle(template.title);
    setEditIsVisible(template.isVisible);
    setIsEditDialogOpen(true);
  };

  const handleUpdate = () => {
    if (!selectedTemplate || !editTitle.trim()) {
      return;
    }

    updateMutation.mutate(
      {
        id: selectedTemplate.id,
        data: {
          title: editTitle.trim(),
          isVisible: editIsVisible,
        },
      },
      {
        onSuccess: () => {
          setIsEditDialogOpen(false);
          setSelectedTemplate(null);
          setEditTitle('');
          setEditIsVisible(false);
        },
      },
    );
  };

  const handleDelete = (template: FormTemplate) => {
    setTemplateToDelete(template);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!templateToDelete) return;

    deleteMutation.mutate(templateToDelete.id, {
      onSuccess: () => {
        setDeleteDialogOpen(false);
        setTemplateToDelete(null);
      },
    });
  };

  const handleDownload = async (template: FormTemplate) => {
    setDownloadingId(template.id);
    try {
      const data = await signedUrlMutation.mutateAsync(template.id);

      // Fetch the PDF as a blob to avoid CORS issues
      const response = await fetch(data.signedUrl, {
        method: 'GET',
        headers: {
          Accept: 'application/pdf',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch PDF');
      }

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      // Open the blob URL in a new tab
      window.open(blobUrl, '_blank');

      // Clean up the blob URL after a delay
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);

      setDownloadingId(null);
    } catch (error) {
      console.error('Error loading PDF:', error);
      toast.error('Failed to load PDF. Please try again.');
      setDownloadingId(null);
    }
  };

  const columns: ColumnDef<FormTemplate>[] = [
    {
      accessorKey: 'title',
      header: 'Title',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span className="font-inter font-medium text-charcoal">{row.original.title}</span>
        </div>
      ),
    },
    {
      accessorKey: 'fileName',
      header: 'File Name',
      cell: ({ row }) => (
        <span className="font-inter text-sm text-muted-foreground">{row.original.fileName}</span>
      ),
    },
    {
      accessorKey: 'fileSize',
      header: 'Size',
      cell: ({ row }) => (
        <span className="font-inter text-sm text-foreground">
          {formatFileSize(row.original.fileSize)}
        </span>
      ),
    },
    {
      accessorKey: 'isVisible',
      header: 'Visibility',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {row.original.isVisible ? (
            <>
              <Eye className="h-4 w-4 text-green-600" />
              <span className="font-inter text-sm text-success">Visible</span>
            </>
          ) : (
            <>
              <EyeOff className="h-4 w-4 text-muted-foreground" />
              <span className="font-inter text-sm text-muted-foreground">Hidden</span>
            </>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ row }) => (
        <span className="font-inter text-sm text-muted-foreground">
          {new Date(row.original.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const template = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDownload(template)}
              disabled={downloadingId === template.id}
            >
              {downloadingId === template.id ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
              ) : (
                <Download className="h-4 w-4" />
              )}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => handleEdit(template)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => handleDelete(template)}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <DashboardPageWrapper
      header={
        <div className="flex flex-col sm:flex-row w-full items-start sm:items-center justify-between gap-4">
          <h1 className="font-poppins font-bold text-2xl text-charcoal">Form Templates</h1>
          <Button onClick={() => setIsUploadDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Upload Template
          </Button>
        </div>
      }
    >
      <div className="space-y-6 lg:space-y-8">
        {/* Stats Cards */}
        {isLoading && !templates ? (
          <StatsCardsSkeleton count={3} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <EnhancedStatCard title="Total Templates" value={stats.total.toString()} />
            <EnhancedStatCard title="Visible" value={stats.visible.toString()} />
            <EnhancedStatCard title="Hidden" value={stats.hidden.toString()} />
          </div>
        )}

        {/* Templates Table */}
        <DataTable
          columns={columns as any}
          data={filteredTemplates}
          title="All Templates"
          searchKey="title"
          searchPlaceholder="Search by title or filename..."
          enableSorting={true}
          enableFiltering={true}
          enableColumnVisibility={true}
          enablePagination={true}
          showSearch={true}
          showSorting={true}
          initialLoading={isLoading && (templates as unknown as FormTemplate[])?.length > 0}
          loading={isFetching}
          externalSearchValue={searchQuery}
          onExternalSearchChange={setSearchQuery}
        />

        {/* Upload Dialog */}
        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Upload Form Template</DialogTitle>
              <DialogDescription>Upload a PDF form template (max 10MB)</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="file">PDF File</Label>
                <Input
                  id="file"
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleFileSelect}
                  disabled={uploadMutation.isPending}
                />
                {uploadFile && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Selected: {uploadFile.name} ({formatFileSize(uploadFile.size)})
                  </p>
                )}
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{uploadProgress}%</p>
                  </div>
                )}
              </div>
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="Enter template title"
                  disabled={uploadMutation.isPending}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsUploadDialogOpen(false);
                  setUploadFile(null);
                  setUploadTitle('');
                  setUploadProgress(0);
                }}
                disabled={uploadMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpload}
                disabled={uploadMutation.isPending || !uploadFile || !uploadTitle.trim()}
              >
                {uploadMutation.isPending ? 'Uploading...' : 'Upload'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Form Template</DialogTitle>
              <DialogDescription>Update template title and visibility</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Enter template title"
                  disabled={updateMutation.isPending}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="edit-visibility">Visible to Freelancers</Label>
                <Switch
                  id="edit-visibility"
                  checked={editIsVisible}
                  onCheckedChange={setEditIsVisible}
                  disabled={updateMutation.isPending}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false);
                  setSelectedTemplate(null);
                  setEditTitle('');
                  setEditIsVisible(false);
                }}
                disabled={updateMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdate}
                disabled={updateMutation.isPending || !editTitle.trim()}
              >
                {updateMutation.isPending ? 'Updating...' : 'Update'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Delete Form Template</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete &quot;{templateToDelete?.title}&quot;? This action
                cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
                disabled={deleteMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
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

export default AdminFormsPage;
