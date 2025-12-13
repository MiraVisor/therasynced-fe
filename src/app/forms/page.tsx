'use client';

import { format } from 'date-fns';
import { useState } from 'react';

import { MedicalHistoryForm } from '@/components/core/Dashboard/FreelancerSide/SlotManagement/forms/MedicalHistoryForm';
import { ROMAssessmentForm } from '@/components/core/Dashboard/FreelancerSide/SlotManagement/forms/ROMAssessmentForm';
import { SOAPNoteForm } from '@/components/core/Dashboard/FreelancerSide/SlotManagement/forms/SOAPNoteForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { FORM_TYPE_LABELS, FormType } from '@/types/formTypes';
import { Slot } from '@/types/types';

// Mock slot data for demo purposes
const createMockSlot = (formType: FormType): Slot => {
  const now = new Date();
  const startTime = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Tomorrow
  const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hour later

  return {
    id: 'demo-slot-1',
    freelancerId: 'demo-freelancer-1',
    freelancerName: 'Demo Therapist',
    locationType: 'ONLINE', // This might have to be 'ONLINE' | 'IN_PERSON', based on app types.
    startTime: startTime.toISOString(),
    endTime: endTime.toISOString(),
    duration: 60,
    basePrice: 100,
    status: 'BOOKED',
    formType,
    booking: {
      id: 'demo-booking-1',
      status: 'CONFIRMED',
      totalAmount: 100,
      client: {
        id: 'demo-client-1',
        name: 'John Doe',
        email: 'john.doe@example.com',
      },
      services: [],
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    },
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };
};

const FORM_TYPE_OPTIONS: { value: FormType; label: string }[] = [
  { value: FormType.SOAP_NOTE, label: FORM_TYPE_LABELS[FormType.SOAP_NOTE] },
  { value: FormType.MEDICAL_HISTORY, label: FORM_TYPE_LABELS[FormType.MEDICAL_HISTORY] },
  { value: FormType.ROM_ASSESSMENT, label: FORM_TYPE_LABELS[FormType.ROM_ASSESSMENT] },
];

export default function FormsDemoPage() {
  const [selectedFormType, setSelectedFormType] = useState<FormType>(FormType.SOAP_NOTE);
  const mockSlot = createMockSlot(selectedFormType);

  const handleFormSubmit = (data: any) => {
    console.log('Form submitted:', data);
    // In a real scenario, you might want to show a toast or save the data
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Forms Demo</h1>
          <p className="text-muted-foreground">Select a form type to see how each form renders</p>
        </div>

        {/* Form Type Selector */}
        <Card>
          <CardHeader>
            <CardTitle>Form Type Selector</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="form-type-selector" className="font-inter text-sm font-medium">
                Select Form Type
              </Label>
              <Select
                value={selectedFormType}
                onValueChange={(value) => setSelectedFormType(value as FormType)}
              >
                <SelectTrigger
                  id="form-type-selector"
                  className="font-inter text-sm w-full md:w-[300px]"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FORM_TYPE_OPTIONS.map((formType) => (
                    <SelectItem
                      key={formType.value}
                      value={formType.value}
                      className="font-inter text-sm"
                    >
                      {formType.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Current selection:{' '}
                <span className="font-inter font-semibold">
                  {FORM_TYPE_OPTIONS.find((f) => f.value === selectedFormType)?.label}
                </span>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Forms Section */}
        <div className="space-y-8">
          {selectedFormType === FormType.SOAP_NOTE && (
            <Card>
              <CardHeader>
                <CardTitle>SOAP Note Form</CardTitle>
              </CardHeader>
              <CardContent>
                <SOAPNoteForm initialData={null} onSubmit={handleFormSubmit} slot={mockSlot} />
              </CardContent>
            </Card>
          )}
          {selectedFormType === FormType.MEDICAL_HISTORY && (
            <Card>
              <CardHeader>
                <CardTitle>Medical History Form</CardTitle>
              </CardHeader>
              <CardContent>
                <MedicalHistoryForm
                  initialData={null}
                  onSubmit={handleFormSubmit}
                  slot={mockSlot}
                />
              </CardContent>
            </Card>
          )}
          {selectedFormType === FormType.ROM_ASSESSMENT && (
            <Card>
              <CardHeader>
                <CardTitle>ROM Assessment Form</CardTitle>
              </CardHeader>
              <CardContent>
                <ROMAssessmentForm initialData={null} onSubmit={handleFormSubmit} slot={mockSlot} />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
