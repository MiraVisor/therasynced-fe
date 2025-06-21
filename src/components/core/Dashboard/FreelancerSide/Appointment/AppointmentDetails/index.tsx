'use client';

import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Appointment } from '@/types/types';

import { ActionButtons } from './ActionButtons';
import { AppointmentHeader } from './AppointmentHeader';
import { AppointmentInfo } from './AppointmentInfo';
import { AppointmentNotes } from './AppointmentNotes';
import { StatusUpdate } from './StatusUpdate';

interface AppointmentDetailsProps {
  appointment: Appointment;
  onClose?: () => void;
  onTypingChange?: (isTyping: boolean) => void;
}

export const AppointmentDetails = ({ appointment, onTypingChange }: AppointmentDetailsProps) => {
  return (
    <Card className="w-full max-w-2xl border-none shadow-none">
      <AppointmentHeader appointment={appointment} />
      <CardContent className="space-y-6">
        <AppointmentInfo appointment={appointment} />
        <AppointmentNotes appointment={appointment} onTypingChange={onTypingChange} />
        <StatusUpdate appointment={appointment} />
      </CardContent>
      <CardFooter className="flex justify-between gap-4 pt-4">
        <ActionButtons appointment={appointment} />
      </CardFooter>
    </Card>
  );
};
