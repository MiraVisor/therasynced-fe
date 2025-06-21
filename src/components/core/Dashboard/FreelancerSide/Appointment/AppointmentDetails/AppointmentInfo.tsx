import { format } from 'date-fns';
import { Clock, MapPin, User } from 'lucide-react';

import { Appointment } from '@/types/types';

interface AppointmentInfoProps {
  appointment: Appointment;
}

export const AppointmentInfo = ({ appointment }: AppointmentInfoProps) => {
  return (
    <div className="grid gap-4">
      <div className="flex items-center gap-3 text-sm">
        <Clock className="h-5 w-5 text-muted-foreground" />
        <div>
          <p className="font-medium">Time</p>
          <p className="text-muted-foreground">
            {format(new Date(appointment.start), 'h:mm a')} -{' '}
            {format(new Date(appointment.end), 'h:mm a')}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3 text-sm">
        <MapPin className="h-5 w-5 text-muted-foreground" />
        <div>
          <p className="font-medium">Location</p>
          <p className="text-muted-foreground">{appointment.location}</p>
        </div>
      </div>
      <div className="flex items-center gap-3 text-sm">
        <User className="h-5 w-5 text-muted-foreground" />
        <div>
          <p className="font-medium">Client</p>
          <p className="text-muted-foreground">{appointment.clientName}</p>
        </div>
      </div>
    </div>
  );
};
