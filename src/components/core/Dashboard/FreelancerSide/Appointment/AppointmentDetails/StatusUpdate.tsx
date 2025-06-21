import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { updateAppointmentStatus } from '@/redux/slices/appointmentSlice';
import { closeEventDialog } from '@/redux/slices/calendarSlice';
import { Appointment } from '@/types/types';

interface StatusUpdateProps {
  appointment: Appointment;
}

const statusOptions = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'COMPLETED', label: 'Completed' },
] as const;

const getStatusLabel = (status: 'PENDING' | 'COMPLETED' | 'CANCELLED') => {
  switch (status) {
    case 'PENDING':
      return 'Pending';
    case 'COMPLETED':
      return 'Completed';
    case 'CANCELLED':
      return 'Cancelled';
    default:
      return status;
  }
};

export const StatusUpdate = ({ appointment }: StatusUpdateProps) => {
  const dispatch = useDispatch();
  const isCancelled = appointment.status === 'CANCELLED';
  const isCompleted = appointment.status === 'COMPLETED';

  const handleStatusChange = (newStatus: 'PENDING' | 'COMPLETED') => {
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

    const previousStatus = appointment.status;
    dispatch(updateAppointmentStatus({ id: appointment.id, status: newStatus }));
    dispatch(closeEventDialog());

    toast.success(
      <div className="flex flex-col gap-2">
        <span>Appointment status updated to {newStatus.toLowerCase()}</span>
        <button
          onClick={() => {
            dispatch(updateAppointmentStatus({ id: appointment.id, status: previousStatus }));
            toast.dismiss();
          }}
          className="text-sm text-primary hover:text-primary/80 font-medium"
        >
          Undo
        </button>
      </div>,
      {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      },
    );
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
