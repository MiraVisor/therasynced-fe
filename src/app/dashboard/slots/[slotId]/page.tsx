'use client';

import { ArrowLeft } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import { DashboardPageWrapper } from '@/components/core/Dashboard/DashboardPageWrapper';
import { SlotFormsTab } from '@/components/core/Dashboard/FreelancerSide/SlotManagement/SlotFormsTab';
import { SlotInfoTab } from '@/components/core/Dashboard/FreelancerSide/SlotManagement/SlotInfoTab';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RootState } from '@/redux/store';
import { Slot } from '@/types/types';

export default function SlotDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slotId = params?.slotId as string;

  const { slots } = useSelector((state: RootState) => state.slot);
  const [slot, setSlot] = useState<Slot | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (slotId && slots.length > 0) {
      // Find slot from Redux state
      const foundSlot = slots.find((s) => s.id === slotId);
      if (foundSlot) {
        setSlot(foundSlot);
        setIsLoading(false);
      } else {
        // If not found in Redux, try localStorage (for POC)
        const storedSlots = localStorage.getItem('slots');
        if (storedSlots) {
          try {
            const parsedSlots = JSON.parse(storedSlots);
            const foundStoredSlot = parsedSlots.find((s: Slot) => s.id === slotId);
            if (foundStoredSlot) {
              setSlot(foundStoredSlot);
              setIsLoading(false);
              return;
            }
          } catch (error) {
            console.error('Error parsing stored slots:', error);
          }
        }
        setIsLoading(false);
      }
    } else if (slotId) {
      // If no slots in Redux yet, check localStorage
      const storedSlots = localStorage.getItem('slots');
      if (storedSlots) {
        try {
          const parsedSlots = JSON.parse(storedSlots);
          const foundSlot = parsedSlots.find((s: Slot) => s.id === slotId);
          if (foundSlot) {
            setSlot(foundSlot);
          }
        } catch (error) {
          console.error('Error parsing stored slots:', error);
        }
      }
      setIsLoading(false);
    }
  }, [slotId, slots]);

  const handleBack = () => {
    router.push('/dashboard/slots');
  };

  if (isLoading) {
    return (
      <DashboardPageWrapper>
        <div className="flex items-center justify-center h-[400px]">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardPageWrapper>
    );
  }

  if (!slot) {
    return (
      <DashboardPageWrapper>
        <div className="space-y-4">
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Slots
          </Button>
          <div className="text-center py-12">
            <p className="text-gray-600">Slot not found</p>
          </div>
        </div>
      </DashboardPageWrapper>
    );
  }

  return (
    <DashboardPageWrapper
      header={
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Slot Details</h1>
            <p className="text-gray-600">Slot ID: {slot.id}</p>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="info" className="font-inter text-sm font-medium">
              Info
            </TabsTrigger>
            <TabsTrigger value="forms" className="font-inter text-sm font-medium">
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
