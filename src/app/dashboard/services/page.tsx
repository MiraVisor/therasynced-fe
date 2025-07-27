'use client';

import { Edit, Eye, EyeOff, Package, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import { DataTable } from '@/components/common/DataTable/data-table';
import { DashboardPageWrapper } from '@/components/core/Dashboard/DashboardPageWrapper';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { useAppDispatch } from '@/redux/hooks/useAppHooks';
import {
  createServiceAsync,
  deleteServiceAsync,
  fetchServices,
  updateServiceAsync,
} from '@/redux/slices/serviceSlice';
import { RootState } from '@/redux/store';
import { LocationType, Service } from '@/types/types';

// Service Form Component
const ServiceForm = ({
  service,
  onSuccess,
  onCancel,
}: {
  service?: Service;
  onSuccess: () => void;
  onCancel: () => void;
}) => {
  const dispatch = useAppDispatch();
  const { isCreating, isUpdating } = useSelector((state: RootState) => state.service);

  const [formData, setFormData] = useState({
    name: service?.name || '',
    description: service?.description || '',
    additionalPrice: service?.additionalPrice || 0,
    duration: service?.duration || undefined,
    locationTypes: service?.locationTypes || [LocationType.VIRTUAL],
    tags: service?.tags || [],
    requiresEquipment: service?.requiresEquipment || false,
  });
  const [newTag, setNewTag] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || formData.additionalPrice <= 0) {
      return;
    }

    try {
      if (service) {
        await dispatch(updateServiceAsync({ id: service.id, data: formData }) as any).unwrap();
      } else {
        await dispatch(createServiceAsync(formData) as any).unwrap();
      }
      onSuccess();
    } catch (error) {
      // Error handling is done in the slice
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, newTag.trim()] });
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({ ...formData, tags: formData.tags.filter((tag) => tag !== tagToRemove) });
  };

  const toggleLocationType = (type: LocationType) => {
    const newTypes = formData.locationTypes.includes(type)
      ? formData.locationTypes.filter((t) => t !== type)
      : [...formData.locationTypes, type];
    setFormData({ ...formData, locationTypes: newTypes });
  };

  const getLocationTypeIcon = (type: LocationType) => {
    switch (type) {
      case LocationType.VIRTUAL:
        return '💻';
      case LocationType.HOME:
        return '🏠';
      case LocationType.OFFICE:
        return '🏢';
      case LocationType.CLINIC:
        return '🏥';
      default:
        return '📍';
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Service Name *</label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Premium Consultation, Home Visit"
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe your service..."
            className="w-full p-3 border border-gray-300 rounded-md resize-none"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Price (€)
            </label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={formData.additionalPrice}
              onChange={(e) =>
                setFormData({ ...formData, additionalPrice: parseFloat(e.target.value) })
              }
              placeholder="25.00"
            />
            <p className="text-xs text-gray-500 mt-1">Additional fee for this service</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duration Extension
            </label>
            <select
              value={formData.duration || 'none'}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  duration: e.target.value === 'none' ? undefined : parseInt(e.target.value),
                })
              }
              className="w-full p-3 border border-gray-300 rounded-md"
            >
              <option value="none">No extension</option>
              <option value="15">+15 minutes</option>
              <option value="30">+30 minutes</option>
              <option value="45">+45 minutes</option>
              <option value="60">+1 hour</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Available Locations
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              LocationType.VIRTUAL,
              LocationType.HOME,
              LocationType.OFFICE,
              LocationType.CLINIC,
            ].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => toggleLocationType(type)}
                className={`p-3 border rounded-lg text-center transition-colors ${
                  formData.locationTypes.includes(type)
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 bg-white hover:bg-gray-50'
                }`}
              >
                <div className="text-lg mb-1">{getLocationTypeIcon(type)}</div>
                <div className="text-xs">{type}</div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
          <div className="flex gap-2 mb-2">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Add a tag..."
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
            />
            <Button type="button" onClick={addTag} variant="outline">
              Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="cursor-pointer"
                onClick={() => removeTag(tag)}
              >
                {tag} ×
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="requiresEquipment"
            checked={formData.requiresEquipment}
            onChange={(e) => setFormData({ ...formData, requiresEquipment: e.target.checked })}
            className="rounded"
          />
          <label htmlFor="requiresEquipment" className="text-sm text-gray-700">
            Requires special equipment
          </label>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isCreating || isUpdating}>
          {isCreating || isUpdating ? 'Saving...' : service ? 'Update Service' : 'Create Service'}
        </Button>
      </div>
    </form>
  );
};

// Service Table Columns
const createServiceColumns = (
  onEdit: (service: Service) => void,
  onDelete: (service: Service) => void,
) => [
  {
    accessorKey: 'name',
    header: 'Service Name',
    cell: ({ row }: any) => (
      <div className="flex flex-col">
        <span className="font-medium text-gray-900">{row.original.name}</span>
        {row.original.description && (
          <span className="text-sm text-gray-500 line-clamp-1">{row.original.description}</span>
        )}
      </div>
    ),
  },
  {
    accessorKey: 'additionalPrice',
    header: 'Price',
    cell: ({ row }: any) => (
      <div className="font-medium text-green-600">€{row.original.additionalPrice}</div>
    ),
  },
  {
    accessorKey: 'duration',
    header: 'Duration',
    cell: ({ row }: any) => (
      <div>{row.original.duration ? `+${row.original.duration} min` : 'No extension'}</div>
    ),
  },
  {
    accessorKey: 'locationTypes',
    header: 'Locations',
    cell: ({ row }: any) => (
      <div className="flex flex-wrap gap-1">
        {row.original.locationTypes.map((type: LocationType) => (
          <span
            key={type}
            className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-md text-xs"
          >
            {type === LocationType.VIRTUAL && '💻'}
            {type === LocationType.HOME && '🏠'}
            {type === LocationType.OFFICE && '🏢'}
            {type === LocationType.CLINIC && '🏥'}
            {type}
          </span>
        ))}
      </div>
    ),
  },
  {
    accessorKey: 'tags',
    header: 'Tags',
    cell: ({ row }: any) => (
      <div className="flex flex-wrap gap-1">
        {row.original.tags.slice(0, 2).map((tag: string) => (
          <Badge key={tag} variant="outline" className="text-xs">
            {tag}
          </Badge>
        ))}
        {row.original.tags.length > 2 && (
          <Badge variant="outline" className="text-xs">
            +{row.original.tags.length - 2}
          </Badge>
        )}
      </div>
    ),
  },
  {
    accessorKey: 'isActive',
    header: 'Status',
    cell: ({ row }: any) => (
      <Badge variant={row.original.isActive ? 'default' : 'secondary'}>
        {row.original.isActive ? 'Active' : 'Inactive'}
      </Badge>
    ),
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }: any) => (
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(row.original)}
          className="h-8 w-8 p-0"
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDelete(row.original)}
          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    ),
  },
];

const ServicesPage = () => {
  const dispatch = useAppDispatch();
  const { services, isLoading, isDeleting } = useSelector((state: RootState) => state.service);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    loadServices();
  }, [sortBy, sortOrder]);

  const loadServices = () => {
    dispatch(fetchServices({ limit: 100, sortBy, sortOrder }) as any);
  };

  const handleDeleteService = async () => {
    if (!selectedService) return;

    const serviceToDelete = selectedService;
    setShowDeleteDialog(false);
    setSelectedService(null);

    try {
      await dispatch(deleteServiceAsync(serviceToDelete.id) as any).unwrap();
    } catch (error) {
      // Error handling is done in the slice
      loadServices(); // Reload to restore the deleted service
    }
  };

  const stats = {
    total: services.length,
    active: services.filter((s) => s.isActive).length,
    inactive: services.filter((s) => !s.isActive).length,
  };

  if (isLoading && services.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <DashboardPageWrapper
      header={
        <div className="flex flex-col gap-2 w-full">
          <h2 className="text-2xl font-bold">Professional Services</h2>
          <p className="text-gray-600">
            Manage your service offerings for your professional profile
          </p>
        </div>
      }
    >
      <div className="flex flex-col gap-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="group border border-gray-200/80 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] backdrop-blur-sm bg-white/80 rounded-xl hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-emerald-600 font-medium">Total Services</p>
                  <p className="text-2xl font-bold text-emerald-900">{stats.total}</p>
                </div>
                <div className="p-3 rounded-2xl bg-emerald-50 group-hover:scale-110 transition-transform duration-300">
                  <Package className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group border border-gray-200/80 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] backdrop-blur-sm bg-white/80 rounded-xl hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">Active Services</p>
                  <p className="text-2xl font-bold text-blue-900">{stats.active}</p>
                </div>
                <div className="p-3 rounded-2xl bg-blue-50 group-hover:scale-110 transition-transform duration-300">
                  <Eye className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group border border-gray-200/80 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] backdrop-blur-sm bg-white/80 rounded-xl hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Inactive Services</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.inactive}</p>
                </div>
                <div className="p-3 rounded-2xl bg-gray-50 group-hover:scale-110 transition-transform duration-300">
                  <EyeOff className="h-6 w-6 text-gray-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Services DataTable */}
        <Card className="group border border-gray-200/80 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] backdrop-blur-sm bg-white/80 rounded-xl">
          <CardHeader className="flex flex-row items-center justify-end space-y-0 pb-4">
            <Button onClick={() => setShowCreateForm(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Service
            </Button>
          </CardHeader>
          <CardContent>
            {services.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No services found</h3>
                <p className="text-gray-600 mb-4">
                  You haven&apos;t created any services yet. Add your first service to enhance your
                  professional profile!
                </p>
                <Button onClick={() => setShowCreateForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Service
                </Button>
              </div>
            ) : (
              <DataTable
                columns={createServiceColumns(
                  (service) => setEditingService(service),
                  (service) => {
                    setSelectedService(service);
                    setShowDeleteDialog(true);
                  },
                )}
                data={services}
                title=""
                searchKey="name"
                searchPlaceholder="Search services by name, description, or tags..."
                enableSorting={true}
                enableFiltering={true}
                enablePagination={true}
                pageSize={10}
                showSorting={false}
                showSearch={false}
              />
            )}
          </CardContent>
        </Card>

        {/* Create/Edit Service Dialog */}
        <Dialog
          open={showCreateForm || !!editingService}
          onOpenChange={() => {
            setShowCreateForm(false);
            setEditingService(null);
          }}
        >
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingService ? 'Edit Service' : 'Add New Service'}</DialogTitle>
              <DialogDescription>
                {editingService
                  ? 'Update your service details and settings.'
                  : 'Create a new service to offer to your clients.'}
              </DialogDescription>
            </DialogHeader>
            <ServiceForm
              service={editingService || undefined}
              onSuccess={() => {
                setShowCreateForm(false);
                setEditingService(null);
                loadServices();
              }}
              onCancel={() => {
                setShowCreateForm(false);
                setEditingService(null);
              }}
            />
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Service</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete &quot;{selectedService?.name}&quot;? This action
                cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteService} disabled={isDeleting}>
                {isDeleting ? 'Deleting...' : 'Delete Service'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardPageWrapper>
  );
};

export default ServicesPage;
