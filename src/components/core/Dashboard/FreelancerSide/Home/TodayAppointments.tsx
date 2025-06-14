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
      return 'bg-green-100 text-green-700';
    case 'cancelled':
      return 'bg-red-100 text-red-700';
    case 'upcoming':
      return 'bg-blue-100 text-blue-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

const AppointmentCard = ({ appointment }: { appointment: (typeof appointments)[0] }) => {
  return (
    <div className="bg-white/80 backdrop-blur-sm border border-gray-200/80 rounded-lg lg:rounded-xl p-4 lg:p-5 hover:shadow-md transition-all duration-200">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 lg:gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 lg:h-5 lg:w-5 text-gray-500" />
            <h3 className="text-sm lg:text-base font-medium text-gray-900">
              {appointment.clientName}
            </h3>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Clock className="h-4 w-4 lg:h-5 lg:w-5 text-gray-500" />
            <p className="text-xs lg:text-sm text-gray-600">
              {appointment.time} ({appointment.duration})
            </p>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <MapPin className="h-4 w-4 lg:h-5 lg:w-5 text-gray-500" />
            <p className="text-xs lg:text-sm text-gray-600">{appointment.location}</p>
          </div>
        </div>
        <div className="flex items-center justify-between lg:justify-end gap-2">
          <span
            className={`px-2.5 py-1 rounded-full text-xs lg:text-sm font-medium ${getStatusColor(
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

const TodayAppointments = () => {
  return (
    <Card className="w-full border border-gray-200/80 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] backdrop-blur-sm bg-white/80 rounded-xl lg:rounded-2xl">
      <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-gray-50/80 to-white px-4 lg:px-5 py-4 lg:py-5">
        <CardTitle className="text-base lg:text-lg font-semibold text-gray-800">
          Today&apos;s Appointments
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 lg:p-5">
        <div className="space-y-3 lg:space-y-4">
          {appointments.map((appointment) => (
            <AppointmentCard key={appointment.id} appointment={appointment} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TodayAppointments;
