'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FORM_TYPE_LABELS, FormType } from '@/types/formTypes';
import { Slot } from '@/types/types';

import { MedicalHistoryForm } from './forms/MedicalHistoryForm';
import { ROMAssessmentForm } from './forms/ROMAssessmentForm';
import { SOAPNoteForm } from './forms/SOAPNoteForm';

interface SlotFormsTabProps {
  slot: Slot;
}

export const SlotFormsTab: React.FC<SlotFormsTabProps> = ({ slot }) => {
  const [selectedFormType, setSelectedFormType] = useState<FormType>(
    (slot.formType as FormType) || FormType.NONE,
  );
  const [formData, setFormData] = useState<Record<string, any> | null>(null);

  // Load existing form data from localStorage (POC)
  useEffect(() => {
    if (slot.booking?.id) {
      const storedFormData = localStorage.getItem(`formData_${slot.booking.id}`);
      if (storedFormData) {
        try {
          setFormData(JSON.parse(storedFormData));
        } catch (error) {
          console.error('Error parsing stored form data:', error);
        }
      }
    }
  }, [slot.booking?.id]);

  const handleFormTypeChange = (value: string) => {
    setSelectedFormType(value as FormType);
    // Clear form data when changing form type
    if (slot.booking?.id) {
      localStorage.removeItem(`formData_${slot.booking.id}`);
      setFormData(null);
    }
  };

  const handleFormSubmit = (data: Record<string, any>) => {
    if (!slot.booking?.id) {
      toast.error('No booking found for this slot');
      return;
    }

    // Save to localStorage for POC
    try {
      localStorage.setItem(`formData_${slot.booking.id}`, JSON.stringify(data));
      setFormData(data);
      toast.success('Form saved successfully!');
      console.log('Form data saved:', data);
    } catch (error) {
      console.error('Error saving form data:', error);
      toast.error('Failed to save form data');
    }
  };

  const renderForm = () => {
    if (selectedFormType === FormType.NONE) {
      return (
        <div className="text-center py-12 text-muted-foreground">
          <p className="font-inter text-sm">
            No form type selected. Please select a form type from the dropdown above.
          </p>
        </div>
      );
    }

    switch (selectedFormType) {
      case FormType.SOAP_NOTE:
        return <SOAPNoteForm initialData={formData} onSubmit={handleFormSubmit} slot={slot} />;
      case FormType.MEDICAL_HISTORY:
        return (
          <MedicalHistoryForm initialData={formData} onSubmit={handleFormSubmit} slot={slot} />
        );
      case FormType.ROM_ASSESSMENT:
        return <ROMAssessmentForm initialData={formData} onSubmit={handleFormSubmit} slot={slot} />;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardContent className="p-6 space-y-6">
        <div className="space-y-2">
          <Label className="font-inter text-sm font-medium">Form Type</Label>
          <Select value={selectedFormType} onValueChange={handleFormTypeChange}>
            <SelectTrigger className="font-inter text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={FormType.NONE} className="font-inter text-sm">
                {FORM_TYPE_LABELS[FormType.NONE]}
              </SelectItem>
              <SelectItem value={FormType.SOAP_NOTE} className="font-inter text-sm">
                {FORM_TYPE_LABELS[FormType.SOAP_NOTE]}
              </SelectItem>
              <SelectItem value={FormType.MEDICAL_HISTORY} className="font-inter text-sm">
                {FORM_TYPE_LABELS[FormType.MEDICAL_HISTORY]}
              </SelectItem>
              <SelectItem value={FormType.ROM_ASSESSMENT} className="font-inter text-sm">
                {FORM_TYPE_LABELS[FormType.ROM_ASSESSMENT]}
              </SelectItem>
            </SelectContent>
          </Select>
          <p className="font-inter text-xs text-muted-foreground">
            Select the form type to fill out for this booking
          </p>
        </div>

        <div className="border-t pt-6">{renderForm()}</div>
      </CardContent>
    </Card>
  );
};
