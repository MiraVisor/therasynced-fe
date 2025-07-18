'use client';

import { Check, ChevronsUpDown } from 'lucide-react';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { irishLocations } from '@/config/onboardingConfig';
import { cn } from '@/lib/utils';

// Convert irishLocations to the format expected by the dropdown
const locationOptions = irishLocations.map((location) => ({
  label: location,
  value: location,
}));

const FormSchema = z.object({
  location: z.string({
    required_error: 'Please select a location.',
  }),
});

interface LocationDropdownProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  className?: string;
}

export function LocationDropdown({
  value,
  onValueChange,
  placeholder = 'Select location...',
  searchPlaceholder = 'Search locations...',
  emptyMessage = 'No location found.',
  className,
}: LocationDropdownProps) {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: undefined, // We'll handle validation manually
    defaultValues: {
      location: value || '',
    },
  });

  // Update form value when prop changes
  React.useEffect(() => {
    if (value !== form.getValues('location')) {
      form.setValue('location', value || '');
    }
  }, [value, form]);

  return (
    <Form {...form}>
      <FormField
        control={form.control}
        name="location"
        render={({ field }) => (
          <FormItem className={cn('flex flex-col', className)}>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    role="combobox"
                    className={cn(
                      'w-full justify-between',
                      !field.value && 'text-muted-foreground',
                    )}
                  >
                    {field.value
                      ? locationOptions.find((location) => location.value === field.value)?.label
                      : placeholder}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder={searchPlaceholder} className="h-9" />
                  <CommandList>
                    <CommandEmpty>{emptyMessage}</CommandEmpty>
                    <CommandGroup>
                      {locationOptions.map((location) => (
                        <CommandItem
                          value={location.label}
                          key={location.value}
                          onSelect={() => {
                            form.setValue('location', location.value);
                            onValueChange(location.value);
                          }}
                        >
                          {location.label}
                          <Check
                            className={cn(
                              'ml-auto h-4 w-4',
                              location.value === field.value ? 'opacity-100' : 'opacity-0',
                            )}
                          />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )}
      />
    </Form>
  );
}
