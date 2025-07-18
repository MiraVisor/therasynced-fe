import React from 'react';

export type AppointmentStatus = 'in-progress' | 'scheduled' | 'cancelled';

interface AppointmentCardProps {
  name: string;
  time: string;
  condition: string;
  status: AppointmentStatus;
}

export const AppointmentCard: React.FC<AppointmentCardProps> = ({
  name,
  time,
  condition,
  status,
}) => {
  const statusClasses = {
    'in-progress': 'bg-green-100 text-green-700',
    scheduled: 'bg-gray-200 text-gray-700',
    cancelled: 'bg-red-100 text-red-700',
  };

  const statusLabels = {
    'in-progress': 'In progress',
    scheduled: 'Scheduled',
    cancelled: 'Cancelled',
  };

  return (
    <div className="flex items-center justify-between py-4 border-b border-gray-100 last:border-none">
      <div>
        <h4 className="font-medium text-sm">{name}</h4>
        <p className="text-xs text-gray-500">
          {time} | {condition}
        </p>
      </div>
      <span className={`px-3 py-1.5 text-xs rounded-md ${statusClasses[status]}`}>
        {statusLabels[status]}
      </span>
    </div>
  );
};
