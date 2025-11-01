import { Clock, MapPin, User } from 'lucide-react';
import { useState } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const sessions = [
  {
    id: 1,
    freelancerName: 'Dr. Sarah Johnson',
    time: '09:00 AM',
    duration: '45 min',
    location: 'Online Session',
    status: 'upcoming',
  },
  {
    id: 2,
    freelancerName: 'Dr. Michael Brown',
    time: '10:30 AM',
    duration: '60 min',
    location: 'Clinic',
    status: 'upcoming',
  },
  {
    id: 3,
    freelancerName: 'Dr. Emma Wilson',
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

const SessionCard = ({
  session,
  onClick,
}: {
  session: (typeof sessions)[0];
  onClick: () => void;
}) => {
  return (
    <div
      onClick={onClick}
      className="bg-gradient-to-br from-mint/30 to-white backdrop-blur-sm border border-sage/30 rounded-xl p-4 hover:shadow-soft hover:border-primary/30 transition-all duration-200 cursor-pointer"
    >
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <User className="h-4 w-4 text-charcoal" />
            <h3 className="text-sm font-poppins font-semibold text-charcoal">
              {session.freelancerName}
            </h3>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <p className="text-xs font-inter text-muted-foreground">
              {session.time} ({session.duration})
            </p>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <p className="text-xs font-inter text-muted-foreground">{session.location}</p>
          </div>
        </div>
        <div className="flex items-center justify-between lg:justify-end gap-2">
          <span
            className={`px-3 py-1 rounded-lg text-xs font-inter font-semibold ${getStatusColor(
              session.status,
            )}`}
          >
            {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
          </span>
        </div>
      </div>
    </div>
  );
};

const UpcomingSessionsList = () => {
  const [selectedSession, setSelectedSession] = useState<(typeof sessions)[0] | null>(null);

  const handleViewDetails = (session: (typeof sessions)[0]) => {
    setSelectedSession(session);
  };

  const handleCloseDialog = () => {
    setSelectedSession(null);
  };

  return (
    <>
      <Card className="w-full border border-gray-200/80 shadow-soft backdrop-blur-sm bg-white/80 rounded-2xl">
        <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-mint/30 to-white px-5 py-5">
          <CardTitle className="text-lg font-poppins font-semibold text-charcoal">
            Today&apos;s Sessions
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <div className="space-y-3">
            {sessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                onClick={() => handleViewDetails(session)}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default UpcomingSessionsList;
