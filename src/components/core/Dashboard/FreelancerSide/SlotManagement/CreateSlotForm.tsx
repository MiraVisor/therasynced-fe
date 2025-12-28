'use client';

import { format, isToday, isTomorrow, startOfDay } from 'date-fns';
import { ChevronDown, Copy, Plus, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateSlot } from '@/hooks/queries/useSlots';
import { cn } from '@/lib/utils';
import api from '@/services/api';
import { CreateSlotDto, LocationType, ServiceCategory } from '@/types/types';
import { filterPastSlots } from '@/utils/slotGenerationUtils';

interface CreateSlotFormProps {
  onSuccess?: () => void;
}

const ServiceCategorySelector = ({
  categories,
  selectedIds,
  onSelectionChange,
}: {
  categories: ServiceCategory[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
}) => {
  const [open, setOpen] = useState(false);

  const grouped: { [key: string]: ServiceCategory[] } = {};
  categories.forEach((category) => {
    const jobTitleName = category.jobTitle?.name || 'Other';
    if (!grouped[jobTitleName]) {
      grouped[jobTitleName] = [];
    }
    grouped[jobTitleName].push(category);
  });

  const toggleCategory = (categoryId: string) => {
    if (selectedIds.includes(categoryId)) {
      onSelectionChange(selectedIds.filter((id) => id !== categoryId));
    } else {
      onSelectionChange([...selectedIds, categoryId]);
    }
  };

  const getDisplayText = () => {
    if (selectedIds.length === 0) return 'Services';
    if (selectedIds.length === 1) {
      const category = categories.find((c) => c.id === selectedIds[0]);
      return category?.name || '1';
    }
    return `${selectedIds.length}`;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" className="h-8 text-xs px-2">
          {getDisplayText()}
          <ChevronDown className="ml-1 h-3 w-3 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0 max-h-[350px] flex flex-col" align="start">
        <div className="flex-1 overflow-y-auto p-2">
          {Object.entries(grouped).map(([jobTitleName, catList]) => (
            <div key={jobTitleName} className="mb-3">
              <div className="px-2 py-1 text-xs font-semibold text-muted-foreground mb-1">
                {jobTitleName.replace(/_/g, ' ')}
              </div>
              {catList.map((category) => {
                const isSelected = selectedIds.includes(category.id);
                return (
                  <div
                    key={category.id}
                    className="flex items-center px-2 py-1 rounded hover:bg-accent cursor-pointer"
                    onClick={() => toggleCategory(category.id)}
                  >
                    <Checkbox checked={isSelected} className="mr-2 h-3 w-3" />
                    <span className="text-xs">{category.name}</span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        {selectedIds.length > 0 && (
          <div className="p-2 border-t">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onSelectionChange([])}
              className="w-full h-7 text-xs"
            >
              Clear
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

export const CreateSlotForm = ({ onSuccess }: CreateSlotFormProps) => {
  const { mutate: createSlot, isPending: isCreating } = useCreateSlot();

  const [formData, setFormData] = useState<CreateSlotDto>({
    locationType: LocationType.HOME,
    locationId: undefined,
    basePrice: undefined, // Optional - backend calculates automatically
    duration: 60,
    slots: [],
    serviceCategoryIds: [],
    notes: '',
  });

  interface SlotEntry {
    id: string;
    date: Date | undefined;
    startTime: string;
    endTime: string;
    basePrice: number | undefined;
    locationType: LocationType | undefined;
    serviceCategoryIds: string[];
  }

  const [slotEntries, setSlotEntries] = useState<SlotEntry[]>([]);
  const [serviceCategories, setServiceCategories] = useState<ServiceCategory[]>([]);
  const [errors, setErrors] = useState<{
    slots?: string;
    price?: string;
  }>({});

  useEffect(() => {
    const loadServiceCategories = async () => {
      try {
        const categoriesResponse = await api.get('service/categories/all');
        if (categoriesResponse.data.success && Array.isArray(categoriesResponse.data.data)) {
          setServiceCategories(categoriesResponse.data.data);
        }
      } catch (error) {
        console.error('Failed to load service categories:', error);
      }
    };
    loadServiceCategories();
  }, []);

  const calculateEndTime = (startTimeStr: string, date: Date, durationMinutes: number): string => {
    if (!startTimeStr || !date) return '';
    const [hours, minutes] = startTimeStr.split(':');
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    const startDate = new Date(
      year,
      month,
      day,
      parseInt(hours || '0'),
      parseInt(minutes || '0'),
      0,
      0,
    );
    const endDate = new Date(startDate.getTime() + durationMinutes * 60000);
    return `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`;
  };

  const addSlotEntry = () => {
    const newEntry: SlotEntry = {
      id: `slot-${Date.now()}-${Math.random()}`,
      date: undefined,
      startTime: '',
      endTime: '',
      basePrice: undefined,
      locationType: undefined,
      serviceCategoryIds: [],
    };
    setSlotEntries([...slotEntries, newEntry]);
  };

  const removeSlotEntry = (id: string) => {
    setSlotEntries(slotEntries.filter((entry) => entry.id !== id));
  };

  const updateSlotEntry = (id: string, updates: Partial<SlotEntry>) => {
    setSlotEntries(
      slotEntries.map((entry) => {
        if (entry.id === id) {
          const updated = { ...entry, ...updates };
          if (
            updated.date &&
            updated.startTime &&
            (updates.date || updates.startTime || formData.duration)
          ) {
            updated.endTime = calculateEndTime(updated.startTime, updated.date, formData.duration);
          }
          return updated;
        }
        return entry;
      }),
    );
  };

  const handleDurationChange = (value: string) => {
    const duration = parseInt(value);
    setFormData((prev) => ({ ...prev, duration }));
    setSlotEntries(
      slotEntries.map((entry) => {
        if (entry.date && entry.startTime) {
          return {
            ...entry,
            endTime: calculateEndTime(entry.startTime, entry.date, duration),
          };
        }
        return entry;
      }),
    );
  };

  const duplicateSlotEntry = (id: string) => {
    const entry = slotEntries.find((e) => e.id === id);
    if (entry) {
      const newEntry: SlotEntry = {
        ...entry,
        id: `slot-${Date.now()}-${Math.random()}`,
        basePrice: entry.basePrice,
        serviceCategoryIds: [...entry.serviceCategoryIds],
      };
      setSlotEntries([...slotEntries, newEntry]);
    }
  };

  const handlePriceChange = (value: string) => {
    const price = value === '' ? undefined : parseFloat(value) || 0;
    setFormData((prev) => ({ ...prev, basePrice: price !== undefined ? price : prev.basePrice }));
    setErrors((prev) => ({
      ...prev,
      price: price !== undefined && price <= 0 ? 'Price must be greater than 0' : undefined,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: typeof errors = {};

    if (slotEntries.length === 0) {
      newErrors.slots = 'Please add at least one time slot';
    } else {
      const invalidSlots = slotEntries.filter(
        (entry) => !entry.date || !entry.startTime || !entry.endTime,
      );
      if (invalidSlots.length > 0) {
        newErrors.slots = 'Please complete all slot entries';
      }
    }

    // Price validation removed - backend calculates pricing automatically from account-level settings
    // Only validate if manually provided prices are positive (for manual override)
    if (formData.basePrice !== undefined && formData.basePrice <= 0) {
      newErrors.price = 'Price must be greater than 0 if provided';
    }

    const invalidSlotPrices = slotEntries.filter(
      (entry) => entry.basePrice !== undefined && entry.basePrice <= 0,
    );
    if (invalidSlotPrices.length > 0) {
      newErrors.price = 'All manually provided prices must be greater than 0';
    }

    // Validate that every slot has a locationType (required by backend)
    // Each slot must have either its own locationType or use the form default
    const slotsWithoutLocation = slotEntries.filter(
      (entry) => !entry.locationType && !formData.locationType,
    );
    if (slotsWithoutLocation.length > 0 || !formData.locationType) {
      newErrors.slots = 'Please specify a location type (HOME or CLINIC)';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    const allSlots = slotEntries.map((entry) => {
      if (!entry.date || !entry.startTime) {
        throw new Error('Invalid slot entry');
      }

      const [hours, minutes] = entry.startTime.split(':');
      const year = entry.date.getFullYear();
      const month = entry.date.getMonth();
      const day = entry.date.getDate();

      const localStartDate = new Date(
        year,
        month,
        day,
        parseInt(hours || '0'),
        parseInt(minutes || '0'),
        0,
        0,
      );
      const [endHours, endMinutes] = entry.endTime.split(':');
      const localEndDate = new Date(
        year,
        month,
        day,
        parseInt(endHours || '0'),
        parseInt(endMinutes || '0'),
        0,
        0,
      );

      // locationType is required at slot level - use entry's locationType or fall back to form default
      const slotLocationType = entry.locationType || formData.locationType;
      if (!slotLocationType) {
        throw new Error('Location type is required for all slots');
      }

      return {
        startTime: localStartDate.toISOString(),
        endTime: localEndDate.toISOString(),
        locationType: slotLocationType, // Required - always include locationType
        ...(entry.basePrice !== undefined && entry.basePrice > 0 && { basePrice: entry.basePrice }),
        ...(entry.serviceCategoryIds &&
          entry.serviceCategoryIds.length > 0 && { serviceCategoryIds: entry.serviceCategoryIds }),
      };
    });

    // Filter out past slots
    const slots = filterPastSlots(allSlots);
    const pastSlotsCount = allSlots.length - slots.length;

    if (slots.length === 0) {
      toast.error(
        pastSlotsCount > 0
          ? 'All selected slots are in the past. Please select future dates and times.'
          : 'No valid slots to create',
      );
      return;
    }

    if (pastSlotsCount > 0) {
      toast.info(
        `Filtered out ${pastSlotsCount} past slot${pastSlotsCount !== 1 ? 's' : ''}. Creating ${slots.length} future slot${slots.length !== 1 ? 's' : ''}.`,
      );
    }

    const submitData: CreateSlotDto = {
      ...formData,
      ...(formData.basePrice !== undefined &&
        formData.basePrice > 0 && { basePrice: formData.basePrice }),
      slots,
    };

    createSlot(submitData, {
      onSuccess: () => {
        toast.success(`Successfully created ${slots.length} slot${slots.length !== 1 ? 's' : ''}!`);
        onSuccess?.();
      },
      onError: (error: unknown) => {
        let errorMessage = 'Failed to create slots';
        if (error && typeof error === 'object') {
          if ('response' in error) {
            const apiError = error as {
              response?: {
                data?: {
                  message?: string;
                  error?: {
                    code?: string;
                    details?: unknown;
                  };
                };
              };
            };
            // Use the message from API response
            errorMessage = apiError.response?.data?.message || errorMessage;
            // Handle specific error codes
            const errorCode = apiError.response?.data?.error?.code;
            if (errorCode === 'TIER_DAY_LIMIT_EXCEEDED') {
              errorMessage =
                apiError.response?.data?.message ||
                "You have exceeded your tier's day limit. Please upgrade your subscription or reduce the number of days.";
            } else if (errorCode === 'PRICING_NOT_CONFIGURED') {
              errorMessage =
                apiError.response?.data?.message ||
                'Pricing not configured. Please set up your service or duration pricing first.';
            }
          } else if ('message' in error) {
            errorMessage = (error as { message: string }).message;
          }
        } else if (error instanceof Error) {
          errorMessage = error.message;
        } else if (typeof error === 'string') {
          errorMessage = error;
        }
        toast.error(errorMessage);
      },
    });
  };

  const getDateDisplay = (date: Date | undefined) => {
    if (!date) return '';
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'MMM d');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Compact Header with Defaults Inline */}
      <div className="flex items-center justify-between gap-4 pb-3 border-b">
        <div className="flex items-center gap-4 flex-1">
          <div className="flex items-center gap-2">
            <Label className="text-xs text-muted-foreground whitespace-nowrap">Location:</Label>
            <Select
              value={formData.locationType}
              onValueChange={(value) =>
                setFormData({ ...formData, locationType: value as LocationType })
              }
            >
              <SelectTrigger className="h-8 w-[120px] text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={LocationType.HOME}>Home Visit</SelectItem>
                <SelectItem value={LocationType.CLINIC}>Clinic</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Label className="text-xs text-muted-foreground whitespace-nowrap">Price (€):</Label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={formData.basePrice || ''}
              onChange={(e) => handlePriceChange(e.target.value)}
              placeholder="50"
              className={cn('h-8 w-20 text-xs', errors.price && 'border-error')}
            />
          </div>

          <div className="flex items-center gap-2">
            <Label className="text-xs text-muted-foreground whitespace-nowrap">Duration:</Label>
            <Select value={formData.duration.toString()} onValueChange={handleDurationChange}>
              <SelectTrigger className="h-8 w-[100px] text-xs">
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

        <Button type="button" variant="outline" size="sm" onClick={addSlotEntry} className="h-8">
          <Plus className="h-4 w-4 mr-1" />
          Add Slot
        </Button>
      </div>

      {errors.price && (
        <div className="p-2 bg-error/10 border border-error/20 rounded text-xs text-error">
          {errors.price}
        </div>
      )}

      {errors.slots && (
        <div className="p-2 bg-error/10 border border-error/20 rounded text-xs text-error">
          {errors.slots}
        </div>
      )}

      {/* Compact Table-like Slots */}
      {slotEntries.length === 0 ? (
        <div className="text-center py-8 text-sm text-muted-foreground">
          No slots added. Click "Add Slot" to start.
        </div>
      ) : (
        <div className="space-y-1.5">
          {slotEntries.map((entry, index) => (
            <div
              key={entry.id}
              className="flex items-center gap-2 p-2.5 rounded-lg border bg-white hover:bg-muted/30 transition-colors"
            >
              <div className="w-6 text-xs text-muted-foreground font-medium">{index + 1}.</div>

              <div className="flex flex-col">
                <Label className="text-xs text-muted-foreground mb-0.5">Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className={cn(
                        'h-8 w-[110px] justify-start text-left font-normal text-xs',
                        !entry.date && 'text-muted-foreground',
                      )}
                    >
                      {entry.date ? getDateDisplay(entry.date) : 'Select'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={entry.date}
                      onSelect={(date) => {
                        if (date) {
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          if (date < today) {
                            toast.error('Please select a future date');
                            return;
                          }
                          updateSlotEntry(entry.id, { date: startOfDay(date) });
                        } else {
                          updateSlotEntry(entry.id, { date: undefined });
                        }
                      }}
                      disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                      captionLayout="dropdown-months"
                      fromYear={new Date().getFullYear()}
                      toYear={new Date().getFullYear() + 2}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex flex-col">
                <Label className="text-xs text-muted-foreground mb-0.5">Time</Label>
                <Input
                  type="time"
                  value={entry.startTime}
                  onChange={(e) => updateSlotEntry(entry.id, { startTime: e.target.value })}
                  className="h-8 w-[90px] text-xs"
                />
              </div>

              <div className="flex flex-col">
                <Label className="text-xs text-muted-foreground mb-0.5">Price (€)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={entry.basePrice !== undefined ? entry.basePrice : ''}
                  onChange={(e) => {
                    const price =
                      e.target.value === '' ? undefined : parseFloat(e.target.value) || 0;
                    updateSlotEntry(entry.id, { basePrice: price });
                  }}
                  placeholder={formData.basePrice ? `${formData.basePrice}` : ''}
                  className="h-8 w-[70px] text-xs"
                />
              </div>

              <div className="flex flex-col">
                <Label className="text-xs text-muted-foreground mb-0.5">Location</Label>
                <Select
                  value={entry.locationType || 'default'}
                  onValueChange={(value) =>
                    updateSlotEntry(entry.id, {
                      locationType: value === 'default' ? undefined : (value as LocationType),
                    })
                  }
                >
                  <SelectTrigger className="h-8 w-[100px] text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value={LocationType.HOME}>Home</SelectItem>
                    <SelectItem value={LocationType.CLINIC}>Clinic</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {serviceCategories.length > 0 && (
                <div className="flex flex-col">
                  <Label className="text-xs text-muted-foreground mb-0.5">Services</Label>
                  <div className="flex items-center gap-1">
                    <ServiceCategorySelector
                      categories={serviceCategories}
                      selectedIds={entry.serviceCategoryIds}
                      onSelectionChange={(ids) =>
                        updateSlotEntry(entry.id, { serviceCategoryIds: ids })
                      }
                    />
                    {entry.serviceCategoryIds.length > 1 && (
                      <div className="flex gap-1">
                        {entry.serviceCategoryIds.slice(0, 1).map((categoryId) => {
                          const category = serviceCategories.find((c) => c.id === categoryId);
                          return category ? (
                            <Badge
                              key={categoryId}
                              variant="secondary"
                              className="text-xs h-6 px-1.5"
                            >
                              {category.name}
                            </Badge>
                          ) : null;
                        })}
                        {entry.serviceCategoryIds.length > 1 && (
                          <Badge variant="secondary" className="text-xs h-6 px-1.5">
                            +{entry.serviceCategoryIds.length - 1}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-1 ml-auto">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => duplicateSlotEntry(entry.id)}
                  className="h-7 w-7 p-0"
                  title="Duplicate"
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeSlotEntry(entry.id)}
                  className="h-7 w-7 p-0 text-muted-foreground hover:text-error"
                  title="Remove"
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Compact Submit */}
      <div className="flex justify-end pt-3 border-t">
        <Button
          type="submit"
          disabled={isCreating || slotEntries.length === 0}
          className="h-9 px-6"
        >
          {isCreating ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              Creating...
            </>
          ) : (
            `Create ${slotEntries.length > 0 ? `${slotEntries.length} ` : ''}Slot${slotEntries.length !== 1 ? 's' : ''}`
          )}
        </Button>
      </div>
    </form>
  );
};
