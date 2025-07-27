'use client';

import { useSearchParams } from 'next/navigation';

import { DashboardPageWrapper } from '@/components/core/Dashboard/DashboardPageWrapper';
import MyBookingHome from '@/components/core/Dashboard/UserSide/MyBookings/MyBookingHome';

const Page = () => {
  const searchParams = useSearchParams();
  const rescheduleBookingId = searchParams.get('rescheduleBookingId');

  return (
    <DashboardPageWrapper>
      <MyBookingHome rescheduleBookingId={rescheduleBookingId} />
    </DashboardPageWrapper>
  );
};

export default Page;
