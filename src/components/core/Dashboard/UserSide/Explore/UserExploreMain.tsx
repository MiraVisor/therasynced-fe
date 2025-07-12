import React, { useMemo, useState } from 'react';

import { Expert } from '@/types/types';

import { DashboardPageWrapper } from '../../DashboardPageWrapper';
import ExpertCard from '../Overview/ExpertCard';
import AppointmentCalendar from './AppointmentCalendar';
import { AppointmentCard } from './AppointmentCard';
import MessageSection from './MessageSection';

interface Appointment {
  expert: Expert;
  date: Date;
  time: string;
  status: 'confirmed' | 'pending';
}

const UserExploreMain = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedAppointment] = useState<Appointment>({
    expert: {
      id: '1',
      name: 'Dr Lee Marshall',
      specialty: 'message therapy',
      experience: '7+ Years of Experience',
      rating: 4,
      description:
        'Experienced in deep tissue and relaxation therapy, Dr Lee helps you unwind, relieve pain, and feel your best.',
      isFavorite: true,
    },
    date: new Date('2025-04-26'),
    time: '11:58',
    status: 'confirmed',
  });

  // Multiple appointments sample data
  const [allAppointments] = useState<Appointment[]>([
    {
      expert: {
        id: '1',
        name: 'Dr Lee Marshall',
        specialty: 'message therapy',
        rating: 4,
        experience: '7+ Years of Experience',
        description: 'Experienced in deep tissue and relaxation therapy.',
        isFavorite: true,
      },
      date: new Date('2025-07-10'),
      time: '10:30',
      status: 'confirmed',
    },
    {
      expert: {
        id: '2',
        name: 'Dr Emily Stone',
        specialty: 'physical therapy',
        rating: 5,
        experience: '10+ Years of Experience',
        description: 'Specializes in sports injuries and rehabilitation.',
        isFavorite: false,
      },
      date: new Date('2025-07-10'),
      time: '14:45',
      status: 'confirmed',
    },
    {
      expert: {
        id: '3',
        name: 'Dr John Smith',
        specialty: 'chiropractic',
        rating: 4,
        experience: '8+ Years of Experience',
        description: 'Expert in spinal adjustments and posture correction.',
        isFavorite: true,
      },
      date: new Date('2025-07-10'),
      time: '17:15',
      status: 'pending',
    },
    {
      expert: {
        id: '4',
        name: 'Dr Sarah Johnson',
        specialty: 'acupuncture',
        rating: 5,
        experience: '12+ Years of Experience',
        description: 'Specializes in pain management and stress relief.',
        isFavorite: false,
      },
      date: new Date('2025-07-15'),
      time: '09:00',
      status: 'confirmed',
    },
    // More appointments on other dates
    {
      expert: {
        id: '5',
        name: 'Dr Michael Chen',
        specialty: 'physical therapy',
        rating: 4,
        experience: '9+ Years of Experience',
        description: 'Focuses on post-surgery rehabilitation.',
        isFavorite: false,
      },
      date: new Date('2025-07-18'),
      time: '11:30',
      status: 'confirmed',
    },
  ]);

  const handleReschedule = () => {
    // Implement reschedule logic
  };

  const handleCancel = () => {
    // Implement cancel logic
  };

  const handleSendMessage = () => {
    // Implement send message logic
  };
  const appointmentsForCalendar = useMemo(
    () => allAppointments.map((apt) => ({ date: apt.date })),
    [allAppointments],
  );
  return (
    <DashboardPageWrapper
      header={
        <h2 className="text-xl font-semibold">
          Hi Nadeem! 👋{' '}
          <span className="text-green-600">Here&apos;s what&apos;s happening today.</span>
        </h2>
      }
    >
      <div className="flex flex-col gap-4">
        {/* Top Grid: Favorite + Appointment */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Favorite Expert Section */}
          <section className="lg:col-span-4">
            <ExpertCard {...selectedAppointment.expert} showFavoriteText={true} />
          </section>

          {/* Appointment Section */}
          <section className="lg:col-span-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl px-3 sm:px-4 py-3 shadow-md border border-gray-100 dark:border-gray-700 min-h-[350px] h-auto lg:h-[410px] relative overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                <div className="w-full">
                  <AppointmentCalendar
                    selectedDate={date || new Date()}
                    onDateChange={setDate}
                    appointments={appointmentsForCalendar}
                  />
                </div>

                <div className="w-full">
                  <AppointmentCard
                    expert={selectedAppointment.expert}
                    date={selectedAppointment.date}
                    time={selectedAppointment.time}
                    status={selectedAppointment.status}
                    onReschedule={handleReschedule}
                    onCancel={handleCancel}
                    allAppointments={allAppointments}
                    selectedDate={date}
                  />
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Messages Section */}
        <section>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 relative">
            <div className="px-6 py-3 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-semibold">Messages</h3>
            </div>
            <div className="py-0 px-1">
              <MessageSection />
            </div>
          </div>
        </section>
      </div>
    </DashboardPageWrapper>
  );
};

export default UserExploreMain;
