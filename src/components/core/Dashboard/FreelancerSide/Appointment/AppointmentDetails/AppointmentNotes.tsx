import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';

import { Textarea } from '@/components/ui/textarea';
import { Appointment } from '@/types/types';

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
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const lastSavedNotesRef = useRef(appointment.notes || '');
  const saveToastRef = useRef<string | number | null>(null);

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
  }, [appointment, notes]);

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

  const isDisabled = appointment.status !== 'PENDING';

  return (
    <div className="space-y-4">
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
            placeholder="Add notes about this appointment..."
            className={`min-h-[100px] ${isDisabled ? 'bg-muted cursor-not-allowed' : ''}`}
            disabled={isDisabled}
            aria-label="Appointment notes"
            aria-describedby={
              appointment.status !== 'PENDING' ? 'notes-disabled-reason' : 'notes-helper'
            }
            aria-required="false"
          />
        </div>
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
        {appointment.status === 'PENDING' && (
          <p className="text-xs text-muted-foreground" id="notes-helper">
            Notes are automatically saved. These notes may contain health information and will be
            retained for 7 years as required by law.
          </p>
        )}
      </div>
    </div>
  );
};
