'use client';

import { DashboardPageWrapper } from '@/components/core/Dashboard/DashboardPageWrapper';

import MessageSection from './Explore/MessageSection';

export default function PatientMessagesPage() {
  return (
    <DashboardPageWrapper header={<h2 className="text-xl font-semibold">Messages</h2>}>
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-100 dark:border-gray-700">
        <MessageSection />
      </div>
    </DashboardPageWrapper>
  );
}
