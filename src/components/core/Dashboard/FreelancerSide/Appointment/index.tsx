'use client';

import { addHours, setHours, setMinutes } from 'date-fns';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { DashboardPageWrapper } from '@/components/core/Dashboard/DashboardPageWrapper';
import { setAppointments } from '@/redux/slices/appointmentSlice';
import { Appointment } from '@/types/types';

import FreelancerAppointments from './FreelancerAppointments';

const generateMonthlyAppointments = (month: number, year: number): Appointment[] => {
  const appointments: Appointment[] = [];
  const statuses: Appointment['status'][] = ['PENDING', 'COMPLETED', 'CANCELLED'];
  const locations = ['Online', 'Office', 'Client Location'];
  const clients = ['John Smith', 'Sarah Johnson', 'Michael Brown', 'Emily Davis', 'David Wilson'];
  const titles = [
    'Initial Consultation',
    'Follow-up Session',
    'Group Therapy',
    'Emergency Session',
    'Progress Review',
  ];

  // Generate 5 appointments for the month
  for (let i = 0; i < 5; i++) {
    const day = Math.floor(Math.random() * 28) + 1;
    const hour = Math.floor(Math.random() * 8) + 9;
    const startDate = setMinutes(setHours(new Date(year, month, day), hour), 0);
    const endDate = addHours(startDate, 1);

    appointments.push({
      id: `app-${year}-${month}-${i}`,
      title: `${titles[i]} - ${clients[i]}`,
      start: startDate.toISOString(),
      end: endDate.toISOString(),
      status: statuses[Math.floor(Math.random() * statuses.length)],
      location: locations[Math.floor(Math.random() * locations.length)],
      clientName: clients[i],
      notes: `Scheduled ${titles[i].toLowerCase()} with ${clients[i]}`,
    });
  }

  return appointments;
};

const Appointments = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const allAppointments = [
      ...generateMonthlyAppointments(4, 2025),
      ...generateMonthlyAppointments(5, 2025),
      ...generateMonthlyAppointments(6, 2025),
    ];

    dispatch(setAppointments(allAppointments));
  }, [dispatch]);

  return (
    <DashboardPageWrapper header={<h2 className="text-xl font-semibold">Appointments</h2>}>
      <div className="h-[100px]">
        <FreelancerAppointments />
      </div>
    </DashboardPageWrapper>
  );
};

export default Appointments;
