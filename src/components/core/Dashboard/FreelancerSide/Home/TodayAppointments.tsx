import { format } from 'date-fns';
import { Calendar, Clock, MapPin, User } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTodayBookingsFreelancer } from '@/hooks/queries/useBookings';
import { LocationType } from '@/types/enums';
import { Booking } from '@/types/types';

interface AppointmentDisplay {
  id: string;
  clientName: string;
  time: string;
  duration: string;
  location: string;
  locationType: string;
  status: string;
  serviceName?: string;
  startTime: Date;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'COMPLETED':
      return 'bg-success/10 text-success border border-success/20';
    case 'CANCELLED':
      return 'bg-error/10 text-error border border-error/20';
    case 'CONFIRMED':
      return 'bg-info/10 text-info border border-info/20';
    case 'RESCHEDULED':
      return 'bg-warning/10 text-warning border border-warning/20';
    default:
      return 'bg-muted text-muted-foreground border border-muted';
  }
};

const formatStatus = (status: string): string => {
  switch (status) {
    case 'COMPLETED':
      return 'Completed';
    case 'CANCELLED':
      return 'Cancelled';
    case 'CONFIRMED':
      return 'Confirmed';
    case 'RESCHEDULED':
      return 'Rescheduled';
    default:
      return status;
  }
};

const formatLocation = (locationType: string): string => {
  switch (locationType) {
    case LocationType.CLINIC:
      return 'Clinic';
    case LocationType.HOME:
      return 'Home Visit';
    default:
      return 'Online Session';
  }
};

const AppointmentCard = ({ appointment }: { appointment: AppointmentDisplay }) => {
  return (
    <div className="bg-gradient-to-br from-mint/30 to-white backdrop-blur-sm border border-sage/30 rounded-xl p-4 hover:shadow-md transition-shadow duration-200">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <User className="h-4 w-4 text-charcoal" />
            <h3 className="text-sm font-poppins font-semibold text-charcoal">
              {appointment.clientName}
            </h3>
          </div>
          {appointment.serviceName && (
            <div className="text-xs font-inter text-muted-foreground mb-2">
              {appointment.serviceName}
            </div>
          )}
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <p className="text-xs font-inter text-muted-foreground">
              {appointment.time} ({appointment.duration})
            </p>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <p className="text-xs font-inter text-muted-foreground">{appointment.location}</p>
          </div>
        </div>
        <div className="flex items-center justify-between lg:justify-end gap-2">
          <span
            className={`px-3 py-1 rounded-lg text-xs font-inter font-semibold ${getStatusColor(
              appointment.status,
            )}`}
          >
            {formatStatus(appointment.status)}
          </span>
        </div>
      </div>
    </div>
  );
};

const TodayAppointments = () => {
  const { data: bookings = [], isLoading } = useTodayBookingsFreelancer();

  // Transform bookings to display format
  const appointments: AppointmentDisplay[] = bookings
    .filter((booking: Booking) => {
      // Only show confirmed and completed bookings for today
      const bookingDate = new Date(booking.slot.startTime);
      const today = new Date();
      const isToday =
        bookingDate.getDate() === today.getDate() &&
        bookingDate.getMonth() === today.getMonth() &&
        bookingDate.getFullYear() === today.getFullYear();
      return isToday && (booking.status === 'CONFIRMED' || booking.status === 'COMPLETED');
    })
    .sort((a: Booking, b: Booking) => {
      // Sort by start time
      return new Date(a.slot.startTime).getTime() - new Date(b.slot.startTime).getTime();
    })
    .slice(0, 3) // Show only next 3 appointments
    .map((booking: Booking) => {
      const startTime = new Date(booking.slot.startTime);
      const endTime = new Date(booking.slot.endTime);
      const durationMinutes = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));

      const serviceName =
        booking.serviceCategories && booking.serviceCategories.length > 0
          ? booking.serviceCategories.map((sc) => sc.name).join(', ')
          : undefined;

      return {
        id: booking.id,
        clientName: booking.client.name,
        time: format(startTime, 'h:mm a'),
        duration: `${durationMinutes} min`,
        location: formatLocation(booking.slot.locationType),
        locationType: booking.slot.locationType,
        status: booking.status,
        serviceName,
        startTime,
      };
    });

  if (isLoading) {
    return (
      <Card className="w-full border border-gray-200/80 shadow-soft backdrop-blur-sm bg-white/80 rounded-2xl">
        <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-mint/30 to-white px-5 py-5">
          <div className="h-6 bg-gray-200 dark:bg-gray-700/30 rounded w-1/3 mb-2" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700/20 rounded w-1/2" />
        </CardHeader>
        <CardContent className="p-5">
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="bg-gradient-to-br from-mint/30 to-white backdrop-blur-sm border border-sage/30 rounded-xl p-4 overflow-hidden relative"
              >
                <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700/60 rounded" />
                      <div className="h-3 bg-gray-200 dark:bg-gray-700/60 rounded w-16" />
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700/60 rounded" />
                      <div className="h-3 bg-gray-200 dark:bg-gray-700/60 rounded w-12" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between lg:justify-end gap-2">
                    <div className="px-3 py-1 bg-gray-200 dark:bg-gray-700/30 rounded-lg overflow-hidden relative">
                      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                      <div className="h-4 bg-gray-200 dark:bg-gray-700/30 rounded w-16" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full border border-gray-200/80 shadow-soft backdrop-blur-sm bg-white/80 rounded-2xl">
      <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-mint/30 to-white px-5 py-5">
        <CardTitle className="text-lg font-poppins font-semibold text-charcoal">
          Today&apos;s Appointments
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5">
        {appointments.length > 0 ? (
          <div className="space-y-3">
            {appointments.map((appointment) => (
              <AppointmentCard key={appointment.id} appointment={appointment} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Calendar className="w-8 h-8 text-gray-400" />
            </div>
            <p className="font-poppins text-charcoal font-medium mb-1">No appointments today</p>
            <p className="text-sm font-inter text-muted-foreground mb-4">
              Your calendar is clear. Share your profile to get your first booking.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                window.location.href = '/dashboard/slots';
              }}
            >
              Create Availability
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TodayAppointments;
