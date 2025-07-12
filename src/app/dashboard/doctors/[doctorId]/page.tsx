'use client';

import { ChevronLeft } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import React from 'react';

import { DashboardPageWrapper } from '@/components/core/Dashboard/DashboardPageWrapper';
import MyBookingHome from '@/components/core/Dashboard/UserSide/MyBookings/MyBookingHome';
import { Button } from '@/components/ui/button';

const Page = () => {
  const router = useRouter();
  const params = useParams();
  const doctorId = params.doctorId;
  // Check for reschedule params in search params
  const searchParams =
    typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const rescheduleBookingId = searchParams?.get('rescheduleBookingId');

  return (
    <DashboardPageWrapper
      header={
        <Button
          variant="ghost"
          className="flex items-center w-fit mb-6"
          onClick={() => router.push('/dashboard/')}
        >
          <ChevronLeft className="mr-1" /> Book Appointment
        </Button>
      }
    >
      <MyBookingHome rescheduleBookingId={rescheduleBookingId} />
    </DashboardPageWrapper>
  );
};

export default Page;
