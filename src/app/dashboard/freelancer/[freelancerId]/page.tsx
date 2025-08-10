'use client';

import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { DashboardPageWrapper } from '@/components/core/Dashboard/DashboardPageWrapper';
import MyBookingHome from '@/components/core/Dashboard/UserSide/MyBookings/MyBookingHome';
import { Button } from '@/components/ui/button';

const Page = () => {
  const router = useRouter();

  // Check for reschedule params in search params
  const searchParams =
    typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const rescheduleBookingId = searchParams?.get('rescheduleBookingId');

  const handleBack = () => {
    // Check if we came from a specific page
    const referrer = document.referrer;
    const currentHost = window.location.origin;

    if (referrer && referrer.startsWith(currentHost)) {
      // If we came from within the same site, go back
      router.back();
    } else {
      // If no referrer or from external site, go to explore page
      router.push('/dashboard/explore');
    }
  };

  return (
    <DashboardPageWrapper
      header={
        <Button variant="ghost" className="flex items-center w-fit mb-6" onClick={handleBack}>
          <ChevronLeft className="mr-1" /> Back
        </Button>
      }
    >
      <MyBookingHome rescheduleBookingId={rescheduleBookingId} />
    </DashboardPageWrapper>
  );
};

export default Page;
