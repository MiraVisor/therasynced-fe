'use client';

import { ChevronDown, Package } from 'lucide-react';
import { useState } from 'react';

import { DashboardPageWrapper } from '@/components/core/Dashboard/DashboardPageWrapper';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { SelectGroup, SelectLabel } from '@/components/ui/select';
import { useAuth } from '@/redux/hooks/useAppHooks';

// Mock service categories grouped by job title
const mockCategories = [
  { id: '1', name: 'Individual Therapy', jobTitle: { name: 'PSYCHOLOGIST' } },
  { id: '2', name: 'Group Therapy', jobTitle: { name: 'PSYCHOLOGIST' } },
  { id: '3', name: 'CBT', jobTitle: { name: 'PSYCHOLOGIST' } },
  { id: '4', name: 'DBT', jobTitle: { name: 'PSYCHOLOGIST' } },
  { id: '5', name: 'EMDR', jobTitle: { name: 'PSYCHOLOGIST' } },
  { id: '6', name: 'Physical Assessment', jobTitle: { name: 'PHYSIOTHERAPIST' } },
  { id: '7', name: 'Exercise Therapy', jobTitle: { name: 'PHYSIOTHERAPIST' } },
  { id: '8', name: 'Massage Therapy', jobTitle: { name: 'PHYSIOTHERAPIST' } },
  { id: '9', name: 'Rehabilitation', jobTitle: { name: 'PHYSIOTHERAPIST' } },
  { id: '10', name: 'Nutrition Counseling', jobTitle: { name: 'NUTRITIONIST' } },
  { id: '11', name: 'Meal Planning', jobTitle: { name: 'NUTRITIONIST' } },
  { id: '12', name: 'Weight Management', jobTitle: { name: 'NUTRITIONIST' } },
  { id: '13', name: 'General Consultation', jobTitle: { name: 'GENERAL_PRACTITIONER' } },
  { id: '14', name: 'Health Checkup', jobTitle: { name: 'GENERAL_PRACTITIONER' } },
  { id: '15', name: 'Prescription Review', jobTitle: { name: 'GENERAL_PRACTITIONER' } },
  { id: '16', name: 'Acupuncture', jobTitle: { name: 'ALTERNATIVE_THERAPIST' } },
  { id: '17', name: 'Herbal Medicine', jobTitle: { name: 'ALTERNATIVE_THERAPIST' } },
  { id: '18', name: 'Yoga Therapy', jobTitle: { name: 'ALTERNATIVE_THERAPIST' } },
  { id: '19', name: 'Meditation', jobTitle: { name: 'ALTERNATIVE_THERAPIST' } },
  { id: '20', name: 'Chiropractic', jobTitle: { name: 'ALTERNATIVE_THERAPIST' } },
];

export default function TestSelectPage() {
  const { role } = useAuth();
  const [open, setOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Group categories by job title
  const grouped: { [key: string]: typeof mockCategories } = {};
  mockCategories.forEach((category) => {
    const jobTitleName = category.jobTitle?.name || 'Other';
    if (!grouped[jobTitleName]) {
      grouped[jobTitleName] = [];
    }
    grouped[jobTitleName].push(category);
  });

  const toggleCategory = (categoryId: string) => {
    if (selectedIds.includes(categoryId)) {
      setSelectedIds(selectedIds.filter((id) => id !== categoryId));
    } else {
      setSelectedIds([...selectedIds, categoryId]);
    }
  };

  const getDisplayText = () => {
    if (selectedIds.length === 0) {
      return 'Select services';
    }
    if (selectedIds.length === 1) {
      const category = mockCategories.find((c) => c.id === selectedIds[0]);
      return category?.name || '1 selected';
    }
    return `${selectedIds.length} selected`;
  };

  return (
    <DashboardPageWrapper
      userRole={role}
      header={<h2 className="text-2xl font-bold">Test Select Component</h2>}
    >
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Service Category Selector (Outside Modal)</h2>
          <p className="text-sm text-muted-foreground mb-4">
            This is a test to verify if the Select component scrolls properly when not inside a
            modal/dialog.
          </p>

          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="w-full md:w-80 h-9 justify-between text-xs"
              >
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
                            className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                            onClick={() => toggleCategory(category.id)}
                          >
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => toggleCategory(category.id)}
                              className="mr-2"
                            />
                            <div className="flex-1 min-w-0">
                              <span className="text-sm">{category.name}</span>
                            </div>
                          </div>
                        );
                      })}
                    </SelectGroup>
                  ))}
                </div>
              </div>
              {selectedIds.length > 0 && (
                <div className="p-2 border-t bg-muted/30 flex-shrink-0">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedIds([])}
                    className="w-full text-xs h-7"
                  >
                    Clear Selection
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>

          {selectedIds.length > 0 && (
            <div className="mt-4 p-3 bg-muted/50 rounded-lg">
              <p className="text-sm font-medium mb-2">Selected ({selectedIds.length}):</p>
              <div className="flex flex-wrap gap-2">
                {selectedIds.map((id) => {
                  const category = mockCategories.find((c) => c.id === id);
                  return category ? (
                    <span key={id} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                      {category.name}
                    </span>
                  ) : null;
                })}
              </div>
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Test Instructions</h2>
          <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
            <li>Click the button above to open the service category selector</li>
            <li>Try scrolling with your trackpad or mouse wheel</li>
            <li>
              Check if you can see all job titles (PSYCHOLOGIST, PHYSIOTHERAPIST, NUTRITIONIST,
              etc.)
            </li>
            <li>Verify that scrolling works smoothly</li>
            <li>Compare this behavior with the one inside the modal at /dashboard/slots</li>
          </ul>
        </div>
      </div>
    </DashboardPageWrapper>
  );
}
