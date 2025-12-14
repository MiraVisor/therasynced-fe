'use client';

import { format } from 'date-fns';
import { AlertCircle, Edit, Eye, FileText, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { HealthDataConsent } from '@/components/common/HealthDataConsent';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useAutoSave } from '@/hooks/useAutoSave';
import { bookingFormDraftService } from '@/services/draftStorage.service';
import { formSubmissionService } from '@/services/formSubmission.service';
import { FormSubmission } from '@/types/formSubmission';
import {
  FORM_TYPE_LABELS,
  FormType,
  type MedicalHistoryFormData,
  type ROMAssessmentFormData,
  type SOAPNoteFormData,
} from '@/types/formTypes';
import { Slot } from '@/types/types';
import { checkHealthDataConsent } from '@/utils/healthDataConsent';

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
  const [hasHealthDataConsent, setHasHealthDataConsent] = useState(false);
  const [isCheckingConsent, setIsCheckingConsent] = useState(true);
  const [isLoadingDraft, setIsLoadingDraft] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [formSubmissions, setFormSubmissions] = useState<FormSubmission[]>([]);
  const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<FormSubmission | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const clientId = slot.booking?.client?.id;
  const bookingId = slot.booking?.id || slot.id;

  // Map form types to their required consent types
  const getConsentTypeForForm = (formType: FormType): 'MEDICAL_HISTORY' | 'SOAP_NOTES' | null => {
    switch (formType) {
      case FormType.MEDICAL_HISTORY:
        return 'MEDICAL_HISTORY';
      case FormType.SOAP_NOTE:
        return 'SOAP_NOTES';
      case FormType.ROM_ASSESSMENT:
        return 'MEDICAL_HISTORY'; // ROM assessments are medical history data
      default:
        return null;
    }
  };

  // Check health data consent based on selected form type
  useEffect(() => {
    const checkConsent = async () => {
      if (!clientId) {
        setIsCheckingConsent(false);
        setHasHealthDataConsent(false);
        return;
      }

      const requiredConsentType = getConsentTypeForForm(selectedFormType);

      // If no form selected or form doesn't require consent, allow selection
      if (!requiredConsentType || selectedFormType === FormType.NONE) {
        setIsCheckingConsent(false);
        setHasHealthDataConsent(true); // Allow form selection
        return;
      }

      setIsCheckingConsent(true);
      try {
        const consent = await checkHealthDataConsent(requiredConsentType, clientId);
        setHasHealthDataConsent(consent);
      } catch (error) {
        console.error('Error checking health data consent:', error);
        setHasHealthDataConsent(false);
      } finally {
        setIsCheckingConsent(false);
      }
    };

    checkConsent();
  }, [clientId, selectedFormType]); // Re-check when form type changes

  // Load form data from backend API on mount
  useEffect(() => {
    async function loadDraft() {
      if (!bookingId) {
        setIsLoadingDraft(false);
        return;
      }

      try {
        setIsLoadingDraft(true);
        const draft = await bookingFormDraftService.getDraft(bookingId);
        if (draft?.formData) {
          setFormData(draft.formData as any);
          // If stored data exists, use the form type from storage or slot
          if (draft.formType) {
            setSelectedFormType(draft.formType as FormType);
          }
        }
      } catch (error) {
        console.error('Failed to load draft:', error);
        // Silently fail - user can still fill out the form
      } finally {
        setIsLoadingDraft(false);
      }
    }

    loadDraft();
  }, [bookingId]);

  // Load form submissions on mount
  useEffect(() => {
    async function loadSubmissions() {
      if (!bookingId) {
        return;
      }

      try {
        setIsLoadingSubmissions(true);
        const response = await formSubmissionService.getFormSubmissions(bookingId);
        setFormSubmissions(response.data || []);
      } catch (error: any) {
        console.error('Failed to load form submissions:', error);

        // Only show error for non-404 errors (404 means no submissions exist, which is fine)
        if (error.status !== 404) {
          // Silently fail for now - submissions are optional and shouldn't block the UI
          // Could add a subtle error indicator if needed
          console.warn('Failed to load form submissions, continuing without them');
        }
        // Set empty array on any error to prevent UI issues
        setFormSubmissions([]);
      } finally {
        setIsLoadingSubmissions(false);
      }
    }

    loadSubmissions();
  }, [bookingId]);

  const handleFormTypeChange = async (newType: FormType) => {
    if (newType !== selectedFormType && formData) {
      const confirmChange = window.confirm(
        'Changing the form type will clear existing form data. Are you sure?',
      );
      if (!confirmChange) {
        return;
      }
      setFormData(null);
      // Delete draft from backend
      try {
        await bookingFormDraftService.deleteDraft(bookingId);
      } catch (error) {
        console.error('Failed to delete draft:', error);
        // Continue anyway - draft will be overwritten on next save
      }
    }
    setSelectedFormType(newType);
  };

  // Auto-save form data with debouncing
  const { saveNow } = useAutoSave(
    formData
      ? {
          ...formData,
          formType: selectedFormType,
        }
      : null,
    {
      onSave: async () => {
        if (!formData || !bookingId) return;

        setIsSaving(true);
        try {
          await bookingFormDraftService.saveDraft(bookingId, {
            formData: formData as any,
            formType: selectedFormType,
            metadata: {
              savedAt: new Date().toISOString(),
              formVersion: '1.0',
            },
          });
          setLastSaved(new Date());
        } catch (error: any) {
          if (error.response?.status === 429) {
            // Rate limit - don't show error, just skip this save
            console.warn('Rate limited - skipping auto-save');
          } else {
            console.error('Auto-save failed:', error);
            // Don't show toast for auto-save failures to avoid annoying user
          }
        } finally {
          setIsSaving(false);
        }
      },
      debounceMs: 2000, // Save 2 seconds after user stops typing
      enabled: !!formData && selectedFormType !== FormType.NONE,
    },
  );

  const handleFormSubmit = async (
    data: SOAPNoteFormData | MedicalHistoryFormData | ROMAssessmentFormData,
  ) => {
    if (!bookingId) {
      toast.error('Booking ID is required to submit forms.');
      return;
    }

    if (!hasHealthDataConsent) {
      toast.error(
        'Health data consent is required before submitting forms. Please grant consent first.',
      );
      return;
    }

    if (selectedFormType === FormType.NONE) {
      toast.error('Please select a form type before submitting.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Submit the form to the submission endpoint
      const formTypeMap: Record<FormType, 'SOAP_NOTE' | 'MEDICAL_HISTORY' | 'ROM_ASSESSMENT'> = {
        [FormType.SOAP_NOTE]: 'SOAP_NOTE',
        [FormType.MEDICAL_HISTORY]: 'MEDICAL_HISTORY',
        [FormType.ROM_ASSESSMENT]: 'ROM_ASSESSMENT',
        [FormType.NONE]: 'SOAP_NOTE', // Fallback, shouldn't happen
      };

      const response = await formSubmissionService.submitForm(bookingId, {
        formType: formTypeMap[selectedFormType],
        formData: data as Record<string, any>,
        submittedAt: new Date().toISOString(),
      });

      // Update local state
      setFormData(data);

      // Refresh submissions list
      try {
        const submissionsResponse = await formSubmissionService.getFormSubmissions(bookingId);
        setFormSubmissions(submissionsResponse.data || []);
      } catch (error) {
        console.warn('Failed to refresh submissions list:', error);
        // Non-critical error, continue
      }

      // Optionally delete draft after successful submission
      try {
        await bookingFormDraftService.deleteDraft(bookingId);
      } catch (error) {
        // Ignore errors when clearing draft - non-critical
        console.warn('Failed to clear draft after submission:', error);
      }

      toast.success('Form submitted successfully!');
    } catch (error: any) {
      console.error('Failed to submit form:', error);

      // Handle specific error types
      if (error.status === 404) {
        const errorMessage = error.message?.toLowerCase() || '';
        if (errorMessage.includes('consent')) {
          toast.error('Health data consent is required. Please grant consent first.');
        } else if (errorMessage.includes('booking') || errorMessage.includes('not found')) {
          toast.error('Booking not found. Please refresh the page and try again.');
        } else {
          toast.error('Resource not found. Please try again.');
        }
      } else if (error.status === 400) {
        // Validation errors
        const errorMessage =
          error.message || error.data?.message || 'Invalid form data. Please check your inputs.';
        toast.error(errorMessage);
      } else if (error.status === 401) {
        toast.error('Authentication required. Please log in again.');
      } else if (error.status === 403) {
        toast.error('You do not have permission to submit this form.');
      } else if (error.status === 429) {
        toast.error('Too many requests. Please wait a moment and try again.');
      } else if (error.status >= 500) {
        toast.error('Server error. Please try again later or contact support.');
      } else if (error.message) {
        // Use the error message from the API
        toast.error(error.message);
      } else {
        // Generic network or unknown error
        toast.error('Failed to submit form. Please check your connection and try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewSubmission = async (submissionId: string) => {
    if (!bookingId) {
      toast.error('Booking ID is required.');
      return;
    }

    try {
      const response = await formSubmissionService.getFormSubmission(bookingId, submissionId);
      setSelectedSubmission(response.data);
      setIsViewDialogOpen(true);
    } catch (error: any) {
      console.error('Failed to load submission:', error);

      if (error.status === 404) {
        toast.error('Form submission not found. It may have been deleted.');
        // Refresh the list to remove the missing submission
        try {
          const submissionsResponse = await formSubmissionService.getFormSubmissions(bookingId);
          setFormSubmissions(submissionsResponse.data || []);
        } catch (refreshError) {
          console.error('Failed to refresh submissions:', refreshError);
        }
      } else if (error.status === 401) {
        toast.error('Authentication required. Please log in again.');
      } else if (error.status === 403) {
        toast.error('You do not have permission to view this submission.');
      } else {
        toast.error('Failed to load form submission. Please try again.');
      }
    }
  };

  const handleDeleteSubmission = async (submissionId: string) => {
    if (!bookingId) {
      toast.error('Booking ID is required.');
      return;
    }

    if (
      !window.confirm(
        'Are you sure you want to delete this form submission? This action cannot be undone.',
      )
    ) {
      return;
    }

    try {
      await formSubmissionService.deleteFormSubmission(bookingId, submissionId);

      // Refresh submissions list
      try {
        const response = await formSubmissionService.getFormSubmissions(bookingId);
        setFormSubmissions(response.data || []);
      } catch (refreshError) {
        console.error('Failed to refresh submissions after delete:', refreshError);
        // Remove from local state if refresh fails
        setFormSubmissions((prev) => prev.filter((s) => s.id !== submissionId));
      }

      toast.success('Form submission deleted successfully');
    } catch (error: any) {
      console.error('Failed to delete submission:', error);

      if (error.status === 404) {
        toast.error('Form submission not found. It may have already been deleted.');
        // Refresh the list
        try {
          const response = await formSubmissionService.getFormSubmissions(bookingId);
          setFormSubmissions(response.data || []);
        } catch (refreshError) {
          console.error('Failed to refresh submissions:', refreshError);
        }
      } else if (error.status === 401) {
        toast.error('Authentication required. Please log in again.');
      } else if (error.status === 403) {
        toast.error('You do not have permission to delete this submission.');
      } else if (error.status >= 500) {
        toast.error('Server error. Please try again later.');
      } else {
        toast.error('Failed to delete form submission. Please try again.');
      }
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

  // Show loading state while checking consent or loading draft
  if (isCheckingConsent || isLoadingDraft) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="text-center">
            <p className="text-sm font-inter text-muted-foreground">
              {isCheckingConsent ? 'Checking client consent...' : 'Loading form draft...'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show error if no client
  if (!clientId) {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-poppins font-semibold text-charcoal">Medical Forms</h3>
          <p className="text-sm font-inter text-muted-foreground mt-1">
            Fill out medical forms for this booking
          </p>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Booking Required</AlertTitle>
          <AlertDescription>
            This slot must have a booking with a client before medical forms can be filled out.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Always show form selector, but show consent banner if needed
  const requiredConsentType = getConsentTypeForForm(selectedFormType);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-poppins font-semibold text-charcoal">Medical Forms</h3>
        <p className="text-sm font-inter text-muted-foreground mt-1">
          Fill out medical forms for this booking
        </p>
      </div>

      {/* Form Type Selector - Always visible */}
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
            {/* Auto-save indicator */}
            {formData && (
              <div className="mt-2">
                {isSaving ? (
                  <p className="text-xs font-inter text-muted-foreground">Saving draft...</p>
                ) : lastSaved ? (
                  <p className="text-xs font-inter text-green-600 dark:text-green-400">
                    Draft saved at {lastSaved.toLocaleTimeString()}
                  </p>
                ) : null}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Consent Banner - Always show if form requires consent */}
      {requiredConsentType && selectedFormType !== FormType.NONE && (
        <HealthDataConsent
          consentType={requiredConsentType}
          description={`The client must grant consent for TheraSynced to process their ${requiredConsentType.replace(/_/g, ' ').toLowerCase()} data before ${FORM_TYPE_LABELS[selectedFormType]} can be filled out. This consent is required to proceed.`}
          onConsentChange={setHasHealthDataConsent}
          required={true}
          userId={clientId}
        />
      )}

      {/* Submitted Forms Section */}
      {formSubmissions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-poppins font-semibold text-charcoal flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Submitted Forms
            </CardTitle>
            <CardDescription className="font-inter">
              View and manage previously submitted forms for this booking
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingSubmissions ? (
              <p className="text-sm font-inter text-muted-foreground">Loading submissions...</p>
            ) : (
              <div className="space-y-3">
                {formSubmissions.map((submission) => (
                  <div
                    key={submission.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-inter font-medium text-charcoal">
                        {FORM_TYPE_LABELS[submission.formType as FormType] || submission.formType}
                      </p>
                      <p className="text-xs font-inter text-muted-foreground mt-1">
                        Submitted on {format(new Date(submission.submittedAt), 'PPp')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewSubmission(submission.id)}
                        className="font-inter"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteSubmission(submission.id)}
                        className="font-inter text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Dynamic Form Rendering - Only show if consent is granted or form doesn't require consent */}
      {!requiredConsentType || hasHealthDataConsent || selectedFormType === FormType.NONE ? (
        renderForm()
      ) : (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="font-inter text-muted-foreground">
                Client consent is required before you can fill out this form. Please ask the client
                to grant consent in their account settings.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* View Submission Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-poppins font-semibold">
              {selectedSubmission && FORM_TYPE_LABELS[selectedSubmission.formType as FormType]}{' '}
              Submission
            </DialogTitle>
            <DialogDescription className="font-inter">
              Submitted on{' '}
              {selectedSubmission && format(new Date(selectedSubmission.submittedAt), 'PPp')}
            </DialogDescription>
          </DialogHeader>
          {selectedSubmission && (
            <div className="space-y-4 mt-4">
              <div className="p-4 bg-muted rounded-lg">
                <pre className="text-xs font-mono overflow-x-auto">
                  {JSON.stringify(selectedSubmission.formData, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
