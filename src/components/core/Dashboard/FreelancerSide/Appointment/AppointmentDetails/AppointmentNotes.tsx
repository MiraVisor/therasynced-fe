import { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';

import { Textarea } from '@/components/ui/textarea';
import { updateAppointment } from '@/redux/slices/appointmentSlice';
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
  const dispatch = useDispatch();
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
      // Update Redux state first
      dispatch(updateAppointment({ ...appointment, notes }));

      // Then save to server
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
      // Revert Redux state on error
      dispatch(updateAppointment({ ...appointment, notes: lastSavedNotesRef.current }));

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
  }, [appointment, dispatch, notes]);

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

  return (
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
          className={`min-h-[100px] ${
            appointment.status !== 'PENDING' ? 'bg-muted cursor-not-allowed' : ''
          }`}
          disabled={appointment.status !== 'PENDING'}
        />
      </div>
      {appointment.status !== 'PENDING' && (
        <p className="text-sm text-muted-foreground">
          Notes cannot be edited for {appointment.status.toLowerCase()} appointments
        </p>
      )}
    </div>
  );
};
