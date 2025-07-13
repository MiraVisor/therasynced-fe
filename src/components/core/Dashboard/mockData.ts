import { AppointmentStatus } from './AdminSide/Cards/AppointmentCard';

// Mock data for the admin dashboard
export const mockStatsData = [
  {
    title: 'Total Users',
    value: '4068',
    trend: {
      value: 8.5,
      isUp: true,
      timeframe: 'yesterday',
    },
    iconName: 'users',
  },
  {
    title: 'Active Clients',
    value: '1029',
    trend: {
      value: 1.3,
      isUp: true,
      timeframe: 'past week',
    },
    iconName: 'clients',
  },
  {
    title: 'Sessions This Month',
    value: '$89,000',
    trend: {
      value: 4.3,
      isUp: false,
      timeframe: 'yesterday',
    },
    iconName: 'calendar',
  },
  {
    title: 'Revenue',
    value: '$13,400',
    trend: {
      value: 1.8,
      isUp: true,
      timeframe: 'last month',
    },
    iconName: 'money',
  },
];

export const mockApplicationsData = [
  {
    id: 1,
    name: 'Sarah Johnson',
    specialty: 'Physiotherapist',
  },
  {
    id: 2,
    name: 'Sarah Johnson',
    specialty: 'Physiotherapist',
  },
  {
    id: 3,
    name: 'Sarah Johnson',
    specialty: 'Physiotherapist',
  },
];

export const mockAppointmentsData = [
  {
    id: 1,
    name: 'Sarah Johnson',
    time: '9:00 am',
    condition: 'Back Pain',
    status: 'in-progress' as AppointmentStatus,
  },
  {
    id: 2,
    name: 'Sarah Johnson',
    time: '9:00 am',
    condition: 'Back Pain',
    status: 'scheduled' as AppointmentStatus,
  },
  {
    id: 3,
    name: 'Sarah Johnson',
    time: '9:00 am',
    condition: 'Back Pain',
    status: 'cancelled' as AppointmentStatus,
  },
];

export const mockChartData = {
  month: 'October',
};
