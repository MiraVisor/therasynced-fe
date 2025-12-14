'use client';

import { FileText } from 'lucide-react';
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
import { FORM_TYPE_LABELS, FormType } from '@/types/formTypes';
import { LocationType, Slot } from '@/types/types';

// Create a mock slot for the forms (they require a slot prop)
const createMockSlot = (): Slot => ({
  id: 'mock-slot-id',
  freelancerId: 'mock-freelancer-id',
  locationType: LocationType.HOME,
  startTime: new Date().toISOString(),
  endTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
  duration: 60,
  basePrice: 50,
  status: 'AVAILABLE',
  notes: '',
  formType: FormType.NONE,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  booking: {
    id: 'mock-booking-id',
    client: {
      id: 'mock-client-id', // Add mock client ID for consent checking
      name: 'Demo Client',
      email: 'demo@example.com',
    },
    status: 'BOOKED',
    totalAmount: 100,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
});

export default function FormsPage() {
  const [selectedFormType, setSelectedFormType] = useState<FormType>(FormType.SOAP_NOTE);
  const mockSlot = createMockSlot();

  const handleFormSubmit = (data: any) => {
    // In a real scenario, this would save to a backend
    // For this unauthenticated view, we'll just log it
    console.log('Form submitted:', { formType: selectedFormType, data });
    alert('Form submitted! (This is a demo - data is logged to console)');
  };

  const renderForm = () => {
    switch (selectedFormType) {
      case FormType.SOAP_NOTE:
        return <SOAPNoteForm initialData={undefined} onSubmit={handleFormSubmit} slot={mockSlot} />;
      case FormType.MEDICAL_HISTORY:
        return (
          <MedicalHistoryForm initialData={undefined} onSubmit={handleFormSubmit} slot={mockSlot} />
        );
      case FormType.ROM_ASSESSMENT:
        return (
          <ROMAssessmentForm initialData={undefined} onSubmit={handleFormSubmit} slot={mockSlot} />
        );
      default:
        return (
          <div className="p-6 text-center text-muted-foreground font-inter">
            Please select a form type to view.
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-poppins font-bold text-charcoal">Medical Forms</h1>
          <p className="text-lg font-inter text-muted-foreground">
            View and explore our medical assessment forms
          </p>
        </div>

        {/* Form Selector */}
        <Card>
          <CardHeader>
            <CardTitle className="font-poppins text-xl font-semibold text-charcoal flex items-center gap-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
              Select Form Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label className="font-inter text-sm font-medium">Form Type</Label>
              <Select
                value={selectedFormType}
                onValueChange={(value) => setSelectedFormType(value as FormType)}
              >
                <SelectTrigger className="h-11 font-inter">
                  <SelectValue placeholder="Select a form type" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(FormType)
                    .filter((type) => type !== FormType.NONE)
                    .map((type) => (
                      <SelectItem key={type} value={type} className="font-inter">
                        {FORM_TYPE_LABELS[type]}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground font-inter">
                Choose a medical form to view and explore its structure.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Form Display */}
        <div className="space-y-6">{renderForm()}</div>
      </div>
    </div>
  );
}
