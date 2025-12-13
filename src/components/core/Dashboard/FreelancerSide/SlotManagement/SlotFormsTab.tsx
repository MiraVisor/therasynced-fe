'use client';

import { FileText } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  FORM_TYPE_LABELS,
  FormType,
  type MedicalHistoryFormData,
  type ROMAssessmentFormData,
  type SOAPNoteFormData,
} from '@/types/formTypes';
import { Slot } from '@/types/types';

import { MedicalHistoryForm } from './forms/MedicalHistoryForm';
import { ROMAssessmentForm } from './forms/ROMAssessmentForm';
import { SOAPNoteForm } from './forms/SOAPNoteForm';

interface SlotFormsTabProps {
  slot: Slot;
}

export const SlotFormsTab = ({ slot }: SlotFormsTabProps) => {
  const [selectedFormType, setSelectedFormType] = useState<FormType>(
    (slot.formType as FormType) || FormType.NONE,
  );
  const [formData, setFormData] = useState<
    SOAPNoteFormData | MedicalHistoryFormData | ROMAssessmentFormData | null
  >(null);

  // Load form data from localStorage on mount
  useEffect(() => {
    const bookingId = slot.booking?.id || slot.id;
    const storageKey = `formData_${bookingId}`;
    const storedData = localStorage.getItem(storageKey);

    if (storedData) {
      try {
        const parsed = JSON.parse(storedData);
        setFormData(parsed);
        // If stored data exists, use the form type from storage or slot
        if (parsed.formType) {
          setSelectedFormType(parsed.formType);
        }
      } catch (error) {
        console.error('Failed to parse stored form data:', error);
      }
    }
  }, [slot.id, slot.booking?.id]);

  const handleFormTypeChange = (newType: FormType) => {
    if (newType !== selectedFormType && formData) {
      const confirmChange = window.confirm(
        'Changing the form type will clear existing form data. Are you sure?',
      );
      if (!confirmChange) {
        return;
      }
      setFormData(null);
      const bookingId = slot.booking?.id || slot.id;
      const storageKey = `formData_${bookingId}`;
      localStorage.removeItem(storageKey);
    }
    setSelectedFormType(newType);
  };

  const handleFormSubmit = (
    data: SOAPNoteFormData | MedicalHistoryFormData | ROMAssessmentFormData,
  ) => {
    try {
      const bookingId = slot.booking?.id || slot.id;
      const storageKey = `formData_${bookingId}`;
      const dataToStore = {
        ...data,
        formType: selectedFormType,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem(storageKey, JSON.stringify(dataToStore));
      setFormData(data);
      toast.success('Form data saved successfully');
    } catch (error) {
      console.error('Failed to save form data:', error);
      toast.error('Failed to save form data');
    }
  };

  const renderForm = () => {
    switch (selectedFormType) {
      case FormType.SOAP_NOTE:
        return (
          <SOAPNoteForm
            initialData={formData as SOAPNoteFormData | undefined}
            onSubmit={handleFormSubmit}
            slot={slot}
          />
        );
      case FormType.MEDICAL_HISTORY:
        return (
          <MedicalHistoryForm
            initialData={formData as MedicalHistoryFormData | undefined}
            onSubmit={handleFormSubmit}
            slot={slot}
          />
        );
      case FormType.ROM_ASSESSMENT:
        return (
          <ROMAssessmentForm
            initialData={formData as ROMAssessmentFormData | undefined}
            onSubmit={handleFormSubmit}
            slot={slot}
          />
        );
      default:
        return (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="font-inter text-muted-foreground">
                  No form type selected. Please select a form type above to begin filling out the
                  form.
                </p>
              </div>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-poppins font-semibold text-charcoal">Medical Forms</h3>
        <p className="text-sm font-inter text-muted-foreground mt-1">
          Fill out medical forms for this booking
        </p>
      </div>

      {/* Form Type Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-poppins font-semibold text-charcoal flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Form Type
          </CardTitle>
          <CardDescription className="font-inter">
            Select the type of medical form to fill out for this booking
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label className="font-inter text-sm font-medium">Form Type</Label>
            <Select value={selectedFormType} onValueChange={handleFormTypeChange}>
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
            {slot.formType && (
              <p className="text-xs font-inter text-muted-foreground mt-1">
                Default form type for this slot: {FORM_TYPE_LABELS[slot.formType as FormType]}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dynamic Form Rendering */}
      {renderForm()}
    </div>
  );
};
