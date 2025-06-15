import { Flag } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { updateAppointmentStatus } from '@/redux/slices/appointmentSlice';
import { Appointment } from '@/types/types';

interface ActionButtonsProps {
  appointment: Appointment;
}

export const ActionButtons = ({ appointment }: ActionButtonsProps) => {
  const dispatch = useDispatch();
  const isCancelled = appointment.status === 'CANCELLED';
  const isCompleted = appointment.status === 'COMPLETED';

  const handleCancelAppointment = () => {
    // TODO: Implement cancel appointment functionality
    if (isCancelled) {
      toast.error('This appointment is already cancelled', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }
    dispatch(updateAppointmentStatus({ id: appointment.id, status: 'CANCELLED' }));
    toast.success('Appointment cancelled successfully', {
      position: 'top-right',
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  const handleReportUser = () => {
    // TODO: Implement report user functionality
    console.log('Report user:', appointment.clientName);
    toast.success('User reported successfully', {
      position: 'top-right',
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  return (
    <div
      className={`w-full flex flex-col lg:grid ${isCancelled || isCompleted ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}
    >
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="outline"
            size="lg"
            className="w-full gap-2 border-destructive/20 text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <Flag className="h-4 w-4" />
            Report User
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Report User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to report {appointment.clientName}? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleReportUser}>Report</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {!isCancelled && !isCompleted && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="lg" className="w-full gap-2">
              Cancel Appointment
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Cancel Appointment</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to cancel this appointment? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>No, keep it</AlertDialogCancel>
              <AlertDialogAction onClick={handleCancelAppointment}>
                Yes, cancel it
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
};
