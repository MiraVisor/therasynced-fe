'use client';

import { ArrowLeft } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { DashboardPageWrapper } from '@/components/core/Dashboard/DashboardPageWrapper';
import { SlotFormsTab } from '@/components/core/Dashboard/FreelancerSide/SlotManagement/SlotFormsTab';
import { SlotInfoTab } from '@/components/core/Dashboard/FreelancerSide/SlotManagement/SlotInfoTab';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSlotById } from '@/hooks/queries/useSlots';
import { useAuthStore } from '@/stores/authStore';

export default function SlotDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { role } = useAuthStore();
  const slotId = params.slotId as string;

  // Use React Query hook
  const { data: slot, isLoading } = useSlotById(slotId);

  useEffect(() => {
    // If slot not found and not loading, redirect back to slots list
    if (!isLoading && !slot) {
      router.push('/dashboard/slots');
    }
  }, [slot, isLoading, router]);

  if (isLoading) {
    return (
      <DashboardPageWrapper
        userRole={role}
        header={
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/dashboard/slots')}
              className="font-inter"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h2 className="text-2xl font-poppins font-bold text-charcoal">Slot Details</h2>
          </div>
        }
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardPageWrapper>
    );
  }

  if (!slot) {
    return (
      <DashboardPageWrapper
        userRole={role}
        header={
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/dashboard/slots')}
              className="font-inter"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h2 className="text-2xl font-poppins font-bold text-charcoal">Slot Details</h2>
          </div>
        }
      >
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <p className="text-lg font-inter text-muted-foreground">Slot not found</p>
          <Button onClick={() => router.push('/dashboard/slots')} className="font-inter">
            Return to Slots
          </Button>
        </div>
      </DashboardPageWrapper>
    );
  }

  return (
    <DashboardPageWrapper
      userRole={role}
      header={
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/dashboard/slots')}
            className="font-inter"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h2 className="text-2xl font-poppins font-bold text-charcoal">Slot Details</h2>
        </div>
      }
    >
      <div className="space-y-6">
        <Tabs defaultValue="info" className="w-full">
          <TabsList className="font-inter h-12 gap-2 p-1">
            <TabsTrigger value="info" className="px-6 py-2.5 text-base font-semibold">
              Info
            </TabsTrigger>
            <TabsTrigger value="forms" className="px-6 py-2.5 text-base font-semibold">
              Forms
            </TabsTrigger>
          </TabsList>
          <TabsContent value="info" className="mt-6">
            <SlotInfoTab slot={slot} />
          </TabsContent>
          <TabsContent value="forms" className="mt-6">
            <SlotFormsTab slot={slot} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardPageWrapper>
  );
}
