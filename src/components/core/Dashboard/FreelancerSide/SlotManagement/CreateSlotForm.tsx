'use client';

import { Calendar, Clock, Euro, Package } from 'lucide-react';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
// import { fetchServices } from '@/redux/slices/serviceSlice'; // No longer needed
import { createSlot } from '@/redux/slices/slotSlice';
import type { AppDispatch } from '@/redux/store';
import { RootState } from '@/redux/store';
import { CreateSlotDto, LocationType } from '@/types/types';

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

export const CreateSlotForm = ({ onSuccess }: CreateSlotFormProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const { isCreating } = useSelector((state: RootState) => state.slot);

  const [formData, setFormData] = useState<CreateSlotDto>({
    locationType: LocationType.VIRTUAL,
    locationId: undefined,
    basePrice: 50,
    duration: 60,
    slots: [],
    serviceIds: [],
    notes: '',
  });

  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

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

  // Simple service toggle - no complex state management needed
  const handleServiceToggle = (serviceId: string) => {
    console.log('Toggling service:', serviceId);
    setFormData((prev) => {
      const currentServices = prev.serviceIds || [];
      console.log('Current services:', currentServices);
      if (currentServices.includes(serviceId)) {
        // Remove service
        const newServices = currentServices.filter((id) => id !== serviceId);
        console.log('Removing service, new services:', newServices);
        return { ...prev, serviceIds: newServices };
      } else {
        // Add service
        const newServices = [...currentServices, serviceId];
        console.log('Adding service, new services:', newServices);
        return { ...prev, serviceIds: newServices };
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
                <SelectItem value={LocationType.VIRTUAL}>💻 Virtual (Online)</SelectItem>
                <SelectItem value={LocationType.HOME}>🏠 Home Visit</SelectItem>
                <SelectItem value={LocationType.OFFICE}>🏢 Office</SelectItem>
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

              {/* Group services by category */}
              {CATEGORIES.map((category) => {
                const categoryServices = SERVICES.filter(
                  (service) => service.category === category,
                );
                return (
                  <div key={category} className="space-y-2">
                    <h4 className="font-medium text-sm text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-1">
                      {category}
                    </h4>
                    <div className="grid grid-cols-1 gap-1 max-h-32 overflow-y-auto">
                      {categoryServices.map((service) => {
                        const isSelected = formData.serviceIds?.includes(service.id) || false;
                        return (
                          <div
                            key={service.id}
                            className="flex items-start space-x-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg cursor-pointer"
                            onClick={() => handleServiceToggle(service.id)}
                          >
                            <div className="mt-0.5 w-4 h-4 border-2 border-gray-300 rounded flex items-center justify-center">
                              {isSelected && <div className="w-2 h-2 bg-blue-600 rounded-sm" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm">{service.name}</span>
                                <Badge variant="secondary" className="text-xs">
                                  {service.duration}min
                                </Badge>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {/* Selected Services Summary */}
              {formData.serviceIds && formData.serviceIds.length > 0 && (
                <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="text-sm font-medium text-green-800 dark:text-green-200 mb-2">
                    Selected Services ({formData.serviceIds.length}):
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.serviceIds.map((serviceId) => {
                      const service = SERVICES.find((s) => s.id === serviceId);
                      return service ? (
                        <Badge key={serviceId} variant="default" className="text-xs">
                          {service.name} ({service.duration}min)
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
