import { format } from 'date-fns';

import { Badge } from '@/components/ui/badge';
import { CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Appointment } from '@/types/types';

interface AppointmentHeaderProps {
  appointment: Appointment;
}

const statusColors = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
} as const;

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

export const AppointmentHeader = ({ appointment }: AppointmentHeaderProps) => {
  return (
    <CardHeader className="space-y-4 pb-4">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <CardTitle className="text-2xl font-bold">{appointment.title}</CardTitle>
          <CardDescription className="text-base">
            {format(new Date(appointment.start), 'EEEE, MMMM d, yyyy')}
          </CardDescription>
        </div>
        <Badge
          variant="secondary"
          className={`text-sm font-medium ${statusColors[appointment.status as keyof typeof statusColors]}`}
        >
          {getStatusLabel(appointment.status as 'PENDING' | 'COMPLETED' | 'CANCELLED')}
        </Badge>
      </div>
      <Separator />
    </CardHeader>
  );
};
