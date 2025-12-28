'use client';

import { DashboardPageWrapper } from '@/components/core/Dashboard/DashboardPageWrapper';
import { AvailabilityPageContent } from '@/components/core/Dashboard/FreelancerSide/Availability/AvailabilityPageContent';
import { useAuth } from '@/hooks/useAuthZustand';

const AvailabilityPage = () => {
  const { role } = useAuth();

  return (
    <DashboardPageWrapper
      userRole={role}
      header={
        <div className="flex flex-col gap-2 w-full">
          <div>
            <h2 className="text-2xl font-poppins font-bold text-charcoal">
              Availability & Pricing
            </h2>
            <p className="font-inter text-muted-foreground mt-1">
              Set your pricing and create available time slots
            </p>
          </div>
        </div>
      }
    >
      <AvailabilityPageContent />
    </DashboardPageWrapper>
  );
};

export default AvailabilityPage;
