import { useDispatch, useSelector } from 'react-redux';

import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Drawer, DrawerContent } from '@/components/ui/drawer';
import { useMediaQuery } from '@/hooks/use-media-query';
import { closeEventDialog } from '@/redux/slices/calendarSlice';
import { RootState } from '@/redux/store';

import { AppointmentDetails } from '../AppointmentDetails';

interface EventDialogProps {
  onTypingChange: (isTyping: boolean) => void;
}

export const EventDialog = ({ onTypingChange }: EventDialogProps) => {
  const isMobile = useMediaQuery('(max-width: 1024px)');
  const dispatch = useDispatch();
  const { selectedEvent, isEventDialogOpen } = useSelector((state: RootState) => state.calendar);

  const handleClose = async () => {
    dispatch(closeEventDialog());
  };

  const content = selectedEvent && (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <AppointmentDetails appointment={selectedEvent} onTypingChange={onTypingChange} />
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer
        open={isEventDialogOpen}
        onOpenChange={async (open) => {
          if (!open) {
            await handleClose();
          }
        }}
      >
        <DrawerContent className="h-[90vh]">{content}</DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog
      open={isEventDialogOpen}
      onOpenChange={async (open) => {
        if (!open) {
          await handleClose();
        }
      }}
    >
      <DialogContent
        className="max-w-3xl w-[95vw] sm:w-[90vw] md:w-[80vw] lg:w-[70vw] xl:w-[60vw] max-h-[80vh] overflow-y-auto p-0 sm:p-0"
        onEscapeKeyDown={(e) => {
          e.preventDefault();
          handleClose();
        }}
        onPointerDownOutside={(e) => {
          e.preventDefault();
          handleClose();
        }}
      >
        {content}
      </DialogContent>
    </Dialog>
  );
};
