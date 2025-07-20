'use client';

import { Euro, Package } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-toastify';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
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
import { CreateServiceDto } from '@/types/types';

interface CreateServiceFormProps {
  onSuccess?: () => void;
}

export const CreateServiceForm = ({ onSuccess }: CreateServiceFormProps) => {
  const [formData, setFormData] = useState<CreateServiceDto>({
    name: '',
    description: '',
    additionalPrice: 0,
    duration: undefined,
    locationTypes: ['VIRTUAL'],
    tags: [],
    requiresEquipment: false,
  });

  const [newTag, setNewTag] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || formData.additionalPrice <= 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      // TODO: Implement service creation API call
      toast.success('Service created successfully!');
      onSuccess?.();
    } catch (error) {
      toast.error('Failed to create service');
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, newTag.trim()],
      });
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  const toggleLocationType = (locationType: 'HOME' | 'OFFICE' | 'VIRTUAL' | 'CLINIC') => {
    const currentTypes = formData.locationTypes;
    const newTypes = currentTypes.includes(locationType)
      ? currentTypes.filter((type) => type !== locationType)
      : [...currentTypes, locationType];

    setFormData({
      ...formData,
      locationTypes: newTypes,
    });
  };

  const getLocationTypeIcon = (type: string) => {
    switch (type) {
      case 'VIRTUAL':
        return '💻';
      case 'HOME':
        return '🏠';
      case 'OFFICE':
        return '🏢';
      case 'CLINIC':
        return '🏥';
      default:
        return '📍';
    }
  };

  const getLocationTypeLabel = (type: string) => {
    switch (type) {
      case 'VIRTUAL':
        return 'Virtual (Online)';
      case 'HOME':
        return 'Home Visit';
      case 'OFFICE':
        return 'Office';
      case 'CLINIC':
        return 'Clinic';
      default:
        return type;
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
        <CardTitle className="flex items-center gap-3 text-xl">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Package className="h-6 w-6 text-blue-600" />
          </div>
          Add Professional Service
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Service Name */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Service Name *</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Specialized Equipment, Extended Session, Premium Consultation"
              className="h-12 text-lg"
            />
          </div>

          {/* Description */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe what this service includes and the value it provides to clients..."
              className="min-h-[100px]"
            />
          </div>

          {/* Pricing and Duration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label className="text-base font-semibold">Additional Price</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Euro className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.additionalPrice}
                  onChange={(e) =>
                    setFormData({ ...formData, additionalPrice: parseFloat(e.target.value) })
                  }
                  placeholder="25.00"
                  className="pl-10 h-12 text-lg"
                />
              </div>
              <p className="text-sm text-gray-500">Additional fee on top of base slot price</p>
            </div>
            <div className="space-y-3">
              <Label className="text-base font-semibold">Extended Duration (Optional)</Label>
              <Select
                value={formData.duration?.toString() || 'none'}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    duration: value === 'none' ? undefined : parseInt(value),
                  })
                }
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="No extension" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No extension</SelectItem>
                  <SelectItem value="15">+15 minutes</SelectItem>
                  <SelectItem value="30">+30 minutes</SelectItem>
                  <SelectItem value="45">+45 minutes</SelectItem>
                  <SelectItem value="60">+1 hour</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-500">Optional time extension for this service</p>
            </div>
          </div>

          {/* Location Types */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Available Location Types</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {(['VIRTUAL', 'HOME', 'OFFICE', 'CLINIC'] as const).map((locationType) => (
                <div
                  key={locationType}
                  className={`relative cursor-pointer rounded-lg border-2 p-4 transition-all hover:shadow-md ${
                    formData.locationTypes.includes(locationType)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                  onClick={() => toggleLocationType(locationType)}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">{getLocationTypeIcon(locationType)}</div>
                    <div className="text-sm font-medium text-gray-700">
                      {getLocationTypeLabel(locationType)}
                    </div>
                  </div>
                  {formData.locationTypes.includes(locationType) && (
                    <div className="absolute top-2 right-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Service Tags</Label>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add a tag (e.g., premium, specialized, equipment)"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className="flex-1"
              />
              <Button type="button" variant="outline" onClick={addTag}>
                Add
              </Button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {formData.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="flex items-center gap-1 px-3 py-1"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:text-red-600"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            )}
            <p className="text-sm text-gray-500">
              Tags help clients find and understand your service
            </p>
          </div>

          {/* Equipment Requirement */}
          <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
            <Checkbox
              id="requiresEquipment"
              checked={formData.requiresEquipment}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, requiresEquipment: checked as boolean })
              }
            />
            <Label htmlFor="requiresEquipment" className="text-base font-medium">
              Requires Special Equipment
            </Label>
          </div>

          {/* Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="font-medium text-blue-800">Service Summary</span>
            </div>
            <div className="text-sm text-blue-700">
              <p>
                • <strong>{formData.name || 'Service Name'}</strong>
              </p>
              <p>• Additional price: €{formData.additionalPrice}</p>
              <p>
                • Available at:{' '}
                {formData.locationTypes.map((type) => getLocationTypeLabel(type)).join(', ')}
              </p>
              {formData.duration && <p>• Extends session by {formData.duration} minutes</p>}
              {formData.requiresEquipment && <p>• Requires special equipment</p>}
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-12 text-lg font-medium bg-blue-600 hover:bg-blue-700"
          >
            Add Service
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
