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
  months: ['October', 'September', 'November', 'December'],
  data: {
    October: {
      xLabels: ['5k', '10k', '15k', '20k', '25k', '30k', '35k', '40k', '45k', '50k', '55k', '60k'],
      profitData: [20, 65, 40, 50, 35, 60, 30, 45, 55, 40, 70, 20],
      lossData: [20, 30, 25, 35, 60, 40, 80, 50, 60, 55, 40, 30],
    },
    September: {
      xLabels: ['5k', '10k', '15k', '20k', '25k', '30k', '35k', '40k', '45k', '50k', '55k', '60k'],
      profitData: [20, 60, 40, 55, 35, 50, 30, 60, 55, 40, 70, 20],
      lossData: [20, 30, 25, 40, 60, 60, 80, 40, 60, 65, 40, 30],
    },
    November: {
      xLabels: ['5k', '10k', '15k', '20k', '25k', '30k', '35k', '40k', '45k', '50k', '55k', '60k'],
      profitData: [30, 55, 45, 60, 40, 55, 35, 50, 60, 45, 65, 25],
      lossData: [25, 35, 30, 45, 65, 45, 85, 55, 65, 60, 45, 35],
    },
    December: {
      xLabels: ['5k', '10k', '15k', '20k', '25k', '30k', '35k', '40k', '45k', '50k', '55k', '60k'],
      profitData: [25, 70, 50, 60, 45, 65, 40, 55, 65, 50, 75, 30],
      lossData: [30, 40, 35, 50, 70, 50, 90, 60, 70, 75, 50, 40],
    },
  },
  defaultMonth: 'October',
};
