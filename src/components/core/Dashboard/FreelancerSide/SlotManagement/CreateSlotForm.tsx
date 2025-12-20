'use client';

import {
  addWeeks,
  eachDayOfInterval,
  endOfWeek,
  format,
  isToday,
  isTomorrow,
  startOfDay,
  startOfWeek,
} from 'date-fns';
import {
  Calendar as CalendarIcon,
  ChevronDown,
  Clock,
  Copy,
  Euro,
  FileText,
  MapPin,
  Package,
  Plus,
  Trash2,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useCreateSlot } from '@/hooks/queries/useSlots';
import { cn } from '@/lib/utils';
import api from '@/services/api';
import { FORM_TYPE_LABELS, FormType } from '@/types/formTypes';
import { CreateSlotDto, LocationType, ServiceCategory } from '@/types/types';

interface CreateSlotFormProps {
  onSuccess?: () => void;
}

// Service Category Selector Component for per-slot selection
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

  // Group categories by job title
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
    if (selectedIds.length === 0) {
      return 'Select services';
    }
    if (selectedIds.length === 1) {
      const category = categories.find((c) => c.id === selectedIds[0]);
      return category?.name || '1 selected';
    }
    return `${selectedIds.length} selected`;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" className="w-full h-9 justify-between text-xs">
          <span className="flex items-center gap-2">
            <Package className="h-3 w-3" />
            {getDisplayText()}
          </span>
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 max-h-[500px] flex flex-col" align="start">
        <div
          className="flex-1 overflow-y-auto overscroll-contain"
          style={{
            WebkitOverflowScrolling: 'touch',
            touchAction: 'pan-y',
          }}
        >
          <div className="p-1">
            {Object.entries(grouped).map(([jobTitleName, catList]) => (
              <SelectGroup key={jobTitleName}>
                <SelectLabel className="px-2 py-1.5 text-xs font-semibold">
                  {jobTitleName.replace(/_/g, ' ')}
                </SelectLabel>
                {catList.map((category) => {
                  const isSelected = selectedIds.includes(category.id);
                  return (
                    <div
                      key={category.id}
                      className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                      onClick={() => toggleCategory(category.id)}
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleCategory(category.id)}
                        className="mr-2"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-sm">{category.name}</span>
                        {category.description && (
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                            {category.description}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </SelectGroup>
            ))}
          </div>
        </div>
        {selectedIds.length > 0 && (
          <div className="p-2 border-t bg-muted/30">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onSelectionChange([])}
              className="w-full text-xs h-7"
            >
              Clear Selection
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

// Collapsible categories component

export const CreateSlotForm = ({ onSuccess }: CreateSlotFormProps) => {
  const { mutate: createSlot, isPending: isCreating } = useCreateSlot();

  const [formData, setFormData] = useState<CreateSlotDto>({
    locationType: LocationType.HOME, // Default fallback
    locationId: undefined,
    basePrice: 50,
    duration: 60,
    slots: [],
    serviceCategoryIds: [],
    notes: '',
    formType: FormType.NONE,
  });

  // Bulk slot creation state
  interface SlotEntry {
    id: string;
    date: Date | undefined;
    startTime: string;
    endTime: string;
    locationType: LocationType | undefined; // undefined means use default
    serviceCategoryIds: string[]; // Per-slot service categories
  }

  const [slotEntries, setSlotEntries] = useState<SlotEntry[]>([]);
  const [serviceCategories, setServiceCategories] = useState<ServiceCategory[]>([]);
  const [, setIsLoadingCategories] = useState(false);
  const [errors, setErrors] = useState<{
    slots?: string;
    price?: string;
  }>({});

  // Fetch all service categories
  useEffect(() => {
    const loadServiceCategories = async () => {
      try {
        setIsLoadingCategories(true);
        const categoriesResponse = await api.get('service/categories/all');

        if (categoriesResponse.data.success && Array.isArray(categoriesResponse.data.data)) {
          setServiceCategories(categoriesResponse.data.data);
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

  // Get quick date options

  // Add a new slot entry
  const addSlotEntry = () => {
    const newEntry: SlotEntry = {
      id: `slot-${Date.now()}-${Math.random()}`,
      date: undefined,
      startTime: '',
      endTime: '',
      locationType: undefined, // Use default
      serviceCategoryIds: [], // Empty array means use default
    };
    setSlotEntries([...slotEntries, newEntry]);
  };

  // Remove a slot entry
  const removeSlotEntry = (id: string) => {
    setSlotEntries(slotEntries.filter((entry) => entry.id !== id));
  };

  // Update a slot entry
  const updateSlotEntry = (id: string, updates: Partial<SlotEntry>) => {
    setSlotEntries(
      slotEntries.map((entry) => {
        if (entry.id === id) {
          const updated = { ...entry, ...updates };
          // Recalculate end time if date, startTime, or duration changed
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

  // Handle duration change - update all slot entries
  const handleDurationChange = (value: string) => {
    const duration = parseInt(value);
    setFormData((prev) => ({ ...prev, duration }));
    // Recalculate end times for all entries
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

  // Quick actions for bulk creation
  const addSlotsForDays = (
    days: Date[],
    startTime: string,
    locationType?: LocationType,
    serviceCategoryIds?: string[],
  ) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const validDays = days.filter((day) => {
      const dayStart = new Date(day);
      dayStart.setHours(0, 0, 0, 0);
      return dayStart >= today;
    });

    if (validDays.length === 0) {
      toast.error('Please select at least one future date');
      return;
    }

    const newEntries: SlotEntry[] = validDays.map((date) => ({
      id: `slot-${Date.now()}-${Math.random()}-${date.toISOString()}`,
      date: startOfDay(date),
      startTime,
      endTime: calculateEndTime(startTime, startOfDay(date), formData.duration),
      locationType,
      serviceCategoryIds: serviceCategoryIds || [],
    }));

    setSlotEntries([...slotEntries, ...newEntries]);
  };

  // Duplicate a slot entry
  const duplicateSlotEntry = (id: string) => {
    const entry = slotEntries.find((e) => e.id === id);
    if (entry) {
      const newEntry: SlotEntry = {
        ...entry,
        id: `slot-${Date.now()}-${Math.random()}`,
        serviceCategoryIds: [...entry.serviceCategoryIds], // Copy array
      };
      setSlotEntries([...slotEntries, newEntry]);
    }
  };

  // Handle price change with validation
  const handlePriceChange = (value: string) => {
    const price = parseFloat(value) || 0;
    setFormData((prev) => ({ ...prev, basePrice: price }));
    setErrors((prev) => ({
      ...prev,
      price: price <= 0 ? 'Price must be greater than 0' : undefined,
    }));
  };

  // Service category toggle

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const newErrors: typeof errors = {};

    if (slotEntries.length === 0) {
      newErrors.slots = 'Please add at least one time slot';
    } else {
      // Validate each slot entry
      const invalidSlots = slotEntries.filter(
        (entry) => !entry.date || !entry.startTime || !entry.endTime,
      );
      if (invalidSlots.length > 0) {
        newErrors.slots = 'Please complete all slot entries (date, start time, and end time)';
      }
    }

    if (!formData.basePrice || formData.basePrice <= 0) {
      newErrors.price = 'Please enter a valid price';
    }

    // Check if at least one location is specified (default or per-slot)
    const hasLocation = formData.locationType || slotEntries.some((entry) => entry.locationType);
    if (!hasLocation) {
      newErrors.slots = 'Please specify a location type (default or per slot)';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Please fill in all required fields');
      return;
    }

    setErrors({});

    // Convert slot entries to API format
    const slots = slotEntries.map((entry) => {
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

      return {
        startTime: localStartDate.toISOString(),
        endTime: localEndDate.toISOString(),
        ...(entry.locationType && { locationType: entry.locationType }),
        ...(entry.serviceCategoryIds &&
          entry.serviceCategoryIds.length > 0 && { serviceCategoryIds: entry.serviceCategoryIds }),
      };
    });

    createSlot(
      {
        ...formData,
        slots,
      },
      {
        onSuccess: () => {
          toast.success(
            `Successfully created ${slots.length} time slot${slots.length !== 1 ? 's' : ''}!`,
          );
          onSuccess?.();
        },
        onError: (error: any) => {
          // Extract error message from API response
          let errorMessage = 'Failed to create time slots';
          if (typeof error === 'string') {
            errorMessage = error;
          } else if (error?.message) {
            errorMessage = error.message;
          } else if (error?.response?.data?.message) {
            errorMessage = error.response.data.message;
          }
          toast.error(errorMessage);
        },
      },
    );
  };

  const getDateDisplay = (date: Date | undefined) => {
    if (!date) return '';
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'EEEE, MMM d, yyyy');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-poppins font-semibold text-charcoal">
            Basic Information
          </CardTitle>
          <CardDescription>
            Set up location, price, and duration for your availability
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Default Location Type */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                Default Location Type
              </Label>
              <Select
                value={formData.locationType}
                onValueChange={(value) =>
                  setFormData({ ...formData, locationType: value as LocationType })
                }
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select default location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={LocationType.HOME}>🏠 Home Visit</SelectItem>
                  <SelectItem value={LocationType.CLINIC}>🏥 Clinic</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Used for slots that don&apos;t specify their own location
              </p>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Euro className="h-4 w-4 text-muted-foreground" />
                Price (EUR)
              </Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={formData.basePrice}
                onChange={(e) => handlePriceChange(e.target.value)}
                placeholder="50.00"
                className={cn('h-11', errors.price && 'border-error focus-visible:ring-error')}
                required
              />
              {errors.price && <p className="text-xs text-error mt-1">{errors.price}</p>}
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                Duration
              </Label>
              <Select value={formData.duration.toString()} onValueChange={handleDurationChange}>
                <SelectTrigger className="h-11">
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

          {/* Form Type Selector - Full Width */}
          <div className="space-y-2 mt-4">
            <Label className="text-sm font-medium flex items-center gap-2 font-inter">
              <FileText className="h-4 w-4 text-muted-foreground" />
              Form Type
            </Label>
            <Select
              value={formData.formType || FormType.NONE}
              onValueChange={(value) => setFormData({ ...formData, formType: value as FormType })}
            >
              <SelectTrigger className="h-11 font-inter">
                <SelectValue placeholder="Select a form type" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(FormType).map((type) => (
                  <SelectItem key={type} value={type} className="font-inter">
                    {FORM_TYPE_LABELS[type]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground font-inter">
              Select the medical form type for this slot (optional)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Date & Time Section - Bulk Slot Creation */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-poppins font-semibold text-charcoal">
                Time Slots
              </CardTitle>
              <CardDescription>
                Add multiple time slots with different dates, times, and locations
              </CardDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addSlotEntry}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Slot
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {errors.slots && (
            <div className="p-3 bg-error/10 border border-error/20 rounded-lg">
              <p className="text-sm text-error">{errors.slots}</p>
            </div>
          )}

          {/* Quick Bulk Actions */}
          {slotEntries.length === 0 && (
            <div className="space-y-3 p-4 bg-muted/50 rounded-lg border border-dashed">
              <p className="text-sm font-medium text-charcoal">Quick Actions</p>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const today = startOfDay(new Date());
                    const weekEnd = endOfWeek(today, { weekStartsOn: 1 }); // Sunday
                    // Only include today and remaining days of the week
                    const remainingDays = eachDayOfInterval({
                      start: today,
                      end: weekEnd,
                    });
                    if (remainingDays.length === 0) {
                      toast.error('No remaining days in this week');
                      return;
                    }
                    const timeInput = prompt('Enter start time (HH:mm):', '09:00');
                    if (timeInput && /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(timeInput)) {
                      addSlotsForDays(remainingDays, timeInput);
                    } else if (timeInput) {
                      toast.error('Please enter a valid time format (HH:mm)');
                    }
                  }}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Add for This Week
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const today = new Date();
                    // Get next week's Monday
                    const nextWeekStart = startOfWeek(addWeeks(today, 1), { weekStartsOn: 1 });
                    // Get next week's Sunday
                    const nextWeekEnd = endOfWeek(addWeeks(today, 1), { weekStartsOn: 1 });
                    const nextWeekDays = eachDayOfInterval({
                      start: nextWeekStart,
                      end: nextWeekEnd,
                    });
                    const timeInput = prompt('Enter start time (HH:mm):', '09:00');
                    if (timeInput && /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(timeInput)) {
                      addSlotsForDays(nextWeekDays, timeInput);
                    } else if (timeInput) {
                      toast.error('Please enter a valid time format (HH:mm)');
                    }
                  }}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Add for Next Week
                </Button>
              </div>
            </div>
          )}

          {/* Slot Entries List */}
          {slotEntries.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-charcoal">
                  {slotEntries.length} slot{slotEntries.length !== 1 ? 's' : ''} added
                </p>
              </div>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {slotEntries.map((entry, index) => (
                  <div
                    key={entry.id}
                    className="p-4 border border-gray-200 rounded-lg bg-white space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-muted-foreground">
                          Slot #{index + 1}
                        </span>
                        {entry.date && entry.startTime && (
                          <Badge variant="secondary" className="text-xs">
                            {getDateDisplay(entry.date)} at {entry.startTime}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => duplicateSlotEntry(entry.id)}
                          className="h-8 w-8 p-0"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSlotEntry(entry.id)}
                          className="h-8 w-8 p-0 text-error hover:text-error"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      {/* Date */}
                      <div className="space-y-1">
                        <Label className="text-xs font-medium">Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              type="button"
                              variant="outline"
                              className={cn(
                                'w-full h-9 justify-start text-left font-normal text-xs',
                                !entry.date && 'text-muted-foreground',
                              )}
                            >
                              <CalendarIcon className="mr-2 h-3 w-3" />
                              {entry.date ? getDateDisplay(entry.date) : 'Pick date'}
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

                      {/* Start Time */}
                      <div className="space-y-1">
                        <Label className="text-xs font-medium">Start Time</Label>
                        <Input
                          type="time"
                          value={entry.startTime}
                          onChange={(e) => updateSlotEntry(entry.id, { startTime: e.target.value })}
                          className="h-9 text-xs"
                          placeholder="HH:mm"
                        />
                      </div>

                      {/* End Time */}
                      <div className="space-y-1">
                        <Label className="text-xs font-medium">End Time</Label>
                        <Input
                          type="time"
                          value={entry.endTime}
                          className="h-9 text-xs bg-muted"
                          readOnly
                          disabled
                        />
                        <p className="text-xs text-muted-foreground">Auto-calculated</p>
                      </div>

                      {/* Location Type (per slot) */}
                      <div className="space-y-1">
                        <Label className="text-xs font-medium">Location</Label>
                        <Select
                          value={entry.locationType || 'default'}
                          onValueChange={(value) =>
                            updateSlotEntry(entry.id, {
                              locationType:
                                value === 'default' ? undefined : (value as LocationType),
                            })
                          }
                        >
                          <SelectTrigger className="h-9 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="default">
                              Default (
                              {formData.locationType === LocationType.HOME
                                ? '🏠 Home'
                                : '🏥 Clinic'}
                              )
                            </SelectItem>
                            <SelectItem value={LocationType.HOME}>🏠 Home Visit</SelectItem>
                            <SelectItem value={LocationType.CLINIC}>🏥 Clinic</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Service Categories (per slot) */}
                    <div className="space-y-1 pt-2 border-t">
                      <Label className="text-xs font-medium flex items-center gap-2">
                        <Package className="h-3 w-3" />
                        Services
                        <span className="text-xs text-muted-foreground font-normal">
                          (Optional)
                        </span>
                      </Label>
                      {serviceCategories.length > 0 ? (
                        <ServiceCategorySelector
                          categories={serviceCategories}
                          selectedIds={entry.serviceCategoryIds}
                          onSelectionChange={(ids) =>
                            updateSlotEntry(entry.id, { serviceCategoryIds: ids })
                          }
                        />
                      ) : (
                        <div className="text-xs text-muted-foreground p-2">
                          Loading service categories...
                        </div>
                      )}
                      {entry.serviceCategoryIds.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {entry.serviceCategoryIds.map((categoryId) => {
                            const category = serviceCategories.find((c) => c.id === categoryId);
                            return category ? (
                              <Badge
                                key={categoryId}
                                variant="secondary"
                                className="text-xs font-normal"
                              >
                                {category.name}
                              </Badge>
                            ) : null;
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notes Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-poppins font-semibold text-charcoal">
            Additional Notes
          </CardTitle>
          <CardDescription>
            Add any special instructions or notes about this slot (optional)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Any special instructions or notes about this slot..."
            rows={3}
            className="font-inter text-sm"
          />
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end gap-3 pt-2">
        <Button
          type="submit"
          disabled={isCreating || slotEntries.length === 0}
          className="h-11 px-8 bg-primary hover:bg-primary/90"
        >
          {isCreating ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              Creating {slotEntries.length} slot{slotEntries.length !== 1 ? 's' : ''}...
            </>
          ) : (
            <>
              <CalendarIcon className="h-4 w-4 mr-2" />
              Create {slotEntries.length > 0 ? `${slotEntries.length} ` : ''}Slot
              {slotEntries.length !== 1 ? 's' : ''}
            </>
          )}
        </Button>
      </div>
    </form>
  );
};
