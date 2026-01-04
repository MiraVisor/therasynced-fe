import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import api from '@/services/api';
import { useCalendarStore } from '@/stores/calendarStore';
import { Appointment } from '@/types/types';

interface StatusUpdateProps {
  appointment: Appointment;
}

const statusOptions = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'COMPLETED', label: 'Completed' },
] as const;

const getStatusLabel = (status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED') => {
  switch (status) {
    case 'PENDING':
      return 'Pending';
    case 'CONFIRMED':
      return 'Confirmed';
    case 'COMPLETED':
      return 'Completed';
    case 'CANCELLED':
      return 'Cancelled';
    default:
      return status;
  }
};

export const StatusUpdate = ({ appointment }: StatusUpdateProps) => {
  const queryClient = useQueryClient();
  const { closeEventDialog } = useCalendarStore();
  const isCancelled = appointment.status === 'CANCELLED';
  const isCompleted = appointment.status === 'COMPLETED';

  const handleStatusChange = async (newStatus: 'PENDING' | 'CONFIRMED' | 'COMPLETED') => {
    if (isCancelled) {
      toast.error('Cannot update a cancelled appointment', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }

    try {
      await api.patch(`/booking/${appointment.id}/status`, { status: newStatus });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['slots'] });

      // If status is changed to COMPLETED, invalidate stamps and favorites to refresh stamp data
      if (newStatus === 'COMPLETED') {
        queryClient.invalidateQueries({ queryKey: ['stamps'] });
        queryClient.invalidateQueries({ queryKey: ['favorites'] });
      }

      closeEventDialog();
      toast.success(`Appointment status updated to ${newStatus.toLowerCase()}`, {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update status';
      toast.error(errorMessage);
    }
  };

  if (isCancelled || isCompleted) {
    return null;
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">Update Status</p>
      <Select value={appointment.status} onValueChange={handleStatusChange}>
        <SelectTrigger className="w-full">
          <SelectValue>{getStatusLabel(appointment.status)}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {statusOptions.map((status) => (
            <SelectItem key={status.value} value={status.value}>
              {status.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
