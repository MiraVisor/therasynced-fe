'use client';

import { Calendar, ChevronDown, ChevronUp, Clock, Euro, Package } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import LoadingSpinner from '@/components/ui/loading-spinner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { getProfile } from '@/redux/api/profileApi';
import { createSlot } from '@/redux/slices/slotSlice';
import type { AppDispatch } from '@/redux/store';
import { RootState } from '@/redux/store';
import api from '@/services/api';
import { ENDPOINTS } from '@/services/endpoints';
import { CreateSlotDto, LocationType, ServiceCategory } from '@/types/types';

interface CreateSlotFormProps {
  onSuccess?: () => void;
}

// Static service data - no need for complex state management
const SERVICES = [
  // Physiotherapy Services
  {
    id: 'sports-massage-physio',
    name: 'Sports massage',
    category: 'Physiotherapy',
    duration: 60,
  },
  {
    id: 'injury-assessment',
    name: 'Injury assessment & diagnosis',
    category: 'Physiotherapy',
    duration: 45,
  },
  {
    id: 'sports-injury-rehab',
    name: 'Sports injury rehabilitation',
    category: 'Physiotherapy',
    duration: 60,
  },
  {
    id: 'post-op-rehab',
    name: 'Post-operative rehabilitation',
    category: 'Physiotherapy',
    duration: 60,
  },
  {
    id: 'back-neck-pain',
    name: 'Back & neck pain management',
    category: 'Physiotherapy',
    duration: 45,
  },
  {
    id: 'chronic-pain',
    name: 'Chronic pain management',
    category: 'Physiotherapy',
    duration: 60,
  },
  {
    id: 'neuro-rehab',
    name: 'Neurological rehabilitation',
    category: 'Physiotherapy',
    duration: 60,
  },
  {
    id: 'prenatal-physio',
    name: 'Pre- and post-natal physiotherapy',
    category: 'Physiotherapy',
    duration: 45,
  },
  {
    id: 'postural-correction',
    name: 'Postural correction & ergonomics advice',
    category: 'Physiotherapy',
    duration: 30,
  },
  {
    id: 'home-visit',
    name: 'Home visit physiotherapy',
    category: 'Physiotherapy',
    duration: 60,
  },
  {
    id: 'dry-needling',
    name: 'Dry needling / acupuncture (if qualified)',
    category: 'Physiotherapy',
    duration: 45,
  },

  // Sports Therapy Services
  {
    id: 'pitch-side-care',
    name: 'On-field pitch-side injury care',
    category: 'Sports Therapy',
    duration: 30,
  },
  {
    id: 'acute-injury',
    name: 'Acute injury management & first aid',
    category: 'Sports Therapy',
    duration: 45,
  },
  {
    id: 'return-to-play',
    name: 'Return-to-play rehabilitation programmes',
    category: 'Sports Therapy',
    duration: 60,
  },
  {
    id: 'injury-prevention',
    name: 'Injury prevention & screening assessments',
    category: 'Sports Therapy',
    duration: 45,
  },
  {
    id: 'mobility-training',
    name: 'Mobility & flexibility training',
    category: 'Sports Therapy',
    duration: 45,
  },
  {
    id: 'movement-assessment',
    name: 'Functional movement assessments',
    category: 'Sports Therapy',
    duration: 60,
  },
  {
    id: 'taping-strapping',
    name: 'Taping & strapping for sports injuries',
    category: 'Sports Therapy',
    duration: 30,
  },
  {
    id: 'concussion-testing',
    name: 'Concussion baseline testing & management',
    category: 'Sports Therapy',
    duration: 60,
  },

  // Massage Therapy Services
  {
    id: 'sports-massage',
    name: 'Sports massage (pre/post-event)',
    category: 'Massage Therapy',
    duration: 60,
  },
  {
    id: 'deep-tissue',
    name: 'Deep tissue massage',
    category: 'Massage Therapy',
    duration: 60,
  },
  {
    id: 'trigger-point',
    name: 'Trigger point therapy',
    category: 'Massage Therapy',
    duration: 45,
  },
  {
    id: 'myofascial-release',
    name: 'Myofascial release',
    category: 'Massage Therapy',
    duration: 60,
  },
  {
    id: 'relaxation-massage',
    name: 'Relaxation massage / stress relief',
    category: 'Massage Therapy',
    duration: 60,
  },
  {
    id: 'pregnancy-massage',
    name: 'Pregnancy massage',
    category: 'Massage Therapy',
    duration: 60,
  },
  {
    id: 'corporate-massage',
    name: 'Corporate/ Workplace massage (Mobile service)',
    category: 'Massage Therapy',
    duration: 30,
  },
  {
    id: 'injury-soft-tissue',
    name: 'Injury-related soft tissue therapy',
    category: 'Massage Therapy',
    duration: 60,
  },

  // Personal Training Services
  {
    id: 'personal-training',
    name: '1-to-1 personal training',
    category: 'Personal Training',
    duration: 60,
  },
  {
    id: 'group-training',
    name: 'Group training sessions',
    category: 'Personal Training',
    duration: 60,
  },
  {
    id: 'team-conditioning',
    name: 'Team strength & conditioning programs',
    category: 'Personal Training',
    duration: 60,
  },
  {
    id: 'speed-agility',
    name: 'Speed, agility & quickness training',
    category: 'Personal Training',
    duration: 60,
  },
  {
    id: 'athletic-development',
    name: 'Athletic development programs',
    category: 'Personal Training',
    duration: 60,
  },
  {
    id: 'weightlifting-coaching',
    name: 'Weightlifting / powerlifting coaching',
    category: 'Personal Training',
    duration: 60,
  },
  {
    id: 'corrective-exercise',
    name: 'Mobility & corrective exercise programmes',
    category: 'Personal Training',
    duration: 45,
  },
  {
    id: 'training-plans',
    name: 'Periodised training plans for athletes',
    category: 'Personal Training',
    duration: 60,
  },
  {
    id: 'online-coaching',
    name: 'Online coaching (remote programming, video check-ins)',
    category: 'Personal Training',
    duration: 30,
  },
  {
    id: 'rehab-programmes',
    name: 'Rehabilitation programmes',
    category: 'Personal Training',
    duration: 60,
  },
  {
    id: 'gym-programmes',
    name: 'Gym programmes',
    category: 'Personal Training',
    duration: 60,
  },
];

const CATEGORIES = ['Physiotherapy', 'Sports Therapy', 'Massage Therapy', 'Personal Training'];

// Collapsible categories component
const CollapsibleCategories = ({
  categories,
  formData,
  onServiceToggle,
}: {
  categories: any[];
  formData: CreateSlotDto;
  onServiceToggle: (id: string) => void;
}) => {
  const [openSections, setOpenSections] = useState<Set<string>>(new Set());

  // Group categories by job title
  const grouped: { [key: string]: any[] } = {};
  categories.forEach((category: any) => {
    const jobTitleName = category.jobTitle?.name || 'Other';
    if (!grouped[jobTitleName]) {
      grouped[jobTitleName] = [];
    }
    grouped[jobTitleName].push(category);
  });

  // Toggle section
  const toggleSection = (jobTitleName: string) => {
    setOpenSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(jobTitleName)) {
        newSet.delete(jobTitleName);
      } else {
        newSet.add(jobTitleName);
      }
      return newSet;
    });
  };

  return (
    <div className="space-y-2 max-h-64 overflow-y-auto">
      {Object.entries(grouped).map(([jobTitleName, catList]) => {
        const isOpen = openSections.has(jobTitleName);
        return (
          <div key={jobTitleName} className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection(jobTitleName)}
              className="w-full px-3 py-2 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                {jobTitleName.replace(/_/g, ' ')}
              </span>
              {isOpen ? (
                <ChevronUp className="h-4 w-4 text-gray-500" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-500" />
              )}
            </button>
            {isOpen && (
              <div className="space-y-1 p-2 bg-white">
                {catList.map((category: any) => {
                  const isSelected = formData.serviceCategoryIds?.includes(category.id) || false;
                  return (
                    <div
                      key={category.id}
                      className="flex items-start space-x-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg cursor-pointer"
                      onClick={() => onServiceToggle(category.id)}
                    >
                      <div className="mt-0.5 w-4 h-4 border-2 border-gray-300 rounded flex items-center justify-center">
                        {isSelected && <div className="w-2 h-2 bg-blue-600 rounded-sm" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-medium text-sm">{category.name}</span>
                        {category.description && (
                          <p className="text-xs text-gray-500 mt-0.5">{category.description}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export const CreateSlotForm = ({ onSuccess }: CreateSlotFormProps) => {
  console.log('CreateSlotForm component rendered');

  const dispatch = useDispatch<AppDispatch>();
  const { isCreating } = useSelector((state: RootState) => state.slot);

  const [formData, setFormData] = useState<CreateSlotDto>({
    locationType: LocationType.HOME,
    locationId: undefined,
    basePrice: 50,
    duration: 60,
    slots: [],
    serviceCategoryIds: [],
    notes: '',
  });

  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [serviceCategories, setServiceCategories] = useState<ServiceCategory[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [freelancerJobTitle, setFreelancerJobTitle] = useState<string | null>(null);

  // Fetch all service categories
  useEffect(() => {
    const loadServiceCategories = async () => {
      console.log('Loading service categories');
      try {
        setIsLoadingCategories(true);
        // Fetch all categories from /service/categories/all
        const categoriesResponse = await api.get('service/categories/all');
        console.log('Categories response:', categoriesResponse.data);

        if (categoriesResponse.data.success && Array.isArray(categoriesResponse.data.data)) {
          // The response is a flat list with each category having a jobTitle property
          // Group them by job title for better organization in the UI
          const groupedByJobTitle: { [key: string]: any[] } = {};

          categoriesResponse.data.data.forEach((category: any) => {
            const jobTitleName = category.jobTitle?.name || 'Other';
            if (!groupedByJobTitle[jobTitleName]) {
              groupedByJobTitle[jobTitleName] = [];
            }
            groupedByJobTitle[jobTitleName].push(category);
          });

          // Flatten back to show all categories, but keep the structure for display
          const allCategories = categoriesResponse.data.data;
          setServiceCategories(allCategories);
          console.log('Loaded categories:', allCategories);
          console.log('Grouped by job title:', groupedByJobTitle);
        } else {
          console.warn('No categories data received, response:', categoriesResponse.data);
        }
      } catch (error) {
        console.error('Failed to load service categories:', error);
        toast.error('Failed to load service categories');
      } finally {
        setIsLoadingCategories(false);
      }
    };

    loadServiceCategories();
  }, []);

  // Calculate end time automatically when start time or duration changes
  const calculateEndTime = (start: string, durationMinutes: number): string => {
    if (!start) return '';
    const startDate = new Date(start);
    const endDate = new Date(startDate.getTime() + durationMinutes * 60000);
    const localEndDate = new Date(endDate.getTime() - endDate.getTimezoneOffset() * 60000);
    return localEndDate.toISOString().slice(0, 16);
  };

  // Update end time when start time or duration changes
  const handleStartTimeChange = (value: string) => {
    setStartTime(value);
    if (value && formData.duration) {
      setEndTime(calculateEndTime(value, formData.duration));
    }
  };

  const handleDurationChange = (value: string) => {
    const duration = parseInt(value);
    setFormData((prev) => ({ ...prev, duration }));
    if (startTime) {
      setEndTime(calculateEndTime(startTime, duration));
    }
  };

  // Simple service category toggle - no complex state management needed
  const handleServiceToggle = (categoryId: string) => {
    console.log('Toggling service category:', categoryId);
    setFormData((prev) => {
      const currentCategories = prev.serviceCategoryIds || [];
      console.log('Current categories:', currentCategories);
      if (currentCategories.includes(categoryId)) {
        // Remove category
        const newCategories = currentCategories.filter((id) => id !== categoryId);
        console.log('Removing category, new categories:', newCategories);
        return { ...prev, serviceCategoryIds: newCategories };
      } else {
        // Add category
        const newCategories = [...currentCategories, categoryId];
        console.log('Adding category, new categories:', newCategories);
        return { ...prev, serviceCategoryIds: newCategories };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!startTime || !endTime) {
      toast.error('Please select start and end time');
      return;
    }

    if (!formData.basePrice || formData.basePrice <= 0) {
      toast.error('Please enter a valid price');
      return;
    }

    const slot = {
      startTime: new Date(startTime).toISOString(),
      endTime: new Date(endTime).toISOString(),
    };

    try {
      await dispatch(
        createSlot({
          ...formData,
          slots: [slot],
        }),
      );

      toast.success('Time slot created successfully!');
      onSuccess?.();
    } catch (error) {
      toast.error('Failed to create time slot');
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calendar className="h-5 w-5 text-green-600" />
          Create Time Slot
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Location Type - Simple Select */}
          <div className="space-y-2">
            <Label>Location Type</Label>
            <Select
              value={formData.locationType}
              onValueChange={(value) =>
                setFormData({ ...formData, locationType: value as LocationType })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={LocationType.HOME}>🏠 Home Visit</SelectItem>
                <SelectItem value={LocationType.CLINIC}>🏥 Clinic</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Price and Duration - Side by Side */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Price (€)</Label>
              <div className="relative">
                <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.basePrice}
                  onChange={(e) =>
                    setFormData({ ...formData, basePrice: parseFloat(e.target.value) || 0 })
                  }
                  className="pl-10"
                  placeholder="50.00"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Duration</Label>
              <Select value={formData.duration.toString()} onValueChange={handleDurationChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 min</SelectItem>
                  <SelectItem value="45">45 min</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="90">1.5 hours</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Time Selection - Simple */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Time</Label>
              <Input
                type="datetime-local"
                value={startTime}
                onChange={(e) => handleStartTimeChange(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>End Time</Label>
              <Input
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="bg-gray-50"
                readOnly
              />
            </div>
          </div>

          {/* Service Selection */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-primary" />
              <Label className="text-base font-medium">Available Services</Label>
              <span className="text-sm text-gray-500">(Optional)</span>
            </div>

            <div className="space-y-4">
              <div className="text-sm text-gray-600 mb-3">
                Select which services will be available for booking in this time slot:
              </div>

              {/* Show dynamic service categories grouped by job title */}
              {isLoadingCategories ? (
                <div className="flex items-center justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : serviceCategories.length > 0 ? (
                <CollapsibleCategories
                  categories={serviceCategories}
                  formData={formData}
                  onServiceToggle={handleServiceToggle}
                />
              ) : (
                <div className="text-center py-4 text-gray-500">
                  No service categories available.
                </div>
              )}

              {/* Selected Services Summary */}
              {formData.serviceCategoryIds && formData.serviceCategoryIds.length > 0 && (
                <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="text-sm font-medium text-green-800 dark:text-green-200 mb-2">
                    Selected Service Categories ({formData.serviceCategoryIds.length}):
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.serviceCategoryIds.map((categoryId) => {
                      const category = serviceCategories.find((s) => s.id === categoryId);
                      return category ? (
                        <Badge key={categoryId} variant="default" className="text-xs">
                          {category.name}
                        </Badge>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Notes - Optional */}
          <div className="space-y-2">
            <Label>Notes (Optional)</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any special instructions..."
              rows={3}
            />
          </div>

          {/* Preview */}
          {startTime && endTime && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm">
              <div className="flex items-center gap-2 text-green-700">
                <Clock className="h-4 w-4" />
                <span className="font-medium">
                  {new Date(startTime).toLocaleDateString()} at{' '}
                  {new Date(startTime).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
                <span>
                  • €{formData.basePrice} • {formData.duration} min
                </span>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isCreating || !startTime || !endTime}
            className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 text-white"
          >
            {isCreating ? 'Creating...' : 'Create Time Slot'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
