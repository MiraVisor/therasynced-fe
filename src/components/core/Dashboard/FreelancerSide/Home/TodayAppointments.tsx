import { Clock, MapPin, User } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const appointments = [
  {
    id: 1,
    clientName: 'Sarah Johnson',
    time: '09:00 AM',
    duration: '45 min',
    location: 'Online Session',
    status: 'cancelled',
  },
  {
    id: 2,
    clientName: 'Michael Brown',
    time: '10:30 AM',
    duration: '60 min',
    location: 'Office',
    status: 'upcoming',
  },
  {
    id: 3,
    clientName: 'Emma Wilson',
    time: '02:00 PM',
    duration: '45 min',
    location: 'Online Session',
    status: 'completed',
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'bg-success/10 text-success border border-success/20';
    case 'cancelled':
      return 'bg-error/10 text-error border border-error/20';
    case 'upcoming':
      return 'bg-info/10 text-info border border-info/20';
    default:
      return 'bg-muted text-muted-foreground border border-muted';
  }
};

const AppointmentCard = ({ appointment }: { appointment: (typeof appointments)[0] }) => {
  return (
    <div className="bg-gradient-to-br from-mint/30 to-white backdrop-blur-sm border border-sage/30 rounded-xl p-4">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <User className="h-4 w-4 text-charcoal" />
            <h3 className="text-sm font-poppins font-semibold text-charcoal">
              {appointment.clientName}
            </h3>
          </div>
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
            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
          </span>
        </div>
      </div>
    </div>
  );
};

const TodayAppointments = ({ isLoading }: { isLoading?: boolean }) => {
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
    <>
      <Card className="w-full border border-gray-200/80 shadow-soft backdrop-blur-sm bg-white/80 rounded-2xl">
        <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-mint/30 to-white px-5 py-5">
          <CardTitle className="text-lg font-poppins font-semibold text-charcoal">
            Today&apos;s Appointments
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <div className="space-y-3">
            {appointments.map((appointment) => (
              <AppointmentCard key={appointment.id} appointment={appointment} />
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default TodayAppointments;
