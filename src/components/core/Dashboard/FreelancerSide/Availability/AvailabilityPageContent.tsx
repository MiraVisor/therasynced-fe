'use client';

import { useState } from 'react';

import { DurationPricingSection } from '@/components/core/Dashboard/FreelancerSide/Pricing/DurationPricingSection';
import { ServicePricingSection } from '@/components/core/Dashboard/FreelancerSide/Pricing/ServicePricingSection';
import { CreateSlotWizard } from '@/components/core/Dashboard/FreelancerSide/SlotManagement/CreateSlotWizard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { BlockedDatesSection } from './BlockedDatesSection';
import { BookingPagePreview } from './BookingPagePreview';

export const AvailabilityPageContent = () => {
  const [activeTab, setActiveTab] = useState<'pricing' | 'slots'>('pricing');

  const handleSlotCreateSuccess = () => {
    // Optionally switch to a different tab or show success message
    // React Query will automatically refetch slots
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'pricing' | 'slots')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="slots">Slots Management</TabsTrigger>
        </TabsList>

        <TabsContent value="pricing" className="space-y-6 mt-6">
          <div className="space-y-6">
            <ServicePricingSection />
            <DurationPricingSection />
          </div>
        </TabsContent>

        <TabsContent value="slots" className="space-y-6 mt-6">
          {/* Create Slots Section */}
          <Card>
            <CardHeader>
              <CardTitle>Create Slots</CardTitle>
              <CardDescription>
                Select your available days and configure time slots for each day. Slots will be
                generated for the next 3 months. Pricing will be automatically calculated based on
                your pricing settings.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CreateSlotWizard onSuccess={handleSlotCreateSuccess} />
            </CardContent>
          </Card>

          {/* Booking Page Preview */}
          <BookingPagePreview />

          {/* Blocked Dates Section */}
          <BlockedDatesSection />
        </TabsContent>
      </Tabs>
    </div>
  );
};
