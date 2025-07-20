'use client';

import { Clock, Euro, Plus, X } from 'lucide-react';
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
import { createSlot } from '@/redux/slices/slotSlice';
import { RootState } from '@/redux/store';
import { CreateSlotDto, LocationType } from '@/types/types';

interface CreateSlotFormProps {
  onSuccess?: () => void;
}

export const CreateSlotForm = ({ onSuccess }: CreateSlotFormProps) => {
  const dispatch = useDispatch();
  const { isCreating } = useSelector((state: RootState) => state.slot);

  const [formData, setFormData] = useState<CreateSlotDto>({
    locationType: LocationType.VIRTUAL,
    basePrice: 0,
    duration: 60,
    slots: [],
    notes: '',
  });

  const [timeSlots, setTimeSlots] = useState<Array<{ startTime: string; endTime: string }>>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');

  // Helper function to convert local datetime to datetime-local format
  const toLocalDateTimeString = (date: Date): string => {
    const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return localDate.toISOString().slice(0, 16);
  };

  // Helper function to calculate end time from start time and duration
  const calculateEndTime = (startTime: string, durationMinutes: number): string => {
    const startDate = new Date(startTime);
    const endDate = new Date(startDate.getTime() + durationMinutes * 60000);
    return toLocalDateTimeString(endDate);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (timeSlots.length === 0) {
      toast.error('Please add at least one time slot');
      return;
    }

    // Validate that all time slots have both start and end times
    const invalidSlots = timeSlots.filter((slot) => !slot.startTime || !slot.endTime);
    if (invalidSlots.length > 0) {
      toast.error('Please fill in both start and end times for all slots');
      return;
    }

    // Validate that end time is after start time
    const invalidTimeOrder = timeSlots.filter(
      (slot) => new Date(slot.startTime) >= new Date(slot.endTime),
    );
    if (invalidTimeOrder.length > 0) {
      toast.error('End time must be after start time for all slots');
      return;
    }

    // Convert datetime-local values to ISO-8601 format
    const formattedSlots = timeSlots.map((slot) => ({
      startTime: new Date(slot.startTime).toISOString(),
      endTime: new Date(slot.endTime).toISOString(),
    }));

    console.log('Original slots:', timeSlots);
    console.log('Formatted slots:', formattedSlots);
    console.log('Final payload:', {
      ...formData,
      slots: formattedSlots,
    });

    try {
      // Close dialog immediately for better UX
      onSuccess?.();

      await dispatch(
        createSlot({
          ...formData,
          slots: formattedSlots,
        }) as any,
      );

      toast.success('Slots created successfully!');
    } catch (error) {
      toast.error('Failed to create slots');
    }
  };

  const addTimeSlot = () => {
    setTimeSlots([...timeSlots, { startTime: '', endTime: '' }]);
  };

  const removeTimeSlot = (index: number) => {
    setTimeSlots(timeSlots.filter((_, i) => i !== index));
  };

  const updateTimeSlot = (index: number, field: 'startTime' | 'endTime', value: string) => {
    const updated = [...timeSlots];
    updated[index][field] = value;

    // Auto-calculate end time if start time is set and duration is available
    if (field === 'startTime' && value && formData.duration) {
      updated[index].endTime = calculateEndTime(value, formData.duration);
    }

    setTimeSlots(updated);
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
      <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b">
        <CardTitle className="flex items-center gap-3 text-xl">
          <div className="p-2 bg-emerald-100 rounded-lg">
            <Clock className="h-6 w-6 text-emerald-600" />
          </div>
          Schedule Availability
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Location Type Selection */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Location Type</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {(
                [
                  LocationType.VIRTUAL,
                  LocationType.HOME,
                  LocationType.OFFICE,
                  LocationType.CLINIC,
                ] as const
              ).map((type) => (
                <div
                  key={type}
                  className={`relative cursor-pointer rounded-lg border-2 p-4 transition-all hover:shadow-md ${
                    formData.locationType === type
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                  onClick={() => setFormData({ ...formData, locationType: type })}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">{getLocationTypeIcon(type)}</div>
                    <div className="text-sm font-medium text-gray-700">
                      {getLocationTypeLabel(type)}
                    </div>
                  </div>
                  {formData.locationType === type && (
                    <div className="absolute top-2 right-2">
                      <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Pricing and Duration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label className="text-base font-semibold">Base Price</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Euro className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.basePrice}
                  onChange={(e) =>
                    setFormData({ ...formData, basePrice: parseFloat(e.target.value) })
                  }
                  placeholder="50.00"
                  className="pl-10 h-12 text-lg"
                />
              </div>
              <p className="text-sm text-gray-500">Base price per session</p>
            </div>

            <div className="space-y-3">
              <Label className="text-base font-semibold">Session Duration</Label>
              <Select
                value={formData.duration.toString()}
                onValueChange={(value) => {
                  const newDuration = parseInt(value);
                  setFormData({ ...formData, duration: newDuration });

                  // Update end times for existing slots if they have start times
                  if (newDuration && timeSlots.length > 0) {
                    const updatedSlots = timeSlots.map((slot) => {
                      if (slot.startTime) {
                        return {
                          ...slot,
                          endTime: calculateEndTime(slot.startTime, newDuration),
                        };
                      }
                      return slot;
                    });
                    setTimeSlots(updatedSlots);
                  }
                }}
              >
                <SelectTrigger className="h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="90">1.5 hours</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-500">Duration per session</p>
            </div>
          </div>

          {/* Time Slots Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Time Slots</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addTimeSlot}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Time Slot
              </Button>
            </div>

            <div className="text-sm text-gray-600 bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-start gap-2">
                <div className="text-blue-600 mt-0.5">💡</div>
                <div>
                  <strong>Quick Setup:</strong> Select a start time and the end time will be
                  automatically calculated. You can add multiple time slots for different dates and
                  times.
                </div>
              </div>
            </div>

            {timeSlots.length === 0 ? (
              <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                <Clock className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No time slots added yet</p>
                <p className="text-sm">Click &quot;Add Time Slot&quot; to get started</p>
              </div>
            ) : (
              <div className="space-y-3">
                {timeSlots.map((slot, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="secondary" className="text-xs">
                        Slot #{index + 1}
                      </Badge>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeTimeSlot(index)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Start Time</Label>
                        <Input
                          type="datetime-local"
                          value={slot.startTime}
                          min={new Date().toISOString().slice(0, 16)}
                          onChange={(e) => updateTimeSlot(index, 'startTime', e.target.value)}
                          required
                          className="h-10"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">End Time</Label>
                        <Input
                          type="datetime-local"
                          value={slot.endTime}
                          onChange={(e) => updateTimeSlot(index, 'endTime', e.target.value)}
                          required
                          className="h-10 bg-gray-100"
                          readOnly
                        />
                      </div>
                    </div>

                    {slot.startTime && slot.endTime && (
                      <div className="mt-3 flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Clock className="h-4 w-4" />
                          <span>
                            {new Date(slot.startTime).toLocaleDateString()} at{' '}
                            {new Date(slot.startTime).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {Math.round(
                            (new Date(slot.endTime).getTime() -
                              new Date(slot.startTime).getTime()) /
                              60000,
                          )}{' '}
                          min
                        </Badge>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Additional Notes (Optional)</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Special instructions, discounts, or additional information for clients..."
              className="min-h-[100px]"
            />
          </div>

          {/* Summary */}
          {timeSlots.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="font-medium text-green-800">Summary</span>
              </div>
              <div className="text-sm text-green-700">
                <p>
                  • {timeSlots.length} time slot{timeSlots.length > 1 ? 's' : ''} will be created
                </p>
                <p>
                  • Base price: €{formData.basePrice} per {formData.duration}-minute session
                </p>
                <p>• Location type: {getLocationTypeLabel(formData.locationType)}</p>
              </div>
            </div>
          )}

          <Button
            type="submit"
            disabled={isCreating}
            className="w-full h-12 text-lg font-medium bg-emerald-600 hover:bg-emerald-700"
          >
            {isCreating
              ? 'Scheduling...'
              : `Schedule ${timeSlots.length} Time Slot${timeSlots.length !== 1 ? 's' : ''}`}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
