import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Drawer, DrawerContent } from '@/components/ui/drawer';
import { useMediaQuery } from '@/hooks/use-media-query';
import { Appointment } from '@/types/types';

import { AppointmentDetails } from '../AppointmentDetails';

interface EventDialogProps {
  selectedEvent: Appointment | null;
  onClose: () => Promise<void>;
  onTypingChange: (isTyping: boolean) => void;
}

export const EventDialog = ({ selectedEvent, onClose, onTypingChange }: EventDialogProps) => {
  const isMobile = useMediaQuery('(max-width: 1024px)');

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
        open={!!selectedEvent}
        onOpenChange={async (open) => {
          if (!open) {
            await onClose();
          }
        }}
      >
        <DrawerContent className="h-[90vh]">{content}</DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog
      open={!!selectedEvent}
      onOpenChange={async (open) => {
        if (!open) {
          await onClose();
        }
      }}
    >
      <DialogContent
        className="max-w-3xl w-[95vw] sm:w-[90vw] md:w-[80vw] lg:w-[70vw] xl:w-[60vw] max-h-[80vh] overflow-y-auto p-0 sm:p-0"
        onEscapeKeyDown={(e) => {
          e.preventDefault();
          onClose();
        }}
        onPointerDownOutside={(e) => {
          e.preventDefault();
          onClose();
        }}
      >
        {content}
      </DialogContent>
    </Dialog>
  );
};
