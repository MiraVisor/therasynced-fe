'use client';

import { useParams, useSearchParams } from 'next/navigation';

import { DashboardPageWrapper } from '@/components/core/Dashboard/DashboardPageWrapper';
import MyBookingHome from '@/components/core/Dashboard/UserSide/MyBookings/MyBookingHome';

const Page = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const rescheduleBookingId = searchParams.get('rescheduleBookingId');

  // Debug logging
  console.log('Doctor page - rescheduleBookingId:', rescheduleBookingId);
  console.log('Doctor page - params:', params);

  return (
    <DashboardPageWrapper>
      <MyBookingHome rescheduleBookingId={rescheduleBookingId} />
    </DashboardPageWrapper>
  );
};

export default Page;
