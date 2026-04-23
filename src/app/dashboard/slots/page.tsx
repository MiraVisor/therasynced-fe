'use client';

import { addWeeks, endOfWeek, format, startOfWeek, subWeeks } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';

import { DashboardPageWrapper } from '@/components/core/Dashboard/DashboardPageWrapper';
import { BulkCreateSlotsModal } from '@/components/core/Dashboard/FreelancerSide/SlotManagement/BulkCreateSlotsModal';
import { DaySlotModal } from '@/components/core/Dashboard/FreelancerSide/SlotManagement/DaySlotModal';
import { SlotDetailsDialog } from '@/components/core/Dashboard/FreelancerSide/SlotManagement/SlotDetailsDialog';
import { TabbedSlotsView } from '@/components/core/Dashboard/FreelancerSide/SlotManagement/TabbedSlotsView';
import { WeeklyCalendarGrid } from '@/components/core/Dashboard/FreelancerSide/SlotManagement/WeeklyCalendarGrid';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EnhancedStatCard } from '@/components/ui/enhanced-stat-card';
import { useDeleteSlot, useMySlots, useSlotStats } from '@/hooks/queries/useSlots';
import { useAuth } from '@/hooks/useAuthZustand';
import { Slot } from '@/types/types';

const SlotsPage = () => {
  const { role } = useAuth();

  const [currentWeekStart, setCurrentWeekStart] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 }),
  );

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showDayModal, setShowDayModal] = useState(false);
  const [showBulkCreate, setShowBulkCreate] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [showSlotDetails, setShowSlotDetails] = useState(false);

  const { data: slotStats, isLoading: isLoadingStats, error: statsError } = useSlotStats();
  const { mutate: deleteSlotMutation } = useDeleteSlot();

  const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 });
  const { data: weekSlots = [], isLoading: isLoadingSlots } = useMySlots({
    page: 1,
    limit: 500,
    weekStart: format(currentWeekStart, "yyyy-MM-dd'T'00:00:00"),
    weekEnd: format(weekEnd, "yyyy-MM-dd'T'23:59:59"),
    sortBy: 'startTime',
    sortOrder: 'asc',
  });

  useEffect(() => {
    if (statsError && !slotStats) {
      const errorMessage =
        statsError instanceof Error ? statsError.message : 'Failed to load slot stats';
      toast.error(errorMessage);
    }
  }, [statsError, slotStats]);

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setShowDayModal(true);
  };

  const handleViewSlotFromDay = (slot: Slot) => {
    setShowDayModal(false);
    setSelectedSlot(slot);
    setShowSlotDetails(true);
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentWeekStart((prev) => (direction === 'prev' ? subWeeks(prev, 1) : addWeeks(prev, 1)));
  };

  const goToThisWeek = () => {
    setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));
  };

  const isCurrentWeek = useMemo(() => {
    const thisWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    return currentWeekStart.getTime() === thisWeekStart.getTime();
  }, [currentWeekStart]);

  const displayStats = useMemo(() => {
    if (slotStats) {
      return {
        total: slotStats.totalSlots || 0,
        booked: slotStats.bookedSlots || 0,
        available: slotStats.availableSlots || 0,
        revenue: slotStats.revenue || 0,
      };
    }
    return { total: 0, booked: 0, available: 0, revenue: 0 };
  }, [slotStats]);

  return (
    <DashboardPageWrapper
      userRole={role}
      header={
        <div className="flex flex-col gap-2 w-full">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-poppins font-bold text-charcoal">My Slots</h2>
              <p className="font-inter text-muted-foreground mt-1">
                Click a day to create, view, or manage your slots
              </p>
            </div>
            <Button onClick={() => setShowBulkCreate(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Slots
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-6 pb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <EnhancedStatCard
            title="Total Slots"
            value={displayStats.total.toString()}
            loading={isLoadingStats && !slotStats}
            simple
          />
          <EnhancedStatCard
            title="Booked"
            value={displayStats.booked.toString()}
            loading={isLoadingStats && !slotStats}
            simple
          />
          <EnhancedStatCard
            title="Available"
            value={displayStats.available.toString()}
            loading={isLoadingStats && !slotStats}
            simple
          />
          <EnhancedStatCard
            title="Revenue"
            value={`EUR ${displayStats.revenue.toFixed(2)}`}
            loading={isLoadingStats && !slotStats}
            simple
          />
        </div>

        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-poppins">Weekly Overview</CardTitle>
                <CardDescription className="mt-1">
                  Click any day to create, view, or manage slots
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={() => navigateWeek('prev')}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant={isCurrentWeek ? 'secondary' : 'outline'}
                  size="sm"
                  onClick={goToThisWeek}
                  className="min-w-[180px]"
                >
                  {isCurrentWeek
                    ? 'This Week'
                    : `${format(currentWeekStart, 'MMM d')} - ${format(weekEnd, 'MMM d')}`}
                </Button>
                <Button variant="outline" size="icon" onClick={() => navigateWeek('next')}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <WeeklyCalendarGrid
              weekStart={currentWeekStart}
              slots={weekSlots}
              isLoading={isLoadingSlots}
              onDayClick={handleDayClick}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-poppins">All Slots</CardTitle>
            <CardDescription>Browse and manage all your time slots</CardDescription>
          </CardHeader>
          <CardContent>
            <TabbedSlotsView />
          </CardContent>
        </Card>
      </div>

      <DaySlotModal
        open={showDayModal}
        onOpenChange={setShowDayModal}
        date={selectedDate}
        slots={weekSlots}
        onViewSlot={handleViewSlotFromDay}
      />

      <BulkCreateSlotsModal
        open={showBulkCreate}
        onOpenChange={setShowBulkCreate}
        weekStart={currentWeekStart}
      />

      {selectedSlot && (
        <SlotDetailsDialog
          slot={selectedSlot}
          isOpen={showSlotDetails}
          onClose={() => {
            setShowSlotDetails(false);
            setSelectedSlot(null);
          }}
          onDelete={(slotId: string) => {
            setShowSlotDetails(false);
            setSelectedSlot(null);
            deleteSlotMutation(slotId);
          }}
          onComplete={() => {
            // React Query handles refetching
          }}
        />
      )}
    </DashboardPageWrapper>
  );
};

export default SlotsPage;
