'use client';

import { addMonths, startOfWeek } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-toastify';

import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { useCreateSlot } from '@/hooks/queries/useSlots';
import { useMySubscription } from '@/hooks/queries/useSubscription';
import type { DaySlotConfiguration } from '@/types/slot';
import { CreateSlotsDto, LocationType } from '@/types/types';
import { filterPastSlots, generateSlotsFromDayConfigurations } from '@/utils/slotGenerationUtils';
import { getTierFromSubscription } from '@/utils/tierUtils';

import { DayConfigurationStep } from './DayConfigurationStep';
import { DaySelectionStep } from './DaySelectionStep';

interface CreateSlotWizardProps {
  onSuccess?: () => void;
}

export const CreateSlotWizard = ({ onSuccess }: CreateSlotWizardProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [configurations, setConfigurations] = useState<Record<string, DaySlotConfiguration>>({});
  const [locationType] = useState<LocationType | undefined>(undefined); // Optional - defaults to CLINIC
  const { mutate: createSlot, isPending: isCreating } = useCreateSlot();
  const { data: currentSubscription } = useMySubscription();
  const tier = getTierFromSubscription(currentSubscription || null);

  const handleDaysChange = (days: string[]) => {
    setSelectedDays(days);
    // Initialize configurations for new days
    const newConfigurations: Record<string, DaySlotConfiguration> = { ...configurations };
    days.forEach((day) => {
      if (!newConfigurations[day]) {
        newConfigurations[day] = {
          day,
          startTime: '09:00',
          endTime: '17:00',
          slotDuration: 60,
          breakFrom: '',
          breakTill: '',
        };
      }
    });
    // Remove configurations for unselected days
    Object.keys(newConfigurations).forEach((day) => {
      if (!days.includes(day)) {
        delete newConfigurations[day];
      }
    });
    setConfigurations(newConfigurations);
  };

  const handleConfigurationChange = (day: string, updates: Partial<DaySlotConfiguration>) => {
    setConfigurations((prev) => ({
      ...prev,
      [day]: {
        day,
        startTime: '09:00',
        endTime: '17:00',
        slotDuration: 60,
        breakFrom: '',
        breakTill: '',
        ...prev[day],
        ...updates,
      },
    }));
  };

  const validateStep1 = (): boolean => {
    if (selectedDays.length === 0) {
      toast.error('Please select at least one day');
      return false;
    }
    return true;
  };

  const validateStep2 = (): boolean => {
    for (const day of selectedDays) {
      const config = configurations[day];
      if (!config) {
        toast.error(`Please configure ${day}`);
        return false;
      }

      if (config.startTime >= config.endTime) {
        toast.error(`${day}: Start time must be before end time`);
        return false;
      }

      if (config.breakFrom && config.breakTill) {
        if (config.breakFrom >= config.breakTill) {
          toast.error(`${day}: Break start time must be before break end time`);
          return false;
        }

        if (config.breakFrom < config.startTime || config.breakTill > config.endTime) {
          toast.error(`${day}: Break time must be within working hours`);
          return false;
        }
      }
    }
    return true;
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (!validateStep1()) return;
      setCurrentStep(2);
    }
  };

  const handleBack = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep2()) return;

    // Convert configurations to array
    const dayConfigs: DaySlotConfiguration[] = selectedDays
      .map((day) => configurations[day])
      .filter((config): config is DaySlotConfiguration => config !== undefined);

    // Generate slots for 3 months ahead
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    const endDate = addMonths(weekStart, 3);
    const generatedSlots = generateSlotsFromDayConfigurations(dayConfigs, weekStart, endDate);

    if (generatedSlots.length === 0) {
      toast.error('No slots could be generated from the current configuration');
      return;
    }

    // Convert to CreateSlotsDto format
    // locationType is optional - only include if specified (defaults to CLINIC on backend)
    const allSlots = generatedSlots.map((slot) => ({
      startTime: slot.startTime,
      endTime: slot.endTime,
      ...(locationType && { locationType }), // Optional - only include if specified
    }));

    // Filter out past slots
    const slots = filterPastSlots(allSlots);
    const pastSlotsCount = allSlots.length - slots.length;

    if (slots.length === 0) {
      toast.error(
        pastSlotsCount > 0
          ? 'All generated slots are in the past. Please adjust your configuration to include future dates.'
          : 'No slots could be generated from the current configuration',
      );
      return;
    }

    if (pastSlotsCount > 0) {
      toast.info(
        `Filtered out ${pastSlotsCount} past slot${pastSlotsCount !== 1 ? 's' : ''}. Creating ${slots.length} future slot${slots.length !== 1 ? 's' : ''}.`,
      );
    }

    // Use the first day's slot duration as default (they can vary per day, but API expects one duration)
    const defaultDuration = dayConfigs[0]?.slotDuration || 60;

    const submitData: CreateSlotsDto = {
      ...(locationType && { locationType }), // Optional - only include if specified
      duration: defaultDuration,
      slots,
    };

    createSlot(submitData, {
      onSuccess: (response) => {
        // Parse the message to check for skipped slots
        const message = response.message || '';
        const hasSkipped = message.toLowerCase().includes('skipped');
        const hasUpdated = message.toLowerCase().includes('updated');

        // Show appropriate notification based on the response
        if (hasSkipped) {
          // Show warning if slots were skipped
          toast.warning(
            message ?? 'Some slots could not be created due to overlaps with booked slots',
          );
        } else if (hasUpdated) {
          // Show info if slots were updated
          toast.info(message ?? 'Slots processed successfully');
        } else {
          // Show success for normal creation
          toast.success(
            message ?? `Successfully created ${slots.length} slot${slots.length !== 1 ? 's' : ''}!`,
          );
        }

        onSuccess?.();
      },
      onError: (error: unknown) => {
        let errorMessage = 'Failed to create slots';
        if (error instanceof Error) {
          errorMessage = error.message;
        } else if (error && typeof error === 'object') {
          if ('response' in error) {
            const apiError = error as { response?: { data?: { message?: string } } };
            errorMessage = apiError.response?.data?.message || errorMessage;
          } else if ('message' in error) {
            errorMessage = (error as { message: string }).message;
          }
        } else if (typeof error === 'string') {
          errorMessage = error;
        }
        toast.error(errorMessage);
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Global Settings - Location Type */}
      {/* <div className="p-4 border rounded-lg bg-muted/30">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label className="text-sm font-medium text-charcoal whitespace-nowrap">
              Location Type (Optional):
            </Label>
            <Select
              value={locationType || 'default'}
              onValueChange={(value) =>
                setLocationType(value === 'default' ? undefined : (value as LocationType))
              }
            >
              <SelectTrigger className="h-9 w-[140px]">
                <SelectValue placeholder="Default (Clinic)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default (Clinic)</SelectItem>
                <SelectItem value={LocationType.HOME}>Home Visit</SelectItem>
                <SelectItem value={LocationType.CLINIC}>Clinic</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <p className="text-xs text-muted-foreground">
            Optional. Defaults to Clinic if not specified. Pricing is determined by service category
            pricing during booking.
          </p>
        </div>
      </div> */}

      {/* Progress Indicator */}
      <div className="flex items-center justify-between pb-6 border-b">
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
              currentStep >= 1
                ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                : 'border-muted-foreground text-muted-foreground bg-white'
            }`}
          >
            <span className="text-sm font-semibold">1</span>
          </div>
          <span
            className={`text-sm font-medium ${currentStep >= 1 ? 'text-charcoal' : 'text-muted-foreground'}`}
          >
            Select Days
          </span>
        </div>
        <div
          className={`flex-1 h-1 mx-4 transition-colors ${
            currentStep >= 2 ? 'bg-primary' : 'bg-muted'
          }`}
        />
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
              currentStep >= 2
                ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                : 'border-muted-foreground text-muted-foreground bg-white'
            }`}
          >
            <span className="text-sm font-semibold">2</span>
          </div>
          <span
            className={`text-sm font-medium ${currentStep >= 2 ? 'text-charcoal' : 'text-muted-foreground'}`}
          >
            Configure Days
          </span>
        </div>
      </div>

      {/* Step Content */}
      <div className="min-h-[400px]">
        {currentStep === 1 && (
          <DaySelectionStep
            selectedDays={selectedDays}
            onDaysChange={handleDaysChange}
            tier={tier}
          />
        )}

        {currentStep === 2 && (
          <DayConfigurationStep
            selectedDays={selectedDays}
            configurations={configurations}
            onConfigurationChange={handleConfigurationChange}
          />
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 1 || isCreating}
          className="h-10 px-6"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        {currentStep === 1 ? (
          <Button
            type="button"
            onClick={handleNext}
            disabled={selectedDays.length === 0 || isCreating}
            className="h-10 px-6"
          >
            Next
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button type="button" onClick={handleSubmit} disabled={isCreating} className="h-10 px-6">
            {isCreating ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Creating Slots...
              </>
            ) : (
              'Generate & Save Slots'
            )}
          </Button>
        )}
      </div>
    </div>
  );
};
