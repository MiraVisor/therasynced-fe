import React, { useState } from 'react';

import { Calendar } from '@/components/ui/calendar';
import { Expert } from '@/types/types';

import { DashboardPageWrapper } from '../../DashboardPageWrapper';
import ExpertCard from '../Overview/ExpertCard';
import { AppointmentCard } from './AppointmentCard';
import { MessageSection } from './MessageSection';

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

  const handleReschedule = () => {
    // Implement reschedule logic
  };

  const handleCancel = () => {
    // Implement cancel logic
  };

  const handleSendMessage = () => {
    // Implement send message logic
  };

  return (
    <DashboardPageWrapper
      header={
        <h2 className="text-xl font-semibold">
          Hi Nadeem! 👋{' '}
          <span className="text-green-600">Here&apos;s what&apos;s happening today.</span>
        </h2>
      }
    >
      <div className="flex flex-col gap-6">
        {/* Top Grid: Favorite + Appointment */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Favorite Expert Section */}
          <section className="lg:col-span-4">
            <ExpertCard {...selectedAppointment.expert} showFavoriteText={true} />
          </section>

          {/* Appointment Section */}
          <section className="lg:col-span-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-100 dark:border-gray-700 min-h-[375px]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="border border-gray-100 dark:border-gray-700 rounded-xl p-4 bg-white dark:bg-gray-800 shadow-sm ">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="rounded-xl"
                  />
                </div>
                <AppointmentCard
                  expert={selectedAppointment.expert}
                  date={selectedAppointment.date}
                  time={selectedAppointment.time}
                  status={selectedAppointment.status}
                  onReschedule={handleReschedule}
                  onCancel={handleCancel}
                />
              </div>
            </div>
          </section>
        </div>

        {/* Messages Section */}
        <section className="mt-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-6">Messages</h3>
            <MessageSection expert={selectedAppointment.expert} onSendMessage={handleSendMessage} />
          </div>
        </section>
      </div>
    </DashboardPageWrapper>
  );
};

export default UserExploreMain;
