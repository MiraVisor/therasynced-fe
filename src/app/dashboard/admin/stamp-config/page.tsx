'use client';

import { Plus, Save, Settings, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import { DashboardPageWrapper } from '@/components/core/Dashboard/DashboardPageWrapper';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  bulkUpdateStampConfigs,
  createOrUpdateStampConfig,
  deleteStampConfig,
  getAllStampConfigs,
  updateStampConfig,
} from '@/redux/api/loyaltyApi';
import { RootState } from '@/redux/store';
import {
  BulkTherapistStampConfigDto,
  CreateTherapistStampConfigDto,
  TherapistStampConfig,
  UpdateTherapistStampConfigDto,
} from '@/types/types';

const StampConfigPage = () => {
  const dispatch = useDispatch();
  const { configs, isLoadingConfigs, isUpdatingConfig, configError } = useSelector(
    (state: RootState) => state.stamps,
  );

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

  useEffect(() => {
    dispatch(getAllStampConfigs() as any);
  }, [dispatch]);

  const handleBulkUpdate = async () => {
    if (bulkForm.stampTarget <= 0 || bulkForm.discountPercentage <= 0) {
      toast.error('Stamp target and discount percentage must be greater than 0');
      return;
    }

    try {
      const result = await dispatch(bulkUpdateStampConfigs(bulkForm) as any);
      if (bulkUpdateStampConfigs.fulfilled.match(result)) {
        toast.success(
          `Successfully updated ${result.payload.updatedCount} therapist configurations`,
        );
        setIsBulkDialogOpen(false);
        dispatch(getAllStampConfigs() as any);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to bulk update configurations');
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

  const handleUpdate = async () => {
    if (!selectedConfig) return;

    if (editForm.stampTarget && editForm.stampTarget <= 0) {
      toast.error('Stamp target must be greater than 0');
      return;
    }

    if (editForm.discountPercentage && editForm.discountPercentage <= 0) {
      toast.error('Discount percentage must be greater than 0');
      return;
    }

    try {
      const result = await dispatch(
        updateStampConfig({
          therapistId: selectedConfig.therapistId,
          dto: editForm,
        }) as any,
      );
      if (updateStampConfig.fulfilled.match(result)) {
        toast.success('Configuration updated successfully');
        setIsEditDialogOpen(false);
        dispatch(getAllStampConfigs() as any);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update configuration');
    }
  };

  const handleDelete = async (therapistId: string) => {
    if (!confirm('Are you sure you want to delete this configuration?')) {
      return;
    }

    try {
      const result = await dispatch(deleteStampConfig(therapistId) as any);
      if (deleteStampConfig.fulfilled.match(result)) {
        toast.success('Configuration deleted successfully');
        dispatch(getAllStampConfigs() as any);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete configuration');
    }
  };

  if (isLoadingConfigs && configs.length === 0) {
    return (
      <DashboardPageWrapper
        header={
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Stamp Configuration</h1>
            <p className="text-gray-600">Manage therapist stamp loyalty settings</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Stamp Configuration</h1>
            <p className="text-gray-600">Manage therapist stamp loyalty settings</p>
          </div>
          <Button onClick={() => setIsBulkDialogOpen(true)}>
            <Settings className="h-4 w-4 mr-2" />
            Bulk Update All
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Info Card */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Therapists without custom configurations will use the default
              settings (5 stamps for 15% discount). Use bulk update to apply settings to all
              therapists at once.
            </p>
          </CardContent>
        </Card>

        {/* Configs List */}
        {configs.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">No custom configurations found.</p>
              <p className="text-sm text-gray-400 mt-2">
                All therapists are using default settings.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {configs.map((config) => (
              <Card key={config.therapistId} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      {config.therapist?.name || 'Unknown Therapist'}
                    </CardTitle>
                    <Badge variant={config.isActive ? 'default' : 'secondary'}>
                      {config.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Stamp Target</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {config.stampTarget || 'Default'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Discount Percentage</p>
                    <p className="text-2xl font-bold text-green-600">
                      {config.discountPercentage || 'Default'}%
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-xs text-gray-500">
                      Updated: {new Date(config.updatedAt).toLocaleDateString()}
                    </span>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(config)}>
                        <Settings className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(config.therapistId)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Bulk Update Dialog */}
        <Dialog open={isBulkDialogOpen} onOpenChange={setIsBulkDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Bulk Update All Therapists</DialogTitle>
              <DialogDescription>
                Apply the same stamp configuration to all therapists. This will create or update
                configurations for every therapist.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="bulk-stamp-target">Stamp Target</Label>
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
                <Label htmlFor="bulk-discount">Discount Percentage</Label>
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
                <Label htmlFor="bulk-active">Active</Label>
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
              <Button onClick={handleBulkUpdate} disabled={isUpdatingConfig}>
                {isUpdatingConfig ? (
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
              <DialogTitle>Edit Configuration for {selectedConfig?.therapist?.name}</DialogTitle>
              <DialogDescription>
                Update the stamp target and discount percentage for this therapist.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="edit-stamp-target">Stamp Target</Label>
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
                <Label htmlFor="edit-discount">Discount Percentage</Label>
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
                <Label htmlFor="edit-active">Active</Label>
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
              <Button onClick={handleUpdate} disabled={isUpdatingConfig}>
                {isUpdatingConfig ? (
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
