'use client';

import { Calendar, Clock, Euro } from 'lucide-react';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

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
    locationId: undefined,
    basePrice: 50,
    duration: 60,
    slots: [],
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
    setFormData({ ...formData, duration });
    if (startTime) {
      setEndTime(calculateEndTime(startTime, duration));
    }
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
        }) as any,
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
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {isCreating ? 'Creating...' : 'Create Time Slot'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
