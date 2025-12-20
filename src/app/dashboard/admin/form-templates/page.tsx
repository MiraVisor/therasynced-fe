'use client';

import { ColumnDef } from '@tanstack/react-table';
import { ExternalLink, Eye, EyeOff, FileText, Plus, Trash2, Upload } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { DataTable } from '@/components/common/DataTable/data-table';
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
import { getCookie } from '@/lib/utils';
import { useAuth } from '@/redux/hooks/useAppHooks';
import { BACKEND_URL } from '@/services/endpoints';
import formTemplateService from '@/services/formTemplateService';
import { FormTemplateResponseDto } from '@/types/formTemplateTypes';
import { ROLES } from '@/types/types';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export default function AdminFormTemplatesPage() {
  const router = useRouter();
  const { isAuthenticated, role } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [templates, setTemplates] = useState<FormTemplateResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<FormTemplateResponseDto | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updatingTemplates, setUpdatingTemplates] = useState<Set<string>>(new Set());
  const [viewingTemplateIds, setViewingTemplateIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/authentication/sign-in');
      return;
    }
    if (role && role !== ROLES.ADMIN) {
      toast.error('Access denied. Admin privileges required.');
      router.push('/dashboard');
      return;
    }
    if (role === ROLES.ADMIN) {
      setIsAuthorized(true);
      loadTemplates();
    }
  }, [isAuthenticated, role, router]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const data = await formTemplateService.getAll();
      setTemplates(data);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to load form templates');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (file.type !== 'application/pdf') {
      toast.error('Only PDF files are allowed');
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setUploadFile(file);

    // Auto-fill title with filename (without extension) if title is empty
    if (!title.trim()) {
      const fileNameWithoutExt = file.name.replace(/\.pdf$/i, '');
      setTitle(fileNameWithoutExt);
    }
  };

  const handleUpload = async () => {
    if (!uploadFile || !title.trim()) {
      toast.error('Please select a PDF file and enter a title');
      return;
    }

    if (title.length > 255) {
      toast.error('Title must be 255 characters or less');
      return;
    }

    try {
      setIsSubmitting(true);
      await formTemplateService.upload({
        file: uploadFile,
        title: title.trim(),
      });
      toast.success('Form template uploaded successfully');
      setIsUploadDialogOpen(false);
      setUploadFile(null);
      setTitle('');
      loadTemplates();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to upload form template');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleVisibility = async (template: FormTemplateResponseDto) => {
    try {
      setUpdatingTemplates((prev) => new Set(prev).add(template.id));
      await formTemplateService.update(template.id, {
        isVisible: !template.isVisible,
      });
      toast.success(
        `Form template ${!template.isVisible ? 'made visible' : 'hidden'} successfully`,
      );
      loadTemplates();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update visibility');
    } finally {
      setUpdatingTemplates((prev) => {
        const next = new Set(prev);
        next.delete(template.id);
        return next;
      });
    }
  };

  const handleView = async (template: FormTemplateResponseDto) => {
    try {
      setViewingTemplateIds((prev) => new Set(prev).add(template.id));

      // Get auth token
      const token = getCookie('token');
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      // Fetch PDF as blob using admin endpoint with token in request body (GDPR compliant)
      const blob = await formTemplateService.download(template.id, token);

      // Create object URL from blob
      const blobUrl = URL.createObjectURL(blob);

      // Create a temporary anchor element and click it to open in new tab
      const link = document.createElement('a');
      link.href = blobUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up blob URL after a delay to allow the browser to load it
      setTimeout(() => {
        URL.revokeObjectURL(blobUrl);
      }, 1000);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to open form template');
    } finally {
      setViewingTemplateIds((prev) => {
        const next = new Set(prev);
        next.delete(template.id);
        return next;
      });
    }
  };

  const handleDelete = async (template: FormTemplateResponseDto) => {
    if (
      !confirm(`Are you sure you want to delete "${template.title}"? This action cannot be undone.`)
    ) {
      return;
    }

    try {
      setUpdatingTemplates((prev) => new Set(prev).add(template.id));
      await formTemplateService.delete(template.id);
      toast.success('Form template deleted successfully');
      loadTemplates();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to delete form template');
    } finally {
      setUpdatingTemplates((prev) => {
        const next = new Set(prev);
        next.delete(template.id);
        return next;
      });
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const columns: ColumnDef<FormTemplateResponseDto>[] = [
    {
      accessorKey: 'title',
      header: 'Title',
      cell: ({ row }) => (
        <div className="font-inter font-medium text-charcoal">{row.original.title}</div>
      ),
    },
    {
      accessorKey: 'fileName',
      header: 'File Name',
      cell: ({ row }) => (
        <div className="font-inter text-sm text-foreground">{row.original.fileName}</div>
      ),
    },
    {
      accessorKey: 'fileSize',
      header: 'Size',
      cell: ({ row }) => (
        <div className="font-inter text-sm text-foreground">
          {formatFileSize(row.original.fileSize)}
        </div>
      ),
    },
    {
      accessorKey: 'isVisible',
      header: 'Visibility',
      cell: ({ row }) => {
        const template = row.original;
        return (
          <div className="flex items-center gap-2">
            {template.isVisible ? (
              <Eye className="h-4 w-4 text-success" />
            ) : (
              <EyeOff className="h-4 w-4 text-muted-foreground" />
            )}
            <span className="font-inter text-sm">{template.isVisible ? 'Visible' : 'Hidden'}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ row }) => (
        <div className="font-inter text-sm text-foreground">
          {formatDate(row.original.createdAt)}
        </div>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const template = row.original;
        const isUpdating = updatingTemplates.has(template.id);
        const isViewing = viewingTemplateIds.has(template.id);
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleView(template)}
              disabled={isViewing}
              className="h-8 w-8 p-0"
              title="View PDF"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleToggleVisibility(template)}
              disabled={isUpdating}
              className="h-8 w-8 p-0"
              title={template.isVisible ? 'Hide from freelancers' : 'Show to freelancers'}
            >
              {template.isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(template)}
              disabled={isUpdating}
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  const visibleCount = templates.filter((t) => t.isVisible).length;
  const hiddenCount = templates.filter((t) => !t.isVisible).length;

  if (!isAuthorized || role !== ROLES.ADMIN) {
    return null;
  }

  return (
    <DashboardPageWrapper
      header={
        <div className="flex items-center justify-between w-full">
          <h1 className="font-poppins font-bold text-2xl text-charcoal">Form Templates</h1>
          <Button
            onClick={() => {
              setUploadFile(null);
              setTitle('');
              setIsUploadDialogOpen(true);
            }}
            className="font-inter"
          >
            <Plus className="h-4 w-4 mr-2" />
            Upload Template
          </Button>
        </div>
      }
    >
      <div className="space-y-6 lg:space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <EnhancedStatCard
            title="Total Templates"
            value={templates.length.toString()}
            icon={FileText}
            iconColor="text-primary"
            iconBg="bg-primary/10"
            loading={loading}
          />
          <EnhancedStatCard
            title="Visible"
            value={visibleCount.toString()}
            icon={Eye}
            iconColor="text-success"
            iconBg="bg-success/10"
            loading={loading}
          />
          <EnhancedStatCard
            title="Hidden"
            value={hiddenCount.toString()}
            icon={EyeOff}
            iconColor="text-muted-foreground"
            iconBg="bg-muted/10"
            loading={loading}
          />
        </div>

        {/* Templates Table */}
        <DataTable
          columns={columns}
          data={templates}
          title="Form Templates"
          searchKey="title"
          searchPlaceholder="Search templates..."
          enableSorting
          enableFiltering
          enablePagination={true}
          showSearch={true}
          showSorting={false}
          initialLoading={loading}
          loading={loading || updatingTemplates.size > 0}
        />

        {/* Upload Dialog */}
        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-poppins font-semibold">Upload Form Template</DialogTitle>
              <DialogDescription className="font-inter">
                Upload a PDF form template. Maximum file size is 10MB.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="file" className="font-inter font-medium">
                  PDF File *
                </Label>
                <div className="mt-2">
                  <Input
                    id="file"
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleFileSelect}
                    className="font-inter"
                  />
                  {uploadFile && (
                    <p className="text-sm text-muted-foreground mt-2 font-inter">
                      Selected: {uploadFile.name} ({formatFileSize(uploadFile.size)})
                    </p>
                  )}
                </div>
              </div>
              <div>
                <Label htmlFor="title" className="font-inter font-medium">
                  Title *
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Patient Intake Form"
                  className="font-inter mt-2"
                  maxLength={255}
                  required
                />
                <p className="text-xs text-muted-foreground mt-1 font-inter">
                  {title.length}/255 characters
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsUploadDialogOpen(false);
                  setUploadFile(null);
                  setTitle('');
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpload}
                disabled={isSubmitting || !uploadFile || !title.trim()}
              >
                {isSubmitting ? 'Uploading...' : 'Upload'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardPageWrapper>
  );
}
