import { useQueryClient } from '@tanstack/react-query';
import { FileText, Flag } from 'lucide-react';
import { useState } from 'react';
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
import { useCancelBooking } from '@/hooks/queries/useBookings';
import { useCalendarStore } from '@/stores/calendarStore';
import { Appointment } from '@/types/types';

import { InvoiceGenerationDialog } from '../InvoiceGenerationDialog';

interface ActionButtonsProps {
  appointment: Appointment;
}

export const ActionButtons = ({ appointment }: ActionButtonsProps) => {
  const queryClient = useQueryClient();
  const { closeEventDialog } = useCalendarStore();
  const { mutate: cancelBookingMutation } = useCancelBooking();
  const isCancelled = appointment.status === 'CANCELLED';
  const isCompleted = appointment.status === 'COMPLETED';
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false);

  const handleCancelAppointment = () => {
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

    cancelBookingMutation(
      {
        bookingId: appointment.id,
        reason: 'Cancelled by freelancer',
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['bookings'] });
          closeEventDialog();
          toast.success('Appointment cancelled successfully', {
            position: 'top-right',
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
        },
        onError: (error: any) => {
          toast.error(error?.message || 'Failed to cancel appointment');
        },
      },
    );
  };

  const handleReportUser = () => {
    // TODO: Implement report user functionality
    toast.success('User reported successfully', {
      position: 'top-right',
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
    dispatch(closeEventDialog());
  };

  return (
    <>
      <div
        className={`w-full flex flex-col lg:grid ${isCancelled || isCompleted ? 'grid-cols-2' : 'grid-cols-3'} gap-4`}
      >
        {/* Generate Invoice Button - Always visible */}
        <Button
          variant="outline"
          size="lg"
          className="w-full gap-2 border-primary/20 text-primary hover:bg-primary/10 hover:text-primary"
          onClick={() => setShowInvoiceDialog(true)}
        >
          <FileText className="h-4 w-4" />
          Generate Invoice
        </Button>

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

      {/* Invoice Generation Dialog */}
      <InvoiceGenerationDialog
        appointment={appointment}
        open={showInvoiceDialog}
        onOpenChange={setShowInvoiceDialog}
      />
    </>
  );
};
