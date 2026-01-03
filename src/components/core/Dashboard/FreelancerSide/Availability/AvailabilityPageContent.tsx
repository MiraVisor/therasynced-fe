'use client';

import { Calendar, Clock, DollarSign, TrendingUp } from 'lucide-react';
import { useMemo, useState } from 'react';

import { DurationPricingSection } from '@/components/core/Dashboard/FreelancerSide/Pricing/DurationPricingSection';
import { ServicePricingSection } from '@/components/core/Dashboard/FreelancerSide/Pricing/ServicePricingSection';
import { CreateSlotWizard } from '@/components/core/Dashboard/FreelancerSide/SlotManagement/CreateSlotWizard';
import { DeleteDaySlotsSection } from '@/components/core/Dashboard/FreelancerSide/SlotManagement/DeleteDaySlotsSection';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSlotStats } from '@/hooks/queries/useSlots';

import { BlockedDatesSection } from './BlockedDatesSection';
import { BookingPagePreview } from './BookingPagePreview';

const StatCard = ({
  title,
  value,
  icon: Icon,
  isLoading,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  isLoading?: boolean;
}) => {
  if (isLoading) {
    return (
      <Card className="border border-gray-200/80 shadow-soft backdrop-blur-sm bg-white/80 rounded-xl">
        <CardContent className="p-6">
          <Skeleton className="h-8 w-24 mb-2" />
          <Skeleton className="h-4 w-32" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-gray-200/80 shadow-soft backdrop-blur-sm bg-white/80 rounded-xl hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-inter text-muted-foreground mb-1">{title}</p>
            <p className="text-2xl font-poppins font-bold text-charcoal">{value}</p>
          </div>
          <div className="p-3 bg-primary/10 rounded-lg">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const AvailabilityPageContent = () => {
  const [activeTab, setActiveTab] = useState<'pricing' | 'slots'>('pricing');
  const { data: slotStats, isLoading: isLoadingStats } = useSlotStats();

  const handleSlotCreateSuccess = () => {
    // Optionally switch to a different tab or show success message
    // React Query will automatically refetch slots
  };

  const formatRevenue = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const stats = useMemo(() => {
    if (!slotStats) {
      return {
        total: 0,
        available: 0,
        booked: 0,
        revenue: 0,
      };
    }
    return {
      total: slotStats.totalSlots || 0,
      available: slotStats.availableSlots || 0,
      booked: slotStats.bookedSlots || 0,
      revenue: slotStats.revenue || 0,
    };
  }, [slotStats]);

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Slots"
          value={stats.total}
          icon={Calendar}
          isLoading={isLoadingStats}
        />
        <StatCard
          title="Available"
          value={stats.available}
          icon={Clock}
          isLoading={isLoadingStats}
        />
        <StatCard
          title="Booked"
          value={stats.booked}
          icon={TrendingUp}
          isLoading={isLoadingStats}
        />
        <StatCard
          title="Potential Revenue"
          value={formatRevenue(stats.revenue)}
          icon={DollarSign}
          isLoading={isLoadingStats}
        />
      </div>

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
          <Card className="border border-gray-200/80 shadow-soft backdrop-blur-sm bg-white/80 rounded-2xl">
            <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-mint/30 to-white px-5 py-5">
              <CardTitle className="text-lg font-poppins font-semibold text-charcoal">
                Create Slots
              </CardTitle>
              <CardDescription className="font-inter text-muted-foreground mt-2">
                Select your available days and configure time slots for each day. Slots will be
                generated for the next 3 months. Pricing will be automatically calculated based on
                your pricing settings.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5">
              <CreateSlotWizard onSuccess={handleSlotCreateSuccess} />
            </CardContent>
          </Card>

          {/* Delete Day Slots Section */}
          <DeleteDaySlotsSection />

          {/* Blocked Dates Section */}
          <BlockedDatesSection />

          {/* Booking Page Preview */}
          <BookingPagePreview />
        </TabsContent>
      </Tabs>
    </div>
  );
};
