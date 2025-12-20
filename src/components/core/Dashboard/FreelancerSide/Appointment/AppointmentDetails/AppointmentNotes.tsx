import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';

import { HealthDataConsent } from '@/components/common/HealthDataConsent';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Appointment } from '@/types/types';
import { checkHealthDataConsent } from '@/utils/healthDataConsent';

const SAVE_DELAY = 1000;

// Mock server update function
const updateNotesOnServer = async (_appointmentId: string, _notes: string): Promise<void> => {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 800));
  // In real implementation, this would be an API call
  // await api.put(`/appointments/${appointmentId}/notes`, { notes });
};

interface AppointmentNotesProps {
  appointment: Appointment;
  onTypingChange?: (isTyping: boolean) => void;
}

export const AppointmentNotes = ({ appointment, onTypingChange }: AppointmentNotesProps) => {
  const [notes, setNotes] = useState(appointment.notes || '');
  const [, setIsEditing] = useState(false);
  const [hasConsent, setHasConsent] = useState(false);
  const [isCheckingConsent, setIsCheckingConsent] = useState(true);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const lastSavedNotesRef = useRef(appointment.notes || '');
  const saveToastRef = useRef<string | number | null>(null);
  const { clientId } = appointment;

  // Check consent on mount
  useEffect(() => {
    const checkConsent = async () => {
      setIsCheckingConsent(true);
      try {
        const consent = await checkHealthDataConsent('SOAP_NOTES', clientId);
        setHasConsent(consent);
      } catch (error) {
        console.error('Error checking consent:', error);
        setHasConsent(false);
      } finally {
        setIsCheckingConsent(false);
      }
    };
    if (clientId) {
      checkConsent();
    } else {
      setHasConsent(false);
      setIsCheckingConsent(false);
    }
  }, [clientId]);

  // Update local state when appointment changes
  useEffect(() => {
    setNotes(appointment.notes || '');
    lastSavedNotesRef.current = appointment.notes || '';
  }, [appointment.notes]);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  const saveToServer = useCallback(async () => {
    if (appointment.status !== 'PENDING') return;

    if (!hasConsent) {
      toast.error(
        'You must grant explicit consent for SOAP notes before saving. Please grant consent below.',
      );
      return;
    }

    if (notes === lastSavedNotesRef.current) return;

    if (saveToastRef.current) {
      toast.dismiss(saveToastRef.current);
    }

    saveToastRef.current = toast.loading('Saving changes...', {
      position: 'bottom-right',
      autoClose: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: false,
    });

    try {
      // Save to server
      await updateNotesOnServer(appointment.id, notes);
      lastSavedNotesRef.current = notes;

      if (saveToastRef.current) {
        toast.update(saveToastRef.current, {
          render: 'Changes saved successfully',
          type: 'success',
          isLoading: false,
          autoClose: 2000,
          closeOnClick: true,
        });
        saveToastRef.current = null;
      }
    } catch (error) {
      // Revert notes on error
      setNotes(lastSavedNotesRef.current);

      if (saveToastRef.current) {
        toast.update(saveToastRef.current, {
          render: 'Failed to save changes. Please try again.',
          type: 'error',
          isLoading: false,
          autoClose: 3000,
          closeOnClick: true,
        });
        saveToastRef.current = null;
      }
    }
  }, [appointment, notes, hasConsent]);

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newNotes = e.target.value;
    setNotes(newNotes);
    onTypingChange?.(true);

    if (appointment.status === 'PENDING') {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(() => {
        saveToServer();
        onTypingChange?.(false);
      }, SAVE_DELAY);
    }
  };

  const handleNotesBlur = () => {
    if (appointment.status === 'PENDING') {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveToServer();
    }
    setIsEditing(false);
    onTypingChange?.(false);
  };

  const handleNotesFocus = () => {
    if (appointment.status === 'PENDING') {
      setIsEditing(true);
    }
  };

  const isDisabled = appointment.status !== 'PENDING' || !hasConsent || isCheckingConsent;

  return (
    <div className="space-y-4">
      {/* Health Data Consent */}
      {appointment.status === 'PENDING' && clientId && (
        <HealthDataConsent
          consentType="SOAP_NOTES"
          description="The client must grant consent for TheraSynced to process these appointment notes (SOAP notes) as part of their health record. This consent is required before notes can be saved."
          onConsentChange={setHasConsent}
          required={true}
          showDisclaimer={true}
          userId={clientId}
        />
      )}

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">Notes</p>
        </div>
        <div className="relative">
          <Textarea
            value={notes}
            onChange={handleNotesChange}
            onBlur={handleNotesBlur}
            onFocus={handleNotesFocus}
            placeholder={
              !hasConsent && appointment.status === 'PENDING'
                ? 'Grant consent above to add notes...'
                : 'Add notes about this appointment...'
            }
            className={`min-h-[100px] ${isDisabled ? 'bg-muted cursor-not-allowed' : ''}`}
            disabled={isDisabled}
            aria-label="Appointment notes (SOAP notes)"
            aria-describedby={
              !hasConsent && appointment.status === 'PENDING'
                ? 'notes-consent-required'
                : appointment.status !== 'PENDING'
                  ? 'notes-disabled-reason'
                  : 'notes-helper'
            }
            aria-required="false"
          />
        </div>
        {!hasConsent && appointment.status === 'PENDING' && (
          <Alert variant="destructive" className="mt-2" role="alert" id="notes-consent-required">
            <AlertDescription>
              {clientId
                ? `The client must grant consent for SOAP notes before you can add or edit notes. Please ask the client to grant consent in their account settings.`
                : `You must grant explicit consent for SOAP notes before you can add or edit notes.`}
            </AlertDescription>
          </Alert>
        )}
        {appointment.status !== 'PENDING' && (
          <p
            className="text-sm text-muted-foreground"
            id="notes-disabled-reason"
            role="status"
            aria-live="polite"
          >
            Notes cannot be edited for {appointment.status.toLowerCase()} appointments
          </p>
        )}
        {hasConsent && appointment.status === 'PENDING' && (
          <p className="text-xs text-muted-foreground" id="notes-helper">
            Notes are automatically saved. These notes may contain health information and will be
            retained for 7 years as required by law.
          </p>
        )}
      </div>
    </div>
  );
};
