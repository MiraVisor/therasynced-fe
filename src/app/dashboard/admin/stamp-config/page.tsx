'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Edit, Save, Settings, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { DataTable } from '@/components/common/DataTable/data-table';
import { DashboardPageWrapper } from '@/components/core/Dashboard/DashboardPageWrapper';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
import LoadingSpinner from '@/components/ui/loading-spinner';
import { Switch } from '@/components/ui/switch';
import {
  useBulkUpdateStampConfigs,
  useDeleteStampConfig,
  useStampConfigs,
  useUpdateStampConfig,
} from '@/hooks/queries/useAdmin';
import type {
  BulkTherapistStampConfigDto,
  TherapistStampConfig,
  UpdateTherapistStampConfigDto,
} from '@/types/types';

const StampConfigPage = () => {
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<TherapistStampConfig | null>(null);
  const [bulkForm, setBulkForm] = useState<BulkTherapistStampConfigDto>({
    stampTarget: 5,
    discountPercentage: 15,
    isActive: true,
  });
  const [editForm, setEditForm] = useState<UpdateTherapistStampConfigDto>({
    stampTarget: 5,
    discountPercentage: 15,
    isActive: true,
  });

  const { data: configsResponse, isLoading: isLoadingConfigs } = useStampConfigs();
  const configs = configsResponse?.data || [];

  const bulkUpdateMutation = useBulkUpdateStampConfigs();
  const updateMutation = useUpdateStampConfig();
  const deleteMutation = useDeleteStampConfig();

  const handleBulkUpdate = async () => {
    if (bulkForm.stampTarget <= 0 || bulkForm.discountPercentage <= 0) {
      return;
    }

    try {
      await bulkUpdateMutation.mutateAsync(bulkForm);
      setIsBulkDialogOpen(false);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleEdit = (config: TherapistStampConfig) => {
    setSelectedConfig(config);
    setEditForm({
      stampTarget: config.stampTarget || 5,
      discountPercentage: config.discountPercentage || 15,
      isActive: config.isActive,
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = async (therapistId: string) => {
    if (!confirm('Are you sure you want to delete this configuration?')) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(therapistId);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleUpdate = async () => {
    if (!selectedConfig) return;

    if (editForm.stampTarget && editForm.stampTarget <= 0) {
      return;
    }

    if (editForm.discountPercentage && editForm.discountPercentage <= 0) {
      return;
    }

    try {
      await updateMutation.mutateAsync({
        therapistId: selectedConfig.therapistId,
        dto: editForm,
      });
      setIsEditDialogOpen(false);
    } catch (error) {
      // Error handled by mutation
    }
  };

  // Column definitions for stamp configs table
  const columns: ColumnDef<TherapistStampConfig>[] = [
    {
      accessorKey: 'therapist.name',
      header: 'Freelancer',
      cell: ({ row }) => (
        <div className="font-inter font-medium text-charcoal">
          {row.original.therapist?.name || 'Unknown Freelancer'}
        </div>
      ),
    },
    {
      accessorKey: 'therapist.email',
      header: 'Email',
      cell: ({ row }) => (
        <div className="font-inter font-medium text-charcoal">
          {row.original.therapist?.email || 'Unknown Email'}
        </div>
      ),
    },
    {
      accessorKey: 'stampTarget',
      header: 'Stamp Target',
      cell: ({ row }) => (
        <div className="font-poppins text-lg font-bold text-charcoal">
          {row.original.stampTarget || 'Default'}
        </div>
      ),
    },
    {
      accessorKey: 'discountPercentage',
      header: 'Discount',
      cell: ({ row }) => (
        <div className="font-poppins text-lg font-bold text-success">
          {row.original.discountPercentage || 'Default'}%
        </div>
      ),
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.original.isActive ? 'default' : 'secondary'}>
          {row.original.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      accessorKey: 'updatedAt',
      header: 'Last Updated',
      cell: ({ row }) => (
        <div className="font-inter text-xs text-muted-foreground">
          {new Date(row.original.updatedAt).toLocaleDateString()}
        </div>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const config = row.original;
        return (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => handleEdit(config)}>
              <Edit className="h-3 w-3 mr-1" />
              Edit
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleDelete(config.therapistId)}>
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        );
      },
    },
  ];

  if (isLoadingConfigs && configs.length === 0) {
    return (
      <DashboardPageWrapper
        header={
          <div>
            <h1 className="font-poppins font-bold text-2xl text-charcoal">Stamp Configuration</h1>
            <p className="font-inter text-sm text-muted-foreground">
              Manage freelancer stamp loyalty settings
            </p>
          </div>
        }
      >
        <div className="flex items-center justify-center min-h-96">
          <LoadingSpinner />
        </div>
      </DashboardPageWrapper>
    );
  }

  return (
    <DashboardPageWrapper
      header={
        <div className="flex items-center justify-between w-full">
          <div>
            <h1 className="font-poppins font-bold text-2xl text-charcoal">Stamp Configuration</h1>
            <p className="font-inter text-sm text-muted-foreground">
              Manage freelancer stamp loyalty settings
            </p>
          </div>
          <Button onClick={() => setIsBulkDialogOpen(true)}>
            <Settings className="h-4 w-4 mr-2" />
            Bulk Update All
          </Button>
        </div>
      }
    >
      <div className="space-y-6 lg:space-y-8">
        {/* Info Card */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <p className="font-inter text-sm text-blue-800">
              <strong>Note:</strong> Freelancers without custom configurations will use the default
              settings (5 stamps for 15% discount). Use bulk update to apply settings to all
              freelancers at once.
            </p>
          </CardContent>
        </Card>

        {/* Configs Table */}
        <DataTable
          columns={columns}
          data={configs}
          title="Stamp Configurations"
          searchKey="therapist.name"
          searchPlaceholder="Search freelancers..."
          enableSorting={true}
          enableFiltering={true}
          enableColumnVisibility={true}
          enablePagination={true}
          showSearch={true}
          showSorting={true}
          initialLoading={isLoadingConfigs && configs.length === 0}
        />

        {/* Bulk Update Dialog */}
        <Dialog open={isBulkDialogOpen} onOpenChange={setIsBulkDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-poppins font-semibold">
                Bulk Update All Freelancers
              </DialogTitle>
              <DialogDescription className="font-inter">
                Apply the same stamp configuration to all freelancers. This will create or update
                configurations for every freelancer.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="bulk-stamp-target" className="font-inter font-medium">
                  Stamp Target
                </Label>
                <Input
                  id="bulk-stamp-target"
                  type="number"
                  min="1"
                  value={bulkForm.stampTarget}
                  onChange={(e) =>
                    setBulkForm({ ...bulkForm, stampTarget: parseInt(e.target.value) || 5 })
                  }
                />
              </div>
              <div>
                <Label htmlFor="bulk-discount" className="font-inter font-medium">
                  Discount Percentage
                </Label>
                <Input
                  id="bulk-discount"
                  type="number"
                  min="1"
                  max="100"
                  value={bulkForm.discountPercentage}
                  onChange={(e) =>
                    setBulkForm({
                      ...bulkForm,
                      discountPercentage: parseFloat(e.target.value) || 20,
                    })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="bulk-active" className="font-inter font-medium">
                  Active
                </Label>
                <Switch
                  id="bulk-active"
                  checked={bulkForm.isActive}
                  onCheckedChange={(checked) => setBulkForm({ ...bulkForm, isActive: checked })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsBulkDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleBulkUpdate} disabled={bulkUpdateMutation.isPending}>
                {bulkUpdateMutation.isPending ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Apply to All
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-poppins font-semibold">
                Edit Configuration for {selectedConfig?.therapist?.name}
              </DialogTitle>
              <DialogDescription className="font-inter">
                Update the stamp target and discount percentage for this freelancer.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="edit-stamp-target" className="font-inter font-medium">
                  Stamp Target
                </Label>
                <Input
                  id="edit-stamp-target"
                  type="number"
                  min="1"
                  value={editForm.stampTarget}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      stampTarget: parseInt(e.target.value) || 5,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="edit-discount" className="font-inter font-medium">
                  Discount Percentage
                </Label>
                <Input
                  id="edit-discount"
                  type="number"
                  min="1"
                  max="100"
                  value={editForm.discountPercentage}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      discountPercentage: parseFloat(e.target.value) || 20,
                    })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="edit-active" className="font-inter font-medium">
                  Active
                </Label>
                <Switch
                  id="edit-active"
                  checked={editForm.isActive}
                  onCheckedChange={(checked) => setEditForm({ ...editForm, isActive: checked })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdate} disabled={updateMutation.isPending}>
                {updateMutation.isPending ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardPageWrapper>
  );
};

export default StampConfigPage;
